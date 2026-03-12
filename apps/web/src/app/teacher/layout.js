import { requireRoleServer } from '@/lib/serverAuth';

export default async function TeacherLayout({ children }) {
  await requireRoleServer('teacher');
  return children;
}
