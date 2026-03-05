import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function POST(request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'يجب تسجيل الدخول أولاً' }, { status: 401 });
    }

    const body = await request.json();
    const { course_id } = body;

    if (!course_id) {
      return NextResponse.json({ error: 'معرف الدورة مطلوب' }, { status: 400 });
    }

    // Fetch course details
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id, title, price, thumbnail_url')
      .eq('id', course_id)
      .single();

    if (courseError || !course) {
      return NextResponse.json({ error: 'الدورة غير موجودة' }, { status: 404 });
    }

    // Check if already enrolled
    const { data: existingEnrollment } = await supabase
      .from('enrollments')
      .select('id')
      .eq('student_id', user.id)
      .eq('course_id', course_id)
      .single();

    if (existingEnrollment) {
      return NextResponse.json({ error: 'أنت مسجل بالفعل في هذه الدورة' }, { status: 400 });
    }

    // Free course: enroll directly
    if (!course.price || Number(course.price) === 0) {
      const { error: enrollError } = await supabase
        .from('enrollments')
        .insert({ student_id: user.id, course_id, progress: 0 });

      if (enrollError) {
        return NextResponse.json({ error: 'حدث خطأ في التسجيل' }, { status: 500 });
      }

      // Notify student
      await supabase.from('notifications').insert({
        user_id: user.id,
        type: 'enrollment',
        title: 'تم التسجيل في الدورة بنجاح',
        message: `تم تسجيلك في دورة: ${course.title}`,
        link: `/student/my-courses`,
      });

      return NextResponse.json({ enrolled: true });
    }

    // Paid course: create Stripe Checkout Session
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: course.title,
              ...(course.thumbnail_url && { images: [course.thumbnail_url] }),
            },
            unit_amount: Math.round(Number(course.price) * 100),
          },
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/courses/${course_id}`,
      metadata: {
        course_id,
        student_id: user.id,
      },
      payment_intent_data: {
        metadata: {
          course_id,
          student_id: user.id,
        },
      },
    });

    // Insert pending payment record
    await supabase.from('payments').insert({
      student_id: user.id,
      course_id,
      stripe_session_id: session.id,
      amount: Number(course.price),
      currency: 'usd',
      status: 'pending',
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json({ error: 'حدث خطأ في إنشاء جلسة الدفع' }, { status: 500 });
  }
}
