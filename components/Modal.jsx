"use client";
import { useEffect, useRef, useState } from "react";
import { X, CheckCircle2, Play, RotateCcw, ShieldCheck } from "lucide-react";
import Brand from "./Brand";
import { GameArt } from "./Artwork";
import { information } from "../data/content";

export default function Modal({ modal, onClose, onAuth, user, onLogout }) {
  const dialog = useRef(null);
  const [alias, setAlias] = useState("");
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    const element = dialog.current;
    const previous = document.activeElement;
    element.showModal();
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = oldOverflow;
      previous?.focus();
    };
  }, []);
  const isAuth = ["login", "register"].includes(modal.type);
  const content = information[modal.type];
  return (
    <dialog
      className={`modal ${modal.game ? "modal--game" : ""}`}
      ref={dialog}
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === dialog.current) {
          const box = dialog.current.getBoundingClientRect();
          if (
            event.clientX < box.left ||
            event.clientX > box.right ||
            event.clientY < box.top ||
            event.clientY > box.bottom
          )
            onClose();
        }
      }}
      aria-labelledby="modal-title"
    >
      <button
        className="modal__close"
        onClick={onClose}
        aria-label="Cerrar ventana"
      >
        <X size={21} />
      </button>
      {isAuth ? (
        <>
          <Brand />
          <div className="modal__label">EXPERIENCIA DE DEMOSTRACIÓN</div>
          <h2 id="modal-title">
            {modal.type === "register"
              ? "Tu aventura empieza aquí"
              : "¡Bienvenido de nuevo!"}
          </h2>
          <p>
            Explora la experiencia con un perfil local. No necesitas correo,
            contraseña ni una cuenta real.
          </p>
          <form
            className="auth-form"
            onSubmit={(event) => {
              event.preventDefault();
              onAuth(alias.trim());
            }}
          >
            <label htmlFor="alias">Tu alias</label>
            <input
              autoComplete="off"
              id="alias"
              placeholder="¿Cómo te llamas?"
              value={alias}
              onChange={(event) => setAlias(event.target.value)}
              minLength={2}
              maxLength={24}
              required
            />
            <label className="auth-form__check">
              <input type="checkbox" required />
              Soy mayor de 18 años y entiendo que es una demo.
            </label>
            <button className="button button--primary" type="submit">
              {modal.type === "register"
                ? "Crear perfil de demo"
                : "Entrar en la demo"}
            </button>
          </form>
          <span className="modal__note">
            <ShieldCheck size={15} />
            Tu alias se guarda solo en este navegador.
          </span>
        </>
      ) : modal.game ? (
        <>
          <div className="modal__game-art">
            <GameArt game={modal.game} />
          </div>
          <div className="modal__game-body">
            <div className="modal__label">
              {modal.game.provider} · VISTA PREVIA
            </div>
            <h2 id="modal-title">{modal.game.title}</h2>
            <p>
              Descubre el diseño del juego en modo demostración. Sin saldo,
              premios ni apuestas reales.
            </p>
            <div
              className={`demo-reels ${revealed ? "demo-reels--revealed" : ""}`}
              aria-live="polite"
            >
              {revealed ? (
                <>
                  <span>◆</span>
                  <span>◆</span>
                  <span>◆</span>
                </>
              ) : (
                <>
                  <span>?</span>
                  <span>?</span>
                  <span>?</span>
                </>
              )}
            </div>
            <button
              className="button button--primary"
              onClick={() => setRevealed(!revealed)}
            >
              {revealed ? <RotateCcw size={17} /> : <Play size={17} />}{" "}
              {revealed ? "Reiniciar vista previa" : "Ver animación demo"}
            </button>
          </div>
        </>
      ) : modal.type === "profile" ? (
        <>
          <CheckCircle2 className="modal__success" size={40} />
          <h2 id="modal-title">Hola, {user}</h2>
          <p>
            Tu perfil de demostración está activo en este navegador. Puedes
            guardar tus juegos favoritos y explorar el catálogo.
          </p>
          <button className="button button--secondary" onClick={onLogout}>
            Cerrar sesión de demo
          </button>
        </>
      ) : modal.type === "language" ? (
        <>
          <h2 id="modal-title">Idioma</h2>
          <p>Esta recreación está disponible en español.</p>
          <button className="language-option" onClick={onClose}>
            <span>🇪🇸 Español</span>
            <CheckCircle2 size={19} />
          </button>
        </>
      ) : (
        <>
          <div className="modal__label">HORSEBET · DEMO</div>
          <h2 id="modal-title">{modal.type}</h2>
          {(content || ["Explora esta experiencia de demostración."]).map(
            (paragraph, i) =>
              i === 0 ? (
                <h3 key={paragraph}>{paragraph}</h3>
              ) : (
                <p key={paragraph}>{paragraph}</p>
              ),
          )}
          <button className="button button--primary" onClick={onClose}>
            Entendido
          </button>
        </>
      )}
    </dialog>
  );
}
