"use client";
import { useState } from "react";
import { Pause, Play } from "lucide-react";
import { GameArt } from "./Artwork";
import { simulatedWins } from "../data/recent-wins";
export default function RecentWins({ onPlay }) {
  const [paused, setPaused] = useState(false);
  return (
    <section
      className={`wins-ticker ${paused ? "wins-ticker--paused" : ""}`}
      aria-label="Ganancias ficticias de demostración"
    >
      <div className="section-heading">
        <h2>Principales victorias recientes</h2>
        <div className="wins-ticker__controls">
          <span>ACTIVIDAD SIMULADA · 200 JUGADORES</span>
          <button
            className="button button--arrow"
            aria-label={
              paused
                ? "Reanudar carrusel de ganancias"
                : "Pausar carrusel de ganancias"
            }
            aria-pressed={paused}
            onClick={() => setPaused(!paused)}
          >
            {paused ? <Play size={15} /> : <Pause size={15} />}
          </button>
        </div>
      </div>
      <div className="wins-ticker__viewport">
        <div className="wins-ticker__track">
          {[0, 1].map((copy) => (
            <div
              className="wins-ticker__group"
              key={copy}
              aria-hidden={copy === 1 ? true : undefined}
            >
              {simulatedWins.map((win) => (
                <button
                  className="wins-ticker__card"
                  key={`${copy}-${win.id}`}
                  tabIndex={copy === 1 ? -1 : 0}
                  title={`${win.username} · ${win.game.title} · Ganancia ficticia`}
                  onClick={() => onPlay(win.game)}
                >
                  <span className="wins-ticker__art">
                    <GameArt game={win.game} />
                    <strong>{win.game.title}</strong>
                  </span>
                  <span className="wins-ticker__amount">
                    MX$
                    {win.amount.toLocaleString("es-MX", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                  <small className="wins-ticker__player">
                    <span
                      className="wins-ticker__avatar"
                      style={{ "--player-hue": win.hue }}
                      aria-hidden="true"
                    >
                      {win.avatar}
                    </span>
                    {win.username}
                  </small>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
