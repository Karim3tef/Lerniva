import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function POST(request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const { course_id } = await request.json();

    if (!course_id) {
      return NextResponse.json({ error: 'بيانات ناقصة' }, { status: 400 });
    }

    // Get total lessons for this course
    const { count: totalLessons } = await supabase
      .from('lessons')
      .select('*', { count: 'exact', head: true })
      .eq('course_id', course_id);

    // Get enrollment to check current completed lessons count
    const { data: enrollment } = await supabase
      .from('enrollments')
      .select('id, progress')
      .eq('student_id', user.id)
      .eq('course_id', course_id)
      .single();

    if (!enrollment) {
      return NextResponse.json({ error: 'غير مسجل في هذه الدورة' }, { status: 404 });
    }

    if (!totalLessons || totalLessons === 0) {
      return NextResponse.json({ progress: 0 });
    }

    // Calculate new progress based on current progress
    const currentCompleted = Math.round((enrollment.progress / 100) * totalLessons);
    const newCompleted = Math.min(currentCompleted + 1, totalLessons);
    const newProgress = Math.round((newCompleted / totalLessons) * 100);

    // Update enrollment progress
    const { error: updateError } = await supabase
      .from('enrollments')
      .update({ progress: newProgress })
      .eq('id', enrollment.id);

    if (updateError) {
      return NextResponse.json({ error: 'حدث خطأ في تحديث التقدم' }, { status: 500 });
    }

    return NextResponse.json({ progress: newProgress });
  } catch (error) {
    console.error('Progress update error:', error);
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}
