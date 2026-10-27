"use client";
import Missions from "./features/Missions";
import Bonuses from "./features/Bonuses";
import VipClub from "./features/VipClub";
import Promotions from "./features/Promotions";
import Referrals from "./features/Referrals";
import CryptoEarn from "./features/CryptoEarn";

const pages = {
  Misiones: Missions,
  Bonos: Bonuses,
  "Club VIP": VipClub,
  Promociones: Promotions,
  Referidos: Referrals,
  "Cripto y Gana": CryptoEarn,
};
export default function FeaturePages({ view, ...props }) {
  const Page = pages[view];
  return Page ? <Page {...props} /> : null;
}
