"use client";
import { useRef, useState } from "react";
import { Bomb, Diamond, Shuffle } from "lucide-react";
import {
  createMinefield,
  mineMultiplier,
  stakeInCents,
  formatCredits,
  payoutFor,
  randomInt,
} from "../../lib/games/engine";
import { BetControl, GameButton, Gem, RoundResult, Stat } from "./Shared";

export default function MinesGame({ wallet, sound }) {
  const [stake, setStake] = useState("10.00"),
    [count, setCount] = useState(3),
    [board, setBoard] = useState(null),
    [result, setResult] = useState(null),
    [error, setError] = useState("");
  const active = useRef(null);
  const busy = Boolean(wallet.pending);
  const seen = board?.seen.length || 0;
  const multiplier = mineMultiplier(count, seen);
  const begin = () => {
    const round = wallet.start(stakeInCents(stake), "mines");
    if (!round) return setError("Revisa la apuesta y las fichas disponibles.");
    const next = {
      ...round,
      mines: createMinefield(count),
      seen: [],
      hit: null,
      finished: false,
    };
    active.current = next;
    setBoard(next);
    setResult(null);
    setError("");
    sound("start");
  };
  const collect = () => {
    const current = active.current;
    if (!current || !current.seen.length) return;
    active.current = null;
    setBoard({ ...current, finished: true });
    setResult(
      wallet.finish(
        current.id,
        mineMultiplier(count, current.seen.length),
        `${current.seen.length} gemas`,
      ),
    );
    sound("win");
  };
  const reveal = (index) => {
    const current = active.current;
    if (!current || current.seen.includes(index)) return;
    if (current.mines.includes(index)) {
      active.current = null;
      setBoard({ ...current, hit: index, finished: true });
      setResult(wallet.finish(current.id, 0, "Mina encontrada"));
      sound("lose");
    } else {
      const next = { ...current, seen: [...current.seen, index] };
      active.current = next;
      setBoard(next);
      sound("gem");
      if (next.seen.length === 25 - count) collect();
    }
  };
  const randomTile = () => {
    if (!active.current) return;
    const remaining = Array.from({ length: 25 }, (_, index) => index).filter(
      (index) => !active.current.seen.includes(index),
    );
    reveal(remaining[randomInt(remaining.length)]);
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
        <label className="game-field" htmlFor="mine-count">
          Número de minas
          <select
            id="mine-count"
            value={count}
            disabled={busy}
            onChange={(event) => {
              setCount(Number(event.target.value));
              setBoard(null);
              setResult(null);
            }}
          >
            {Array.from({ length: 10 }, (_, i) => (
              <option value={i + 1} key={i}>
                {i + 1} {i ? "minas" : "mina"}
              </option>
            ))}
          </select>
        </label>
        <div className="game-controls__stats">
          <Stat label="Gemas restantes">{25 - count - seen}</Stat>
          <Stat label="Multiplicador">{multiplier.toFixed(2)}×</Stat>
        </div>
        {busy ? (
          <GameButton collecting disabled={!seen} onClick={collect}>
            Recoger {formatCredits(payoutFor(wallet.pending.stake, multiplier))}
          </GameButton>
        ) : (
          <GameButton disabled={!wallet.ready} onClick={begin}>
            Empezar ronda
          </GameButton>
        )}
        <button
          className="game-secondary"
          disabled={!busy}
          onClick={randomTile}
        >
          <Shuffle size={16} />
          Elegir casilla al azar
        </button>
        {error && (
          <p className="game-error" role="alert">
            {error}
          </p>
        )}
        <div className="game-controls__return">
          <span>Siguiente gema</span>
          <strong>
            {seen < 25 - count
              ? mineMultiplier(count, seen + 1).toFixed(2)
              : multiplier.toFixed(2)}
            ×
          </strong>
        </div>
        <p className="game-controls__hint">
          Puedes recoger tus fichas después de encontrar la primera gema.
        </p>
      </aside>
      <section className="game-stage mines-stage" aria-label="Tablero de Mines">
        <div className="game-stage__eyebrow">
          HORSEBET ORIGINALS <span>02 / MINES</span>
        </div>
        <div className="mines-stage__legend">
          <span>
            <Gem />
            {25 - count} gemas
          </span>
          <span>
            <Bomb size={16} />
            {count} minas
          </span>
        </div>
        <div
          className="mine-grid"
          role="group"
          aria-label="Tablero de 25 casillas"
        >
          {Array.from({ length: 25 }, (_, index) => {
            const opened = board?.seen.includes(index),
              mine = board?.finished && board.mines.includes(index),
              hit = board?.hit === index;
            return (
              <button
                key={index}
                className={`mine-tile ${opened ? "mine-tile--gem" : ""} ${mine ? "mine-tile--mine" : ""} ${hit ? "mine-tile--hit" : ""}`}
                disabled={!busy || opened}
                onClick={() => reveal(index)}
                aria-label={`Casilla ${index + 1}${opened ? ", gema" : mine ? ", mina" : ", oculta"}`}
                aria-pressed={Boolean(opened)}
              >
                {opened ? <Gem /> : mine ? <Bomb /> : <Diamond />}
              </button>
            );
          })}
        </div>
        <RoundResult
          result={result}
          idle={
            busy
              ? `${seen} ${seen === 1 ? "gema descubierta" : "gemas descubiertas"} · Elige otra casilla o recoge`
              : "Empieza una ronda para descubrir las gemas"
          }
        />
      </section>
    </div>
  );
}
