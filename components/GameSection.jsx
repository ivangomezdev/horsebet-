"use client";
import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Heart, Play } from "lucide-react";
import { GameArt } from "./Artwork";
import { playablePath } from "../data/playable-games";

export function GameCard({ game, onPlay, favorite, onFavorite }) {
  return (
    <article
      className={`game-card ${game.color ? "game-card--original" : ""} ${game.cover ? "game-card--illustrated" : ""}`}
    >
      <button
        className="game-card__play"
        aria-label={`${playablePath(game.id) ? "Jugar" : "Ver juego"} ${game.title}`}
        onClick={() => onPlay(game)}
      >
        <GameArt game={game} />
        {game.badge && (
          <span
            className={`game-card__badge ${game.badge === "CALIENTE" ? "game-card__badge--hot" : ""}`}
          >
            {game.badge}
          </span>
        )}
        <span className="game-card__caption">
          <strong>{game.title}</strong>
          <small>{game.provider}</small>
        </span>
        <span className="game-card__overlay">
          <span>
            <Play fill="currentColor" size={25} />
          </span>
          <b>Jugar</b>
        </span>
      </button>
      <button
        className={`game-card__favorite ${favorite ? "game-card__favorite--active" : ""}`}
        aria-label={`${favorite ? "Quitar" : "Añadir"} ${game.title} ${favorite ? "de" : "a"} favoritos`}
        aria-pressed={favorite}
        onClick={() => onFavorite(game.id)}
      >
        <Heart size={16} fill={favorite ? "currentColor" : "none"} />
      </button>
    </article>
  );
}
export default function GameSection({
  title,
  games,
  onPlay,
  favorites,
  onFavorite,
  onSeeAll,
  id,
  seeAllLabel,
  badge,
  showAllCard = false,
}) {
  const rail = useRef(null);
  const [offset, setOffset] = useState(0);
  const orderedGames = [...games.slice(offset), ...games.slice(0, offset)];
  function move(direction) {
    if (rail.current.scrollWidth <= rail.current.clientWidth + 1) {
      setOffset((value) => (value + direction + games.length) % games.length);
    } else {
      rail.current.scrollBy({
        left: direction * rail.current.clientWidth,
        behavior: "smooth",
      });
    }
  }
  return (
    <section className="game-section" id={id}>
      <div className="section-heading">
        <div className="section-heading__title">
          <h2>{title}</h2>
          {badge && <span className="section-heading__badge">{badge}</span>}
        </div>
        <div className="section-heading__actions">
          <button className="text-button" onClick={onSeeAll}>
            {seeAllLabel ||
              `Ir ${title === "Internos" ? "al Casino" : "a Slots"}`}
            <ChevronRight size={16} />
          </button>
          <button
            className="button button--arrow"
            aria-label={`${title}: anteriores`}
            onClick={() => move(-1)}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            className="button button--arrow"
            aria-label={`${title}: siguientes`}
            onClick={() => move(1)}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      <div className="game-section__rail" ref={rail}>
        {orderedGames.map((game) => (
          <GameCard
            key={game.id}
            game={game}
            onPlay={onPlay}
            favorite={favorites.includes(game.id)}
            onFavorite={onFavorite}
          />
        ))}
        {showAllCard && (
          <button className="game-section__all" onClick={onSeeAll}>
            Ver todos <ChevronRight size={18} />
          </button>
        )}
      </div>
    </section>
  );
}
