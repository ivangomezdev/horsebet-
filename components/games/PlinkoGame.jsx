"use client";
import { useEffect, useRef, useState } from "react";
import {
  plinkoResult,
  PLINKO_PAYOUTS,
  stakeInCents,
} from "../../lib/games/engine";
import { BetControl, GameButton, RoundResult, Stat } from "./Shared";

function pathFor(steps) {
  let x = 360,
    y = 42;
  const points = [`M ${x} 19 L ${x} ${y}`];
  steps.forEach((right, index) => {
    const nextX = x + (right ? 27 : -27),
      nextY = 81 + index * 39;
    points.push(`Q ${x + (right ? 18 : -18)} ${y - 18} ${nextX} ${nextY}`);
    x = nextX;
    y = nextY;
  });
  points.push(`Q ${x} ${y + 15} ${x} 390`);
  return points.join(" ");
}

function FallingBall({ drop }) {
  const ballRef = useRef(null);
  const pathRef = useRef(null);

  useEffect(() => {
    const ball = ballRef.current;
    const path = pathRef.current;
    const length = path.getTotalLength();
    const duration = drop.reduced ? 180 : 2400;
    let frame;
    let started;

    // Each round owns its clock, independent of the SVG document's age.
    const tick = (timestamp) => {
      started ??= timestamp;
      const progress = Math.min((timestamp - started) / duration, 1);
      const point = path.getPointAtLength(length * progress);
      ball.setAttribute("transform", `translate(${point.x} ${point.y})`);
      if (progress < 1) frame = requestAnimationFrame(tick);
      else drop.onLand();
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [drop]);

  return (
    <>
      <path ref={pathRef} d={pathFor(drop.steps)} fill="none" stroke="none" />
      <g
        ref={ballRef}
        className="plinko-board__ball"
        transform="translate(360 19)"
      >
        <circle r="15" fill="#ff2453" opacity=".8" filter="url(#plinko-glow)" />
        <circle r="8" fill="url(#plinko-ball)" />
      </g>
    </>
  );
}
function PlinkoBoard({ drop, busy, risk }) {
  const multipliers = PLINKO_PAYOUTS[risk];
  return (
    <svg
      className="plinko-board"
      viewBox="0 0 720 470"
      role="img"
      aria-label={
        drop && !busy
          ? `La bola cayó en el multiplicador ${drop.multiplier}`
          : "Tablero de Plinko con ocho filas de pivotes"
      }
    >
      <defs>
        <radialGradient id="plinko-ball">
          <stop stopColor="#fff6de" />
          <stop offset=".3" stopColor="#ffe5b6" />
          <stop offset="1" stopColor="#ff3860" />
        </radialGradient>
        <filter id="plinko-glow" x="-150%" y="-150%" width="400%" height="400%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
        <linearGradient id="plinko-slot" x2="0" y2="1">
          <stop stopColor="#ff305d" />
          <stop offset="1" stopColor="#ca123c" />
        </linearGradient>
      </defs>
      <path
        d="M360 27 90 403h540L360 27Z"
        fill="#ff174b"
        fillOpacity=".022"
        stroke="#ff3656"
        strokeOpacity=".07"
      />
      {Array.from({ length: 8 }, (_, row) =>
        Array.from({ length: row + 3 }, (_, col) => {
          const x = 360 + (col - (row + 2) / 2) * 54,
            y = 54 + row * 39;
          return (
            <g key={`${row}-${col}`}>
              <circle cx={x} cy={y + 2} r="6" fill="#060d16" />
              <circle cx={x} cy={y} r="4.5" fill="#b6c6dc" />
              <circle cx={x - 1} cy={y - 1.5} r="1.6" fill="#f1f6ff" />
            </g>
          );
        }),
      )}
      {multipliers.map((multiplier, index) => (
        <g
          className={`plinko-board__slot ${drop && !busy && drop.bucket === index ? "plinko-board__slot--hit" : ""}`}
          key={`${risk}-${index}`}
          transform={`translate(${360 + (index - 4) * 54 - 24},400)`}
        >
          <rect
            width="48"
            height="40"
            rx="7"
            fill={
              index === 0 || index === 8
                ? "url(#plinko-slot)"
                : index === 1 || index === 7
                  ? "#e64939"
                  : index === 2 || index === 6
                    ? "#df8037"
                    : "#a78235"
            }
          />
          <rect
            y="36"
            width="48"
            height="4"
            rx="2"
            fill="#000"
            fillOpacity=".25"
          />
          <text
            x="24"
            y="25"
            textAnchor="middle"
            fill="#fff3d7"
            fontWeight="800"
            fontSize="13"
          >
            {multiplier}×
          </text>
        </g>
      ))}
      {drop ? (
        <FallingBall key={drop.id} drop={drop} />
      ) : (
        <>
          <circle
            cx="360"
            cy="19"
            r="17"
            fill="#ff194c"
            opacity=".18"
            filter="url(#plinko-glow)"
          />
          <circle cx="360" cy="19" r="7" fill="url(#plinko-ball)" />
        </>
      )}
    </svg>
  );
}
export default function PlinkoGame({ wallet, sound }) {
  const [stake, setStake] = useState("10.00"),
    [risk, setRisk] = useState("low"),
    [drop, setDrop] = useState(null),
    [result, setResult] = useState(null),
    [error, setError] = useState("");
  const busy = Boolean(wallet.pending);
  const play = () => {
    const round = wallet.start(stakeInCents(stake), "plinko");
    if (!round) return setError("Revisa la apuesta y las fichas disponibles.");
    const outcome = plinkoResult(risk);
    setError("");
    setDrop({
      ...outcome,
      id: round.id,
      reduced: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      onLand: () => {
        setResult(
          wallet.finish(round.id, outcome.multiplier, `${outcome.multiplier}×`),
        );
        sound(outcome.multiplier > 1 ? "win" : "gem");
      },
    });
    sound("start");
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
        <fieldset className="game-segment" disabled={busy}>
          <legend>Nivel de riesgo</legend>
          {[
            ["low", "Bajo"],
            ["high", "Alto"],
          ].map(([value, label]) => (
            <button
              key={value}
              className={
                risk === value
                  ? "game-segment__button game-segment__button--active"
                  : "game-segment__button"
              }
              aria-pressed={risk === value}
              onClick={() => {
                setRisk(value);
                setDrop(null);
                setResult(null);
              }}
            >
              {label}
            </button>
          ))}
        </fieldset>
        <div className="game-controls__stats">
          <Stat label="Filas">8</Stat>
          <Stat label="Máximo retorno">{PLINKO_PAYOUTS[risk][0]}×</Stat>
        </div>
        <GameButton disabled={!wallet.ready || busy} onClick={play}>
          {busy ? "La bola está cayendo…" : "Soltar bola"}
        </GameButton>
        {error && (
          <p className="game-error" role="alert">
            {error}
          </p>
        )}
        <p className="game-controls__hint">
          Las casillas de los extremos pagan más, pero son menos frecuentes.
        </p>
      </aside>
      <section
        className="game-stage plinko-stage"
        aria-label="Tablero de Plinko"
      >
        <div className="game-stage__eyebrow">
          HORSEBET ORIGINALS <span>03 / PLINKO</span>
        </div>
        <PlinkoBoard drop={drop} busy={busy} risk={risk} />
        <RoundResult
          result={result}
          pending={busy}
          idle="Elige tu riesgo y descubre el recorrido"
        />
      </section>
    </div>
  );
}
