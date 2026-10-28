"use client";
import { useState } from "react";
import { ArrowLeftRight, Dices } from "lucide-react";
import {
  diceResult,
  stakeInCents,
  formatCredits,
  payoutFor,
} from "../../lib/games/engine";
import {
  BetControl,
  GameButton,
  RoundResult,
  Stat,
  useRoundTimer,
} from "./Shared";

export default function DiceGame({ wallet, sound }) {
  const [stake, setStake] = useState("10.00"),
    [chance, setChance] = useState(50),
    [direction, setDirection] = useState("under"),
    [result, setResult] = useState(null),
    [roll, setRoll] = useState(null),
    [error, setError] = useState("");
  const later = useRoundTimer();
  const busy = Boolean(wallet.pending);
  const threshold = direction === "under" ? chance : 100 - chance;
  const play = () => {
    const cents = stakeInCents(stake);
    const round = wallet.start(cents, "dice");
    if (!round) return setError("Revisa la apuesta y las fichas disponibles.");
    setError("");
    sound("start");
    const outcome = diceResult(chance, direction);
    later(() => {
      setRoll(outcome.roll);
      setResult(
        wallet.finish(round.id, outcome.multiplier, outcome.roll.toFixed(2)),
      );
      sound(outcome.won ? "win" : "lose");
    }, 1050);
  };
  return (
    <div className="game-layout">
      <aside className="game-controls">
        <div className="game-controls__mode">
          <span className="live-dot" />
          Juego manual
        </div>
        <BetControl
          value={stake}
          onChange={setStake}
          disabled={busy}
          balance={wallet.balance}
        />
        <div className="game-controls__stats">
          <Stat label="Multiplicador">{(97 / chance).toFixed(2)}×</Stat>
          <Stat label="Probabilidad">{chance}%</Stat>
        </div>
        <label className="game-field">
          Objetivo
          <button
            className="game-direction"
            disabled={busy}
            onClick={() =>
              setDirection(direction === "under" ? "over" : "under")
            }
          >
            <span>
              {direction === "under" ? "Menor que" : "Mayor o igual a"}{" "}
              <b>{threshold.toFixed(2)}</b>
            </span>
            <ArrowLeftRight size={17} />
          </button>
        </label>
        <GameButton disabled={!wallet.ready || busy} onClick={play}>
          {busy ? "Lanzando…" : "Lanzar dados"}
        </GameButton>
        {error && (
          <p className="game-error" role="alert">
            {error}
          </p>
        )}
        <div className="game-controls__return">
          <span>Retorno si aciertas</span>
          <strong>
            {formatCredits(payoutFor(stakeInCents(stake) || 100, 97 / chance))}{" "}
            <small>fichas</small>
          </strong>
        </div>
        <p className="game-controls__hint">
          Ajusta la probabilidad con el control del tablero.
        </p>
      </aside>
      <section
        className={`game-stage dice-stage ${busy ? "dice-stage--rolling" : ""}`}
        aria-label="Tablero de Dice"
      >
        <div className="game-stage__eyebrow">
          HORSEBET ORIGINALS <span>01 / DICE</span>
        </div>
        <div className="dice-stage__orb">
          <Dices size={58} strokeWidth={1.3} />
        </div>
        <div
          className={`dice-number ${result && !busy && result.payout ? "dice-number--win" : ""}`}
        >
          <span>
            {busy ? "••.••" : roll === null ? "50.00" : roll.toFixed(2)}
          </span>
          <small>
            {busy
              ? "EL DADO ESTÁ EN EL AIRE"
              : roll === null
                ? "TU PRÓXIMO NÚMERO"
                : result?.payout
                  ? "OBJETIVO ALCANZADO"
                  : "PRUEBA EN LA SIGUIENTE RONDA"}
          </small>
        </div>
        <div
          className={`dice-slider ${direction === "over" ? "dice-slider--over" : ""}`}
          style={{ "--threshold": `${threshold}%` }}
        >
          <div className="dice-slider__track" />
          {roll !== null && !busy && (
            <span className="dice-slider__marker" style={{ left: `${roll}%` }}>
              {roll.toFixed(2)}
            </span>
          )}
          <input
            aria-label="Probabilidad de ganar"
            type="range"
            min="5"
            max="95"
            value={chance}
            disabled={busy}
            onChange={(event) => setChance(Number(event.target.value))}
            style={{ direction: direction === "over" ? "rtl" : "ltr" }}
          />
          <div className="dice-slider__ticks">
            <span>0</span>
            <span>25</span>
            <span>50</span>
            <span>75</span>
            <span>100</span>
          </div>
        </div>
        <RoundResult
          result={result}
          pending={busy}
          idle="Elige tu probabilidad y lanza los dados"
        />
      </section>
    </div>
  );
}
