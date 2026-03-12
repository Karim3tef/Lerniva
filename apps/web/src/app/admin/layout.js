import { requireRoleServer } from '@/lib/serverAuth';

export default async function AdminLayout({ children }) {
  await requireRoleServer('admin');
  return children;
}
