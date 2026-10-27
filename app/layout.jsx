import "./globals.css";

export const metadata = {
  title: "BetFury — Casino & Deportes | Demo de diseño",
  description:
    "Recreación visual de BetFury con ilustraciones originales. Demostración de interfaz sin apuestas reales.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
