import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function POST(request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const { course_id, lesson_id, watch_duration = 0 } = await request.json();

    if (!course_id || !lesson_id) {
      return NextResponse.json({ error: 'بيانات ناقصة' }, { status: 400 });
    }

    // Verify enrollment
    const { data: enrollment } = await supabase
      .from('enrollments')
      .select('id, progress')
      .eq('student_id', user.id)
      .eq('course_id', course_id)
      .single();

    if (!enrollment) {
      return NextResponse.json({ error: 'غير مسجل في هذه الدورة' }, { status: 404 });
    }

    // Get lesson duration to check if 80% watched
    const { data: lesson } = await supabase
      .from('lessons')
      .select('duration')
      .eq('id', lesson_id)
      .single();

    const lessonDurationSeconds = (lesson?.duration || 0) * 60;
    const completed = lessonDurationSeconds > 0
      ? watch_duration >= lessonDurationSeconds * 0.8
      : true;

    // Upsert lesson progress
    const { error: progressError } = await supabase
      .from('lesson_progress')
      .upsert({
        student_id: user.id,
        lesson_id,
        course_id,
        watch_duration,
        last_watched_at: new Date().toISOString(),
        ...(completed && { completed: true, completed_at: new Date().toISOString() }),
      }, { onConflict: 'student_id,lesson_id', ignoreDuplicates: false });

    if (progressError) {
      console.error('Lesson progress upsert error:', progressError);
    }

    // Recompute course progress
    const { count: totalLessons } = await supabase
      .from('lessons')
      .select('*', { count: 'exact', head: true })
      .eq('course_id', course_id);

    const { count: completedLessons } = await supabase
      .from('lesson_progress')
      .select('*', { count: 'exact', head: true })
      .eq('student_id', user.id)
      .eq('course_id', course_id)
      .eq('completed', true);

    const newProgress = totalLessons > 0
      ? Math.round((completedLessons / totalLessons) * 100)
      : 0;

    // Update enrollment progress
    const updateData = { progress: newProgress };
    if (newProgress === 100) {
      updateData.completed_at = new Date().toISOString();
    }

    await supabase
      .from('enrollments')
      .update(updateData)
      .eq('id', enrollment.id);

    return NextResponse.json({ progress: newProgress, lesson_completed: completed });
  } catch (error) {
    console.error('Progress update error:', error);
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}

