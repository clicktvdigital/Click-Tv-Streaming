# CLICK TV STREAMING 💙

<p align="center">
  <img src="./clicktv-icono.png" width="190" alt="Logo cuadrado oficial de CLICK TV STREAMING" />
</p>

Tienda web de CLICK TV DIGITAL: catálogo comercial de entretenimiento, televisión en vivo, servicios digitales y atención al cliente.

- **Marca pública:** CLICK TV STREAMING.
- **Tienda:** https://click-tv-streaming.vercel.app/
- **Repositorio GitHub:** [Click-Tv-Streaming](https://github.com/clicktvdigital/Click-Tv-Streaming).
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
- El repositorio GitHub ya fue renombrado a `Click-Tv-Streaming`. Comprobar la conexión de Vercel y mantener la URL pública sin cambios.

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

## Renovación visual cinematográfica (15/10/2026)

- `clicktv-cinematico.css` moderniza la portada, tarjetas y paleta azul. Respeta los colores identificables de WhatsApp y otros métodos.
- Imágenes originales optimizadas WebP: `clicktv-foto-{cine,deportes,television,musica}.webp`; no dependen de terceros ni copian la web de referencia.
- El bloque de radio, accesos y Teleamazonas se ubica debajo de las categorías; **sus ID, enlaces, funciones y contenido no se alteran**.
- Las cuatro tarjetas conservan `data-ctv-category` y enlazan al filtro real del catálogo.
- No se cambian `data.js`, `catalogo.js`, `script.js`, precios, cuentas, carrito, QR ni configuraciones de pago.
- No se muestran afirmaciones de clientes conectados o compras simuladas en la portada. No afirmar activación instantánea.
- Aún requiere inspección manual de celular y escritorio, pruebas de radio/catálogo/carrito, CI y despliegue antes de considerarse verificado.

## Pulido de marca azul y emblemas de catálogo (15/10/2026)

- `clicktv-pulido-azul.css`: tipografía, blancos legibles, tarjetas, carrito, reproductores y logo sin brillo verde; se conserva el verde **solo en WhatsApp**.
- `style.css`: valores verde neón antiguos migrados a la paleta azul; no se cambiaron clases ni estructura. Respaldo local disponible.
- `clicktv-logos-catalogo.js`: presentación progresiva de emblemas de marcas conocidas (Simple Icons, con favicon como respaldo); sin tocar los datos, precios ni botones. Para marcas sin logo verificado muestra abreviaturas legibles, **no un logotipo oficial inventado**.
- Los emblemas de marcas pertenecen a sus titulares y se presentan únicamente para identificar servicios; no implican patrocinio ni distribución autorizada. Revisar el derecho a comercializar cada producto.
- Los logos externos requieren conectividad para cargarse. Las abreviaturas permanecen legibles cuando los recursos no cargan. Para independencia total se deberán obtener archivos de logo con permiso para alojarlos localmente.
- Sin modificación de `data.js`, `catalogo.js`, `script.js`, pasarelas ni contactos. Validar visualmente carrito, logo, filtros, radio y pantallas móviles antes de aceptar pagos.

## Ajuste de carrito, avisos y remanentes verdes (15/10/2026)

- `clicktv-carrito-toast-azul.css`: notificaciones legibles, azul uniforme y ubicación fija incluso con carrito abierto; mejora iconos, negrillas y fondos del panel.
- `script.js`: se añade `data-producto` al HTML visual de la fila del carrito, **sin modificar datos, totales, acciones ni pasarelas**.
- `clicktv-logos-catalogo.js`: el mismo identificador de producto aplica el emblema del catálogo en el carrito, también tras cambios de cantidad o renovación; si falla el logo externo aparece texto de respaldo.
- Se conserva el verde únicamente en los enlaces/botones de WhatsApp y colores propios de métodos externos. El brillo decorativo y las sombras genéricas de la tienda son azules o neutrales.
- Verificar visualmente en teléfonos de 320-400px el aviso al agregar un producto, las filas del carrito, el total, pagos, renovaciones y canales de soporte. No confundir `git push` o tests JS con confirmación real de pagos.
