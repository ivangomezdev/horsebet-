"use client";
import Link from "next/link";
import { sports } from "../data/content";
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
          <Link
            className="sport-card"
            key={sport.id}
            href={`/es/sports/?sport=${sport.id}`}
            style={{
              "--sport-card-icon": `url('/images/sports/top/${sport.icon}.svg')`,
            }}
          >
            {index < 5 && <span className="game-card__badge">CALIENTE</span>}
            <span className="sport-card__watermark" aria-hidden="true" />
            <span className="sport-card__icon" aria-hidden="true" />
            <strong>{sport.label}</strong>
          </Link>
        ))}
      </div>
    </section>
  );
}
