# Chat de soporte HorseBet

Todos los accesos «Ayuda» abren `SupportChat.jsx`, un popup no modal con cierre, teclado, historial y respuesta automática. En localhost sin Supabase o sin iniciar sesión, la conversación se guarda en `sessionStorage` para esta pestaña y se identifica como demostración local: no se ha contactado a ningún agente. La respuesta de muestra usa el texto solicitado.

Para usuarios autenticados y con Supabase configurado, aplicar `supabase/migrations/202610270003_support_chat.sql`. `/api/support/` consulta y guarda mensajes en `support_messages`. Cada envío guarda el mensaje y su acuse automático en una sola transacción. Los reintentos tienen UUID idempotente. RLS impide leer conversaciones ajenas; no se permite que un cliente escriba mensajes de agente ni modifique el historial. Límite: 30 mensajes por cuenta cada 15 minutos.

La respuesta automática no es una respuesta humana. Antes de producción hay que asignar personal a la bandeja y conectar su interfaz de trabajo; este cambio no crea un equipo de agentes ni un panel administrativo. El rol de servicio puede guardar respuestas de agente. No se envían correos ni mensajes externos.
