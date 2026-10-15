# CLICK TV STREAMING 💙

Tienda web de CLICK TV DIGITAL: catálogo comercial de entretenimiento, televisión en vivo, servicios digitales y atención al cliente.

- **Marca pública:** CLICK TV STREAMING.
- **Tienda:** https://click-tv-streaming.vercel.app/
- **Código fuente histórico:** https://github.com/clicktvdigital/Click-Tv-Mundial-2026 (hasta completar el cambio de nombre).
- **Publicación:** GitHub + Vercel; no requiere compilar en el teléfono.

## Estructura principal

| Archivo | Función |
| --- | --- |
| `index.html` | Página, SEO, accesos al catálogo, metadatos y miniatura para compartir. |
| `data.js` | Datos base, configuración de la tienda y productos originales. |
| `clicktv-precios-publico-2026.js` | Precios públicos complementarios para clientes finales. **No publicar costos internos.** |
| `catalogo.js` | Visualización de productos y conexión con las funciones de compra. |
| `script.js` | Carrito, pagos, radio y otras funciones existentes. |
| `style.css`, `responsive.css` | Estilos generales y adaptación a móviles. |
| `clicktv-accesible-azul.css` | Identidad azul y estilos de accesibilidad. |
| `clicktv-accesible.js` | Ayudas de accesibilidad y mejoras de interacción. |
| `click-tv-logo-horizontal-2026.jpg` | Identidad visual del encabezado. |
| `click-tv-miniatura-whatsapp-2026.jpg` | Miniatura Open Graph para enlaces compartidos. |
| `clicktv-icono.png` | Favicon e icono del sitio. |

## Experiencia accesible

La tienda se diseña para personas mayores y personas con discapacidad. Dar prioridad a letras legibles, contraste suficiente, controles grandes, etiquetas claras, navegación por teclado y compatibilidad con lectores de pantalla (TalkBack).

### Revisión manual antes de publicar

1. En teléfono y escritorio, abrir la tienda, navegar por categorías y localizar productos.
2. Comprobar las opciones de precio, duración y dispositivos sin ambigüedad.
3. Agregar un producto al carrito y revisar el total; probar el botón de WhatsApp sin finalizar una compra real.
4. Probar navegación con teclado y TalkBack; los botones visibles de agrandar texto y alto contraste se retiraron a petición del negocio.
5. Compartir la URL en WhatsApp y verificar la miniatura tras el despliegue.
6. Confirmar que pagos, radio y enlaces previos sigan funcionando.

## Verificaciones en GitHub

`.github/workflows/verificar-tienda-web.yml` revisa que existan los recursos principales y que el JavaScript tenga sintaxis válida. Corre **en GitHub Actions**; no instala dependencias ni genera compilaciones en Termux.

## Mantenimiento y seguridad

- Mantener el trabajo en GitHub y utilizar Vercel para servir la web.
- No colocar contraseñas, tokens privados, claves de producción ni costos del proveedor en archivos públicos del repositorio.
- Verificar los permisos de comercialización, las condiciones y la disponibilidad de cada servicio antes de publicarlo como oferta oficial.
- Mantener `docs/CONTINUAR_AQUI.md` actualizado al terminar cada sesión de trabajo.
- Cambiar el nombre del repositorio mediante la configuración de GitHub solo después de comprobar referencias y despliegues.

## Atención comercial y métodos de pago (15/10/2026)

- `clicktv-atencion-pagos.css` y `clicktv-atencion-pagos.js`: compra nueva, renovación, soporte, garantías e instrucciones de transferencia.
- Compras nuevas al WhatsApp comercial configurado en `CONFIG`; renovaciones y soporte al WhatsApp alternativo configurado en `CONFIG`.
- Se reutilizan los enlaces ya configurados de PayPal, PayPhone y DEUNA; no se guardan secretos ni se afirma que el pago se acredita automáticamente.
- Bancos: copiar número y abrir sitio oficial de Banco Pichincha o Guayaquil. La tienda no captura claves bancarias.
- Los términos de uso muestran condiciones de los servicios sin prometer activación inmediata ni soporte 24/7. Verificar condiciones particulares de cada producto antes de publicitarlo.
- Mantener la rama `main`, respetar los cambios existentes y ejecutar verificaciones en GitHub Actions; no compilar en Android.

## Pago por producto, QR y comprobantes (15/10/2026)

- `clicktv-pago-producto.js` y `clicktv-pago-producto.css` agregan un botón **Pagar este plan** a cada modalidad disponible, con resumen de producto, duración, dispositivos y precio del catálogo público.
- Referencia de pedido `CTV-...`; mensajes a WhatsApp de ventas, soporte o Telegram con número de pedido y total. Se requiere adjuntar el comprobante manualmente.
- QR aportados por el comerciante y comprobados por lectura: PayPhone, Deuna/Pichincha, Deuna personal y Binance. Enlace temporal Deuna caduca el 14/11/2026 según la información suministrada.
- Los QR de pago son **fijos** y pueden requerir que el cliente introduzca importe. NO se precarga ni se garantiza que la pasarela reciba exactamente el precio indicado. Nunca se da por pagada una compra a partir de un clic o captura.
- Transferencias: se usan las cuentas configuradas en `CONFIG`, con botón copiar y apertura únicamente de bancas oficiales. También existe enlace Pichincha para envío internacional.
- Horarios Ecuador: ventas/activaciones 08:00–20:00; soporte/renovaciones 08:00–18:00; activación estimada desde 5 minutos, condicionada a pago **comprobado** y disponibilidad.
- Confirmación: solo por soporte/administración después de verificar el abono. La tienda no recibe claves, datos de tarjeta ni OTP.
- Sin backend ni webhooks: **no existe confirmación automática de pagos**. Para automatizar: crear pedidos del lado del servidor, notificaciones seguras y validación en proveedor autorizado, con secretos en variables de entorno de Vercel.
- Trabajo en `main`, sin reinstalar dependencias ni compilar en Android. GitHub Actions valida sintaxis y presencia de archivos.

## Mejoras de interfaz y carrito (15/10/2026)

- `clicktv-final-visual.css/js` añade una vitrina ilustrada original (sin copiar imágenes de la competencia), categorías visuales y microtransiciones ligeras para teléfono, tablet y ordenador.
- Ilustraciones SVG propias de cine, deportes, televisión y música; se sirven desde GitHub/Vercel y se cargan de forma diferida.
- El carrito tiene etiquetas y bloques de contacto con contraste legible, espacio disponible y desplazamiento táctil correcto. No se alteraron cuentas, precios, pasarelas, comprobantes, radio ni pedidos.
- Se eliminaron de la interfaz los botones «Agrandar letra» y «Alto contraste». Permanecen texto base claro, botones táctiles amplios, foco por teclado, enlace para saltar al catálogo y movimiento reducido cuando lo solicita el sistema.
- Las afirmaciones de activación inmediata/soporte 24/7 se sustituyen por información condicional y horarios reales.
- Mantener el repositorio en `main` y validar en GitHub Actions; no realizar compilaciones de Android.
