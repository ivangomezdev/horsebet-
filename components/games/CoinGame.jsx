"use client";
import { useState } from "react";
import Brand from "../Brand";
import {
  coinResult,
  stakeInCents,
  formatCredits,
  payoutFor,
} from "../../lib/games/engine";
import {
  BetControl,
  GameButton,
  Horseshoe,
  RoundResult,
  Stat,
  useRoundTimer,
} from "./Shared";

export default function CoinGame({ wallet, sound }) {
  const [stake, setStake] = useState("10.00"),
    [choice, setChoice] = useState(0),
    [face, setFace] = useState(0),
    [turn, setTurn] = useState(0),
    [result, setResult] = useState(null),
    [error, setError] = useState("");
  const later = useRoundTimer();
  const busy = Boolean(wallet.pending);
  const play = () => {
    const round = wallet.start(stakeInCents(stake), "coin");
    if (!round) return setError("Revisa la apuesta y las fichas disponibles.");
    setError("");
    sound("start");
    const outcome = coinResult(choice);
    setTurn((value) => value + 6 + (outcome.face - face) / 2);
    setFace(outcome.face);
    later(() => {
      setResult(
        wallet.finish(
          round.id,
          outcome.multiplier,
          outcome.face === 0 ? "Caballo" : "Herradura",
        ),
      );
      sound(outcome.won ? "win" : "lose");
    }, 1600);
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
        <fieldset className="coin-choice" disabled={busy}>
          <legend>Elige tu lado</legend>
          <button
            className={
              choice === 0
                ? "coin-choice__button coin-choice__button--active"
                : "coin-choice__button"
            }
            onClick={() => setChoice(0)}
            aria-pressed={choice === 0}
          >
            <Brand />
            <span>Caballo</span>
          </button>
          <button
            className={
              choice === 1
                ? "coin-choice__button coin-choice__button--active"
                : "coin-choice__button"
            }
            onClick={() => setChoice(1)}
            aria-pressed={choice === 1}
          >
            <Horseshoe />
            <span>Herradura</span>
          </button>
        </fieldset>
        <div className="game-controls__stats">
          <Stat label="Multiplicador">1.94×</Stat>
          <Stat label="Probabilidad">50%</Stat>
        </div>
        <GameButton disabled={!wallet.ready || busy} onClick={play}>
          {busy ? "La moneda está girando…" : "Lanzar moneda"}
        </GameButton>
        {error && (
          <p className="game-error" role="alert">
            {error}
          </p>
        )}
        <div className="game-controls__return">
          <span>Retorno si aciertas</span>
          <strong>
            {formatCredits(payoutFor(stakeInCents(stake) || 100, 1.94))}{" "}
            <small>fichas</small>
          </strong>
        </div>
      </aside>
      <section
        className={`game-stage coin-stage ${busy ? "coin-stage--flipping" : ""}`}
        aria-label="Tablero de Coin Flip"
      >
        <div className="game-stage__eyebrow">
          HORSEBET ORIGINALS <span>04 / COIN FLIP</span>
        </div>
        <div className="coin-scene">
          <div className="coin-scene__halo" />
          <div
            className="horse-coin"
            style={{ transform: `rotateY(${turn * 360}deg)` }}
          >
            <div className="horse-coin__face horse-coin__face--front">
              <span className="horse-coin__inscription">
                HORSEBET · ORIGINALS
              </span>
              <Brand />
              <span className="horse-coin__year">★ EST. 2026 ★</span>
            </div>
            <div className="horse-coin__face horse-coin__face--back">
              <span className="horse-coin__inscription">
                MAKE YOUR OWN LUCK
              </span>
              <Horseshoe />
              <span className="horse-coin__year">★ HORSEBET ★</span>
            </div>
          </div>
          <div className="coin-scene__shadow" />
        </div>
        <div className="coin-stage__caption">
          {busy
            ? "EL DESTINO ESTÁ EN EL AIRE"
            : result
              ? face === 0
                ? "CABALLO"
                : "HERRADURA"
              : "¿DE QUÉ LADO ESTÁ TU SUERTE?"}
        </div>
        <RoundResult
          result={result}
          pending={busy}
          idle="Una moneda. Dos posibilidades."
        />
      </section>
    </div>
  );
}
