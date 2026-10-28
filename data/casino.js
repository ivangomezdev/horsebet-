import { games, originals } from "./content.js";
import { bonusSlotCatalog } from "./bonus-slots.js";
export const casinoSlots = bonusSlotCatalog;

export const casinoOriginals = [
  originals[0],
  {
    id: "mines",
    title: "Mines",
    art: 1,
    color: "purple",
    provider: "HORSEBET",
  },
  {
    id: "keno",
    title: "Keno",
    special: "keno",
    color: "blue",
    provider: "HORSEBET",
  },
  originals[3],
  originals[4],
  {
    id: "limbo",
    title: "Limbo",
    special: "crash",
    color: "pink",
    provider: "HORSEBET",
  },
  originals[5],
  originals[2],
].map((game) => ({ ...game, category: "Originals" }));

export const liveGames = [
  {
    id: "vip4",
    title: "VIP Blackjack 4",
    art: 0,
    provider: "PRAGMATIC PLAY",
    tags: ["Blackjack", "VIP"],
  },
  {
    id: "azure",
    title: "Blackjack 32 Azure",
    art: 1,
    provider: "PRAGMATIC PLAY",
    tags: ["Blackjack", "VIP"],
  },
  {
    id: "crazy",
    title: "Crazy Time",
    art: 2,
    provider: "EVOLUTION",
    tags: ["Programas"],
  },
  {
    id: "russian",
    title: "Russian Blackjack 3",
    art: 3,
    provider: "PRAGMATIC PLAY",
    tags: ["Blackjack"],
  },
  {
    id: "blackjack143",
    title: "Blackjack 143",
    art: 4,
    provider: "PRAGMATIC PLAY",
    tags: ["Blackjack"],
  },
  {
    id: "classic",
    title: "Classic Blackjack",
    art: 5,
    provider: "EVOLUTION",
    tags: ["Blackjack", "VIP"],
  },
  {
    id: "roulettelive",
    title: "Auto Roulette VIP",
    art: 4,
    provider: "EVOLUTION",
    tags: ["Ruleta", "VIP"],
  },
  {
    id: "megawheel",
    title: "Mega Wheel",
    art: 2,
    provider: "PRAGMATIC PLAY",
    tags: ["Programas"],
  },
].map((game) => ({ ...game, atlas: "live", category: "En vivo" }));

export const tableGames = [
  {
    id: "roulette",
    title: "HorseBet Roulette",
    special: "roulette",
    color: "red",
    provider: "HORSEBET",
    tags: ["Ruleta"],
  },
  {
    id: "blackjack",
    title: "Blackjack",
    special: "cards",
    color: "green",
    provider: "HORSEBET",
    tags: ["Blackjack"],
  },
  {
    id: "baccarat",
    title: "Baccarat",
    special: "cards",
    color: "blue",
    provider: "EVOLUTION",
  },
  {
    id: "european",
    title: "European Roulette",
    special: "roulette",
    color: "gold",
    provider: "PRAGMATIC PLAY",
    tags: ["Ruleta"],
  },
  {
    id: "poker",
    title: "Casino Hold’em",
    special: "cards",
    color: "purple",
    provider: "BGAMING",
  },
  {
    id: "speed",
    title: "Speed Roulette",
    special: "roulette",
    color: "pink",
    provider: "EVOLUTION",
    tags: ["Ruleta"],
  },
].map((game) => ({ ...game, category: "Mesa" }));

export const casinoGames = [
  ...casinoSlots,
  ...casinoOriginals,
  ...liveGames,
  ...tableGames,
];
export const featuredGames = [casinoSlots[1], casinoSlots[6]];
export const providers = ["PRAGMATIC PLAY", "BGAMING", "EVOLUTION", "HORSEBET"];
export const casinoPromotions = [
  {
    id: "welcome",
    title: "Bono de bienvenida hasta el 590%",
    subtitle: "+225 Free Spins",
    art: 0,
    action: "register",
  },
  {
    id: "birthday",
    title: "Birthday 007",
    badge: "EDICIÓN ANIVERSARIO",
    prize: "2.000.000 US$",
    art: 1,
    action: "Promociones",
  },
  {
    id: "raffle",
    title: "Birthday Raffle",
    badge: "EVENTO ESPECIAL",
    prize: "100.000 US$",
    art: 2,
    action: "Promociones",
  },
];
