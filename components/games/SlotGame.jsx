"use client";
import { useEffect, useRef, useState } from "react";
import { RotateCw, Zap, List, Trophy } from "lucide-react";
import Reel from "../../lib/games/vendor/Reel";
import { slotSymbols, slotThemes } from "../../data/slots";
import {
  spinSlot,
  slotSymbol,
  slotPaytable,
  slotReturn,
  PAYLINES,
} from "../../lib/games/slots";
import { stakeInCents, formatCredits } from "../../lib/games/engine";
import { BetControl, GameButton, RoundResult, Stat } from "./Shared";
import { GameArt } from "../Artwork";

export function SlotSymbol({ id }) {
  return (
    <span
      className={`slot-symbol slot-symbol--${id}`}
      role="img"
      aria-label={slotSymbols.find((symbol) => symbol.id === id)?.name}
    />
  );
}
function createSymbol(id) {
  const cell = document.createElement("span");
  cell.className = "slot-reel__cell";
  const sprite = document.createElement("span");
  sprite.className = `slot-symbol slot-symbol--${id}`;
  sprite.setAttribute("role", "img");
  sprite.setAttribute(
    "aria-label",
    slotSymbols.find((symbol) => symbol.id === id).name,
  );
  cell.appendChild(sprite);
  return cell;
}
const initialGrid = [
  ["cherry", "horse", "emerald"],
  ["bell", "seven", "ruby"],
  ["shoe", "crown", "diamond"],
  ["ruby", "horse", "cherry"],
  ["emerald", "bell", "seven"],
];
function SlotBoard({ gameId, engines, outcome, spinning }) {
  const mounts = useRef([]);
  useEffect(() => {
    engines.current = mounts.current.map(
      (element, index) =>
        new Reel(element, index, initialGrid[index], createSymbol, () =>
          slotSymbol(gameId),
        ),
    );
    return () => {
      engines.current.forEach((reel) => reel.dispose());
      engines.current = [];
    };
  }, [gameId, engines]);
  const cells = new Set(
    !spinning ? outcome?.wins.flatMap((win) => win.cells) : [],
  );
  return (
    <div className="slot-cabinet">
      <div className="slot-cabinet__trim" />
      <div className="slot-cabinet__lamps">
        <i />
        <i />
        <i />
        <i />
        <i />
      </div>
      <div
        className={`slot-board ${spinning ? "slot-board--spinning" : ""}`}
        role="group"
        aria-label="Cinco rodillos de tres símbolos"
      >
        {Array.from({ length: 5 }, (_, index) => (
          <div
            className="slot-reel"
            key={index}
            ref={(element) => {
              mounts.current[index] = element;
            }}
          />
        ))}
        <div className="slot-board__highlights" aria-hidden="true">
          {Array.from({ length: 15 }, (_, index) => {
            const col = index % 5,
              row = Math.floor(index / 5);
            return (
              <span
                key={index}
                className={cells.has(`${col}-${row}`) ? "slot-board__hit" : ""}
              />
            );
          })}
        </div>
        {!spinning && outcome?.wins.length > 0 && (
          <svg
            className="slot-board__lines"
            viewBox="0 0 500 300"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {outcome.wins.map((win) => (
              <polyline
                key={win.line}
                points={PAYLINES[win.line]
                  .slice(0, win.count)
                  .map((row, index) => `${50 + index * 100},${50 + row * 100}`)
                  .join(" ")}
                fill="none"
                stroke="var(--slot-line)"
                strokeWidth="2"
                strokeDasharray="5 6"
              />
            ))}
          </svg>
        )}
      </div>
      <div className="slot-cabinet__base">
        <span>5 RODILLOS</span>
        <span>HORSEBET</span>
        <span>5 LÍNEAS</span>
      </div>
    </div>
  );
}
export default function SlotGame({ gameId, wallet, sound }) {
  const theme = slotThemes[gameId],
    engines = useRef([]),
    mounted = useRef(true);
  const [stake, setStake] = useState("10.00"),
    [turbo, setTurbo] = useState(false),
    [outcome, setOutcome] = useState(null),
    [result, setResult] = useState(null),
    [error, setError] = useState(""),
    [table, setTable] = useState(false);
  const busy = Boolean(wallet.pending);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const play = async () => {
    if (engines.current.length !== 5) return;
    const round = wallet.start(stakeInCents(stake), gameId);
    if (!round) return setError("Revisa la apuesta y las fichas disponibles.");
    setError("");
    setResult(null);
    setOutcome(null);
    sound("start");
    const next = spinSlot(gameId),
      reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    try {
      engines.current.forEach((reel, index) =>
        reel.renderSymbols(next.grid[index]),
      );
      const completed = await Promise.all(
        engines.current.map((reel) => reel.spin({ turbo, reduced })),
      );
      if (!mounted.current || completed.some((value) => !value)) return;
      setOutcome(next);
      setResult(
        wallet.finish(
          round.id,
          next.multiplier,
          `${next.wins.length} ${next.wins.length === 1 ? "línea ganadora" : "líneas ganadoras"}`,
        ),
      );
      sound(next.multiplier > 1 ? "win" : next.multiplier > 0 ? "gem" : "lose");
    } catch {
      if (mounted.current) {
        wallet.finish(round.id, 1, "Giro cancelado: fichas devueltas");
        setError(
          "La animación no pudo completarse. Se devolvieron las fichas.",
        );
      }
    }
  };
  return (
    <>
      <div
        className={`game-layout slot-layout slot-layout--${gameId} ${theme.art !== undefined ? "slot-layout--illustrated" : ""}`}
        style={
          theme.accent
            ? {
                "--slot-gold": theme.accent,
                "--slot-dark": theme.dark,
                "--slot-line": theme.accent,
                "--slot-title": theme.accent,
              }
            : undefined
        }
      >
        <aside className="game-controls">
          <div className="game-controls__mode">
            <span className="live-dot" />
            Giro manual
          </div>
          <BetControl
            value={stake}
            onChange={setStake}
            disabled={busy}
            balance={wallet.balance}
          />
          <div className="game-controls__stats">
            <Stat label="Líneas activas">5</Stat>
            <Stat label="Fichas por línea">
              {formatCredits((stakeInCents(stake) || 100) / 5)}
            </Stat>
          </div>
          <GameButton onClick={play} disabled={!wallet.ready || busy}>
            {busy ? "Girando rodillos…" : "Girar rodillos"}
          </GameButton>
          <button
            className={`game-secondary ${turbo ? "slot-turbo--active" : ""}`}
            disabled={busy}
            aria-pressed={turbo}
            onClick={() => setTurbo(!turbo)}
          >
            <Zap size={16} />
            Turbo {turbo ? "activado" : "desactivado"}
          </button>
          <button
            className="game-secondary"
            aria-expanded={table}
            aria-controls="slot-paytable"
            onClick={() => setTable(!table)}
          >
            <List size={16} />
            Tabla de premios
          </button>
          {error && (
            <p className="game-error" role="alert">
              {error}
            </p>
          )}
          <div className="slot-controls__emblem">
            <SlotSymbol id={theme.emblem} />
            <span>THE HORSEBET COLLECTION</span>
          </div>
          <p className="game-controls__hint">
            Combina símbolos desde la izquierda. Los premios de las líneas
            ganadoras se suman.
          </p>
        </aside>
        <section
          className="game-stage slot-stage"
          aria-label={`Slot ${theme.title}`}
        >
          {theme.art !== undefined && (
            <div className="slot-stage__art" aria-hidden="true">
              <GameArt game={theme} />
            </div>
          )}
          <div className="slot-stage__stars" />
          <div className="slot-stage__title">
            <span>HORSEBET PRESENTS</span>
            <h2>{theme.title}</h2>
            <small>{theme.subtitle}</small>
          </div>
          <SlotBoard
            gameId={gameId}
            engines={engines}
            outcome={outcome}
            spinning={busy}
          />
          <div className="slot-stage__message">
            {busy ? (
              <>
                <RotateCw size={15} className="slot-spinning-icon" />
                LOS RODILLOS ESTÁN GIRANDO
              </>
            ) : outcome?.wins.length ? (
              <>
                <Trophy size={16} />
                {outcome.wins.length}{" "}
                {outcome.wins.length === 1
                  ? "LÍNEA GANADORA"
                  : "LÍNEAS GANADORAS"}
              </>
            ) : (
              "3, 4 O 5 SÍMBOLOS IGUALES DESDE LA IZQUIERDA"
            )}
          </div>
          <RoundResult
            result={result}
            pending={busy}
            idle="Tu siguiente historia comienza con un giro"
          />
        </section>
      </div>
      {table && (
        <section className="slot-paytable" id="slot-paytable">
          <div>
            <h3>Tabla de premios · {theme.title}</h3>
            <p>
              Multiplicadores de la apuesta por línea. Solo paga la coincidencia
              más larga de cada línea, desde el primer rodillo.
            </p>
          </div>
          <div className="slot-paytable__grid">
            {slotSymbols.map((symbol, index) => (
              <article key={symbol.id}>
                <SlotSymbol id={symbol.id} />
                <div>
                  <strong>{symbol.name}</strong>
                  {slotPaytable(gameId)[index].map((multiplier, count) => (
                    <span key={count}>
                      <b>{count + 3} iguales</b>
                      {multiplier.toFixed(2)}×
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
          <p>
            Retorno teórico de esta simulación:{" "}
            {(slotReturn(gameId) * 100).toFixed(2)}%, antes del redondeo. Cada
            giro es independiente. Base de rodillos:{" "}
            <a
              href="https://github.com/johakr/html5-slot-machine"
              target="_blank"
              rel="noreferrer"
            >
              html5-slot-machine
            </a>{" "}
            ·{" "}
            <a
              href="/licenses/html5-slot-machine.txt"
              target="_blank"
              rel="noreferrer"
            >
              Licencia MIT
            </a>
            .
          </p>
        </section>
      )}
    </>
  );
}
