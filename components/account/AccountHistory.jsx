"use client";
import { useEffect, useState } from "react";
import {
  ArrowRightLeft,
  Dice5,
  ChevronLeft,
  ChevronRight,
  Share2,
} from "lucide-react";
import { apiRequest } from "../auth/AuthProvider";
import { formatAtomic } from "../../lib/account/validation";
import { FeatureDialog } from "../features/Shared";
export default function AccountHistory({ kind, authenticated, onSignIn }) {
  const games = kind === "game-history";
  const [type, setType] = useState("all"),
    [category, setCategory] = useState("all"),
    [game, setGame] = useState("all"),
    [page, setPage] = useState(0),
    [items, setItems] = useState([]),
    [hasMore, setHasMore] = useState(false),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(false),
    [selected, setSelected] = useState(null);
  const [dates, setDates] = useState(() => {
    const to = new Date(),
      from = new Date();
    from.setUTCDate(from.getUTCDate() - 7);
    return {
      from: from.toISOString().slice(0, 10),
      to: to.toISOString().slice(0, 10),
    };
  });
  useEffect(() => {
    let active = true;
    setItems([]);
    setHasMore(false);
    setSelected(null);
    setError("");
    setLoading(false);
    if (!authenticated) return;
    setLoading(true);
    const params = new URLSearchParams(
      games
        ? { type: "games", category, game, offset: String(page * 20) }
        : {
            type: "transactions",
            ...dates,
            kind: type,
            offset: String(page * 20),
          },
    );
    apiRequest(`/api/account/history/?${params}`, undefined, "GET")
      .then((data) => {
        if (active) {
          setItems(data.items);
          setHasMore(data.hasMore);
          setError("");
        }
      })
      .catch((problem) => {
        if (active) setError(problem.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [authenticated, games, type, category, game, page, dates]);
  return (
    <>
      <div className="account-history__filters">
        {games ? (
          <>
            <label>
              <span>Proveedor</span>
              <select
                value={category}
                onChange={(event) => {
                  setCategory(event.target.value);
                  setPage(0);
                }}
              >
                <option value="all">Todos los proveedores</option>
                <option value="HorseBet Originals">HorseBet Originals</option>
                <option value="Pragmatic Play">Pragmatic Play</option>
                <option value="BGaming">BGaming</option>
              </select>
            </label>
            <label>
              <span>Juego</span>
              <select
                value={game}
                onChange={(event) => {
                  setGame(event.target.value);
                  setPage(0);
                }}
              >
                <option value="all">Todos los juegos</option>
                <option value="dice">Dice</option>
                <option value="crash">Crash</option>
                <option value="plinko">Plinko</option>
              </select>
            </label>
          </>
        ) : (
          <>
            <label>
              <span>Tipo</span>
              <select
                value={type}
                onChange={(event) => {
                  setType(event.target.value);
                  setPage(0);
                }}
              >
                <option value="all">Todos los movimientos</option>
                <option value="credit">Abonos</option>
                <option value="debit">Cargos</option>
              </select>
            </label>
            <div className="account-history__dates">
              <label>
                <span>Desde</span>
                <input
                  type="date"
                  value={dates.from}
                  onChange={(event) => {
                    setDates({ ...dates, from: event.target.value });
                    setPage(0);
                  }}
                />
              </label>
              <label>
                <span>Hasta</span>
                <input
                  type="date"
                  value={dates.to}
                  onChange={(event) => {
                    setDates({ ...dates, to: event.target.value });
                    setPage(0);
                  }}
                />
              </label>
            </div>
          </>
        )}
      </div>
      {error && (
        <p className="account-message account-message--error" role="alert">
          {error}
        </p>
      )}
      {items.length ? (
        <div className="account-history__table">
          <table>
            <thead>
              <tr>
                {(games
                  ? [
                      "JUEGO",
                      "TIEMPO",
                      "IMPORTE DE LA APUESTA",
                      "MULTIPLICADOR",
                      "PAGO",
                      "",
                    ]
                  : ["TIPO", "FECHA", "MONEDA", "IMPORTE", ""]
                ).map((label, index) => (
                  <th key={index}>{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  {games ? (
                    <>
                      <td>
                        <Dice5 size={18} />
                        {item.game_name}
                      </td>
                      <td>
                        {new Date(item.played_at).toLocaleString("es-MX")}
                      </td>
                      <td>
                        {item.currency}{" "}
                        {formatAtomic(item.bet_atomic, item.decimals)}
                      </td>
                      <td>
                        <span className="account-multiplier">
                          ×{Number(item.multiplier).toLocaleString("es-MX")}
                        </span>
                      </td>
                      <td
                        className={
                          BigInt(item.payout_atomic) > 0n
                            ? "account-history__positive"
                            : ""
                        }
                      >
                        {item.currency}{" "}
                        {formatAtomic(item.payout_atomic, item.decimals)}
                      </td>
                    </>
                  ) : (
                    <>
                      <td>
                        <ArrowRightLeft size={16} />
                        {item.kind === "credit" ? "Abono" : "Cargo"}
                      </td>
                      <td>
                        {new Date(item.created_at).toLocaleString("es-MX")}
                      </td>
                      <td>{item.currency}</td>
                      <td
                        className={
                          item.kind === "credit"
                            ? "account-history__positive"
                            : ""
                        }
                      >
                        {formatAtomic(item.amount_atomic, item.decimals)}
                      </td>
                    </>
                  )}
                  <td>
                    <button
                      aria-label="Ver detalle del movimiento"
                      onClick={() => setSelected(item)}
                    >
                      <Share2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="account-empty">
          {games ? <Dice5 size={28} /> : <ArrowRightLeft size={28} />}
          <h3>
            {loading
              ? "Cargando historial…"
              : games
                ? "Aún no hay partidas registradas"
                : "Aún no hay transacciones"}
          </h3>
          <p>
            {authenticated
              ? "Los movimientos de tu cuenta aparecerán aquí."
              : "Inicia sesión para consultar tu historial personal."}
          </p>
          {!authenticated && (
            <button className="button button--secondary" onClick={onSignIn}>
              Iniciar sesión
            </button>
          )}
        </div>
      )}
      {(page > 0 || hasMore) && (
        <div className="pagination">
          <button
            disabled={page === 0 || loading}
            aria-label="Historial anterior"
            onClick={() => setPage(page - 1)}
          >
            <ChevronLeft size={17} />
          </button>
          <span>{page + 1}</span>
          <button
            disabled={!hasMore || loading}
            aria-label="Historial siguiente"
            onClick={() => setPage(page + 1)}
          >
            <ChevronRight size={17} />
          </button>
        </div>
      )}
      {selected && (
        <FeatureDialog
          title="Detalle del movimiento"
          onClose={() => setSelected(null)}
        >
          <p>
            Referencia: <code>{selected.id}</code>
          </p>
          <p>
            {games
              ? selected.game_name
              : selected.kind === "credit"
                ? "Abono"
                : "Cargo"}{" "}
            · {selected.currency}
          </p>
          <p>Este registro pertenece exclusivamente a tu cuenta.</p>
        </FeatureDialog>
      )}
    </>
  );
}
