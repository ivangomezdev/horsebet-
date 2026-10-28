// Adapted from cschweda/metaincognita-slots, c09d03ac9ae028e1e0943c9935480dde3b6ed443
// Copyright (c) 2026 Chris Schweda. MIT; see public/licenses/metaincognita-slots.txt.
// Cascade / tumble engine (Temple of Gold). NON-INTERACTIVE: the entire tumble
// chain resolves inside one spinCascade() call (one bet). Each cell is an
// independent weighted draw; a paying symbol landing >= minMatch times anywhere
// on the grid pays (scatter / pay-anywhere), its cells shatter and the column
// tumbles + refills, and each successive chain climbs the multiplier ladder.
// A rare idol scatter on the INITIAL grid awards the percent Grand (decoupled
// from the tumble so the exact RTP stays computable — see cascadeRtp.ts).

/** Draw alphabet: every weighted symbol (paying symbols + the idol). */
export function cascadeAlphabet(def) {
  const entries = Object.entries(def.weights).map(([sym, w]) => ({ sym, w }));
  const total = entries.reduce((a, e) => a + e.w, 0);
  return { entries, total };
}

function pick(entries, total, rand) {
  let r = rand() * total;
  for (const e of entries) {
    r -= e.w;
    if (r < 0) return e.sym;
  }
  return entries[entries.length - 1].sym;
}

/** A fresh grid: cols columns × rows cells, each an i.i.d. weighted draw. grid[col][row], row 0 = top. */
function drawGrid(def, entries, total, rand) {
  const grid = [];
  for (let c = 0; c < def.cols; c++) {
    const col = [];
    for (let r = 0; r < def.rows; r++) col.push(pick(entries, total, rand));
    grid.push(col);
  }
  return grid;
}

const cloneGrid = (grid) => grid.map((col) => col.slice());

/** Count every symbol across the whole grid (scatter / position-independent). */
export function countSymbols(grid) {
  const m = new Map();
  for (const col of grid) for (const s of col) m.set(s, (m.get(s) ?? 0) + 1);
  return m;
}

/** Highest matching count tier's pay (per coin), or null if the count clears none. */
export function tierPay(tiers, count) {
  let best = null;
  let bestAt = -1;
  for (const t of tiers) {
    if (count >= t.countAtLeast && t.countAtLeast > bestAt) {
      best = t.pay;
      bestAt = t.countAtLeast;
    }
  }
  return best;
}

/** Ladder multiplier for 1-based chain index (clamped to the last rung). */
export function ladderMult(def, chain) {
  const i = Math.min(chain, def.multiplierLadder.length) - 1;
  return def.multiplierLadder[i] ?? 1;
}

/**
 * One tumble: drop every winning-symbol cell, let survivors fall to the bottom
 * of their column, and refill the emptied top slots with fresh i.i.d. draws.
 * Non-winning symbols (including idols and sub-threshold paying symbols) persist.
 */
function tumble(def, grid, winnerSet, entries, total, rand) {
  return grid.map((col) => {
    const survivors = col.filter((s) => !winnerSet.has(s));
    const need = def.rows - survivors.length;
    const top = [];
    for (let i = 0; i < need; i++) top.push(pick(entries, total, rand));
    return [...top, ...survivors];
  });
}

/**
 * Resolve one cascade spin. Returns a SpinOutcome whose totalPayout is the sum
 * of every chain's pays (× ladder, × coins) plus any Grand, and whose
 * cascadeSteps carry the tumble sequence for UI animation.
 */
export function spinCascade(def, state, coins, rand) {
  const { entries, total } = cascadeAlphabet(def);
  let grid = drawGrid(def, entries, total, rand);

  // The Grand is decided by the INITIAL grid's idol count only (exactly computable).
  const idolInit = countSymbols(grid).get(def.idolSymbol) ?? 0;

  const steps = [];
  const wins = [];
  const progressiveEvents = [];
  let totalPayout = 0;
  let chain = 0;

  // Tumble loop: score → record → shatter → tumble, until a grid produces no win.
  for (;;) {
    chain += 1;
    const counts = countSymbols(grid);
    const idolCount = counts.get(def.idolSymbol) ?? 0;
    const chainMult = ladderMult(def, chain);

    // Past the cap, the grid is left as-is (no further scoring) — bounds the
    // tumble so the exact RTP stays tractable.
    const winners = [];
    if (chain <= def.maxTumbles) {
      for (const sym of Object.keys(def.paytable)) {
        const c = counts.get(sym) ?? 0;
        if (c < def.minMatch) continue;
        const p = tierPay(def.paytable[sym], c);
        if (p !== null) winners.push({ sym, pay: p });
      }
    }

    if (winners.length === 0) {
      // final settle: the resting grid, no wins (gives the animation its last frame)
      steps.push({
        grid: cloneGrid(grid),
        wins: [],
        chain,
        chainMult,
        idolCount,
      });
      break;
    }

    const stepWins = [];
    for (const w of winners) {
      const credits = w.pay * chainMult * coins;
      const lw = {
        line: "scatter",
        entryId: w.sym,
        symbols: [w.sym],
        payCredits: credits,
        wildCount: 0,
        progressive: false,
      };
      stepWins.push(lw);
      wins.push(lw);
      totalPayout += credits;
    }
    steps.push({
      grid: cloneGrid(grid),
      wins: stepWins,
      chain,
      chainMult,
      idolCount,
    });

    const winnerSet = new Set(winners.map((w) => w.sym));
    grid = tumble(def, grid, winnerSet, entries, total, rand);
  }

  // Grand: idols on the initial grid. Pay the live meter, reset it, like video.ts.
  if (
    idolInit >= def.grandTrigger &&
    state.progressive?.kind === "percent" &&
    def.progressive !== null
  ) {
    const grand = Math.floor(state.progressive.value);
    state.progressive.value = def.progressive.reset;
    wins.push({
      line: "grand",
      entryId: "grand",
      symbols: [],
      payCredits: grand,
      wildCount: 0,
      progressive: true,
    });
    totalPayout += grand;
    progressiveEvents.push({
      type: "hit",
      meter: "percent",
      amountCredits: grand,
    });
  }

  return {
    machineId: def.id,
    family: "cascade",
    coins,
    gameKind: "base",
    coinsIn: coins,
    stops: [],
    grid,
    wins,
    totalPayout,
    progressiveEvents,
    featureEvents: [],
    cascadeSteps: steps,
    trace: { draws: [] },
  };
}
