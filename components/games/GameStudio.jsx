"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Coins,
  RotateCcw,
  Volume2,
  VolumeX,
  Expand,
  Minimize,
  Info,
  CircleDot,
} from "lucide-react";
import { playableGames } from "../../data/playable-games";
import { formatCredits } from "../../lib/games/engine";
import useDemoWallet from "./useDemoWallet";
import DiceGame from "./DiceGame";
import MinesGame from "./MinesGame";
import PlinkoGame from "./PlinkoGame";
import CoinGame from "./CoinGame";
import SlotGame from "./SlotGame";
import BonusSlotGame from "./BonusSlotGame";
import { useAuth } from "../auth/AuthProvider";
import { LockKeyhole } from "lucide-react";

const components = {
  dice: DiceGame,
  mines: MinesGame,
  plinko: PlinkoGame,
  coin: CoinGame,
};
export default function GameStudio({ gameId }) {
  const { user, loading, openAuth } = useAuth();
  if (loading || !user?.onboardingCompleted) {
    return (
      <section className="content game-access" aria-busy={loading}>
        <Link href="/es/casino/" className="originals-room__back">
          <ArrowLeft size={17} />
          Casino
        </Link>
        <div className="game-access__panel">
          <LockKeyhole size={36} aria-hidden="true" />
          <span className="game-access__eyebrow">HORSEBET ORIGINALS</span>
          <h1>{playableGames[gameId].title}</h1>
          <p role="status">
            {loading
              ? "Comprobando tu sesión…"
              : user
                ? "Completa tu perfil para acceder a los juegos."
                : "Debes estar registrado para realizar apuestas."}
          </p>
          {!loading && (
            <div className="game-access__actions">
              <button
                className="button button--primary"
                onClick={() => openAuth(user ? "complete" : "register")}
              >
                {user ? "Completar perfil" : "Regístrate"}
              </button>
              {!user && (
                <button
                  className="button button--secondary"
                  onClick={() => openAuth("login")}
                >
                  Iniciar sesión
                </button>
              )}
            </div>
          )}
        </div>
      </section>
    );
  }
  return <AuthenticatedGame key={`${user.id}:${gameId}`} gameId={gameId} />;
}

function AuthenticatedGame({ gameId }) {
  const game = playableGames[gameId],
    Game =
      game.kind === "bonus-slot"
        ? BonusSlotGame
        : game.kind === "slot"
          ? SlotGame
          : components[gameId];
  const wallet = useDemoWallet();
  const [muted, setMuted] = useState(true),
    [wide, setWide] = useState(false),
    [showRules, setShowRules] = useState(false);
  const audio = useRef(null);
  useEffect(
    () => () => {
      audio.current?.close().catch(() => {});
    },
    [],
  );
  const sound = (kind) => {
    if (muted) return;
    try {
      const Audio = window.AudioContext || window.webkitAudioContext;
      if (!Audio) return;
      audio.current ||= new Audio();
      audio.current.resume().catch(() => {});
      const context = audio.current,
        frequencies =
          kind === "win"
            ? [523, 659, 784]
            : kind === "gem"
              ? [880, 1174]
              : kind === "lose"
                ? [180, 130]
                : [330, 440];
      frequencies.forEach((frequency, index) => {
        const oscillator = context.createOscillator(),
          gain = context.createGain(),
          time = context.currentTime + index * 0.075;
        oscillator.type = "sine";
        oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.035, time + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.19);
        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start(time);
        oscillator.stop(time + 0.2);
        oscillator.onended = () => {
          oscillator.disconnect();
          gain.disconnect();
        };
      });
    } catch {
      /* Audio is optional; browser restrictions must never interrupt a round. */
    }
  };
  return (
    <div
      className={`content originals-room originals-room--${game.color} ${wide ? "originals-room--wide" : ""}`}
    >
      <div className="originals-room__top">
        <Link href="/es/casino/" className="originals-room__back">
          <ArrowLeft size={17} />
          Casino
        </Link>
        <div className="originals-room__demo">
          <span />
          FICHAS VIRTUALES · SIN DINERO REAL
        </div>
      </div>
      <header className="originals-heading">
        <div>
          <span className="originals-heading__eyebrow">HORSEBET ORIGINALS</span>
          <h1>
            {game.title}
            <span>ORIGINAL</span>
          </h1>
          <p>{game.description}</p>
        </div>
        {game.kind !== "bonus-slot" && (
          <div className="demo-wallet">
            <span>
              <Coins size={15} />
              Tus fichas virtuales
            </span>
            <div>
              <strong>{formatCredits(wallet.balance)}</strong>
              <button
                onClick={wallet.reset}
                disabled={!wallet.ready || Boolean(wallet.pending)}
                aria-label="Reponer 10,000 fichas virtuales"
                title="Reinicia las fichas y el historial de esta sesión"
              >
                <RotateCcw size={17} />
              </button>
            </div>
          </div>
        )}
      </header>
      <div className="originals-machine">
        <Game gameId={gameId} wallet={wallet} sound={sound} />
        <footer className="originals-machine__footer">
          <span>
            <span className="originals-machine__wordmark">
              HORSE<span>BET</span>
            </span>
            <span className="originals-machine__footer-label">{game.tag}</span>
          </span>
          <div>
            <button
              onClick={() => setMuted(!muted)}
              aria-label={muted ? "Activar sonido" : "Silenciar sonido"}
              aria-pressed={!muted}
            >
              {muted ? <VolumeX size={17} /> : <Volume2 size={17} />}
            </button>
            <button
              onClick={() => setWide(!wide)}
              aria-label={wide ? "Restaurar tamaño" : "Ampliar juego"}
              aria-pressed={wide}
            >
              {wide ? <Minimize size={17} /> : <Expand size={17} />}
            </button>
            <button
              onClick={() => setShowRules(!showRules)}
              aria-expanded={showRules}
              aria-controls="game-rules"
            >
              <Info size={16} />
              <span>Cómo jugar</span>
            </button>
          </div>
        </footer>
      </div>
      {showRules && (
        <section className="originals-rules" id="game-rules">
          <h2>Cómo jugar a {game.title}</h2>
          <p>{game.rules}</p>
          <p>
            Estas fichas no tienen valor monetario. Los resultados se generan
            localmente con la aleatoriedad del navegador. Las rondas
            interrumpidas se reembolsan al volver al juego. El saldo de tu
            cuenta permanece separado.
          </p>
        </section>
      )}
      <section className="originals-history">
        <div className="originals-history__heading">
          <h2>Tus últimas rondas</h2>
          <span>ESTA SESIÓN</span>
        </div>
        {wallet.history.length ? (
          <div className="originals-history__scroll">
            <table>
              <thead>
                <tr>
                  <th>Juego</th>
                  <th>Resultado</th>
                  <th>Apuesta</th>
                  <th>Multiplicador</th>
                  <th>Retorno</th>
                </tr>
              </thead>
              <tbody>
                {wallet.history.map((row) => (
                  <tr key={row.id}>
                    <td>{playableGames[row.game]?.title || "Original"}</td>
                    <td>{row.detail}</td>
                    <td>{formatCredits(row.stake)}</td>
                    <td>
                      <span
                        className={
                          row.payout > row.stake ? "originals-history__win" : ""
                        }
                      >
                        {row.multiplier.toFixed(2)}×
                      </span>
                    </td>
                    <td
                      className={
                        row.payout > row.stake ? "originals-history__win" : ""
                      }
                    >
                      {formatCredits(row.payout)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="originals-history__empty">
            <CircleDot size={20} />
            <span>Tu primera ronda empieza aquí.</span>
            <small>Consulta aquí los resultados de tus rondas.</small>
          </div>
        )}
      </section>
    </div>
  );
}
