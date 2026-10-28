import { useState } from "react";
import {
  Ticket,
  ChevronDown,
  Trash2,
  X,
  SlidersHorizontal,
  LockKeyhole,
} from "lucide-react";
import Link from "next/link";
import {
  resolvePick,
  slipTotals,
  sportsMoney,
  displayOdds,
} from "../../lib/sports/slip";
import { sportsEventPath } from "../../data/sports";

export default function BetSlip({
  keys,
  onRemove,
  onClear,
  open,
  setOpen,
  mode,
  setMode,
  stake,
  setStake,
  format,
  setFormat,
  onPlaceBet,
  user,
  loading,
  submitting,
  submitError,
  openAuth,
}) {
  const [settings, setSettings] = useState(false);
  const picks = keys.map(resolvePick).filter(Boolean);
  const totals = slipTotals(keys, stake, mode);
  return (
    <aside
      className={`sports-slip ${open ? "sports-slip--open" : ""}`}
      aria-label="Cupón de apuesta"
    >
      <button
        className="sports-slip__header"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls="sports-slip-body"
      >
        <Ticket size={24} />
        <strong>Cupón de apuesta</strong>
        <b>{picks.length}</b>

        <ChevronDown size={17} />
      </button>
      {open && (
        <div id="sports-slip-body" className="sports-slip__body">
          <div className="sports-slip__tabs">
            {[
              ["single", "Directa"],
              ["combo", "Combo"],
            ].map(([id, label]) => (
              <button
                key={id}
                className={
                  mode === id
                    ? "sports-slip__tab sports-slip__tab--active"
                    : "sports-slip__tab"
                }
                aria-pressed={mode === id}
                onClick={() => setMode(id)}
              >
                {label}
              </button>
            ))}
          </div>
          {!user && !loading && (
            <div className="sports-slip__auth" role="status">
              <LockKeyhole size={20} />
              <div>
                <strong>Debes estar registrado para realizar apuestas.</strong>
                <p>
                  <button onClick={() => openAuth("register")}>
                    Regístrate
                  </button>{" "}
                  o{" "}
                  <button onClick={() => openAuth("login")}>
                    inicia sesión
                  </button>
                  .
                </p>
              </div>
            </div>
          )}
          {!picks.length ? (
            <div className="sports-slip__empty">
              <Ticket size={46} strokeWidth={1.2} />
              <h3>Realiza tu selección</h3>
              <p>Pulsa una cuota para añadirla a tu cupón.</p>
            </div>
          ) : (
            <>
              <div className="sports-slip__picks">
                {picks.map(({ key, event, market, outcome }) => (
                  <article className="sports-slip__pick" key={key}>
                    <button
                      className="sports-slip__remove"
                      onClick={() => onRemove(key)}
                      aria-label={`Quitar ${outcome.label} de ${event.home} contra ${event.away}`}
                    >
                      <X size={16} />
                    </button>
                    <div>
                      <strong>{outcome.label}</strong>
                      <Link href={sportsEventPath(event.id)}>
                        {event.home} vs. {event.away}
                      </Link>
                      <small>{market.title}</small>
                      <b>{displayOdds(outcome.odds, format)}</b>
                    </div>
                  </article>
                ))}
              </div>
              <div className="sports-slip__amount">
                <label htmlFor="sports-stake">
                  {mode === "single"
                    ? "Importe por selección"
                    : "Importe de la combinada"}
                </label>
                <input
                  id="sports-stake"
                  inputMode="decimal"
                  autoComplete="off"
                  value={stake}
                  onChange={(event) => setStake(event.target.value)}
                  aria-describedby="sports-stake-limit"
                />
                <small id="sports-stake-limit">
                  De 1 a 1,000 fichas por apuesta
                </small>
                <div>
                  {[1, 10, 30, 50].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setStake(String(amount))}
                    >
                      {amount}
                    </button>
                  ))}
                </div>
              </div>
              <dl className="sports-slip__totals">
                {mode === "combo" && (
                  <div>
                    <dt>Cuota total</dt>
                    <dd>{totals ? displayOdds(totals.odds, format) : "—"}</dd>
                  </div>
                )}
                <div>
                  <dt>Apuesta total</dt>
                  <dd>{totals ? sportsMoney(totals.stake) : "—"}</dd>
                </div>
                <div>
                  <dt>RETORNO POTENCIAL</dt>
                  <dd>
                    {totals ? sportsMoney(totals.payout) : "—"}
                    <small> fichas</small>
                  </dd>
                </div>
              </dl>
              {!totals && (
                <p className="sports-slip__error" role="alert">
                  Introduce un importe válido entre 1 y 1,000, con hasta dos
                  decimales.
                </p>
              )}
              {mode === "combo" && picks.length < 2 && (
                <p className="sports-slip__hint">
                  Selecciona otro evento para crear una combinada.
                </p>
              )}
              <button
                className="button button--primary sports-slip__submit"
                disabled={
                  loading ||
                  submitting ||
                  (!!user &&
                    (!totals || (mode === "combo" && picks.length < 2)))
                }
                onClick={onPlaceBet}
              >
                {loading
                  ? "Comprobando sesión…"
                  : submitting
                    ? "Enviando…"
                    : "Realizar apuesta"}
              </button>
              <p className="sports-slip__hint">
                Una selección por evento; elegir otra la reemplaza.
              </p>
            </>
          )}
          {submitError && (
            <p className="sports-slip__error" role="alert">
              {submitError}
            </p>
          )}
          <div className="sports-slip__footer">
            <button
              onClick={onClear}
              disabled={!picks.length}
              aria-label="Vaciar cupón"
            >
              <Trash2 size={17} />
            </button>
            <button
              onClick={() => setSettings(!settings)}
              aria-expanded={settings}
            >
              <SlidersHorizontal size={15} /> Formato de cuotas
            </button>
          </div>
          {settings && (
            <label className="sports-slip__settings">
              Mostrar cuotas
              <select
                value={format}
                onChange={(event) => setFormat(event.target.value)}
              >
                <option value="decimal">Decimal · 1.85</option>
                <option value="american">Americano · -118</option>
              </select>
            </label>
          )}
        </div>
      )}
    </aside>
  );
}
