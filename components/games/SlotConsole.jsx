import {
  RotateCw,
  RotateCcw,
  Settings2,
  Pause,
  Play,
  Gift,
  List,
} from "lucide-react";
import { formatCredits } from "../../lib/games/engine";
import { BetControl } from "./Shared";

export default function SlotConsole({
  wallet,
  stake,
  onStake,
  spinning,
  roundActive,
  preview,
  total,
  buttonText,
  onPlay,
  onPreview,
  table,
  onTable,
  motionPaused,
  onMotion,
  error,
  variant = "panoramic",
}) {
  const locked = spinning || roundActive || Boolean(wallet.pending);
  return (
    <div
      className={`slot-console slot-console--${variant}`}
      aria-label="Controles del slot"
    >
      <div className="slot-console__main">
        <div className="slot-console__balance">
          <span>SALDO EN FICHAS</span>
          <strong>{wallet.ready ? formatCredits(wallet.balance) : "—"}</strong>
          <small>FICHAS</small>
        </div>
        <div className="slot-console__bet">
          <BetControl
            value={stake}
            onChange={onStake}
            balance={wallet.balance}
            disabled={!wallet.ready || locked}
          />
        </div>
        <button
          className="slot-console__spin"
          onClick={onPlay}
          disabled={!wallet.ready || spinning}
          aria-label={buttonText}
        >
          <RotateCw
            size={34}
            className={spinning ? "slot-spinning-icon" : ""}
            aria-hidden="true"
          />
          <span>{buttonText}</span>
        </button>
        <div className="slot-console__return" aria-live="polite">
          <span>
            {preview ? "RETORNO DE VISTA PREVIA" : "RETORNO DE LA RONDA"}
          </span>
          <strong>{formatCredits(total)}</strong>
          <small>{preview ? "SIN MODIFICAR TU SALDO" : "FICHAS VIRTUALES"}</small>
        </div>
      </div>
      {error && (
        <p className="game-error" role="alert">
          {error}
        </p>
      )}
      <details className="slot-console__settings">
        <summary>
          <Settings2 size={15} /> Opciones del juego{" "}
          <span>{preview ? "VISTA PREVIA" : "FICHAS VIRTUALES"}</span>
        </summary>
        <div className="slot-console__tools">
          <button onClick={onTable} aria-expanded={table}>
            <List size={16} />
            Tabla de premios
          </button>
          <button onClick={onPreview} disabled={locked}>
            <Gift size={16} />
            Vista previa del bonus
          </button>
          <button onClick={onMotion} aria-pressed={motionPaused}>
            {motionPaused ? <Play size={16} /> : <Pause size={16} />}
            {motionPaused ? "Activar ambiente" : "Pausar ambiente"}
          </button>
          <button
            onClick={wallet.reset}
            disabled={!wallet.ready || locked}
            aria-label="Reponer 10,000 fichas virtuales"
          >
            <RotateCcw size={16} />
            Reponer fichas virtuales
          </button>
        </div>
        <p>
          Las fichas no tienen valor monetario. Los bonus se completan antes de
          liquidar la ronda. La vista previa no modifica el saldo ni el
          historial.
        </p>
      </details>
    </div>
  );
}
