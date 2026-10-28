// Browser-only play-money rules. Never use these outcomes to settle real wallets.
export const INITIAL_CREDITS = 1000000;
export const MAX_STAKE = 100000;
export const PLINKO_PAYOUTS = {
  low: [5, 2, 1.3, 0.9, 0.5, 0.9, 1.3, 2, 5],
  high: [29, 5, 1, 0.4, 0.2, 0.4, 1, 5, 29],
};

export function randomInt(limit, source = globalThis.crypto) {
  if (!Number.isInteger(limit) || limit < 1 || limit > 0xffffffff)
    throw new Error("Invalid random range");
  const cutoff = Math.floor(0x100000000 / limit) * limit;
  const bytes = new Uint32Array(1);
  do {
    source.getRandomValues(bytes);
  } while (bytes[0] >= cutoff);
  return bytes[0] % limit;
}
export function stakeInCents(value) {
  const text = String(value).replace(",", ".");
  if (!/^\d{1,7}(\.\d{1,2})?$/.test(text)) return null;
  const [whole, fraction = ""] = text.split(".");
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  return cents >= 100 && cents <= MAX_STAKE ? cents : null;
}
export function formatCredits(cents) {
  return (cents / 100).toLocaleString("es-MX", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
export function payoutFor(stake, multiplier) {
  if (
    !Number.isSafeInteger(stake) ||
    stake <= 0 ||
    !Number.isFinite(multiplier) ||
    multiplier < 0
  )
    throw new Error("Invalid payout");
  return Math.floor(stake * multiplier + 1e-8);
}
export function diceResult(chance, direction, roll = randomInt(10000)) {
  if (
    !Number.isInteger(chance) ||
    chance < 5 ||
    chance > 95 ||
    !["under", "over"].includes(direction) ||
    !Number.isInteger(roll) ||
    roll < 0 ||
    roll >= 10000
  )
    throw new Error("Invalid dice round");
  const won =
    direction === "under" ? roll < chance * 100 : roll >= (100 - chance) * 100;
  return { roll: roll / 100, won, multiplier: won ? 97 / chance : 0 };
}
export function coinResult(choice, face = randomInt(2)) {
  if (![0, 1].includes(choice) || ![0, 1].includes(face))
    throw new Error("Invalid coin round");
  return { face, won: choice === face, multiplier: choice === face ? 1.94 : 0 };
}
export function mineMultiplier(mines, revealed) {
  if (
    !Number.isInteger(mines) ||
    mines < 1 ||
    mines > 10 ||
    !Number.isInteger(revealed) ||
    revealed < 0 ||
    revealed > 25 - mines
  )
    throw new Error("Invalid mine count");
  if (!revealed) return 1;
  let survival = 1;
  for (let i = 0; i < revealed; i++) survival *= (25 - mines - i) / (25 - i);
  return 0.97 / survival;
}
export function createMinefield(count, random = randomInt) {
  mineMultiplier(count, 0);
  const positions = Array.from({ length: 25 }, (_, index) => index);
  for (let i = 0; i < count; i++) {
    const next = i + random(25 - i);
    [positions[i], positions[next]] = [positions[next], positions[i]];
  }
  return positions.slice(0, count);
}
export function plinkoResult(risk, random = randomInt) {
  if (!PLINKO_PAYOUTS[risk]) throw new Error("Invalid risk");
  const steps = Array.from({ length: 8 }, () => random(2));
  const bucket = steps.reduce((sum, step) => sum + step, 0);
  return { steps, bucket, multiplier: PLINKO_PAYOUTS[risk][bucket] };
}
