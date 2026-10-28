"use client";
import { useEffect, useRef, useState } from "react";
import { Headphones, X, Send, ShieldCheck } from "lucide-react";
import { useAuth, apiRequest } from "./auth/AuthProvider";
import {
  SUPPORT_REPLY,
  SUPPORT_GREETING,
  cleanSupportDraft,
  restoreSupportMessages,
} from "../lib/support/messages";

const storageKey = "horsebet-support-demo-v1";
export default function SupportChat({ open, onClose }) {
  const { user, configured, loading } = useAuth();
  const connected = Boolean(user && configured);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const list = useRef(null),
    input = useRef(null),
    busy = useRef(false),
    revision = useRef(0),
    pendingId = useRef(null);
  useEffect(() => {
    let active = true;
    setMessages([]);
    setReady(false);
    setError("");
    if (loading) return;
    if (connected) {
      apiRequest("/api/support/", undefined, "GET")
        .then((data) => {
          if (active) {
            setMessages(data.messages);
            setReady(true);
          }
        })
        .catch((err) => {
          if (active) setError(err.message);
        });
    } else {
      try {
        setMessages(
          restoreSupportMessages(
            JSON.parse(sessionStorage.getItem(storageKey)),
          ),
        );
      } catch {}
      setReady(true);
    }
    return () => {
      active = false;
    };
  }, [connected, user?.id, loading]);
  useEffect(() => {
    if (open) {
      const previous = document.activeElement;
      input.current?.focus();
      return () => {
        if (previous?.isConnected) previous.focus();
      };
    }
  }, [open]);
  useEffect(() => {
    if (open && list.current)
      list.current.scrollTop = list.current.scrollHeight;
  }, [messages, sending, open]);
  useEffect(() => {
    if (!open || !connected || !ready) return;
    let active = true;
    const timer = setInterval(() => {
      if (document.hidden || busy.current) return;
      const requestedRevision = revision.current;
      apiRequest("/api/support/", undefined, "GET")
        .then((data) => {
          if (active && !busy.current && requestedRevision === revision.current)
            setMessages(data.messages);
        })
        .catch(() => {});
    }, 15000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [open, connected, ready]);
  async function send(event) {
    event.preventDefault();
    const text = cleanSupportDraft(draft);
    if (!text || busy.current || !ready) return;
    busy.current = true;
    revision.current += 1;
    setSending(true);
    setError("");
    const id = pendingId.current || crypto.randomUUID();
    pendingId.current = id;
    try {
      if (connected) {
        const data = await apiRequest("/api/support/", { id, message: text });
        setMessages((previous) =>
          [
            ...previous.filter(
              (m) => !data.messages.some((n) => n.id === m.id),
            ),
            ...data.messages,
          ].slice(-100),
        );
      } else {
        const now = new Date().toISOString();
        const next = [
          ...messages,
          { id, sender: "user", text, created_at: now },
          {
            id: `${id}-reply`,
            sender: "automatic",
            text: SUPPORT_REPLY,
            created_at: now,
          },
        ].slice(-60);
        setMessages(next);
        try {
          sessionStorage.setItem(storageKey, JSON.stringify(next));
        } catch {}
      }
      setDraft("");
      pendingId.current = null;
    } catch (err) {
      setError(err.message);
    } finally {
      busy.current = false;
      setSending(false);
      input.current?.focus();
    }
  }
  if (!open) return null;
  return (
    <section
      className="support-chat"
      role="dialog"
      aria-modal="false"
      aria-labelledby="support-chat-title"
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.stopPropagation();
          onClose();
        }
      }}
    >
      <header className="support-chat__header">
        <span className="support-chat__avatar">
          <Headphones size={23} />
        </span>
        <div>
          <h2 id="support-chat-title">Soporte HorseBet</h2>
          <span>Asistente automático</span>
        </div>
        <button
          type="button"
          className="support-chat__close"
          aria-label="Cerrar chat de soporte"
          onClick={onClose}
        >
          <X size={20} />
        </button>
      </header>
      <div className="support-chat__intro">
        <ShieldCheck size={15} />
        <span>Estamos aquí para ayudarte</span>
      </div>
      {!connected && (
        <p className="support-chat__local">
          Chat local. Los mensajes todavía no se envían a un agente.
        </p>
      )}
      <div
        ref={list}
        className="support-chat__messages"
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        aria-label="Conversación con soporte"
      >
        <article className="support-chat__message support-chat__message--automatic">
          <span>HorseBet · Respuesta automática</span>
          <p>{SUPPORT_GREETING}</p>
        </article>
        {messages.map((message) => (
          <article
            key={message.id}
            className={`support-chat__message support-chat__message--${message.sender}`}
          >
            <span>
              {message.sender === "user"
                ? "Tú"
                : message.sender === "agent"
                  ? "Soporte HorseBet"
                  : "HorseBet · Respuesta automática"}
            </span>
            <p>{message.text}</p>
            <time dateTime={message.created_at}>
              {new Date(message.created_at).toLocaleTimeString("es", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </time>
          </article>
        ))}
        {sending && (
          <p className="support-chat__sending" role="status">
            Enviando mensaje…
          </p>
        )}
      </div>
      {error && (
        <p className="support-chat__error" role="alert">
          {error}
        </p>
      )}
      <form className="support-chat__form" onSubmit={send}>
        <label className="support-chat__label" htmlFor="support-message">
          Tu mensaje para soporte
        </label>
        <textarea
          ref={input}
          id="support-message"
          rows={2}
          maxLength={2000}
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value);
            pendingId.current = null;
          }}
          placeholder="Escribe tu mensaje…"
          disabled={sending || !ready}
          onKeyDown={(event) => {
            if (
              event.key === "Enter" &&
              !event.shiftKey &&
              !event.nativeEvent.isComposing
            ) {
              event.preventDefault();
              event.currentTarget.form.requestSubmit();
            }
          }}
        />
        <button
          type="submit"
          aria-label="Enviar mensaje a soporte"
          disabled={!draft.trim() || sending || !ready}
        >
          <Send size={20} />
        </button>
        <small>No compartas contraseñas ni códigos de acceso.</small>
      </form>
    </section>
  );
}
