"use client";
import { useEffect, useRef, useState } from "react";
import { X, CheckCircle2, Play, RotateCcw, ShieldCheck } from "lucide-react";
import Brand from "./Brand";
import { GameArt } from "./Artwork";
import { information } from "../data/content";

export default function Modal({ modal, onClose }) {
  const dialog = useRef(null);
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
      {modal.game ? (
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
