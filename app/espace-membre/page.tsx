import { MemberDashboard } from '@/components/dashboard';
import { MEMBER_SESSION_COOKIE, getMemberIdFromSession } from '@/lib/member-auth';
import { getMemberById, getMemberContributions } from '@/lib/site-store';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function EspaceMembre() {
  const memberId = getMemberIdFromSession(cookies().get(MEMBER_SESSION_COOKIE)?.value);
  const member = memberId ? await getMemberById(memberId) : null;
  if (!member) redirect('/connexion');
  const contributions = await getMemberContributions(member.id);
  return <MemberDashboard member={member} contributions={contributions} />;
}
