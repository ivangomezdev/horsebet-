import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, Search, X } from "lucide-react";
import { sportCategories } from "../../data/sport-categories";
import { SportIcon, ReferenceIcon } from "./SportsUI";

export default function SportsNavigation({ event, sport, onSelect, onTab }) {
  const [expanded, setExpanded] = useState(false);
  const [search, setSearch] = useState("");
  const container = useRef(null);
  const trigger = useRef(null);
  const input = useRef(null);
  useEffect(() => {
    if (!expanded) return;
    input.current?.focus();
    const outside = (e) => {
      if (!container.current?.contains(e.target)) setExpanded(false);
    };
    const escape = (e) => {
      if (e.key === "Escape") {
        setExpanded(false);
        trigger.current?.focus();
      }
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [expanded]);
  const select = (id) => {
    onSelect(id);
    setExpanded(false);
    setSearch("");
  };
  const item = (category, withLabel = false) => {
    const contents = (
      <>
        <SportIcon sport={category.id} size={28} />
        {withLabel && <span>{category.label}</span>}
      </>
    );
    const common = {
      title: category.label,
      "aria-label": category.label,
      className: `sports-nav__item ${sport === category.id ? "sports-nav__item--active" : ""}`,
    };
    return event ? (
      <Link
        key={category.id}
        {...common}
        href={`/es/sports/?sport=${category.id}`}
        onClick={() => setExpanded(false)}
      >
        {contents}
      </Link>
    ) : (
      <button
        key={category.id}
        {...common}
        aria-pressed={sport === category.id}
        onClick={() => select(category.id)}
      >
        {contents}
      </button>
    );
  };
  return (
    <div className="sports-navigation" ref={container}>
      <nav className="sports-nav" aria-label="Categorías deportivas">
        <Link
          href="/es/sports/"
          aria-label="Inicio de deportes"
          title="Inicio"
          onClick={() => {
            select("all");
            onTab("popular");
          }}
        >
          <ReferenceIcon name="ic-home" size={28} />
        </Link>
        <Link
          href="/es/sports/live/"
          aria-label="Eventos en vivo"
          title="En vivo"
          onClick={() => {
            select("all");
            onTab("live");
          }}
        >
          <ReferenceIcon name="ic-live" size={28} />
        </Link>
        {event ? (
          <Link
            href="/es/sports/?tab=favorites"
            title="Favoritos"
            aria-label="Favoritos"
          >
            <ReferenceIcon name="ic-favourite" size={28} />
          </Link>
        ) : (
          <button
            onClick={() => onTab("favorites")}
            title="Favoritos"
            aria-label="Favoritos"
          >
            <ReferenceIcon name="ic-favourite" size={28} />
          </button>
        )}
        {event ? (
          <Link
            href="/es/sports/?tab=tickets"
            title="Mis cupones"
            aria-label="Mis cupones"
          >
            <ReferenceIcon name="ic-navbar-mybets" size={28} />
          </Link>
        ) : (
          <button
            onClick={() => onTab("tickets")}
            title="Mis cupones"
            aria-label="Mis cupones"
          >
            <ReferenceIcon name="ic-navbar-mybets" size={28} />
          </button>
        )}
        <span className="sports-nav__divider" />
        {sportCategories
          .filter((category) => category.primary)
          .map((category) => item(category))}
      </nav>
      <button
        ref={trigger}
        className={`sports-navigation__more ${expanded ? "sports-navigation__more--active" : ""}`}
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        aria-controls="sports-all-disciplines"
        aria-label="Más deportes"
        title="Más deportes"
      >
        <ChevronDown size={18} />
      </button>
      {expanded && (
        <div className="sports-navigation__panel" id="sports-all-disciplines">
          <div className="sports-navigation__heading">
            <strong>Todos los deportes</strong>
            <button
              onClick={() => setExpanded(false)}
              aria-label="Cerrar deportes"
            >
              <X size={18} />
            </button>
          </div>
          <label className="sports-navigation__search">
            <Search size={17} />
            <input
              ref={input}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar deporte"
              aria-label="Buscar deporte"
            />
          </label>
          <div className="sports-navigation__grid">
            {sportCategories
              .filter((category) =>
                category.label
                  .toLocaleLowerCase("es")
                  .includes(search.toLocaleLowerCase("es")),
              )
              .map((category) => item(category, true))}
          </div>
        </div>
      )}
    </div>
  );
}
