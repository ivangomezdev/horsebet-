import { notFound } from "next/navigation";
import CasinoApp from "../../../components/CasinoApp";
import { featureRoutes } from "../../../data/features";

export const dynamicParams = false;
export function generateStaticParams() {
  return Object.keys(featureRoutes).map((section) => ({ section }));
}
export async function generateMetadata({ params }) {
  const { section } = await params;
  return {
    title: `${featureRoutes[section] || "HorseBet"} — HorseBet`,
    description: `Descubre ${featureRoutes[section] || "HorseBet"} en esta experiencia de demostración.`,
  };
}
export default async function FeaturePage({ params }) {
  const { section } = await params;
  if (!featureRoutes[section]) notFound();
  return <CasinoApp initialView={featureRoutes[section]} />;
}
