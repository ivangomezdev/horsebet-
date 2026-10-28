import { Check } from "lucide-react";
import { FeatureDialog } from "./Shared";
import VipIcon from "./VipIcon";

export default function VipBenefitDialog({ benefit, onClose }) {
  return (
    <FeatureDialog
      title={benefit.title}
      onClose={onClose}
      className="vip-benefit-dialog"
    >
      <div className="vip-benefit-dialog__visual">
        <VipIcon index={benefit.art} className="vip-benefit-dialog__icon" />
        <span className="vip-benefit-dialog__level">
          {benefit.rank >= 15 ? "SÚPER VIP" : "CLUB VIP"} · RANK {benefit.rank}+
        </span>
      </div>
      <p className="vip-benefit-dialog__intro">{benefit.description}</p>
      <ul className="vip-benefit-dialog__details">
        {benefit.details.map((detail) => (
          <li key={detail}>
            <Check size={17} aria-hidden="true" />
            <span>{detail}</span>
          </li>
        ))}
      </ul>
      <div className="vip-benefit-dialog__access">
        <h3>Cómo acceder</h3>
        <p>{benefit.access}</p>
      </div>
      <p className="vip-benefit-dialog__note">
        Vista previa del club. Las recompensas de esta demo no se acreditan como
        saldo real.
      </p>
      <button
        className="button button--primary vip-benefit-dialog__button"
        onClick={onClose}
      >
        Entendido
      </button>
    </FeatureDialog>
  );
}
