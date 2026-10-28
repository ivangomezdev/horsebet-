import { notFound } from "next/navigation";
import CasinoApp from "../../../components/CasinoApp";
import { featureRoutes } from "../../../data/features";
import { accountRoutes } from "../../../data/account";
import { memberRoutes } from "../../../data/currencies";

export const dynamicParams = false;
export function generateStaticParams() {
  return [
    ...Object.keys(featureRoutes),
    ...Object.keys(accountRoutes),
    ...Object.keys(memberRoutes),
  ].map((section) => ({ section }));
}
export async function generateMetadata({ params }) {
  const { section } = await params;
  return {
    title: `${featureRoutes[section] || accountRoutes[section] || memberRoutes[section] || "HorseBet"} — HorseBet`,
    description: `Descubre ${featureRoutes[section] || "HorseBet"} en HorseBet.`,
  };
}
export default async function FeaturePage({ params }) {
  const { section } = await params;
  if (memberRoutes[section])
    return <CasinoApp initialView="Mi espacio" memberSection={section} />;
  if (accountRoutes[section])
    return <CasinoApp initialView="Cuenta" accountTab={section} />;
  if (!featureRoutes[section]) notFound();
  return <CasinoApp initialView={featureRoutes[section]} />;
}
