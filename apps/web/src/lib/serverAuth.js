import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

function resolveApiBase() {
  return (
    process.env.INTERNAL_API_URL ||
    process.env.NEXT_SERVER_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:4000/api'
  );
}

function dashboardByRole(role) {
  if (role === 'admin') return '/admin/dashboard';
  if (role === 'teacher') return '/teacher/dashboard';
  return '/student/dashboard';
}

export async function requireRoleServer(requiredRole) {
  const apiBase = resolveApiBase();
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refresh_token')?.value;

  if (!refreshToken) {
    redirect('/login');
  }

  let response;
  try {
    response = await fetch(`${apiBase}/auth/refresh`, {
      method: 'POST',
      headers: {
        Cookie: `refresh_token=${refreshToken}`,
      },
      cache: 'no-store',
    });
  } catch {
    redirect('/login');
  }

  if (!response.ok) {
    redirect('/login');
  }

  const data = await response.json();
  const role = data?.user?.role;

  if (!role) {
    redirect('/login');
  }

  if (role !== requiredRole) {
    redirect(dashboardByRole(role));
  }

  return data.user;
}
