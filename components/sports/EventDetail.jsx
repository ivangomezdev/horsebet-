import { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronDown,
  Radio,
  BarChart3,
  Search,
} from "lucide-react";
import { sportsEvents, sportsEventPath } from "../../data/sports";
import { OddButton, TeamBadge, SportIcon } from "./SportsUI";

export default function EventDetail({ event, picks, onPick, format }) {
  const [group, setGroup] = useState("Todos");
  const [query, setQuery] = useState("");
  const groups = [
    "Todos",
    ...new Set(event.markets.map((market) => market.group)),
  ];
  const markets = event.markets.filter(
    (market) =>
      (group === "Todos" || market.group === group) &&
      market.title
        .toLocaleLowerCase("es")
        .includes(query.toLocaleLowerCase("es")),
  );
  return (
    <>
      <div className="sports-event-rail">
        {sportsEvents.map((item) => (
          <Link
            key={item.id}
            href={sportsEventPath(item.id)}
            className={
              item.id === event.id
                ? "sports-event-rail__item sports-event-rail__item--active"
                : "sports-event-rail__item"
            }
          >
            <small>
              {item.live && <Radio size={11} />}
              {item.when}
            </small>
            <span>{item.home}</span>
            <span>{item.away}</span>
          </Link>
        ))}
      </div>
      <div className="sports-detail">
        <div className="sports-detail__main">
          <Link href="/es/sports/" className="sports-detail__back">
            <ChevronLeft size={15} />
            Todos los deportes
          </Link>
          <section className="sports-scoreboard">
            <p>
              <SportIcon sport={event.sport} size={15} />
              {event.league}
            </p>
            <div className="sports-scoreboard__teams">
              <div>
                <TeamBadge
                  name={event.home}
                  sport={event.sport}
                  country={event.homeCountry}
                  large
                />
                <h1>{event.home}</h1>
              </div>
              <div className="sports-scoreboard__score">
                <small>{event.live ? "EN VIVO" : "PRÓXIMAMENTE"}</small>
                <strong>{event.score ? event.score.join(" : ") : "VS"}</strong>
                <span>{event.when}</span>
              </div>
              <div>
                <TeamBadge
                  name={event.away}
                  sport={event.sport}
                  country={event.awayCountry}
                  large
                />
                <h2>{event.away}</h2>
              </div>
            </div>
          </section>
          <div className="sports-suggestions">
            {event.markets.slice(0, 3).map((market) => (
              <article key={market.id}>
                <span>SELECCIÓN DESTACADA</span>
                <h3>{market.title}</h3>
                <p>
                  {event.home} vs. {event.away}
                </p>
                <OddButton
                  {...{ event, market, picks, onPick, format }}
                  outcome={market.outcomes[0]}
                />
              </article>
            ))}
          </div>
          <div className="sports-markets__toolbar">
            <div>
              {groups.map((name) => (
                <button
                  key={name}
                  aria-pressed={group === name}
                  className={
                    group === name
                      ? "sports-pill sports-pill--active"
                      : "sports-pill"
                  }
                  onClick={() => setGroup(name)}
                >
                  {name}
                  <small>
                    {name === "Todos"
                      ? event.markets.length
                      : event.markets.filter((market) => market.group === name)
                          .length}
                  </small>
                </button>
              ))}
            </div>
            <label>
              <Search size={15} />
              <input
                placeholder="Buscar mercado"
                aria-label="Buscar mercado"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
          </div>
          <div className="sports-markets">
            {markets.map((market) => (
              <details key={market.id} className="sports-market" open>
                <summary>
                  {market.title}
                  <ChevronDown size={16} />
                </summary>
                <div className="sports-market__odds">
                  {market.outcomes.map((outcome) => (
                    <OddButton
                      key={outcome.id}
                      {...{ event, market, outcome, picks, onPick, format }}
                    />
                  ))}
                </div>
              </details>
            ))}
            {!markets.length && (
              <p className="sports-empty">
                No hay mercados que coincidan con tu búsqueda.
              </p>
            )}
          </div>
        </div>
        <aside className="sports-tracker">
          <h3>
            <BarChart3 size={16} />
            Rastreador
          </h3>
          <div className="sports-tracker__teams">
            <span>
              {event.homeCode} <b>{event.score?.[0] ?? "—"}</b>
            </span>
            <span>
              {event.awayCode} <b>{event.score?.[1] ?? "—"}</b>
            </span>
          </div>
          <div className={`sports-pitch sports-pitch--${event.sport}`}>
            <i />
            <div>
              <SportIcon sport={event.sport} size={30} />
              <strong>{event.live ? event.score.join(" : ") : "VS"}</strong>
              <span>{event.when}</span>
            </div>
          </div>
          <div className="sports-tracker__stats">
            <span>Información del encuentro</span>
            <p>Seguimiento en directo no disponible.</p>
          </div>
        </aside>
      </div>
    </>
  );
}
