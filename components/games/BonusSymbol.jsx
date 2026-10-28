import { symbolArt } from "../../lib/games/vendor/metaincognita/symbols.js";
import { symbolSprite } from "../../lib/games/symbol-art.js";

export default function BonusSymbol({
  icon,
  label,
  wild = false,
  scatter = false,
}) {
  const art = symbolArt(icon);
  const sprite = symbolSprite(icon);
  return (
    <span
      className={`bonus-symbol ${wild ? "bonus-symbol--wild" : ""} ${scatter ? "bonus-symbol--scatter" : ""}`}
      role="img"
      aria-label={label || icon}
    >
      {sprite ? (
        <i
          className={`slot-symbol slot-symbol--${sprite}`}
          aria-hidden="true"
        />
      ) : art?.kind === "svg" ? (
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          dangerouslySetInnerHTML={{ __html: art.body }}
        />
      ) : (
        <b
          className={art?.variant === "bar" ? "bonus-symbol__bars" : undefined}
        >
          {art?.variant === "bar"
            ? Array(Number(art.text) || 1)
                .fill("BAR")
                .join("\n")
            : art?.text || label}
        </b>
      )}
      {(wild || scatter) && <small>{wild ? "WILD" : "SCATTER"}</small>}
    </span>
  );
}
