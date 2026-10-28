"use client";
import {
  ArrowRightToLine,
  Spade,
  Volleyball,
  Gift,
  Crown,
  CircleDollarSign,
  Target,
  Megaphone,
  Users,
  Box,
  ClipboardList,
  Headphones,
  Bitcoin,
  Trophy,
  MessageCircle,
  Menu,
  X,
  Search,
  Globe,
  ChevronDown,
} from "lucide-react";
import Brand from "./Brand";
import { ObjectArt } from "./Artwork";
import AccountNavbar from "./member/AccountNavbar";

const navigation = [
  ["Casino", Spade],
  ["Deportes", Volleyball],
  ["Misiones", Target],
  ["Bonos", Gift],
  ["Club VIP", Crown],
  ["Cripto y Gana", CircleDollarSign],
  ["Promociones", Megaphone],
  ["Referidos", Users],
  ["Cuenta", ClipboardList],
  ["Comunidad", Box],
  ["Ayuda", ClipboardList],
];
export function Header({ onNavigate, onAction, expanded, setExpanded, user }) {
  return (
    <header className="header">
      <div className="header__brand">
        <button
          className="header__menu"
          aria-label={expanded ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={expanded}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? <X size={21} /> : <ArrowRightToLine size={20} />}
        </button>
        <button
          className="header__home"
          aria-label="HorseBet: inicio"
          onClick={() => onNavigate("Inicio")}
        >
          <Brand />
        </button>
      </div>
      <nav className="header__links" aria-label="Navegación principal">
        <button onClick={() => onNavigate("Casino")}>Casino</button>
        <button onClick={() => onNavigate("Deportes")}>Deportes</button>
      </nav>
      <div className="header__actions">
        <button
          className="header__search"
          aria-label="Buscar juegos"
          onClick={() => onNavigate("Casino")}
        >
          <Search size={20} />
        </button>
        <button
          className="header__gift"
          aria-label="Ver promociones"
          onClick={() => onAction("Promociones")}
        >
          <ObjectArt kind="gift" />
        </button>
        {user ? (
          <AccountNavbar />
        ) : (
          <>
            <button
              className="button button--secondary header__login"
              onClick={() => onAction("login")}
            >
              Iniciar sesión
            </button>
            <button
              className="button button--primary"
              onClick={() => onAction("register")}
            >
              Regístrate
            </button>
          </>
        )}
        <button
          className="header__utility"
          aria-label="Torneos"
          onClick={() => onAction("Torneos")}
        >
          <Trophy size={21} />
        </button>
        <button
          className="header__utility"
          aria-label="Comunidad"
          onClick={() => onAction("Comunidad")}
        >
          <MessageCircle size={22} />
        </button>
      </div>
    </header>
  );
}
export function Sidebar({ expanded, current, onNavigate, onAction, onClose }) {
  return (
    <>
      <aside
        className={`sidebar ${expanded ? "sidebar--expanded" : ""}`}
        aria-label="Menú lateral"
      >
        <button
          className="sidebar__promo"
          onClick={() => onAction("Promociones")}
          aria-label="Promociones especiales"
        >
          <ObjectArt kind="gift" />
          <span>Bonos y regalos</span>
        </button>
        <div className="sidebar__nav">
          {navigation.map(([label, Icon]) => (
            <button
              key={label}
              className={`sidebar__item ${current === label ? "sidebar__item--active" : ""}`}
              title={label}
              aria-label={label}
              onClick={() => {
                ["Casino", "Deportes"].includes(label)
                  ? onNavigate(label)
                  : onAction(label);
                onClose();
              }}
            >
              <Icon size={21} />
              <span>{label}</span>
            </button>
          ))}
        </div>
        <div className="sidebar__bottom">
          <button
            className="sidebar__item"
            aria-label="Ayuda y soporte"
            onClick={() => onAction("Ayuda")}
          >
            <Headphones size={22} />
            <span>Soporte en vivo</span>
          </button>
          <button
            className="sidebar__item"
            aria-label="Cripto y Gana"
            onClick={() => onAction("Cripto y Gana")}
          >
            <Bitcoin size={21} />
            <span>Cripto y Gana</span>
          </button>
          <button
            className="sidebar__item"
            aria-label="Idioma: Español"
            onClick={() => onAction("language")}
          >
            <Globe size={20} />
            <span>
              Español <ChevronDown size={14} />
            </span>
          </button>
        </div>
      </aside>
      {expanded && (
        <button
          className="sidebar__scrim"
          aria-label="Cerrar menú lateral"
          onClick={onClose}
        />
      )}
    </>
  );
}
export function Footer({ onAction, sports = false }) {
  return (
    <footer className="footer">
      <div className="footer__top">
        <Brand />
        <span>Tu universo de entretenimiento.</span>
        <button
          className="footer__language"
          onClick={() => onAction("language")}
        >
          <Globe size={17} /> Español <ChevronDown size={15} />
        </button>
      </div>
      <div className="footer__columns">
        {[
          ["Casino", "Slots", "Internos", "Deportes"],
          ["Misiones", "Bonos", "Club VIP", "Promociones", "Cripto y Gana"],
          ["Referidos", "Ayuda", "Comunidad", "Afiliados", "Juego responsable"],
        ].map((column, i) => (
          <div key={i}>
            {column.map((label) => (
              <button key={label} onClick={() => onAction(label)}>
                {label}
              </button>
            ))}
          </div>
        ))}
        <div className="footer__socials">
          <strong>Únete a la comunidad</strong>
          <div>
            <button
              aria-label="Comunidad Telegram"
              onClick={() => onAction("Comunidad")}
            >
              ➤
            </button>
            <button
              aria-label="Comunidad X"
              onClick={() => onAction("Comunidad")}
            >
              𝕏
            </button>
            <button
              aria-label="Comunidad Discord"
              onClick={() => onAction("Comunidad")}
            >
              ◉
            </button>
          </div>
        </div>
      </div>
      <div className="footer__currencies">
        <span>₿</span>
        <span>Ξ</span>
        <span>₮</span>
        <span>◈</span>
        <span>Ł</span>
        <span>◎</span>
        <span>Ð</span>
        <span>VISA</span>
        <span>Mastercard</span>
      </div>
      <div className="footer__legal">
        <span className="footer__age">18+</span>
        <p>
          {sports ? (
            "HorseBet. Solo para mayores de 18 años. Juega con responsabilidad."
          ) : (
            <>
              HorseBet incluye ilustraciones originales creadas con
              IA y recursos con licencia de reutilización. Esta versión no
              permite apuestas, depósitos ni pagos reales. Los importes y
              eventos son ilustrativos.
            </>
          )}
        </p>
      </div>
      <div className="footer__copyright">
        <span>© 2026 · HorseBet</span>
        <button onClick={() => onAction("Juego responsable")}>
          Juega responsablemente
        </button>
      </div>
    </footer>
  );
}
export function MobileNav({ current, onNavigate, onAction, onMenu }) {
  return (
    <nav className="mobile-nav" aria-label="Navegación móvil">
      <button onClick={onMenu}>
        <Menu size={21} />
        Menú
      </button>
      <button
        className={current === "Casino" ? "mobile-nav__active" : ""}
        onClick={() => onNavigate("Casino")}
      >
        <Spade size={21} />
        Casino
      </button>
      <button className="mobile-nav__gift" onClick={() => onAction("Bonos")}>
        <Gift size={24} />
        Bonos
      </button>
      <button
        className={current === "Deportes" ? "mobile-nav__active" : ""}
        onClick={() => onNavigate("Deportes")}
      >
        <Volleyball size={21} />
        Deportes
      </button>
      <button onClick={() => onAction("Ayuda")}>
        <Headphones size={21} />
        Ayuda
      </button>
    </nav>
  );
}
