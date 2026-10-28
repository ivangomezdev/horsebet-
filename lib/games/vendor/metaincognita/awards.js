// Adapted from cschweda/metaincognita-slots, c09d03ac9ae028e1e0943c9935480dde3b6ed443
// Copyright (c) 2026 Chris Schweda. MIT; see public/licenses/metaincognita-slots.txt.

export function leftRun(line, symbol) {
  let n = 0;
  for (const s of line) {
    if (s === symbol) n++;
    else break;
  }
  return n;
}

/** First matching entry wins. `run` matches EXACT left-run length. */
export function ballyAwardForLine(line, paytable) {
  for (const entry of paytable) {
    if (entry.kind === "run") {
      if (leftRun(line, entry.symbol) === entry.length) return entry;
    } else {
      if (line.every((s) => s === entry.symbol)) return entry;
    }
  }
  return null;
}

/** Every entry tested; highest pay wins. See plan "Numbers provenance" for semantics. */
export function bestStepperAward(line, def) {
  const wild = def.wildSymbol;
  const nWild = wild === null ? 0 : line.filter((s) => s === wild).length;
  let best = null;

  for (const entry of def.paytable) {
    let pay = 0;
    let wildCount = 0;

    if (entry.kind === "allWild") {
      if (wild !== null && nWild === line.length) pay = entry.pay;
    } else if (entry.kind === "allSame") {
      if (
        nWild < line.length &&
        line.every((s) => s === entry.symbol || s === wild)
      ) {
        wildCount = nWild;
        pay = entry.pay * def.wildMultiplier ** wildCount;
      }
    } else if (entry.kind === "anyOf") {
      if (
        nWild < line.length &&
        line.every((s) => entry.symbols.includes(s) || s === wild)
      ) {
        wildCount = nWild;
        pay = entry.pay * def.wildMultiplier ** wildCount;
      }
    } else {
      if (line.filter((s) => s === entry.symbol).length === entry.n)
        pay = entry.pay;
    }

    if (pay > 0 && (best === null || pay > best.payCredits)) {
      best = { entry, wildCount, payCredits: pay };
    }
  }
  return best;
}
