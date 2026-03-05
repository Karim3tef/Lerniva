import { NextResponse } from 'next/server';
import { mux } from '@/lib/mux';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function POST(request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const body = await request.json();
    const { lesson_id, course_id } = body;

    if (!lesson_id || !course_id) {
      return NextResponse.json({ error: 'بيانات ناقصة' }, { status: 400 });
    }

    // Verify the teacher owns this course
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id, teacher_id')
      .eq('id', course_id)
      .eq('teacher_id', user.id)
      .single();

    if (courseError || !course) {
      return NextResponse.json({ error: 'غير مصرح بالوصول لهذه الدورة' }, { status: 403 });
    }

    // Create a Mux direct upload
    const upload = await mux.video.uploads.create({
      new_asset_settings: {
        playback_policy: ['public'],
      },
      cors_origin: '*',
    });

    // Store the upload_id on the lesson for later matching
    const { error: updateError } = await supabase
      .from('lessons')
      .update({ mux_asset_id: upload.id })
      .eq('id', lesson_id);

    if (updateError) {
      console.error('Error updating lesson:', updateError);
    }

    return NextResponse.json({
      upload_url: upload.url,
      upload_id: upload.id,
    });
  } catch (error) {
    console.error('Mux upload error:', error);
    return NextResponse.json({ error: 'حدث خطأ في رفع الفيديو' }, { status: 500 });
  }
}
