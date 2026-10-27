# BetFury · recreación de interfaz

Proyecto Next.js con App Router, React y **JSX**, CSS convencional con metodología **BEM**, sin TypeScript y sin Tailwind. Inspirado en la página española de BetFury, con paleta oscura, acentos rojos y recursos gráficos originales generados con ImageGen.

## Desarrollo

Requiere Node.js 20.9 o posterior.

```bash
npm ci
npm run dev
```

Abre http://127.0.0.1:3000/es/. La misma página está disponible en `/`.

## Producción

```bash
npm run build
npm start
```

El build genera una exportación estática en `out/`. Puede alojarse en cualquier servidor estático. `npm start` sirve esa exportación en el puerto 3000; detén antes el servidor de desarrollo si ocupa el puerto.

## Organización

- `app/`: rutas, metadatos y estilos BEM. Los colores, dimensiones y espaciados base están centralizados en variables CSS.
- `components/`: estructura del sitio, carrusel, tarjetas reutilizables, catálogo, deportes y ventanas accesibles con `dialog` nativo.
- `data/content.js`: juegos, promociones y contenido editable, separado de la presentación.
- `public/images/`: ilustraciones originales. `games.png` y `objects.png` son atlas reutilizados mediante posiciones CSS.
- `docs/image-prompts.md`: prompts exactos utilizados con la herramienta integrada ImageGen.

## Funcionalidad

- Carrusel con navegación manual y rotación automática, pausado al interactuar y compatible con movimiento reducido.
- Catálogo con búsqueda, categorías, estado vacío y favoritos persistidos en el navegador.
- Vistas de inicio, casino y deportes con navegación por hash y soporte del historial del navegador.
- Navegación lateral desplegable y barra inferior en móvil.
- Perfil local mediante alias; no solicita contraseñas ni se conecta a cuentas reales.
- Ventanas de juegos con una animación de demostración y paneles de promociones, VIP, ayuda y cripto.
- Diseño adaptable a móvil, tablet y escritorio; foco visible y etiquetas accesibles.

## Alcance

Esta es una recreación visual independiente. No se conecta a BetFury, no contiene un motor de apuestas ni procesadores de pago, y no permite depósitos ni transacciones. Los importes, promociones y eventos son contenido ilustrativo. El logotipo se representa mediante texto y una marca vectorial original. Las fuentes Inter y Barlow Condensed se cargan desde Google Fonts con fuentes de sistema como alternativa.

## Verificación

- Compilación de producción y exportación estática de `/` y `/es/`.
- Revisión visual en navegador de escritorio y viewport de 390 px dentro de un iframe de prueba temporal.
- Comprobación de búsqueda, favoritos, filtros, navegación, vista previa del juego y categorías deportivas.

Ejecuta `npm run format` para mantener el formato del código.
