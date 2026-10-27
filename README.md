# HorseBet · Casino y Deportes

Proyecto Next.js con App Router, React y **JSX**, CSS convencional con metodología **BEM**, sin TypeScript y sin Tailwind. Inspirado en la página española de BetFury, con paleta oscura, acentos rojos y recursos gráficos originales generados con ImageGen.

## Desarrollo

Requiere Node.js 20.9 o posterior.

```bash
npm ci
npm run dev
```

Abre http://127.0.0.1:3000/es/. La misma página está disponible en `/`.

## Páginas

| Sección | Ruta |
| --- | --- |
| Inicio | `/es/` |
| Casino | `/es/casino/` |
| Misiones | `/es/missions/` |
| Gabinete de bonos | `/es/bonus-cabinet/` |
| Club VIP | `/es/vip-club/` |
| Promociones | `/es/promo/` |
| Referidos | `/es/about-referral-system/` |
| Cripto y Gana | `/es/crypto-and-earn/` |

Las siete secciones también admiten acceso sin el prefijo `/es`. Cada página se exporta como HTML estático y admite recarga directa.

## Producción

```bash
npm run build
npm start
```

El build genera una exportación estática en `out/`. Puede alojarse en cualquier servidor estático. `npm start` sirve esa exportación en el puerto 3000; detén antes el servidor de desarrollo si ocupa el puerto.

## Organización

- `app/`: rutas, metadatos y estilos BEM. Los colores, dimensiones y espaciados base están centralizados en variables CSS.
- `components/`: estructura del sitio, carrusel, tarjetas reutilizables, catálogo, deportes y ventanas accesibles con `dialog` nativo.
- `components/features/`: seis páginas, con banners, recompensas, preguntas frecuentes y diálogos compartidos en `Shared.jsx`.
- `data/`: catálogo, misiones, promociones, beneficios y contenido editable separado de la presentación.
- `public/images/`: ilustraciones originales; atlas reutilizables para juegos, promociones, banners y recompensas.
- `docs/*image-prompts.md`: prompts exactos utilizados con la herramienta integrada ImageGen.

## Funcionalidad

- Carrusel con navegación manual y rotación automática, pausado al interactuar y compatible con movimiento reducido.
- Catálogo con búsqueda, categorías, estado vacío y favoritos persistidos en el navegador.
- Rutas de inicio, casino y seis secciones con Next.js App Router; deportes mantiene su vista por hash.
- Navegación lateral desplegable y barra inferior en móvil.
- Perfil local mediante alias; no solicita contraseñas ni se conecta a cuentas reales.
- Casino con categorías, búsqueda, filtros por proveedor, ordenación, favoritos, juego aleatorio, carruseles y vistas previas.
- Misiones con filtros, detalle, activación/cancelación y persistencia local.
- Bonos con selección de paquetes y detalles de recompensas.
- VIP con pestañas, selector de nivel, comparación de ranks y preguntas frecuentes.
- Promociones con categorías, estado, paginación y código de prueba `HORSEBET`.
- Referidos con enlace copiable y calculadora de reparto ilustrativa.
- Cripto con calculadoras de ejemplo, carruseles y vistas previas de NFT.
- Diseño adaptable a móvil, tablet y escritorio; foco visible y etiquetas accesibles.

## Alcance

Esta es una recreación visual independiente. No se conecta a BetFury, no contiene un motor de apuestas ni procesadores de pago, y no permite depósitos ni transacciones. Los importes, promociones y eventos son contenido ilustrativo. El logotipo combina el nombre HorseBet con una cabeza de caballo vectorial original. El banner utiliza una mascota equina 3D generada con ImageGen. Las fuentes Inter y Barlow Condensed se cargan desde Google Fonts con fuentes de sistema como alternativa.

## Verificación

- Compilación de producción y exportación estática de todas las rutas.
- Revisión visual en navegador de escritorio y móvil.
- Comprobación de búsqueda, favoritos, filtros, navegación, vista previa del juego y categorías deportivas.
- Verificación de activación/cancelación de misiones, filtros de promociones, código demo, selector VIP, enlace de referido y calculadoras cripto.

Ejecuta `npm run format` para mantener el formato del código.
