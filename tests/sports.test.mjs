import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { sportsEvents } from "../data/sports.js";
import { sportCategories } from "../data/sport-categories.js";
import {
  resolvePick,
  togglePick,
  sanitizePicks,
  slipTotals,
  displayOdds,
} from "../lib/sports/slip.js";

const madrid = "parma-udinese:winner:home";
const london = "genoa-juventus:winner:home";

test("sports: every category icon exists and primary sports have demo markets", () => {
  const identities = JSON.parse(
    readFileSync(
      new URL("../data/sports-team-assets.json", import.meta.url),
      "utf8",
    ),
  );
  for (const category of sportCategories) {
    assert.ok(
      existsSync(
        new URL(
          `../public/images/sports/icons/${category.icon}.svg`,
          import.meta.url,
        ),
      ),
      category.id,
    );
    if (category.primary)
      assert.ok(
        sportsEvents.some((event) => event.sport === category.id),
        category.id,
      );
  }
  assert.equal(
    new Set(sportsEvents.map((event) => event.id)).size,
    sportsEvents.length,
  );
  for (const event of sportsEvents) {
    for (const name of [event.home, event.away]) {
      if (identities[name])
        assert.ok(
          existsSync(new URL(`../public${identities[name]}`, import.meta.url)),
          name,
        );
    }
    for (const market of event.markets) {
      for (const outcome of market.outcomes)
        assert.ok(resolvePick(`${event.id}:${market.id}:${outcome.id}`));
    }
  }
});

test("sports: direct bets and combos calculate independent stake and exact returns", () => {
  assert.deepEqual(slipTotals([madrid, london], "10", "single"), {
    stake: 2000,
    payout: 4750,
    odds: 5.565,
  });
  assert.deepEqual(slipTotals([madrid, london], "10", "combo"), {
    stake: 1000,
    payout: 5565,
    odds: 5.565,
  });
  assert.equal(slipTotals([madrid, london], "1.01", "combo").payout, 562);
});

test("sports: correlated selections replace each other and can be removed", () => {
  const replacement = "parma-udinese:goals:over";
  assert.deepEqual(togglePick([madrid, london], replacement), [
    london,
    replacement,
  ]);
  assert.deepEqual(togglePick([madrid, london], madrid), [london]);
  assert.deepEqual(sanitizePicks([madrid, madrid, null, "unknown", london]), [
    madrid,
    london,
  ]);
  assert.equal(resolvePick(`${madrid}:extra`), null);
});

test("sports: invalid amounts and missing events never produce a return", () => {
  for (const stake of [
    "0",
    "-10",
    "1000.01",
    "NaN",
    "1e2",
    "1.234",
    "",
    "Infinity",
  ]) {
    assert.equal(slipTotals([madrid], stake), null, stake);
  }
  assert.equal(slipTotals([], "10"), null);
  assert.equal(slipTotals(["missing:winner:home"], "10"), null);
  assert.equal(slipTotals([madrid], "1000").stake, 100000);
  assert.equal(displayOdds(2.1, "american"), "+110");
  assert.equal(displayOdds(1.5, "american"), "-200");
});
