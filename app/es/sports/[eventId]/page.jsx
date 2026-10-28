import { notFound } from "next/navigation";
import CasinoApp from "../../../../components/CasinoApp";
import { sportsEvents, findSportsEvent } from "../../../../data/sports";
export const dynamicParams = false;
export function generateStaticParams() {
  return sportsEvents.map(({ id }) => ({ eventId: id }));
}
export async function generateMetadata({ params }) {
  const event = findSportsEvent((await params).eventId);
  return {
    title: event
      ? `${event.home} vs. ${event.away} — HorseBet Sports`
      : "Evento no encontrado",
  };
}
export default async function SportsEventPage({ params }) {
  const { eventId } = await params;
  if (!findSportsEvent(eventId)) notFound();
  return <CasinoApp initialView="Deportes" sportsEventId={eventId} />;
}
