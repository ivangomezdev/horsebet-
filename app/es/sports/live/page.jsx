import CasinoApp from "../../../../components/CasinoApp";
export const metadata = { title: "En vivo — HorseBet Sports" };
export default function LiveSportsPage() {
  return <CasinoApp initialView="Deportes" sportsTab="live" />;
}
