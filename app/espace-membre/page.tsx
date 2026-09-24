import { MemberDashboard } from '@/components/dashboard';
import { MEMBER_SESSION_COOKIE, getMemberIdFromSession } from '@/lib/member-auth';
import { getEvents, getMemberById, getMemberContributions } from '@/lib/site-store';
import { activities as activityGallery } from '@/lib/data';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function EspaceMembre() {
  const memberId = getMemberIdFromSession(cookies().get(MEMBER_SESSION_COOKIE)?.value);
  const member = memberId ? await getMemberById(memberId) : null;
  if (!member) redirect('/connexion');
  const [contributions, agendaEvents] = await Promise.all([
    getMemberContributions(member.id),
    getEvents(),
  ]);
  const activities = agendaEvents.length
    ? agendaEvents.map(event => ({ kind: "agenda" as const, ...event }))
    : activityGallery.map((activity, index) => ({ kind: "gallery" as const, id: `gallery-${index}`, ...activity }));
  return <MemberDashboard member={member} contributions={contributions} activities={activities} />;
}
