import { findSportsEvent } from "../../data/sports.js";

export function resolvePick(key) {
  if (typeof key !== "string" || key.split(":").length !== 3) return null;
  const [eventId, marketId, outcomeId] = key.split(":");
  const event = findSportsEvent(eventId);
  const market = event?.markets.find((item) => item.id === marketId);
  const outcome = market?.outcomes.find((item) => item.id === outcomeId);
  return outcome ? { key, event, market, outcome } : null;
}

export function togglePick(keys, key) {
  const pick = resolvePick(key);
  if (!pick) return keys;
  if (keys.includes(key)) return keys.filter((item) => item !== key);
  // One selection per event avoids treating correlated markets as independent.
  return [
    ...keys.filter((item) => resolvePick(item)?.event.id !== pick.event.id),
    key,
  ].slice(-6);
}

export function sanitizePicks(keys) {
  if (!Array.isArray(keys)) return [];
  return [...new Set(keys)].reduce(
    (valid, key) => (resolvePick(key) ? togglePick(valid, key) : valid),
    [],
  );
}

export function slipTotals(keys, stake, mode = "single") {
  const picks = sanitizePicks(keys).map(resolvePick);
  if (!/^\d{1,4}(\.\d{1,2})?$/.test(String(stake))) return null;
  const cents = Math.round(Number(stake) * 100);
  if (cents < 100 || cents > 100000 || !picks.length) return null;
  const odds = picks.map(({ outcome }) =>
    BigInt(Math.round(outcome.odds * 100)),
  );
  const product = odds.reduce((value, price) => value * price, 1n);
  const divisor = 100n ** BigInt(picks.length);
  const payout =
    mode === "combo"
      ? (BigInt(cents) * product) / divisor
      : odds.reduce(
          (value, price) => value + (BigInt(cents) * price) / 100n,
          0n,
        );
  return {
    stake: cents * (mode === "combo" ? 1 : picks.length),
    payout: Number(payout),
    odds: Number(product) / Number(divisor),
  };
}

export const sportsMoney = (cents) =>
  (cents / 100).toLocaleString("es-MX", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
export function displayOdds(value, format = "decimal") {
  if (format === "american")
    return value >= 2
      ? `+${Math.round((value - 1) * 100)}`
      : `${Math.round(-100 / (value - 1))}`;
  return value.toFixed(2);
}
