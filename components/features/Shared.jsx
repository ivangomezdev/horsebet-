"use client";
import { useEffect, useId, useRef } from "react";
import { ChevronDown, ChevronRight, X } from "lucide-react";

export function RewardArt({ index = 0, className = "" }) {
  return (
    <span
      className={`reward-art reward-art--${index} ${className}`}
      aria-hidden="true"
    />
  );
}
export function FeatureHero({
  type,
  children,
  description,
  button = "Regístrate y Únete",
  onAction,
  extra,
}) {
  return (
    <section className={`feature-hero feature-hero--${type}`}>
      <div className="feature-hero__art" aria-hidden="true" />
      <div className="feature-hero__body">
        <h1>{children}</h1>
        <p>{description}</p>
        {extra}
        <button className="button button--primary" onClick={onAction}>
          {button}
        </button>
      </div>
    </section>
  );
}
export function FAQ({ items }) {
  return (
    <section className="feature-faq">
      <h2>FAQ</h2>
      {items.map(([question, answer]) => (
        <details className="feature-faq__item" key={question}>
          <summary>
            {question}
            <ChevronDown size={18} />
          </summary>
          <p>{answer}</p>
        </details>
      ))}
    </section>
  );
}
export function Breadcrumb({ name, onHome }) {
  return (
    <nav className="feature-breadcrumb" aria-label="Ruta de navegación">
      <button onClick={onHome}>HorseBet</button>
      <ChevronRight size={14} />
      <span>{name}</span>
    </nav>
  );
}
export function FeatureDialog({ title, children, onClose, className = "" }) {
  const ref = useRef(null);
  const id = useId();
  useEffect(() => {
    const focused = document.activeElement;
    const overflow = document.body.style.overflow;
    ref.current.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
      focused?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={`feature-dialog ${className}`}
      aria-labelledby={id}
      onCancel={onClose}
      onClick={(event) => {
        if (event.target !== ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        if (
          event.clientX < rect.left ||
          event.clientX > rect.right ||
          event.clientY < rect.top ||
          event.clientY > rect.bottom
        )
          onClose();
      }}
    >
      <button
        className="feature-dialog__close"
        aria-label="Cerrar detalle"
        onClick={onClose}
      >
        <X size={20} />
      </button>
      <div className="feature-dialog__eyebrow">HORSEBET</div>
      <h2 id={id}>{title}</h2>
      {children}
    </dialog>
  );
}
export function BenefitsGrid({ items, onSelect, Art = RewardArt }) {
  return (
    <div className="benefit-cards">
      {items.map((item) => (
        <article className="benefit-card" key={item.title}>
          <Art index={item.art} />
          {item.tag && <span className="benefit-card__tag">{item.tag}</span>}
          <h3>{item.title}</h3>
          <p>{item.description}</p>
          {onSelect && (
            <button className="text-button" onClick={() => onSelect(item)}>
              Ver detalles <ChevronRight size={15} />
            </button>
          )}
        </article>
      ))}
    </div>
  );
}
