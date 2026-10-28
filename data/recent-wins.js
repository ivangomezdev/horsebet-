import { casinoSlots, casinoOriginals } from "./casino.js";
import { playablePath } from "./playable-games.js";
const games = [...casinoSlots, ...casinoOriginals].filter((game) =>
  playablePath(game.id),
);
const names = [
  "Jinete",
  "Potro",
  "Estrella",
  "Rayo",
  "Corcel",
  "Luna",
  "Tornado",
  "Pegaso",
  "Cometa",
  "Centella",
];
const surnames = [
  "Azul",
  "Dorado",
  "Norte",
  "Sur",
  "Solar",
  "Lunar",
  "Veloz",
  "Libre",
  "Real",
  "Bravo",
  "Mar",
  "Cielo",
  "Monte",
  "Valle",
  "Prado",
  "Nieve",
  "Fuego",
  "Brisa",
  "Noche",
  "Alba",
];
const fraction = (seed) => {
  let value = Math.imul(seed ^ 0x45d9f3b, 0x45d9f3b);
  value = Math.imul(value ^ (value >>> 16), 0x45d9f3b);
  return ((value ^ (value >>> 16)) >>> 0) / 4294967296;
};
// Presentation fixtures only: each fictional identity owns one fixed game.
// Never insert these records into auth, player history or the money ledger.
export const simulatedPlayers = Array.from({ length: 200 }, (_, index) => ({
  id: `demo-player-${index + 1}`,
  username: `${names[index % names.length]}${surnames[Math.floor(index / names.length)]}`,
  avatar: `${names[index % names.length][0]}${surnames[Math.floor(index / names.length)][0]}`,
  hue: (index * 137.508) % 360,
  game: games[Math.floor(fraction(index + 19) * games.length)],
}));
export const simulatedWins = simulatedPlayers
  .map((player, index) => ({
    ...player,
    id: `simulated-win-${index + 1}`,
    playerId: player.id,
    amount: Math.round((12 + fraction(index + 901) ** 3 * 4800) * 100) / 100,
    order: fraction(index + 4001),
  }))
  .sort((a, b) => a.order - b.order);
