# HorseBet: Supabase, Google y Vercel

El código está preparado, pero todavía no está conectado a Supabase ni a Google. Sin configuración, se puede revisar el diseño y los formularios de acceso quedan desactivados. No se ha desplegado esta versión.

## 1. Variables locales

Usa Node.js 22 o posterior. Ejecuta `npm ci` y `npm run setup:local`. El segundo comando crea `.env.local`, genera dos secretos sin mostrarlos y nunca sobrescribe un archivo existente. Está excluido de Git. Completa las variables en tu editor; no compartas sus valores.

| Variable | Valor |
| --- | --- |
| `APP_URL` | `http://127.0.0.1:3000` en local; origen HTTPS del sitio en Vercel, sin rutas. |
| `SUPABASE_URL` | URL del proyecto Supabase. |
| `SUPABASE_PUBLISHABLE_KEY` | Publishable key del proyecto, o anon key heredada. |
| `SUPABASE_SECRET_KEY` | Secret key del servidor, o service_role heredada. Nunca usar `NEXT_PUBLIC_`. |
| `AUTH_RATE_LIMIT_SECRET` | Secreto generado por el script para proteger los identificadores de los límites de acceso. |
| `KYC_ENCRYPTION_KEY` | Clave generada de 32 bytes en base64; cifra los campos personales de KYC. |
| `AUTH_GOOGLE_ENABLED` | `false` inicialmente; `true` tras configurar Google. |
| `DEV_COUNTRY` | Opcional: código como `MX`, solo en desarrollo. |

Conserva una copia segura de la clave KYC junto con las copias de seguridad: perderla impide leer los datos cifrados. No la cambies sobre una base existente sin migrar los datos. Usa proyectos y secretos diferentes para pruebas y producción.

## 2. Base de datos

Crea un proyecto Supabase. En SQL Editor ejecuta **una vez, en este orden**, los archivos completos:

1. `supabase/migrations/202610270001_accounts.sql`
2. `supabase/migrations/202610270002_account_center.sql`
3. `supabase/migrations/202610270003_support_chat.sql`
4. `supabase/migrations/202610270004_member_navigation.sql`

Son migraciones para un proyecto nuevo. Cada archivo usa una transacción; no son scripts para volver a ejecutar sobre tablas existentes. No publiques el esquema `private` en Data API. Las migraciones crean el bucket privado `account-documents`; no lo hagas público ni añadas políticas anónimas.

Crean perfiles, monederos, contabilidad de doble entrada, movimientos, partidas, sesiones, preferencias, expedientes KYC cifrados y metadatos de documentos. Cada usuario nuevo recibe un saldo USDT de cero. Las políticas RLS restringen las lecturas a su propietario y las escrituras sensibles pasan por el servidor. [RLS en Supabase](https://supabase.com/docs/guides/database/postgres/row-level-security).

## 3. Correo y contraseñas

En Authentication:

- Habilita Email y **Confirm email**.
- Mantén **Secure email change** habilitado para confirmar ambas direcciones.
- Configura un mínimo de 12 caracteres para las contraseñas.
- Configura SMTP propio; el servicio de correo de prueba de Supabase tiene restricciones. [SMTP](https://supabase.com/docs/guides/auth/auth-smtp).
- En URL Configuration establece Site URL y permite exactamente las rutas `/auth/confirm/` y `/auth/callback/` del origen local y del dominio de producción. Usa `127.0.0.1` en local para coincidir con `APP_URL` y las cookies.

En Email Templates sustituye el enlace de cada plantilla:

**Confirm signup**

```html
<a href="{{ .RedirectTo }}?token_hash={{ .TokenHash }}&amp;type=email">Confirmar mi correo en HorseBet</a>
```

**Reset password**

```html
<a href="{{ .RedirectTo }}?token_hash={{ .TokenHash }}&amp;type=recovery">Recuperar mi cuenta</a>
```

**Change email address**

```html
<a href="{{ .RedirectTo }}?token_hash={{ .TokenHash }}&amp;type=email_change">Confirmar el cambio de correo</a>
```

La página exige pulsar «Continuar» antes de consumir el enlace para evitar que un escáner de correo lo use al abrirlo. Esta implementación verifica `token_hash` en servidor; no uses el enlace predeterminado que devuelve tokens en el fragmento de URL. [Plantillas oficiales](https://supabase.com/docs/guides/auth/auth-email-templates).

El acceso acepta usuario o correo más contraseña. Incluye recuperación, reenvío de confirmación, cambio de contraseña y cierre de sesiones. La recuperación exige una sesión validada por el enlace y una cookie firmada con caducidad de 15 minutos.

## 4. Google

1. En Google Cloud configura la pantalla de consentimiento y crea un cliente OAuth de tipo **Web application**.
2. Añade la URI de redirección que muestra Supabase en Authentication → Providers → Google, normalmente `https://TU-PROYECTO.supabase.co/auth/v1/callback`.
3. Guarda Client ID y Client Secret en el proveedor de Supabase y actívalo. El secreto de Google no va en el navegador ni en el repositorio.
4. Incluye `http://127.0.0.1:3000/auth/callback/` y `https://TU-DOMINIO/auth/callback/` en las redirecciones permitidas de Supabase.
5. Cambia `AUTH_GOOGLE_ENABLED=true` y reinicia Next.js. Si Google está en modo de prueba, añade tus correos de prueba en Google Cloud.

El retorno usa PKCE. Después del primer acceso con Google, HorseBet pide completar usuario, país y aceptación de condiciones. [Google con Supabase](https://supabase.com/docs/guides/auth/social-sign-in/auth-google).

## 5. Comprobar y desplegar

```bash
npm run check:config
npm test
npm run dev
```

`check:config` comprueba presencia y formato sin imprimir secretos; no valida el proyecto remoto. Abre `http://127.0.0.1:3000/es/account/`.

Después de conectar Supabase, prueba con dos cuentas: registro y correo, acceso por usuario, Google, recuperación, actualización del perfil, recarga, cierre de otras sesiones y aislamiento entre cuentas. Sube solamente documentos ficticios de prueba durante la puesta en marcha. Las pruebas automatizadas ejecutan las migraciones en PostgreSQL embebido (PGlite); no sustituyen la comprobación de proveedores externos.

Importa el repositorio en Vercel como **Next.js**, Node.js 22 o posterior. Build: `npm run build`. Conserva la salida por defecto; **no uses `out/`**. Añade las variables al entorno de producción, con `APP_URL=https://TU-DOMINIO`, sin prefijo `NEXT_PUBLIC_`. Una URL de preview diferente necesita sus propias variables y redirecciones. Vuelve a desplegar después de cambiar variables.

El país sugerido usa `x-vercel-ip-country` en Vercel, con bandera y prefijo telefónico. Fuera de Vercel usa `DEV_COUNTRY` solo en desarrollo, o la región explícita del idioma del navegador. Se puede corregir manualmente. La IP sugiere un país; no prueba residencia. [Cabeceras de Vercel](https://vercel.com/docs/headers/request-headers).

## Persistencia y alcance

- **Cuenta:** usuario, avatar de caballo, país, teléfono y preferencias persistentes; correo y contraseña gestionados por Supabase Auth. El teléfono queda «Sin verificar» hasta integrar SMS.
- **Transacciones y partidas:** filtros y paginación sobre registros propios. La base nueva muestra estados vacíos. Las ganancias ficticias del carrusel nunca se insertan en estos historiales.
- **Saldos:** unidades enteras sin redondeo de JavaScript. `post_ledger_transfer` es exclusivo del servidor, con idempotencia, balance de entradas y bloqueo transaccional. No hay endpoint público para incrementar saldos. Faltan proveedores de pagos y juegos, webhooks verificados y conciliación.
- **KYC:** formulario cifrado, carga privada y envío a revisión. JPG/PNG hasta 3 MB, normalizados a WebP sin metadatos; lectura mediante enlaces de 60 segundos tras verificar el propietario. El límite está por debajo del máximo de [Vercel Functions](https://vercel.com/docs/functions/limitations). El usuario no puede aprobar su expediente. La revisión queda pendiente hasta integrar un proveedor KYC o proceso administrativo autorizado; no se ha integrado SumSub ni validación documental automática.
- **Sesiones:** cookies HttpOnly, comprobación de usuario en servidor y revocación. Sin tokens en localStorage. [Autenticación de servidor](https://supabase.com/docs/guides/auth/server-side/advanced-guide).
- **Contenido ilustrativo:** promociones, apuestas y calculadoras siguen siendo demostraciones. El carrusel contiene 200 jugadores ficticios y está identificado como actividad simulada.

Antes de recoger documentos reales, completa la revisión, retención/eliminación de documentos, copias de seguridad y condiciones definitivas del producto. La aceptación actual identifica la versión de demostración. No es un casino operativo ni procesa depósitos o retiros.

La publicación privada anterior de Sites conserva la versión visual estática. `.openai/hosting.json` es su manifiesto histórico; no se utiliza en Vercel.
