import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request) {
  try {
    const body = await request.text();
    const sig = request.headers.get('stripe-signature');
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    if (webhookSecret && sig) {
      try {
        event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
      } catch (err) {
        console.error('Stripe webhook signature verification failed:', err.message);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
      }
    } else {
      event = JSON.parse(body);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const { course_id, student_id } = session.metadata || {};

      if (course_id && student_id) {
        // Update payment status
        await supabaseAdmin
          .from('payments')
          .update({ status: 'succeeded', paid_at: new Date().toISOString() })
          .eq('stripe_session_id', session.id);

        // Enroll student (ignore if already enrolled)
        const { error: enrollError } = await supabaseAdmin
          .from('enrollments')
          .insert({ student_id, course_id, progress: 0 });

        if (enrollError && enrollError.code !== '23505') {
          console.error('Enrollment error:', enrollError);
        }

        // Notify student
        const { data: course } = await supabaseAdmin
          .from('courses')
          .select('title')
          .eq('id', course_id)
          .single();

        await supabaseAdmin.from('notifications').insert({
          user_id: student_id,
          type: 'enrollment',
          title: 'تم التسجيل في الدورة بنجاح',
          message: `تم تسجيلك في دورة: ${course?.title || ''}`,
          link: '/student/my-courses',
        });
      }
    }

    if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object;
      await supabaseAdmin
        .from('payments')
        .update({ status: 'failed' })
        .eq('stripe_payment_intent_id', paymentIntent.id);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    return NextResponse.json({ received: true });
  }
}
