/* CLICK TV STREAMING · Service worker mínimo.
 * Sirve para que el sitio pueda instalarse como app en el celular.
 * No guarda copias del sitio: siempre se carga la versión publicada. */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => { /* red normal */ });
