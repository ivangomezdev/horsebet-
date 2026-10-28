"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import {
  LockKeyhole,
  Bell,
  Trophy,
  MessageCircle,
  ArrowDownToLine,
  ShieldCheck,
  Crown,
} from "lucide-react";
import { useAuth } from "../auth/AuthProvider";
import { useMember } from "./MemberProvider";
import CurrencyIcon from "./CurrencyIcon";
import {
  currencies,
  memberRoutes,
  currencyByCode,
} from "../../data/currencies";
import { rankProgress } from "../../lib/account/member";
import { formatBalance } from "../../lib/account/format-balance";

export default function MemberPage({ section, onSupport }) {
  const { user, loading, openAuth } = useAuth();
  const { data, error, busy, refresh, mutate } = useMember();
  const [coinOverride, setCoin] = useState(null),
    [network, setNetwork] = useState(""),
    [direction, setDirection] = useState("in"),
    [amount, setAmount] = useState(""),
    [notice, setNotice] = useState(""),
    [formError, setFormError] = useState("");
  const requestKey = useRef(null);
  const code = coinOverride || data?.preferences?.currency || "USDT",
    coin = currencyByCode[code],
    rank = rankProgress(data?.points || "0");
  const balance = (currency, kind = "user") => {
    const c = currencyByCode[currency],
      w = data?.wallets.find((w) => w.currency === currency && w.kind === kind);
    return data ? formatBalance(w?.balance_atomic || "0", c.decimals) : "—";
  };
  const choose = (next) => {
    setCoin(next);
    setNetwork("");
    requestKey.current = null;
    setNotice("");
    setFormError("");
  };
  const notifyRead = async (id) => {
    try {
      await mutate({ action: "read", id });
    } catch (e) {
      setFormError(e.message);
    }
  };
  const transfer = async (e) => {
    e.preventDefault();
    setFormError("");
    setNotice("");
    requestKey.current ||= crypto.randomUUID();
    try {
      await mutate({
        action: "vault",
        currency: code,
        amount,
        direction,
        key: requestKey.current,
      });
      setAmount("");
      requestKey.current = null;
      setNotice("Movimiento completado. Tus saldos se han actualizado.");
    } catch (e) {
      setFormError(e.message);
    }
  };
  const publicPage = ["tournaments", "community"].includes(section);
  return (
    <div className="content member-page">
      <div className="member-page__heading">
        <div>
          <span>HORSEBET · TU ESPACIO</span>
          <h1>{memberRoutes[section]}</h1>
        </div>
        <Link href="/es/account/">Mi cuenta</Link>
      </div>
      {!publicPage && !user && (
        <section className="member-card member-card--access">
          <ShieldCheck size={32} />
          <h2>
            {loading ? "Cargando tu sesión…" : "Tu cuenta, siempre contigo"}
          </h2>
          <p>Inicia sesión para consultar tus saldos y gestionar tu cuenta.</p>
          <button
            className="button button--primary"
            disabled={loading}
            onClick={() => openAuth("login")}
          >
            Iniciar sesión
          </button>
        </section>
      )}
      {!publicPage && user && error && (
        <div className="member-page__error" role="alert">
          {error}
          <button onClick={refresh}>Reintentar</button>
        </div>
      )}
      {!publicPage && user && !data && !error && (
        <p role="status">Cargando tu información…</p>
      )}
      {formError && (
        <p className="member-page__error" role="alert">
          {formError}
        </p>
      )}
      {notice && (
        <p className="member-page__notice" role="status">
          {notice}
        </p>
      )}
      {user && data && (
        <>
          {section === "wallet" && (
            <>
              <div className="member-page__toolbar">
                <p>Tu saldo disponible, en cada moneda.</p>
                <Link className="button button--primary" href="/es/deposit/">
                  <ArrowDownToLine size={18} />
                  Depósito
                </Link>
              </div>
              <div className="member-wallet-grid">
                {currencies.map((c) => (
                  <article className="member-card" key={c.code}>
                    <CurrencyIcon code={c.code} size={36} />
                    <h2>
                      {c.name}
                      <small>{c.code}</small>
                    </h2>
                    <strong className="member-card__amount">
                      {balance(c.code)}
                    </strong>
                    <p>
                      Bóveda: {balance(c.code, "vault")} {c.code}
                    </p>
                    <button
                      className="member-card__select"
                      disabled={busy}
                      onClick={async () => {
                        try {
                          await mutate({
                            action: "preferences",
                            currency: c.code,
                            hideZero: data.preferences.hide_zero,
                            includeVault: data.preferences.include_vault,
                          });
                          setNotice(c.code + " seleccionada en tu navbar.");
                        } catch (e) {
                          setFormError(e.message);
                        }
                      }}
                    >
                      {data.preferences.currency === c.code
                        ? "Moneda seleccionada"
                        : "Usar esta moneda"}
                    </button>
                  </article>
                ))}
              </div>
              <div className="member-page__toolbar">
                <Link href="/es/transactions/">Ver transacciones</Link>
                <Link href="/es/vault/">Abrir bóveda</Link>
              </div>
            </>
          )}
          {section === "deposit" && (
            <div className="member-page__columns">
              <section className="member-card">
                <span className="member-card__step">01 · MONEDA</span>
                <h2>Depositar criptomonedas</h2>
                <div className="member-coin-picker">
                  {currencies.map((c) => (
                    <button
                      key={c.code}
                      aria-pressed={code === c.code}
                      onClick={() => choose(c.code)}
                    >
                      <CurrencyIcon code={c.code} />
                      {c.code}
                    </button>
                  ))}
                </div>
                <label className="member-field">
                  Red
                  <select
                    value={network || coin.networks[0]}
                    onChange={(e) => setNetwork(e.target.value)}
                  >
                    {coin.networks.map((n) => (
                      <option key={n}>{n}</option>
                    ))}
                  </select>
                </label>
                <div className="member-deposit-status">
                  <LockKeyhole size={28} />
                  <h3>Depósitos aún no disponibles</h3>
                  <p>
                    Estamos preparando los depósitos de {code}. Podrás ver aquí
                    tu dirección y el código QR cuando el servicio esté
                    habilitado.
                  </p>
                  <button
                    className="button button--secondary"
                    onClick={onSupport}
                  >
                    Contactar con soporte
                  </button>
                </div>
              </section>
              <aside className="member-card">
                <CurrencyIcon code={code} size={42} />
                <h2>Tu saldo {code}</h2>
                <strong className="member-card__amount">{balance(code)}</strong>
                <p>
                  Los depósitos confirmados aparecerán en tu historial de
                  transacciones.
                </p>
                <Link href="/es/transactions/">
                  Ver historial <ArrowDownToLine size={16} />
                </Link>
              </aside>
            </div>
          )}
          {section === "vault" && (
            <div className="member-page__columns">
              <section className="member-card">
                <LockKeyhole size={36} />
                <h2>Tu bóveda personal</h2>
                <p>
                  Separa fondos de tu saldo disponible. Puedes devolverlos a tu
                  cartera cuando quieras.
                </p>
                <div className="member-vault-list">
                  {currencies.map((c) => (
                    <button
                      key={c.code}
                      aria-pressed={code === c.code}
                      onClick={() => choose(c.code)}
                    >
                      <CurrencyIcon code={c.code} />
                      <span>{c.code}</span>
                      <strong>{balance(c.code, "vault")}</strong>
                    </button>
                  ))}
                </div>
              </section>
              <form className="member-card" onSubmit={transfer}>
                <h2>Mover {code}</h2>
                <div className="member-tabs">
                  <button
                    type="button"
                    aria-pressed={direction === "in"}
                    onClick={() => {
                      setDirection("in");
                      requestKey.current = null;
                    }}
                  >
                    Guardar
                  </button>
                  <button
                    type="button"
                    aria-pressed={direction === "out"}
                    onClick={() => {
                      setDirection("out");
                      requestKey.current = null;
                    }}
                  >
                    Devolver a cartera
                  </button>
                </div>
                <p>
                  Disponible:{" "}
                  {balance(code, direction === "in" ? "user" : "vault")} {code}
                </p>
                <label className="member-field">
                  Importe
                  <input
                    inputMode="decimal"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      requestKey.current = null;
                    }}
                    placeholder="0.00"
                    required
                    maxLength={40}
                    disabled={busy}
                  />
                </label>
                <button
                  className="button button--primary"
                  disabled={busy || !amount}
                >
                  {busy
                    ? "Procesando…"
                    : direction === "in"
                      ? "Guardar en bóveda"
                      : "Devolver a cartera"}
                </button>
                <small className="member-card__note">
                  Este movimiento no es un depósito ni un retiro externo.
                </small>
              </form>
            </div>
          )}
          {section === "notifications" && (
            <section className="member-card">
              <div className="member-page__toolbar">
                <h2>Tu actividad</h2>
                <button
                  className="button button--secondary"
                  disabled={busy || !data.unread}
                  onClick={() => notifyRead(null)}
                >
                  Marcar todas como leídas
                </button>
              </div>
              {!data.notifications.length ? (
                <div className="member-empty">
                  <Bell size={42} />
                  <h3>Estás al día</h3>
                  <p>Aquí aparecerán las novedades de tu cuenta.</p>
                </div>
              ) : (
                data.notifications.map((n) => (
                  <article
                    key={n.id}
                    className={
                      "member-notification " +
                      (!n.read_at ? "member-notification--unread" : "")
                    }
                  >
                    <Bell size={19} />
                    <div>
                      <h3>{n.title}</h3>
                      <p>{n.body}</p>
                      <time>
                        {new Date(n.created_at).toLocaleString("es-MX")}
                      </time>
                    </div>
                    {!n.read_at && (
                      <button disabled={busy} onClick={() => notifyRead(n.id)}>
                        Marcar como leída
                      </button>
                    )}
                  </article>
                ))
              )}
            </section>
          )}
          {section === "profile" && (
            <div className="member-page__columns">
              <section className="member-card member-profile">
                <div className="member-profile__avatar">♞</div>
                <h2>{user.username}</h2>
                <p>Miembro de HorseBet · Nivel {rank.level}</p>
                <Link className="button button--secondary" href="/es/account/">
                  Editar perfil
                </Link>
              </section>
              <section className="member-card">
                <Crown size={34} />
                <h2>Tu progreso</h2>
                <strong className="member-card__amount">{rank.percent}%</strong>
                <div className="member-progress">
                  <i style={{ width: rank.percent + "%" }} />
                </div>
                <p>
                  {rank.nextLevel === null
                    ? "Has alcanzado el nivel máximo."
                    : rank.remaining +
                      " puntos para el nivel " +
                      rank.nextLevel +
                      "."}
                </p>
                <p>
                  Las rondas con fichas de demostración no generan puntos de
                  nivel.
                </p>
                <Link href="/es/vip-club/">Explorar Club VIP</Link>
              </section>
            </div>
          )}
        </>
      )}
      {section === "tournaments" && (
        <section className="member-card member-empty">
          <Trophy size={48} />
          <h2>La próxima competición empieza aquí</h2>
          <p>
            No hay torneos activos en este momento. Las fechas y condiciones
            aparecerán aquí cuando se anuncien.
          </p>
          <div className="member-empty__links">
            <Link className="button button--primary" href="/es/casino/">
              Explorar juegos
            </Link>
            <Link className="button button--secondary" href="/es/promo/">
              Ver promociones
            </Link>
          </div>
        </section>
      )}
      {section === "community" && (
        <section className="member-card member-empty">
          <MessageCircle size={48} />
          <h2>Comunidad HorseBet</h2>
          <p>
            Los canales oficiales de la comunidad se anunciarán aquí. Mientras
            tanto, nuestro chat de soporte está disponible para tus consultas.
          </p>
          <button className="button button--primary" onClick={onSupport}>
            Abrir chat de soporte
          </button>
        </section>
      )}
      <nav className="member-page__breadcrumb">
        <Link href="/es/">HorseBet</Link>
        <span>›</span>
        {memberRoutes[section]}
      </nav>
    </div>
  );
}
