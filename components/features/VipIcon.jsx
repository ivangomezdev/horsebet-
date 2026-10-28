import {
  Crown,
  RotateCw,
  Coins,
  Ticket,
  Medal,
  Gift,
  Headphones,
  ShieldCheck,
  Users,
} from "lucide-react";
const icons = [
  Crown,
  RotateCw,
  Coins,
  Ticket,
  Medal,
  Gift,
  Headphones,
  ShieldCheck,
  Users,
];
export default function VipIcon({ index = 0, className = "" }) {
  const Icon = icons[index] || Crown;
  return (
    <span
      className={`vip-icon vip-icon--${index} ${className}`}
      aria-hidden="true"
    >
      <Icon size={32} strokeWidth={1.6} />
    </span>
  );
}
