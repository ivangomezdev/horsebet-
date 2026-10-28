import test from "node:test";
import assert from "node:assert/strict";
import {
  randomInt,
  stakeInCents,
  payoutFor,
  diceResult,
  coinResult,
  createMinefield,
  mineMultiplier,
  plinkoResult,
  PLINKO_PAYOUTS,
} from "../lib/games/engine.js";

test("demo stakes reject fractions smaller than a cent, invalid values and out-of-range amounts", () => {
  for (const input of [
    "0",
    "-10",
    "Infinity",
    "1e3",
    "1.001",
    "1000.01",
    "",
    "abc",
  ])
    assert.equal(stakeInCents(input), null);
  assert.equal(stakeInCents("10.25"), 1025);
  assert.equal(stakeInCents("10,25"), 1025);
  assert.equal(stakeInCents("1000"), 100000);
  assert.equal(payoutFor(1001, 1.94), 1941);
  assert.throws(() => payoutFor(100, Infinity));
});
test("random integer sampling discards biased overflow values", () => {
  const values = [0xffffffff, 7];
  let reads = 0;
  assert.equal(
    randomInt(10, {
      getRandomValues(buffer) {
        buffer[0] = values[reads++];
        return buffer;
      },
    }),
    7,
  );
  assert.equal(reads, 2);
  assert.throws(() => randomInt(0));
});
test("dice boundaries and both directions match the selected probability", () => {
  assert.equal(diceResult(50, "under", 4999).won, true);
  assert.equal(diceResult(50, "under", 5000).won, false);
  assert.equal(diceResult(50, "over", 4999).won, false);
  assert.equal(diceResult(50, "over", 5000).won, true);
  for (const chance of [5, 50, 95])
    for (const direction of ["under", "over"]) {
      let wins = 0;
      for (let roll = 0; roll < 10000; roll++)
        if (diceResult(chance, direction, roll).won) wins++;
      assert.equal(wins, chance * 100);
    }
  assert.throws(() => diceResult(0, "under", 0));
  assert.throws(() => diceResult(50, "over", 10000));
});
test("coin outcomes return the advertised multiplier only for the selected face", () => {
  for (const choice of [0, 1])
    for (const face of [0, 1])
      assert.equal(
        coinResult(choice, face).multiplier,
        choice === face ? 1.94 : 0,
      );
  assert.throws(() => coinResult(2, 0));
});
test("mines boards contain unique positions and payouts follow survival probability", () => {
  for (let count = 1; count <= 10; count++) {
    const positions = createMinefield(count, (limit) => limit - 1);
    assert.equal(positions.length, count);
    assert.equal(new Set(positions).size, count);
    assert.ok(positions.every((index) => index >= 0 && index < 25));
    let previous = 1;
    for (let revealed = 1; revealed <= 25 - count; revealed++) {
      const multiplier = mineMultiplier(count, revealed);
      assert.ok(Number.isFinite(multiplier));
      assert.ok(multiplier > previous);
      previous = multiplier;
    }
  }
  assert.ok(Math.abs(mineMultiplier(3, 1) - (0.97 * 25) / 22) < 1e-12);
  assert.ok(
    Math.abs(mineMultiplier(3, 2) - (0.97 * 25 * 24) / (22 * 21)) < 1e-12,
  );
  assert.throws(() => mineMultiplier(3, 23));
});
test("all 256 Plinko paths land in the matching slot and match the stated return", () => {
  for (const risk of ["low", "high"]) {
    let total = 0;
    const buckets = Array(9).fill(0);
    for (let pattern = 0; pattern < 256; pattern++) {
      let offset = 0;
      const outcome = plinkoResult(risk, () => (pattern >> offset++) & 1);
      assert.equal(outcome.steps.length, 8);
      assert.equal(
        outcome.bucket,
        outcome.steps.reduce((sum, n) => sum + n, 0),
      );
      assert.equal(outcome.multiplier, PLINKO_PAYOUTS[risk][outcome.bucket]);
      buckets[outcome.bucket]++;
      total += outcome.multiplier;
    }
    assert.deepEqual(buckets, [1, 8, 28, 56, 70, 56, 28, 8, 1]);
    assert.ok(
      Math.abs(total / 256 - (risk === "low" ? 0.97890625 : 0.9875)) < 1e-10,
    );
  }
});
