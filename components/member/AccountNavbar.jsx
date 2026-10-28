"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronRight,
  Search,
  Bell,
  Wallet,
  User,
  Settings,
  LockKeyhole,
  LogOut,
} from "lucide-react";
import { useAuth } from "../auth/AuthProvider";
import { useMember } from "./MemberProvider";
import CurrencyIcon from "./CurrencyIcon";
import { currencies } from "../../data/currencies";
import { rankProgress } from "../../lib/account/member";
import { formatBalance } from "../../lib/account/format-balance";

export function AccountNavbarView({
  data,
  error,
  busy,
  onPreferences,
  onLogout,
  onRetry,
}) {
  const [panel, setPanel] = useState(null),
    [query, setQuery] = useState(""),
    [notice, setNotice] = useState("");
  const root = useRef(null),
    walletButton = useRef(null),
    rankButton = useRef(null);
  const preference = data?.preferences || {
    currency: "USDT",
    hide_zero: false,
    include_vault: false,
  };
  const rank = rankProgress(data?.points || "0");
  const balance = (code) => {
    if (!data) return "—";
    const coin = currencies.find((c) => c.code === code);
    const rows = data.wallets.filter(
      (w) =>
        w.currency === code && (w.kind === "user" || preference.include_vault),
    );
    const value = rows.reduce((sum, w) => sum + BigInt(w.balance_atomic), 0n);
    return formatBalance(value.toString(), coin.decimals);
  };
  useEffect(() => {
    if (!panel) return;
    const outside = (e) => {
      if (!root.current?.contains(e.target)) setPanel(null);
    };
    const escape = (e) => {
      if (e.key === "Escape") {
        setPanel(null);
        (panel === "wallet" ? walletButton : rankButton).current?.focus();
      }
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [panel]);
  const save = async (changes) => {
    setNotice("");
    try {
      await onPreferences({ ...preference, ...changes });
    } catch (e) {
      setNotice(e.message);
    }
  };
  const visible = currencies.filter(
    (c) =>
      (c.code + " " + c.name).toLowerCase().includes(query.toLowerCase()) &&
      (!preference.hide_zero ||
        data?.wallets.some(
          (w) =>
            w.currency === c.code &&
            (w.kind === "user" || preference.include_vault) &&
            BigInt(w.balance_atomic) > 0n,
        )),
  );
  const menu = [
    ["notifications", "Notificaciones", Bell],
    ["wallet", "Cartera", Wallet],
    ["profile", "Perfil", User],
    ["account", "Cuenta", Settings],
    ["vault", "Bóveda", LockKeyhole],
  ];
  return (
    <div className="member-nav" ref={root}>
      <div className="member-nav__wallet-group">
        <button
          ref={walletButton}
          className="member-nav__balance"
          aria-label={
            "Seleccionar moneda. " +
            preference.currency +
            " " +
            balance(preference.currency)
          }
          aria-expanded={panel === "wallet"}
          aria-controls="wallet-popover"
          onClick={() => {
            setPanel(panel === "wallet" ? null : "wallet");
            setNotice("");
          }}
        >
          <CurrencyIcon code={preference.currency} />
          <span>
            {balance(preference.currency)}
            <small>
              {preference.currency}
              {preference.include_vault ? " · total" : ""}
            </small>
          </span>
          <ChevronDown size={16} />
        </button>
        <Link className="member-nav__deposit" href="/es/deposit/">
          Depósito
        </Link>
      </div>
      <button
        ref={rankButton}
        className="member-nav__rank"
        style={{ "--progress": rank.percent + "%" }}
        aria-label={
          "Menú de cuenta. Nivel " +
          rank.level +
          ". " +
          rank.percent +
          "% para el próximo nivel"
        }
        aria-expanded={panel === "account"}
        aria-controls="account-popover"
        onClick={() => {
          setPanel(panel === "account" ? null : "account");
          setNotice("");
        }}
      >
        <span>{data ? rank.percent + "%" : "—"}</span>
        {data?.unread > 0 && <b>{data.unread > 99 ? "99+" : data.unread}</b>}
      </button>
      {panel === "wallet" && (
        <section
          className="member-popover member-popover--wallet"
          id="wallet-popover"
          aria-label="Selector de moneda"
        >
          <label className="member-popover__search">
            <Search size={17} />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar moneda"
              aria-label="Buscar moneda"
            />
          </label>
          {error ? (
            <div className="member-popover__error" role="alert">
              {error}
              <button onClick={onRetry}>Reintentar</button>
            </div>
          ) : !data ? (
            <p className="member-popover__empty">Cargando saldos…</p>
          ) : (
            <div className="member-popover__coins">
              {visible.map((c) => (
                <button
                  key={c.code}
                  disabled={busy}
                  className={
                    "member-popover__coin " +
                    (preference.currency === c.code
                      ? "member-popover__coin--selected"
                      : "")
                  }
                  aria-pressed={preference.currency === c.code}
                  onClick={() => save({ currency: c.code })}
                >
                  <CurrencyIcon code={c.code} />
                  <span>
                    {c.code}
                    <small>{c.name}</small>
                  </span>
                  <strong>{balance(c.code)}</strong>
                </button>
              ))}
              {!visible.length && (
                <p className="member-popover__empty">
                  No hay monedas que coincidan.
                  <br />
                  Puedes desactivar «Ocultar saldos en 0».
                </p>
              )}
            </div>
          )}
          <div className="member-popover__options">
            <label>
              Ocultar saldos en 0
              <input
                type="checkbox"
                role="switch"
                checked={preference.hide_zero}
                disabled={!data || busy}
                onChange={(e) => save({ hide_zero: e.target.checked })}
              />
            </label>
            <label>
              Incluir saldo de la bóveda
              <input
                type="checkbox"
                role="switch"
                checked={preference.include_vault}
                disabled={!data || busy}
                onChange={(e) => save({ include_vault: e.target.checked })}
              />
            </label>
            <Link href="/es/wallet/" onClick={() => setPanel(null)}>
              Ver cartera <ChevronRight size={15} />
            </Link>
          </div>
          {notice && (
            <p className="member-popover__error" role="alert">
              {notice}
            </p>
          )}
        </section>
      )}
      {panel === "account" && (
        <section
          className="member-popover member-popover--account"
          id="account-popover"
          aria-label="Menú de cuenta"
        >
          <Link
            href="/es/vip-club/"
            className="member-popover__progress"
            onClick={() => setPanel(null)}
          >
            <div>
              <b>{rank.level}</b>
              <span
                role="progressbar"
                aria-label="Progreso de nivel"
                aria-valuenow={rank.percent}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <i style={{ width: rank.percent + "%" }} />
              </span>
              <b>{rank.nextLevel ?? rank.level}</b>
            </div>
            <p>
              {!data ? (
                "Cargando tu nivel…"
              ) : rank.nextLevel === null ? (
                "Nivel máximo alcanzado"
              ) : (
                <>
                  Para el siguiente nivel:{" "}
                  <strong>
                    {Number(rank.remaining).toLocaleString("es-MX")} puntos
                  </strong>
                </>
              )}
              <ChevronRight size={16} />
            </p>
          </Link>
          {menu.map(([path, label, Icon]) => (
            <Link
              key={path}
              className="member-popover__link"
              href={"/es/" + path + "/"}
              onClick={() => setPanel(null)}
            >
              <Icon size={18} />
              {label}
              {path === "notifications" && data?.unread > 0 && (
                <b>{data.unread}</b>
              )}
            </Link>
          ))}
          <button
            className="member-popover__link"
            disabled={busy}
            onClick={async () => {
              try {
                await onLogout();
                setPanel(null);
              } catch (e) {
                setNotice(e.message);
              }
            }}
          >
            <LogOut size={18} />
            Cerrar sesión
          </button>
          {(notice || error) && (
            <p className="member-popover__error" role="alert">
              {notice || error}
            </p>
          )}
        </section>
      )}
    </div>
  );
}
export default function AccountNavbar() {
  const { logout } = useAuth();
  const member = useMember();
  return (
    <AccountNavbarView
      {...member}
      onRetry={member.refresh}
      onLogout={logout}
      onPreferences={(p) =>
        member.mutate({
          action: "preferences",
          currency: p.currency,
          hideZero: p.hide_zero,
          includeVault: p.include_vault,
        })
      }
    />
  );
}
