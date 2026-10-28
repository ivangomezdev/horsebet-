import { randomInt } from "./engine.js";
import { slotSymbols, slotThemes } from "../../data/slots.js";

export const PAYLINES = [
  [1, 1, 1, 1, 1],
  [0, 0, 0, 0, 0],
  [2, 2, 2, 2, 2],
  [0, 1, 2, 1, 0],
  [2, 1, 0, 1, 2],
];
const rawExpected = (weights, tables) => {
  const total = weights.reduce((sum, n) => sum + n, 0);
  return weights.reduce((sum, weight, index) => {
    const p = weight / total,
      [three, four, five] = tables[index];
    return (
      sum + p ** 3 * (1 - p) * three + p ** 4 * (1 - p) * four + p ** 5 * five
    );
  }, 0);
};
const paytables = Object.fromEntries(
  Object.entries(slotThemes).map(([id, theme]) => {
    const raw = slotSymbols.map((symbol) => symbol.pays),
      scale = 0.96 / rawExpected(theme.weights, raw);
    return [
      id,
      raw.map((table) =>
        table.map((value) => Math.round(value * scale * 100) / 100),
      ),
    ];
  }),
);
export function slotPaytable(id) {
  if (!paytables[id]) throw new Error("Unknown slot");
  return paytables[id];
}
export function slotReturn(id) {
  return rawExpected(slotThemes[id].weights, slotPaytable(id));
}
export function slotSymbol(id, random = randomInt) {
  const theme = slotThemes[id];
  if (!theme) throw new Error("Unknown slot");
  let ticket = random(theme.weights.reduce((sum, n) => sum + n, 0));
  for (let index = 0; index < theme.weights.length; index++) {
    ticket -= theme.weights[index];
    if (ticket < 0) return slotSymbols[index].id;
  }
  throw new Error("Invalid random value");
}
export function evaluateSlot(grid, id) {
  if (
    !Array.isArray(grid) ||
    grid.length !== 5 ||
    grid.some(
      (reel) =>
        !Array.isArray(reel) ||
        reel.length !== 3 ||
        reel.some(
          (symbol) => !slotSymbols.some((entry) => entry.id === symbol),
        ),
    )
  )
    throw new Error("Invalid reel grid");
  const table = slotPaytable(id),
    wins = [];
  PAYLINES.forEach((rows, line) => {
    const symbol = grid[0][rows[0]];
    let count = 1;
    while (count < 5 && grid[count][rows[count]] === symbol) count++;
    if (count >= 3) {
      const index = slotSymbols.findIndex((entry) => entry.id === symbol);
      wins.push({
        line,
        symbol,
        count,
        multiplier: table[index][count - 3] / PAYLINES.length,
        cells: rows.slice(0, count).map((row, col) => `${col}-${row}`),
      });
    }
  });
  return {
    wins,
    multiplier: wins.reduce((sum, win) => sum + win.multiplier, 0),
  };
}
export function spinSlot(id, random = randomInt) {
  const grid = Array.from({ length: 5 }, () =>
    Array.from({ length: 3 }, () => slotSymbol(id, random)),
  );
  return { grid, ...evaluateSlot(grid, id) };
}
