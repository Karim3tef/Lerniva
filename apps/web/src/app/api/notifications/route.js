import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      return NextResponse.json({ error: 'حدث خطأ في تحميل الإشعارات' }, { status: 500 });
    }

    return NextResponse.json({ notifications: data || [] });
  } catch (error) {
    console.error('Notifications GET error:', error);
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const { ids } = await request.json();

    let query = supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id);

    if (ids && ids.length > 0) {
      query = query.in('id', ids);
    }

    const { error } = await query;

    if (error) {
      return NextResponse.json({ error: 'حدث خطأ في تحديث الإشعارات' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Notifications PUT error:', error);
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}
