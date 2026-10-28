import Link from "next/link";
import { Star, ChevronRight, Radio } from "lucide-react";
import { displayOdds } from "../../lib/sports/slip";
import { sportsEventPath } from "../../data/sports";
import { sportCategories } from "../../data/sport-categories";
import teamAssets from "../../data/sports-team-assets.json";

export function ReferenceIcon({ name, size = 24 }) {
  return (
    <span
      className="sports-reference-icon"
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        "--sport-icon": `url('/images/sports/icons/${name}.svg')`,
      }}
    />
  );
}

export function SportIcon({ sport, size = 20 }) {
  const category = sportCategories.find((item) => item.id === sport);
  return <ReferenceIcon name={category?.icon || "ic-home"} size={size} />;
}
export function TeamBadge({ name, sport, country, large = false }) {
  const src =
    teamAssets[name] ||
    (country ? `/images/sports/flags/${country}.svg` : null);
  return (
    <span className={`sports-badge ${large ? "sports-badge--large" : ""}`}>
      {src ? (
        <img
          src={src}
          alt={name}
          width={large ? 64 : 42}
          height={large ? 64 : 42}
        />
      ) : (
        <SportIcon sport={sport} size={large ? 48 : 32} />
      )}
    </span>
  );
}
export function OddButton({
  event,
  market,
  outcome,
  picks,
  onPick,
  format,
  compact = false,
}) {
  const key = `${event.id}:${market.id}:${outcome.id}`;
  const selected = picks.includes(key);
  const label =
    compact && market.id === "winner"
      ? { home: "1", draw: "X", away: "2" }[outcome.id] || outcome.label
      : outcome.label;
  return (
    <button
      className={`sports-odd ${selected ? "sports-odd--selected" : ""}`}
      aria-pressed={selected}
      aria-label={`${event.home} contra ${event.away}: ${market.title}, ${outcome.label}, cuota ${displayOdds(outcome.odds, format)}`}
      onClick={() => onPick(key)}
    >
      <span>{label}</span>
      <strong>{displayOdds(outcome.odds, format)}</strong>
    </button>
  );
}
export function EventCard({
  event,
  picks,
  onPick,
  format,
  favorite,
  onFavorite,
}) {
  const market = event.markets[0];
  return (
    <article className={`sports-card sports-card--${event.sport}`}>
      <div className="sports-card__league">
        <SportIcon sport={event.sport} size={13} />
        <span>{event.league}</span>
        <button
          aria-label={`Favorito: ${event.home} contra ${event.away}`}
          aria-pressed={favorite}
          onClick={() => onFavorite(event.id)}
        >
          <Star size={15} fill={favorite ? "currentColor" : "none"} />
        </button>
      </div>
      <Link className="sports-card__event" href={sportsEventPath(event.id)}>
        <span
          className={`sports-card__time ${event.live ? "sports-card__time--live" : ""}`}
        >
          {event.live && <Radio size={11} />} {event.when}
        </span>
        <span className="sports-card__teams">
          <span>
            <TeamBadge
              name={event.home}
              sport={event.sport}
              country={event.homeCountry}
            />
            <strong>{event.home}</strong>
          </span>
          <b>{event.score ? event.score.join(" : ") : "VS"}</b>
          <span>
            <TeamBadge
              name={event.away}
              sport={event.sport}
              country={event.awayCountry}
            />
            <strong>{event.away}</strong>
          </span>
        </span>
      </Link>
      <span className="sports-card__market">{market.title}</span>
      <div className="sports-card__odds">
        {market.outcomes.map((outcome) => (
          <OddButton
            key={outcome.id}
            {...{ event, market, outcome, picks, onPick, format }}
            compact
          />
        ))}
      </div>
      <Link href={sportsEventPath(event.id)} className="sports-card__more">
        Todos los mercados · {event.markets.length}
        <ChevronRight size={12} />
      </Link>
    </article>
  );
}
