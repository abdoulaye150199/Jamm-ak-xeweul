import { ContentPage } from '@/components/public-pages';
import { getEvents } from '@/lib/site-store';

export const dynamic = 'force-dynamic';

export default async function Activites() {
  const events = await getEvents();
  return <ContentPage type="activities" events={events} />;
}
