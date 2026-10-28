"use client";
import { Trophy, CircleDot, Activity } from "lucide-react";
import { sports } from "../data/content";
import { ObjectArt } from "./Artwork";
export function SportsPreview({ onNavigate }) {
  return (
    <section className="sports-preview">
      <div className="section-heading">
        <h2>Deportes TOP</h2>
        <button className="text-button" onClick={() => onNavigate("Deportes")}>
          Ir a Deportes <span>›</span>
        </button>
      </div>
      <div className="sports-preview__grid">
        {sports.map((sport, index) => (
          <button
            className="sport-card"
            key={sport}
            onClick={() => onNavigate("Deportes", sport)}
          >
            {index < 4 && <span className="game-card__badge">CALIENTE</span>}
            {index === 2 || index === 3 ? (
              <ObjectArt kind="ball" />
            ) : index === 0 ? (
              <Activity />
            ) : index === 1 ? (
              <Trophy />
            ) : (
              <CircleDot />
            )}
            <strong>{sport}</strong>
          </button>
        ))}
      </div>
    </section>
  );
}
