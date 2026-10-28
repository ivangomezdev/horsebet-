"use client";
import { useEffect, useRef } from "react";
import { Coins, Play, Sparkles } from "lucide-react";
import { formatCredits, stakeInCents, MAX_STAKE } from "../../lib/games/engine";

export function useRoundTimer() {
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);
  return (callback, duration) => {
    clearTimeout(timer.current);
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    timer.current = setTimeout(callback, reduced ? 80 : duration);
  };
}
export function BetControl({ value, onChange, disabled, balance }) {
  const adjust = (factor) => {
    const current = stakeInCents(value) || 100;
    onChange(
      (
        Math.max(
          100,
          Math.min(
            MAX_STAKE,
            Math.floor(current * factor),
            Math.max(100, balance),
          ),
        ) / 100
      ).toFixed(2),
    );
  };
  return (
    <div className="game-bet">
      <label htmlFor="demo-stake">
        Apuesta <span>FICHAS DEMO</span>
      </label>
      <div className="game-bet__input">
        <Coins size={17} />
        <input
          id="demo-stake"
          inputMode="decimal"
          autoComplete="off"
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          aria-describedby="demo-stake-limit"
        />
        <button
          disabled={disabled}
          onClick={() => adjust(0.5)}
          aria-label="Dividir apuesta entre dos"
        >
          ½
        </button>
        <button
          disabled={disabled}
          onClick={() => adjust(2)}
          aria-label="Duplicar apuesta"
        >
          2×
        </button>
      </div>
      <small id="demo-stake-limit">De 1 a 1,000 fichas por ronda</small>
    </div>
  );
}
export function GameButton({
  children,
  disabled,
  onClick,
  collecting = false,
}) {
  return (
    <button
      className={`game-action ${collecting ? "game-action--collect" : ""}`}
      disabled={disabled}
      onClick={onClick}
    >
      {collecting ? (
        <Sparkles size={18} />
      ) : (
        <Play size={17} fill="currentColor" />
      )}
      {children}
    </button>
  );
}
export function Stat({ label, children }) {
  return (
    <div className="game-stat">
      <span>{label}</span>
      <strong>{children}</strong>
    </div>
  );
}
export function RoundResult({ result, idle, pending }) {
  const profit = result ? result.payout - result.stake : 0;
  return (
    <div
      className={`game-result ${result && !pending ? (profit > 0 ? "game-result--win" : "game-result--loss") : ""}`}
      role="status"
      aria-live="polite"
    >
      {pending ? (
        <>
          <span className="game-result__dot" />
          Ronda en curso…
        </>
      ) : result ? (
        <>
          <span>{result.payout ? "Retorno" : "Sin retorno"}</span>
          <strong>
            {formatCredits(result.payout)} <small>fichas</small>
          </strong>
          <span>
            {result.multiplier.toFixed(2)}× · {profit > 0 ? "+" : ""}
            {formatCredits(profit)} netas
          </span>
        </>
      ) : (
        <>
          <Sparkles size={18} />
          <span>{idle}</span>
        </>
      )}
    </div>
  );
}
export function Gem({ className = "" }) {
  return (
    <svg
      className={`mine-gem ${className}`}
      viewBox="0 0 80 74"
      fill="none"
      aria-hidden="true"
    >
      <path d="M17 8h46l14 22-37 40L3 30 17 8Z" fill="#23cbab" />
      <path d="m17 8 10 22H3L17 8Z" fill="#72ffe1" />
      <path d="m17 8 23 1-13 21L17 8Z" fill="#c2fff0" />
      <path d="m40 9 13 21H27L40 9Z" fill="#70ffcf" />
      <path d="m40 9 23-1-10 22L40 9Z" fill="#b3ffe5" />
      <path d="m63 8 14 22H53L63 8Z" fill="#55ecb4" />
      <path d="m3 30 37 40-13-40H3Z" fill="#13a789" />
      <path d="m27 30 13 40 13-40H27Z" fill="#38efb9" />
      <path d="m53 30-13 40 37-40H53Z" fill="#097e73" />
      <path
        d="m17 8 46 0 14 22-37 40L3 30 14-22Z"
        stroke="#adffe7"
        strokeOpacity=".35"
        strokeWidth="2"
      />
    </svg>
  );
}
export function Horseshoe() {
  return (
    <svg viewBox="0 0 100 100" fill="none" aria-hidden="true">
      <path
        d="M22 19v36a28 28 0 0 0 56 0V19H63v36a13 13 0 0 1-26 0V19H22Z"
        fill="currentColor"
      />
      <path
        d="M28 28v5m0 12v5m5 17 3 3m36-42v5m0 12v5m-5 17-3 3M48 77h5"
        stroke="#55371d"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}
