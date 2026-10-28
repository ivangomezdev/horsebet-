import test from "node:test";
import assert from "node:assert/strict";
import { bonusSlots } from "../data/bonus-slots.js";
import { spinVideo } from "../lib/games/vendor/metaincognita/video.js";
import { symbolArt } from "../lib/games/vendor/metaincognita/symbols.js";
import {
  initialBonusState,
  previewBonusState,
  pendingFeature,
  spinBonus,
} from "../lib/games/bonus-engine.js";
const stops = (values) => {
  let index = 0;
  return () => (values[index++ % values.length] + 0.5) / 24;
};

test("both MIT games trigger their own bonuses and free spins cost zero", () => {
  for (const { definition: def } of Object.values(bonusSlots)) {
    if (!def.freeSpins) continue;
    const state = { videoFeature: null };
    const base = spinVideo(def, state, 25, stops([2, 2, 0, 2, 10]));
    assert.equal(base.coinsIn, 25);
    assert.ok(
      base.featureEvents.some((event) => event.type === "free-spins-triggered"),
    );
    assert.equal(state.videoFeature.remaining, def.freeSpins.count);
    for (let i = 0; i < def.freeSpins.count; i++) {
      const free = spinVideo(def, state, 25, () => 0);
      assert.equal(free.coinsIn, 0);
      assert.equal(free.gameKind, "free-spin");
      assert.ok(Number.isFinite(free.totalPayout));
    }
    assert.equal(state.videoFeature, null);
    assert.ok(
      Object.values(def.symbols).every((symbol) => symbolArt(symbol.icon)),
    );
  }
});

test("all 17 catalog slots use a complete licensed engine and resolve their bonus previews", () => {
  assert.equal(Object.keys(bonusSlots).length, 17);
  assert.equal(
    new Set(Object.values(bonusSlots).map((game) => game.family)).size,
    5,
  );
  for (const { definition: def, icon } of Object.values(bonusSlots)) {
    assert.ok(symbolArt(icon));
    assert.ok(
      Object.values(def.symbols).every((symbol) => symbolArt(symbol.icon)),
    );
    const state = previewBonusState(def);
    let count = 0;
    do {
      const result = spinBonus(def, state, () => 0.99999);
      assert.ok(Number.isFinite(result.totalPayout));
      assert.ok(result.totalPayout >= 0);
      if (def.family !== "cascade") assert.equal(result.coinsIn, 0);
      assert.ok(++count <= 11);
    } while (pendingFeature(state));
  }
});

test("cascade chains are bounded; wheel and lock features do not charge a second bet", () => {
  const cascade = bonusSlots.aztec.definition;
  const chain = spinBonus(cascade, initialBonusState(cascade), () => 0.1);
  assert.equal(chain.cascadeSteps.length, cascade.maxTumbles + 1);
  assert.deepEqual(
    chain.cascadeSteps.slice(0, 5).map((step) => step.chainMult),
    [1, 2, 3, 5, 8],
  );
  assert.equal(
    chain.totalPayout,
    chain.wins.reduce((sum, win) => sum + win.payCredits, 0),
  );
  const wheel = bonusSlots["horse-fortune"].definition;
  const wheelState = previewBonusState(wheel);
  const wheelResult = spinBonus(wheel, wheelState, () => 0.99999);
  assert.equal(wheelResult.totalPayout, 25);
  assert.equal(wheelResult.coinsIn, 0);
  assert.equal(wheelState.wheel.pending, false);
  const hold = bonusSlots["ruby-rush"].definition;
  const holdState = previewBonusState(hold);
  const rounds = [0, 1, 2].map(() => spinBonus(hold, holdState, () => 0.99999));
  assert.ok(rounds.every((round) => round.coinsIn === 0));
  assert.equal(rounds[2].totalPayout, 150);
  assert.equal(holdState.videoFeature, null);
});
test("Canal Royale doubles free-spin awards; Dragon's Hoard retriggers eight spins", () => {
  const canal = bonusSlots["canal-royale"].definition;
  const base = spinVideo(canal, { videoFeature: null }, 25, () => 0);
  const free = spinVideo(
    canal,
    {
      videoFeature: {
        kind: "freeSpins",
        remaining: 1,
        multiplier: 2,
        coins: 25,
      },
    },
    25,
    () => 0,
  );
  assert.ok(base.totalPayout > 0);
  assert.equal(free.totalPayout, base.totalPayout * 2);
  const dragon = bonusSlots["dragons-hoard"].definition;
  const state = {
    videoFeature: { kind: "freeSpins", remaining: 8, multiplier: 1, coins: 25 },
  };
  const retrigger = spinVideo(dragon, state, 25, stops([2, 2, 0, 2, 10]));
  assert.equal(state.videoFeature.remaining, 15);
  assert.ok(
    retrigger.featureEvents.some(
      (event) => event.type === "free-spins-retriggered",
    ),
  );
});
