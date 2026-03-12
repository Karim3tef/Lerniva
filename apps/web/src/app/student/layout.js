import { requireRoleServer } from '@/lib/serverAuth';

export default async function StudentLayout({ children }) {
  await requireRoleServer('student');
  return children;
}
