import { notFound } from "next/navigation";
import CasinoApp from "../../../../components/CasinoApp";
import { playableGames } from "../../../../data/playable-games";
export const dynamicParams = false;
export function generateStaticParams() {
  return Object.keys(playableGames).map((game) => ({ game }));
}
export async function generateMetadata({ params }) {
  const { game } = await params;
  return {
    title: `${playableGames[game]?.title || "Originals"} — HorseBet Originals`,
    description: "Juega con fichas de demostración. Sin dinero real.",
  };
}
export default async function GamePage({ params }) {
  const { game } = await params;
  if (!playableGames[game]) notFound();
  return <CasinoApp initialView="Juego" gameId={game} />;
}
