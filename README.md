# HorseBet

Next.js App Router + React JSX, CSS BEM, sin TypeScript ni Tailwind. Paleta oscura y roja, mascota equina y arte original. Autenticación y persistencia preparadas con Supabase; despliegue previsto en Vercel.

## Desarrollo

Node.js 22 o posterior:

```bash
npm ci
npm run setup:local
npm run dev
```

Abre http://127.0.0.1:3000/es/. La interfaz funciona sin credenciales; los formularios de acceso quedan desactivados hasta conectar Supabase. Sigue [la configuración de Supabase, Google y Vercel](docs/auth-and-vercel.md) para activar usuarios, correo y almacenamiento. No compartas `.env.local`.

## Rutas

Inicio `/es/`, casino `/es/casino/`, misiones `/es/missions/`, bonos `/es/bonus-cabinet/`, VIP `/es/vip-club/`, promociones `/es/promo/`, referidos `/es/about-referral-system/` y cripto `/es/crypto-and-earn/`.

Cuenta: `/es/account/`, `/es/transactions/`, `/es/game-history/`, `/es/sessions/` y `/es/kyc/`. Las secciones también admiten rutas sin `/es`. Deportes mantiene su vista por hash.

## Producción y pruebas

```bash
npm run check:config
npm test
npm run build
npm start
```

Esta versión usa el servidor de Next.js, no una exportación estática. En Vercel selecciona Next.js y conserva la salida por defecto. Las migraciones están en `supabase/migrations/`; las pruebas usan PostgreSQL embebido para comprobar aislamiento, permisos, contabilidad, cifrado, persistencia y revocación de sesiones.

## Organización

- `components/auth/`, `lib/auth/`, `app/api/auth/`: formularios y autenticación de servidor.
- `components/account/`, `lib/account/`, `app/api/account/`: perfil, historiales, sesiones y KYC privado.
- `components/features/`: secciones promocionales y componentes compartidos.
- `data/`: catálogos y contenido; `recent-wins.js` contiene 200 resultados ficticios exclusivamente visuales.
- `app/*.css`: estilos BEM adaptables.
- `public/images/`: arte original; `public/flags/`: banderas SVG con licencia.
- `docs/`: configuración y prompts originales de imágenes.

## Alcance

Hay 21 juegos con fichas demo: Dice, Mines, Plinko, Coin Flip y 17 slots jugables sobre cinco mecánicas MIT: líneas, combinaciones, cascadas, Hold & Spin y ruleta de bonus. Sus reglas y gráficos reutilizados permiten modificaciones bajo licencia MIT. Consulta [reglas, procedencia y funcionamiento](docs/horsebet-games.md). Se abren desde el catálogo y usan fichas separadas de los saldos de cuenta.

El carrusel de ganancias se reproduce indefinidamente, permite pausar y respeta movimiento reducido. Está identificado como actividad simulada. Perfiles, documentos, saldos e historiales usan la base de datos y no reciben esos resultados ficticios.

Pendientes externos: crear/configurar Supabase, Google y SMTP; conectar proveedores de pagos, juegos, SMS y revisión KYC para operar esos servicios. No hay motor de apuestas, depósitos ni retiros reales. Promociones y calculadoras continúan siendo ilustrativas. El sitio no se conecta a cuentas de BetFury.
