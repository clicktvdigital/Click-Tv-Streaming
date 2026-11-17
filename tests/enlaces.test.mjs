// Pruebas de los enlaces compartibles: "iptv" se publica como "television-por-internet"
// y los enlaces antiguos siguen abriendo el producto correcto.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createContext, runInContext } from 'node:vm';

const contexto = createContext({
  console,
  URLSearchParams,
  history: {},
  location: { search: '', origin: 'https://click-tv-streaming.vercel.app', pathname: '/' },
  document: { readyState: 'complete' }
});
contexto.window = contexto;
runInContext(readFileSync(new URL('../clicktv-enlaces-2026.js', import.meta.url), 'utf8'), contexto, { filename: 'clicktv-enlaces-2026.js' });
const { slugPublico, idDesdeSlug } = contexto.ctvSlugProducto;

test('los planes de TV por internet se comparten con "television-por-internet"', () => {
  assert.equal(contexto.enlaceDeProducto('iptv-basico'), 'https://click-tv-streaming.vercel.app/?producto=television-por-internet-basico');
  assert.equal(contexto.enlaceDeProducto('iptv-premium'), 'https://click-tv-streaming.vercel.app/?producto=television-por-internet-premium');
  assert.equal(contexto.enlaceDeProducto('iptv-ultra'), 'https://click-tv-streaming.vercel.app/?producto=television-por-internet-ultra');
  assert.equal(slugPublico('plataformas-iptv'), 'plataformas-television-por-internet');
});

test('los demás productos conservan su enlace', () => {
  assert.equal(slugPublico('netflix-compartido'), 'netflix-compartido');
  assert.equal(slugPublico('xc-tv'), 'xc-tv');
});

test('enlaces nuevos y antiguos abren el mismo producto', () => {
  for (const id of ['iptv-basico', 'iptv-premium', 'iptv-ultra', 'plataformas-iptv']) {
    assert.equal(idDesdeSlug(slugPublico(id)), id, `enlace nuevo de ${id}`);
    assert.equal(idDesdeSlug(id), id, `enlace antiguo de ${id}`);
  }
  assert.equal(idDesdeSlug('netflix-normal'), 'netflix-compartido');
});
