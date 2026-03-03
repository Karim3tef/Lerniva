import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function POST(request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const { course_id, rating, comment } = await request.json();

    if (!course_id || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'بيانات غير صحيحة' }, { status: 400 });
    }

    // Verify enrollment
    const { data: enrollment } = await supabase
      .from('enrollments')
      .select('id, progress')
      .eq('student_id', user.id)
      .eq('course_id', course_id)
      .single();

    if (!enrollment) {
      return NextResponse.json({ error: 'يجب التسجيل في الدورة أولاً' }, { status: 403 });
    }

    // Upsert review (one per student per course)
    const { data, error } = await supabase
      .from('reviews')
      .upsert({
        student_id: user.id,
        course_id,
        rating: Math.round(rating),
        comment: comment || null,
      }, { onConflict: 'student_id,course_id' })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'حدث خطأ في حفظ التقييم' }, { status: 500 });
    }

    return NextResponse.json({ review: data });
  } catch (error) {
    console.error('Review POST error:', error);
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const course_id = searchParams.get('course_id');

    if (!course_id) {
      return NextResponse.json({ error: 'معرف الدورة مطلوب' }, { status: 400 });
    }

    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('student_id', user.id)
      .eq('course_id', course_id);

    if (error) {
      return NextResponse.json({ error: 'حدث خطأ في حذف التقييم' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Review DELETE error:', error);
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}
