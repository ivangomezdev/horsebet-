import "./globals.css";
import "./casino.css";
import "./carousel.css";
import "./sports.css";
import "./features.css";
import "./auth.css";
import "./account.css";
import "./games.css";
import "./slots.css";
import "./bonus-slots.css";
import "./slot-worlds.css";
import "./slot-console.css";
import "./support-chat.css";
import "./member.css";
import { MemberProvider } from "../components/member/MemberProvider";
import { AuthProvider } from "../components/auth/AuthProvider";

export const metadata = {
  title: "HorseBet — Casino & Deportes | Demo de diseño",
  description:
    "Recreación visual de HorseBet con ilustraciones originales. Demostración de interfaz sin apuestas reales.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          <MemberProvider>{children}</MemberProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
