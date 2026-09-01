import { AdminListPage } from '@/components/admin-list-pages';
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from '@/lib/admin-auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function AdminContributions() {
  if (!isValidAdminSession(cookies().get(ADMIN_SESSION_COOKIE)?.value)) redirect('/login/admin');
  return <AdminListPage kind="contributions" />;
}
