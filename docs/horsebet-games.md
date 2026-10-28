# Juegos HorseBet

21 juegos demo: 17 slots y cuatro Originals. Todos los slots de la portada y del casino abren su ruta jugable; ninguno usa el antiguo modal de tres signos de interrogación. Los títulos de proveedores comerciales se reemplazaron por variantes HorseBet. Las mesas y el casino en vivo del catálogo de referencia siguen siendo vistas previas, no servicios de crupieres conectados.

## Catálogo de slots

Todas estas rutas empiezan por `/es/casino/`; también funcionan sin `/es`.

| Ruta | Nombre | Mecánica |
| --- | --- | --- |
| dragons-hoard/ | Dragon’s Hoard | 243 combinaciones, 8 giros gratis reactivables |
| canal-royale/ | Canal Royale | 25 líneas, 10 giros gratis ×2 |
| horse-fortune/ | Horse Fortune | Tres rodillos y ruleta de bonus |
| neon-gems/ | Neon Gems | 243 combinaciones y giros gratis |
| ruby-rush/ | Ruby Rush | Hold & Spin, gemas bloqueadas, multiplicadores |
| aztec/ | Aztec Gold | Cascadas de 20 símbolos y escalera hasta ×8 |
| diamond/ | Diamond Trails | 243 combinaciones y giros gratis |
| sugar/ | Candy Meadows | Cascadas |
| pepper/ | Pepper Blaze | Ruleta de bonus |
| olympus/ | Olympian Crown | 25 líneas y giros gratis ×2 |
| sugar1000/ | Candy Galaxy | Cascadas |
| horse-sugar/ | Sweet Stallion | 25 líneas y giros gratis ×2 |
| horse-merge/ | Lucky Herd | Hold & Spin |
| bass/ | Golden Catch | 243 combinaciones y giros gratis |
| joker/ | Jester Jewels | Ruleta de bonus |
| fruit/ | Orchard Fiesta | Cascadas |
| vampy/ | Midnight Velvet | Hold & Spin |

Son 17 variantes sobre cinco juegos/mecánicas, no 17 motores independientes ni copias de los juegos comerciales cuyos nombres aparecían antes. Las reglas, símbolos, tabla y premios se corresponden con la mecánica de cada tarjeta. `data/bonus-slots.js` es el catálogo común; `BonusSlotGame.jsx` presenta el juego. Next.js, JSX y CSS BEM, sin TypeScript ni Tailwind en la aplicación.

## Código y gráficos reutilizados con licencia gratuita

1. **Metaincognita Slots**, Chris Schweda: https://github.com/cschweda/metaincognita-slots
   - Revisión: `c09d03ac9ae028e1e0943c9935480dde3b6ed443`.
   - MIT, © 2026 Chris Schweda. Aviso íntegro: `public/licenses/metaincognita-slots.txt`.
   - Reutilizamos los motores video, cascade y wheel, evaluación de premios, progresivos locales, cinco definiciones de máquinas y el registro de símbolos SVG originales.
   - El código original se convirtió a JavaScript; los imports se ajustaron. No instalamos Nuxt, Vue ni Tailwind. La interfaz se adaptó a React/JSX y BEM. El importador está en `scripts/import-open-slots.mjs`; espera el checkout revisado dentro de `outputs/metaincognita-source`.
   - No se copiaron manuales históricos ni recursos de terceros excluidos por el autor. Los gráficos combinan constantes SVG locales del registro MIT e ilustraciones originales de HorseBet. No se carga código remoto al jugar.
2. **html5-slot-machine**, Johannes Kronmüller: https://github.com/johakr/html5-slot-machine
   - Revisión: `347fc31ddd227674d8dc93e238d6664784e1872d`.
   - MIT, © 2017 Johannes Kronmüller. Aviso íntegro: `public/licenses/html5-slot-machine.txt`.
   - Controlador de rodillos adaptado en `lib/games/vendor/Reel.js`, con cancelación, animación adaptable y movimiento reducido.

MIT permite uso, modificación y distribución, incluso comercial, sin pagar regalías por este código, conservando los avisos. Estos permisos sobre software no equivalen a autorización para operar apuestas con dinero real. No se integraron plantillas comerciales sin licencia.

Las 17 portadas y escenarios originales están en `public/images/slots/`, junto con un atlas transparente de 16 símbolos. Sus prompts y el proceso de generación están en `docs/slot-world-art.md`. El atlas anterior de HorseBet sigue en `public/images/slot-symbols.png` (prompt en `docs/slot-image-prompts.md`). `lib/games/symbol-art.js` combina ambos atlas con los símbolos restantes del registro SVG MIT. Las sustituciones son visuales y no alteran los premios.

Cada escenario incorpora capas animadas según su ambiente: brasas, hojas, nieve, lluvia, burbujas, dulces, reflejos o confeti. Los marcos también cambian de estructura y materiales según la temática. Se pueden pausar los ambientes; respetan movimiento reducido y se suspenden fuera de pantalla. Los premios destacan sus símbolos y muestran un contador animado; los bonus tienen una presentación propia por tema. No se utilizan slots de proveedores que exijan credenciales comerciales.

## Fichas, bonus y animaciones

- Saldo inicial: 10.000 fichas. Apuestas de 1 a 1.000, con centésimas. `useDemoWallet` usa `sessionStorage` por pestaña, independiente de Supabase y de saldos reales.
- Una apuesta reserva una sola ronda. Giros gratis, nuevas tiradas y ruleta no vuelven a debitar. El acumulado se liquida una vez al terminar toda la ronda; se redondea hacia abajo a centésimas.
- Salir o recargar durante una ronda incompleta devuelve la apuesta y descarta todos los resultados parciales de esa ronda demo. No se guardan bonus pendientes para continuar después.
- La vista previa de bonus es explícita: nunca altera saldo ni historial. En cascadas muestra un tablero inicial preparado; los giros ordinarios usan `crypto.getRandomValues`, sin forzar premios.
- Cascadas: desaparecen símbolos premiados y caen otros; la escalera sube hasta ×8. Hold & Spin: las gemas quedan fijas y cada nueva gema reinicia las tiradas. Ruleta: el sector animado coincide con el sector sorteado; los pesos desiguales se muestran en la tabla.
- Los progresivos son locales al componente durante esa visita; no son jackpots compartidos ni persistentes entre rutas. El valor en fichas cambia con la unidad de apuesta. No se anuncia un RTP certificado para esta adaptación.
- El carrusel contiene 200 identidades ficticias diferentes con nombre, avatar y juego fijo. Se etiqueta actividad simulada y nunca escribe en auth, KYC, historial real ni libro de saldos.

## Originals y validación

Dice, Mines, Plinko y Coin Flip mantienen sus rutas `/es/casino/dice/`, `/mines/`, `/plinko/` y `/coin/`. Plinko usa un reloj por lanzamiento y liquida al finalizar la caída.

`npm test` comprueba aislamiento de datos, saldos, reglas de los Originals, catálogo sin tarjetas de slots huérfanas, símbolos disponibles, activación/reactivación de giros gratis, premios ×2, cascadas acotadas, ruleta y Hold & Spin sin doble cobro, e identidades del carrusel. Verificar en navegador una ronda y una vista previa de cada familia, junto con catálogo y móvil; compilar con `npm run build`.

Para dinero real sería necesaria una integración distinta de resultados y liquidación en servidor, proveedores y controles operativos. Los resultados del navegador no deben conectarse directamente al libro de saldos.
