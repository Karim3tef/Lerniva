import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import TeacherCourseEditForm from '@/components/forms/TeacherCourseEditForm';

export default async function TeacherCourseEditPage({ params }) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: course, error } = await supabase
    .from('courses')
    .select('*, categories(id, name)')
    .eq('id', id)
    .eq('teacher_id', user.id)
    .single();

  if (error || !course) redirect('/teacher/courses');

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name')
    .order('name', { ascending: true });

  return <TeacherCourseEditForm course={course} categories={categories || []} />;
}
