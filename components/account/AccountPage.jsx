"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Settings,
  ArrowRightLeft,
  Coins,
  Clock3,
  BadgeCheck,
  LoaderCircle,
  LogOut,
  Wallet,
} from "lucide-react";
import { useAuth, apiRequest } from "../auth/AuthProvider";
import { accountRoutes } from "../../data/account";
import { formatAtomic } from "../../lib/account/validation";
import { Breadcrumb } from "../features/Shared";
import AccountSettings from "./AccountSettings";
import AccountHistory from "./AccountHistory";
import AccountKyc from "./AccountKyc";

const icons = {
  account: Settings,
  transactions: ArrowRightLeft,
  "game-history": Coins,
  sessions: Clock3,
  kyc: BadgeCheck,
};
export default function AccountPage({ tab, onHome }) {
  const { user, loading, openAuth, refresh, logout } = useAuth();
  const generation = useRef(0);
  const [data, setData] = useState(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [notice, setNotice] = useState("");
  const reload = useCallback(async () => {
    const requestGeneration = ++generation.current;
    if (!user) {
      setData(null);
      setBusy(false);
      setError("");
      return;
    }
    setBusy(true);
    try {
      const result = await apiRequest("/api/account/", undefined, "GET");
      if (requestGeneration !== generation.current) return;
      setData(result);
      setError("");
    } catch (problem) {
      if (requestGeneration !== generation.current) return;
      setError(problem.message);
    } finally {
      if (requestGeneration === generation.current) setBusy(false);
    }
  }, [user?.id]);
  useEffect(() => {
    setData(null);
    reload();
    return () => {
      generation.current++;
    };
  }, [reload]);
  const saved = async (message) => {
    await reload();
    await refresh();
    setNotice(message || "Cambios guardados.");
  };
  const canEdit = Boolean(user?.onboardingCompleted && data);
  const revoke = async (all) => {
    setBusy(true);
    try {
      await apiRequest("/api/account/security/", {
        action: all ? "logout-all" : "revoke-others",
      });
      if (all) await refresh();
      await saved(
        all ? "Sesiones cerradas." : "Se cerraron tus otras sesiones.",
      );
    } catch (problem) {
      setError(problem.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="content account-page">
      <div className="account-page__heading">
        <h1>Cuenta</h1>
        <nav className="account-tabs" aria-label="Secciones de la cuenta">
          {Object.entries(accountRoutes).map(([slug, label]) => {
            const Icon = icons[slug];
            return (
              <Link
                key={slug}
                href={`/es/${slug}/`}
                className={`account-tabs__tab ${tab === slug ? "account-tabs__tab--active" : ""}`}
                aria-current={tab === slug ? "page" : undefined}
              >
                <Icon size={15} />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
      {!loading && !user && (
        <div className="account-access">
          <span>
            <strong>Tu cuenta, en un solo lugar.</strong> Inicia sesión para
            consultar y guardar tus datos.
          </span>
          <button
            className="button button--primary"
            onClick={() => openAuth("login")}
          >
            Iniciar sesión
          </button>
        </div>
      )}
      {user && !user.onboardingCompleted && (
        <div className="account-access">
          <span>Completa tu perfil para gestionar tu cuenta.</span>
          <button
            className="button button--primary"
            onClick={() => openAuth("complete")}
          >
            Completar perfil
          </button>
        </div>
      )}
      {(loading || busy) && (
        <div className="account-page__loading" role="status">
          <LoaderCircle className="auth-spinner" size={18} /> Cargando tu
          cuenta…
        </div>
      )}
      {error && (
        <div className="account-message account-message--error" role="alert">
          {error}
          <button onClick={reload}>Reintentar</button>
        </div>
      )}
      {notice && (
        <div className="account-message" role="status">
          {notice}
          <button onClick={() => setNotice("")} aria-label="Cerrar aviso">
            ×
          </button>
        </div>
      )}
      {tab === "account" && (
        <AccountSettings data={data} canEdit={canEdit} onSaved={saved} />
      )}
      {(tab === "transactions" || tab === "game-history") && (
        <AccountHistory
          key={`${user?.id || "guest"}-${tab}`}
          kind={tab}
          authenticated={Boolean(user && data)}
          onSignIn={() => openAuth("login")}
        />
      )}
      {tab === "kyc" && (
        <AccountKyc data={data} canEdit={canEdit} onSaved={saved} />
      )}
      {tab === "sessions" && (
        <section className="account-panel">
          <div className="account-panel__title">
            <div>
              <h2>Sesiones activas</h2>
              <p>
                Consulta los accesos a HorseBet y cierra tus otras sesiones.
              </p>
            </div>
            <button
              className="button button--secondary"
              disabled={!canEdit || busy}
              onClick={() => revoke(false)}
            >
              Cerrar otras sesiones
            </button>
          </div>
          <div className="account-sessions">
            {data?.sessions?.length ? (
              data.sessions.map((session) => (
                <article key={session.id}>
                  <Clock3 size={24} />
                  <div>
                    <strong>
                      {session.is_current
                        ? "Este dispositivo"
                        : "Sesión de HorseBet"}
                    </strong>
                    <p>
                      Última actividad:{" "}
                      {new Date(session.last_seen_at).toLocaleString("es-MX")}
                    </p>
                    <small>
                      Inicio:{" "}
                      {new Date(session.created_at).toLocaleString("es-MX")}
                    </small>
                  </div>
                  <span className="account-status account-status--success">
                    {session.is_current ? "Actual" : "Activa"}
                  </span>
                </article>
              ))
            ) : (
              <div className="account-empty">
                <Clock3 />
                <h3>No hay sesiones para mostrar</h3>
                <p>Inicia sesión para consultar tus accesos.</p>
              </div>
            )}
          </div>
          <button
            className="account-danger"
            disabled={!canEdit || busy}
            onClick={() => revoke(true)}
          >
            <LogOut size={16} /> Cerrar todas las sesiones
          </button>
        </section>
      )}
      {data?.wallets?.length > 0 && tab === "account" && (
        <section className="account-panel account-wallets">
          <div>
            <h2>
              <Wallet size={20} /> Mis saldos
            </h2>
            <p>Saldo de tu cuenta, registrado en la base de datos.</p>
          </div>
          {data.wallets.map((wallet) => (
            <article key={wallet.id}>
              <span>{wallet.currency}</span>
              <strong>
                {formatAtomic(
                  wallet.balance_atomic,
                  wallet.decimals,
                  Math.min(wallet.decimals, 6),
                )}
              </strong>
            </article>
          ))}
        </section>
      )}
      {user && tab === "account" && (
        <button
          className="account-danger"
          onClick={async () => {
            try {
              await logout();
              setData(null);
            } catch (problem) {
              setError(problem.message);
            }
          }}
        >
          <LogOut size={16} /> Cerrar sesión
        </button>
      )}
      <Breadcrumb name="Cuenta" onHome={onHome} />
    </div>
  );
}
