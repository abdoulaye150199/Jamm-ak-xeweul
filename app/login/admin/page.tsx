import { AdminLogin } from '@/components/admin-login';
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from '@/lib/admin-auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function AdminLoginPage() {
  const session = cookies().get(ADMIN_SESSION_COOKIE)?.value;
  if (isValidAdminSession(session)) redirect('/admin');
  return <AdminLogin />;
}
