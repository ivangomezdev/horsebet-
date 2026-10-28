import test from "node:test";
import assert from "node:assert/strict";
import { parseCurrencyAmount, rankProgress } from "../lib/account/member.js";
import { formatBalance } from "../lib/account/format-balance.js";
test("new accounts start at 0%; level thresholds advance only with recorded points", () => {
  assert.deepEqual(rankProgress("0"), {
    level: 0,
    nextLevel: 1,
    percent: 0,
    remaining: "1000",
    points: "0",
  });
  assert.equal(rankProgress("999").percent, 99);
  assert.equal(rankProgress("1000").level, 1);
  assert.equal(rankProgress("1000").percent, 0);
  assert.equal(rankProgress("3000").percent, 50);
  assert.equal(rankProgress("5120000000").level, 20);
  assert.equal(rankProgress("5120000000").nextLevel, null);
});
test("vault input preserves crypto precision and rejects rounding or invalid amounts", () => {
  assert.equal(parseCurrencyAmount("0.000000001", "SOL"), "1");
  assert.equal(formatBalance("0", 9), "0.00");
  assert.equal(formatBalance("1", 9), "0.000000001");
  assert.equal(formatBalance("1230000", 6), "1.23");
  assert.equal(parseCurrencyAmount("0.00000001", "BTC"), "1");
  assert.equal(
    parseCurrencyAmount("9007199254740993.123456", "USDT"),
    "9007199254740993123456",
  );
  for (const value of [
    "0",
    "-1",
    "NaN",
    "Infinity",
    "1e6",
    "0.0000001",
    "1.2.3",
  ])
    assert.throws(() => parseCurrencyAmount(value, "USDT"));
});
