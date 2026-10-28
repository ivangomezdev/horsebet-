import test from "node:test";
import assert from "node:assert/strict";
import { simulatedPlayers, simulatedWins } from "../data/recent-wins.js";
import { playablePath } from "../data/playable-games.js";

test("simulated carousel keeps 200 distinct identities assigned to one playable game", () => {
  assert.equal(simulatedPlayers.length, 200);
  assert.equal(
    new Set(simulatedPlayers.map((player) => player.username)).size,
    200,
  );
  const players = new Map(
    simulatedPlayers.map((player) => [player.id, player]),
  );
  assert.equal(new Set(simulatedWins.map((win) => win.playerId)).size, 200);
  for (const win of simulatedWins) {
    const player = players.get(win.playerId);
    assert.equal(win.game.id, player.game.id);
    assert.equal(win.username, player.username);
    assert.equal(win.hue, player.hue);
    assert.ok(playablePath(win.game.id));
    assert.ok(win.amount > 0);
  }
  assert.ok(
    simulatedWins.some(
      (win, i) => i > 0 && win.amount < simulatedWins[i - 1].amount,
    ),
  );
});
