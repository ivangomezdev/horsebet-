import BonusSymbol from "./games/BonusSymbol";

export function ObjectArt({ kind, className = "" }) {
  return (
    <span
      className={`object-art object-art--${kind} ${className}`}
      aria-hidden="true"
    />
  );
}
export function GameArt({ game }) {
  if (game.cover)
    return (
      <span className="game-art slot-cover" aria-hidden="true">
        <img
          className="slot-cover__image"
          src={game.cover}
          alt=""
          loading="lazy"
          decoding="async"
          width="480"
          height="640"
        />
        <span className="slot-cover__shade" />
        <span className="slot-cover__shine" />
      </span>
    );
  if (game.bonusTheme)
    return (
      <span
        className={`game-art bonus-card-art bonus-card-art--${game.bonusTheme}`}
        style={{
          "--card-accent": game.bonusAccent,
          "--card-dark": game.bonusDark,
        }}
        aria-hidden="true"
      >
        <BonusSymbol icon={game.bonusIcon} label={game.title} />
        <span>{game.bonusLabel}</span>
      </span>
    );
  if (game.slotTheme && game.art === undefined) {
    const emblem =
      game.slotTheme === "neon-gems"
        ? "diamond"
        : game.slotTheme === "ruby-rush"
          ? "ruby"
          : "horse";
    return (
      <span
        className={`game-art slot-card-art slot-card-art--${game.slotTheme}`}
        aria-hidden="true"
      >
        <span className="slot-card-art__ring" />
        <i className={`slot-symbol slot-symbol--${emblem}`} />
        <span className="slot-card-art__label">HORSEBET SLOTS</span>
        <span className="slot-card-art__spark">✦</span>
      </span>
    );
  }
  return (
    <span
      className={`game-art ${game.color ? `game-art--${game.color}` : ""}`}
      aria-hidden="true"
    >
      {game.art !== undefined && (
        <span
          className={`game-art__image game-art__image--${game.art} ${game.atlas ? `game-art__image--${game.atlas}` : ""}`}
        />
      )}
      {game.object && <ObjectArt kind={game.object} />}
      {game.special === "keno" && (
        <span className="game-art__keno">
          {[8, 21, 7, 16, 32, 4, 11, 28, 9].map((number) => (
            <i key={number}>{number}</i>
          ))}
        </span>
      )}
      {game.special === "roulette" && (
        <span className="game-art__roulette">
          <i>★</i>
        </span>
      )}
      {game.special === "cards" && (
        <span className="game-art__cards">
          <i>
            A<span>♠</span>
          </i>
          <i>
            K<span>♥</span>
          </i>
        </span>
      )}
      {game.special === "plinko" && (
        <span className="game-art__plinko">
          {Array.from({ length: 7 }, (_, row) => (
            <span key={row}>{"• ".repeat(row + 1)}</span>
          ))}
        </span>
      )}
      {game.special === "crash" && (
        <span className="game-art__rocket">
          ➤<i>×12.80</i>
        </span>
      )}
    </span>
  );
}
