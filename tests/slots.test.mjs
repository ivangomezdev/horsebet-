import test from "node:test";
import assert from "node:assert/strict";
import { slotSymbols, slotThemes } from "../data/slots.js";
import { casinoSlots } from "../data/casino.js";
import { games } from "../data/content.js";
import { bonusSlots } from "../data/bonus-slots.js";
import { playableGames, playablePath } from "../data/playable-games.js";
import {
  PAYLINES,
  evaluateSlot,
  slotPaytable,
  slotReturn,
  slotSymbol,
  spinSlot,
} from "../lib/games/slots.js";

test("every slot card opens its own playable HorseBet route", () => {
  assert.equal(casinoSlots.length, 17);
  assert.equal(
    new Set(casinoSlots.map((game) => game.id)).size,
    casinoSlots.length,
  );
  for (const game of [...casinoSlots, ...games]) {
    assert.equal(playablePath(game.id), `/es/casino/${game.id}/`);
    assert.ok(["slot", "bonus-slot"].includes(playableGames[game.id].kind));
    assert.equal(playableGames[game.id].title, game.title);
    assert.equal(game.provider, "HORSEBET");
    assert.ok(slotThemes[game.id] || bonusSlots[game.id]);
  }
});

test("licensed-slot adaptation selects symbols according to each theme weight", () => {
  for (const [id, theme] of Object.entries(slotThemes)) {
    const total = theme.weights.reduce((sum, n) => sum + n, 0),
      counts = Object.fromEntries(slotSymbols.map((symbol) => [symbol.id, 0]));
    for (let ticket = 0; ticket < total; ticket++)
      counts[slotSymbol(id, () => ticket)]++;
    assert.deepEqual(
      slotSymbols.map((symbol) => counts[symbol.id]),
      theme.weights,
    );
    assert.ok(Math.abs(slotReturn(id) - 0.96) < 0.001);
    const round = spinSlot(id, () => 0);
    assert.equal(round.grid.length, 5);
    assert.ok(round.grid.every((reel) => reel.length === 3));
  }
});
test("five matching symbols pay only the longest combination on each line", () => {
  const grid = Array.from({ length: 5 }, () => ["horse", "horse", "horse"]);
  for (const id of Object.keys(slotThemes)) {
    const result = evaluateSlot(grid, id);
    assert.equal(result.wins.length, PAYLINES.length);
    assert.ok(result.wins.every((win) => win.count === 5));
    assert.ok(Math.abs(result.multiplier - slotPaytable(id)[0][2]) < 1e-9);
  }
});
test("slots pay left-to-right only and mark precisely the matching cells", () => {
  const base = [
    ["ruby", "horse", "bell"],
    ["bell", "horse", "ruby"],
    ["emerald", "horse", "diamond"],
    ["shoe", "cherry", "seven"],
    ["cherry", "crown", "emerald"],
  ];
  const result = evaluateSlot(base, "horse-fortune");
  assert.equal(result.wins.length, 1);
  assert.deepEqual(result.wins[0].cells, ["0-1", "1-1", "2-1"]);
  assert.equal(result.wins[0].count, 3);
  assert.equal(result.multiplier, slotPaytable("horse-fortune")[0][0] / 5);
  const rightOnly = base.map((reel) => [...reel]);
  rightOnly[0][1] = "ruby";
  rightOnly[3][1] = "horse";
  rightOnly[4][1] = "horse";
  assert.equal(evaluateSlot(rightOnly, "horse-fortune").wins.length, 0);
  assert.throws(() => evaluateSlot([["horse"]], "horse-fortune"));
  assert.throws(() => slotSymbol("unknown"));
});
