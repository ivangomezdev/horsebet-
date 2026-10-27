import "./globals.css";
import "./casino.css";
import "./features.css";

export const metadata = {
  title: "HorseBet — Casino & Deportes | Demo de diseño",
  description:
    "Recreación visual de HorseBet con ilustraciones originales. Demostración de interfaz sin apuestas reales.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
