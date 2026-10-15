# CONTINUAR AQUÍ — CLICK TV STREAMING

**Fecha de registro:** 15 de octubre de 2026.

## Proyecto correcto

- Repositorio actual: `clicktvdigital/Click-Tv-Mundial-2026`.
- Rama de trabajo: `main`.
- Carpeta en Termux: `~/Click-Tv-Mundial-2026`.
- Web: https://click-tv-streaming.vercel.app/.
- Nombre público deseado: **CLICK TV STREAMING**; nombre técnico deseado para GitHub: `click-tv-streaming`.
- No modificar el proyecto Android ni Alerta EC.

## Último estado confirmado

El instalador del diseño azul fue ejecutado sobre la copia local. Git muestra:

- Modificado: `index.html`.
- Nuevos: `click-tv-logo-horizontal-2026.jpg`, `click-tv-miniatura-whatsapp-2026.jpg`, `clicktv-accesible-azul.css`, `clicktv-accesible.js`, `clicktv-icono.png`, `clicktv-precios-publico-2026.js`.
- Aún **no hay confirmación de commit, push ni despliegue de estos cambios**.
- El proyecto no tenía `README.md` ni `docs/CONTINUAR_AQUI.md` al ejecutar la revisión.
- La carpeta de Descargas `CLICK TV VERIFICAR` (23 archivos idénticos al estado comprobado de GitHub) ya fue eliminada; otras carpetas Android o de respaldos no se tocaron.

## Identidad y precios

- Logo horizontal para encabezado.
- Miniatura específica para WhatsApp y enlaces compartidos.
- Identidad visual azul alineada con la marca.
- Precios de cliente final en un archivo de extensión independiente del catálogo base.
- Precios para revendedores y costos del proveedor no deben aparecer en el repositorio público.
- Revisar que los precios nuevos sustituyan las ofertas antiguas sin duplicar productos y que cada plan incluya la vigencia y los dispositivos correctos.
- Las modalidades de 3, 6 y 12 meses y varios dispositivos son cálculos comerciales propuestos; confirmar la disponibilidad real del proveedor antes de cobrar.

## Reglas de trabajo

1. **Un comando de Termux por turno**, en español, compatible con fish.
2. Sin builds ni tareas pesadas en el teléfono; reservar GitHub Actions para la comprobación del código.
3. Mantener intactos carrito, pagos, radio, reseñas, enlaces, datos existentes y servicios no contemplados en el nuevo catálogo.
4. Respaldar antes de cambios destructivos; no borrar repositorios ni carpetas Android sin auditoría.
5. Tras cada avance, actualizar este archivo y README.

## Siguientes pasos

1. Añadir esta documentación y el workflow de verificación.
2. Revisar el orden de carga de JavaScript, duplicados de productos, montos visibles y comportamiento del carrito.
3. Revisar permisos de reventa y evitar publicar promesas no confirmadas de estabilidad o garantía.
4. Realizar commit/push de los archivos comprobados a GitHub.
5. Confirmar resultado de GitHub Actions y despliegue de Vercel; comprobar WhatsApp, TalkBack, precios y compras.
6. Cambiar el nombre técnico del repositorio en GitHub a `click-tv-streaming`, actualizar `origin` y comprobar redirecciones.

**No marcar como publicado lo que no haya sido comprobado en GitHub o Vercel.**

## Avance: atención, garantía y pagos (15/10/2026)

- Se preparó `clicktv-atencion-pagos.css` y `clicktv-atencion-pagos.js`, junto con secciones HTML accesibles para activación nueva, renovación y soporte.
- Identificar como **CLICK TV STREAMING**; el cambio de nombre técnico del repositorio se hará aparte y requiere verificar los enlaces de Vercel.
- Los números y enlaces de pago se obtienen de `CONFIG` existente, sin modificar cuentas bancarias, carrito, PayPal, PayPhone, DEUNA, radio ni datos.
- El instalador `APLICAR_FINAL_MAIN.py` trabaja sobre `main`, admite cambios pendientes y crea respaldo de los archivos modificados antes de escribir. No hace commit/push ni genera APK.
- Verificar visualmente en móvil, teclado y TalkBack: enlaces de compra nueva, renovación, soporte, copia de cuentas, bancas oficiales y enlaces de pago.
- **Estado de publicación:** pendiente hasta confirmación explícita de `git push`, GitHub Actions y Vercel.
- No prometer activaciones instantáneas ni garantías absolutas. Aclarar que la disponibilidad, plazos y condiciones se confirman antes de cobrar.

## Pago individual y QR (15/10/2026)

- Integrados: botón por cada plan visible y disponible, resumen de pedido identificable, QR/binance/deuna/payphone, transferencia bancaria, PayPal, envío internacional Pichincha, WhatsApp comercial/soporte, Telegram y copia de resumen.
- **Importante**: enlaces externos no fijan el precio automáticamente ni prueban un cobro; solo el administrador confirma la acreditación después de cotejar la operación. La subida de comprobante a WhatsApp/Telegram la hace la persona manualmente.
- Binance QR fue leído como URL de Binance, ambos QR Deuna son distintos y el QR PayPhone corresponde al enlace PayPhone enviado. Para cada pago revisar destinatario y cantidad.
- Ventas 08:00–20:00, soporte 08:00–18:00, hora Ecuador. Activación orientativa desde cinco minutos tras validar pago/disponibilidad, no garantizada.
- Archivos nuevos: `clicktv-pago-producto.js`, `clicktv-pago-producto.css`, cuatro `clicktv-qr-*.png`. El instalador genera un respaldo de los archivos de texto cambiados en `~/.clicktv-backups/`.
- **Estado**: aplicado localmente cuando el usuario confirme salida de Termux; todavía requiere `git commit`, `git push`, Actions y verificación en producción. No afirmar publicación antes.
- Pendientes: comprobar escaneo QR desde móvil, monto y titular en cada pasarela, botón Pagar plan y accesibilidad TalkBack, validar tiempo real con usuario, y evaluar backend webhooks sólo con soporte oficial.
