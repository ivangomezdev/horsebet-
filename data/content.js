import { bonusSlotCatalog } from "./bonus-slots.js";
export const games = [
  "aztec",
  "diamond",
  "sugar",
  "pepper",
  "olympus",
  "sugar1000",
].map((id) => bonusSlotCatalog.find((game) => game.id === id));
export const originals = [
  {
    id: "dice",
    title: "Dice",
    provider: "HORSEBET",
    object: "dice",
    color: "green",
  },
  {
    id: "mines",
    title: "Mines",
    provider: "HORSEBET",
    art: 1,
    color: "purple",
  },
  {
    id: "space",
    title: "Space Dice",
    provider: "HORSEBET",
    object: "dice",
    color: "blue",
  },
  {
    id: "coin",
    title: "Coin Flip",
    provider: "HORSEBET",
    object: "coins",
    color: "gold",
  },
  {
    id: "plinko",
    title: "Plinko",
    provider: "HORSEBET",
    special: "plinko",
    color: "red",
  },
  {
    id: "crash",
    title: "Crash",
    provider: "HORSEBET",
    special: "crash",
    color: "pink",
  },
];
export const sports = [
  { id: "tennis", label: "Tenis", icon: "tennis" },
  { id: "baseball", label: "Béisbol", icon: "baseball" },
  { id: "esoccer", label: "eSoccer", icon: "fifa" },
  { id: "football", label: "Fútbol", icon: "soccer" },
  { id: "basketball", label: "Baloncesto", icon: "basketball" },
  { id: "ebasketball", label: "eBasketball", icon: "nba-2k" },
];
export const promotions = [
  {
    eyebrow: "TU PRÓXIMA AVENTURA EMPIEZA AQUÍ",
    accent: "Bono de bienvenida",
    title: "de hasta el 590 %",
    subtitle: "+ 225 tiradas gratis",
    cta: "Regístrate y juega",
  },
  {
    eyebrow: "CELEBRAMOS A LO GRANDE",
    accent: "Únete a Birthday 007",
    title: "por $2 000 000",
    subtitle: "Una celebración. Miles de posibilidades.",
    cta: "Descubrir promoción",
  },
  {
    eyebrow: "EL CLUB DONDE TÚ ERES LA ESTRELLA",
    accent: "Lleva tu juego",
    title: "al siguiente nivel",
    subtitle: "Descubre las ventajas del Club VIP",
    cta: "Explorar Club VIP",
  },
];
export const information = {
  Promociones: [
    "Más motivos para jugar",
    "Bono de bienvenida de hasta el 590 % + 225 tiradas gratis.",
    "Birthday 007: descubre la promoción especial del aniversario.",
    "Las promociones mostradas son ilustrativas.",
  ],
  "Club VIP": [
    "Tu experiencia, a otro nivel",
    "Descubre los niveles Bronze, Silver, Gold y Platinum.",
    "Ventajas, recompensas y atención personalizada en un solo lugar.",
  ],
  "Cripto y Gana": [
    "Todo tu universo cripto",
    "Explora staking, intercambio y recompensas en una experiencia unificada.",
    "Esta sección no conecta billeteras ni realiza transacciones.",
  ],
  Torneos: [
    "La emoción de competir",
    "Explora los torneos de Slots, Originals y Deportes.",
    "Clasificación de ejemplo: 1. HorsePlayer · 2. LuckyFox · 3. CryptoAce",
  ],
  Afiliados: [
    "Crece con HorseBet",
    "Descubre el programa de afiliados y las herramientas para creadores.",
  ],
  Comunidad: [
    "Forma parte de la comunidad",
    "Comparte tu pasión por los juegos y descubre las novedades.",
  ],
  Novedades: [
    "Lo último en HorseBet",
    "Nuevos juegos, nuevas experiencias y más entretenimiento cada semana.",
  ],
  Ayuda: [
    "Estamos para ayudarte",
    "Explora los juegos, las promociones y tu cuenta desde el menú principal.",
    "¿Puedo apostar? No. No hay depósitos, pagos ni apuestas reales.",
    "¿Se guardan mis datos? Solo se guardan favoritos y un alias en este navegador.",
  ],
  "Juego responsable": [
    "Solo para mayores de 18 años",
    "El juego debe ser entretenimiento. Establece límites y toma descansos.",
    "Esta página es una recreación de diseño independiente, sin apuestas reales.",
  ],
};
