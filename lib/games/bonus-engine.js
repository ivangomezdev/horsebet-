import { spinVideo } from "./vendor/metaincognita/video.js";
import { spinCascade } from "./vendor/metaincognita/cascade.js";
import { spinWheel } from "./vendor/metaincognita/wheelGame.js";
import {
  feedProgressive,
  initProgressiveState,
} from "./vendor/metaincognita/progressive.js";
import { randomInt } from "./engine.js";

export const bonusRandom = () => randomInt(16777216) / 16777216;
export const initialBonusState = (def) => ({
  videoFeature: null,
  wheel: def.family === "wheel" ? { pending: false } : null,
  progressive: def.progressive ? initProgressiveState(def.progressive) : null,
});
export const pendingFeature = (state) =>
  state.videoFeature || (state.wheel?.pending ? { kind: "wheel" } : null);
export const initialGrid = (def) =>
  def.family === "cascade"
    ? Array.from({ length: def.cols }, (_, c) =>
        Array.from(
          { length: def.rows },
          (_, r) =>
            Object.keys(def.symbols)[(c + r) % Object.keys(def.symbols).length],
        ),
      )
    : (def.strips || def.physicalStrips).map((strip) => strip.slice(0, 3));
export function spinBonus(def, state, random = bonusRandom) {
  const engine =
    def.family === "cascade"
      ? spinCascade
      : def.family === "wheel"
        ? spinWheel
        : spinVideo;
  const result = engine(def, state, def.maxCoins, random);
  feedProgressive(def, state.progressive, "after", result.coinsIn);
  return result;
}
export function previewBonusState(def) {
  const state = initialBonusState(def);
  if (def.family === "wheel") state.wheel.pending = true;
  else if (def.freeSpins)
    state.videoFeature = {
      kind: "freeSpins",
      remaining: def.freeSpins.count,
      multiplier: def.freeSpins.multiplier,
      coins: def.maxCoins,
    };
  else if (def.holdAndSpin)
    state.videoFeature = {
      kind: "holdAndSpin",
      respins: 3,
      coins: def.maxCoins,
      locked: Array.from({ length: 15 }, (_, i) =>
        i % 2 === 0 && i < 12 ? { credits: 25 } : null,
      ),
    };
  return state;
}
export function winningCells(def, outcome) {
  const cells = new Set();
  if (!outcome?.grid?.length) return cells;
  for (const win of outcome.wins) {
    const entry = def.paytable.find?.((item) => item.id === win.entryId);
    if (win.line.startsWith("line-")) {
      def.betMode.lines[Number(win.line.slice(5)) - 1]
        .slice(0, entry?.length || 0)
        .forEach((row, col) => cells.add(`${col}-${row}`));
    } else if (win.line.startsWith("ways-")) {
      outcome.grid.slice(0, entry?.length || 0).forEach((column, col) =>
        column.forEach((id, row) => {
          if (id === entry.symbol || id === def.wildSymbol)
            cells.add(`${col}-${row}`);
        }),
      );
    } else if (win.line === "scatter") {
      outcome.grid.forEach((column, col) =>
        column.forEach((id, row) => {
          if (win.symbols.includes(id)) cells.add(`${col}-${row}`);
        }),
      );
    } else if (win.line === "payline")
      outcome.grid.forEach((_, col) => cells.add(`${col}-1`));
  }
  return cells;
}
