// SEO y Google Search Console: archivos estáticos, sitemap, robots y datos estructurados de la marca.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const leer = (archivo) => readFileSync(new URL(`../${archivo}`, import.meta.url), 'utf8');
const DOMINIO = 'https://click-tv-streaming.vercel.app/';

test('el archivo de verificación de Google tiene exactamente una línea con su contenido', () => {
  assert.equal(leer('googlebd70cc265f0ecc3d.html'), 'google-site-verification: googlebd70cc265f0ecc3d.html');
});

test('robots.txt permite todo y apunta al sitemap del dominio real', () => {
  const robots = leer('robots.txt');
  assert.match(robots, /^User-agent: \*$/m);
  assert.match(robots, /^Allow: \/$/m);
  assert.doesNotMatch(robots, /^Disallow: *\/ *$/m);
  assert.match(robots, new RegExp(`^Sitemap: ${DOMINIO}sitemap\\.xml$`, 'm'));
});

test('sitemap: portada, enlaces de IPTV y categorías, todos en el dominio real', () => {
  const locs = [...leer('sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  assert.equal(locs[0], DOMINIO);
  for (const plan of ['basico', 'premium', 'ultra']) assert.ok(locs.includes(`${DOMINIO}?producto=television-por-internet-${plan}`), plan);
  for (const c of ['iptv', 'streaming', 'deportes', 'musica', 'apps', 'recargas', 'proneet']) assert.ok(locs.includes(`${DOMINIO}?categoria=${c}`), c);
  assert.ok(locs.every((u) => u.startsWith(DOMINIO)));
  assert.equal(new Set(locs).size, locs.length, 'sin URLs repetidas');
});

test('index.html: título, descripción, canonical y JSON-LD con las dos marcas', () => {
  const html = leer('index.html');
  assert.match(html, /<title>Click TV Streaming \| Televisión por internet, streaming y entretenimiento en Ecuador<\/title>/);
  assert.match(html, /<meta name="description" content="Click TV Streaming \(Click TV Digital\): televisión por internet/);
  assert.equal((html.match(/rel="canonical"/g) || []).length, 1);
  assert.match(html, new RegExp(`<link rel="canonical" href="${DOMINIO}">`));
  const ld = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  const tipos = Object.fromEntries(ld['@graph'].map((n) => [n['@type'], n]));
  assert.equal(tipos.Store.name, 'Click TV Streaming');
  assert.equal(tipos.Organization.name, 'Click TV Digital');
  assert.match(tipos.Store.slogan, /Televisión por internet, streaming y entretenimiento en Ecuador/);
  for (const nodo of ld['@graph']) assert.ok(nodo.url.startsWith(DOMINIO));
});

test('vercel.json no reescribe ni redirige los archivos estáticos de SEO', () => {
  const vercel = JSON.parse(leer('vercel.json'));
  assert.equal(vercel.rewrites, undefined);
  assert.equal(vercel.redirects, undefined);
  assert.equal(vercel.cleanUrls, undefined, 'cleanUrls quitaría el .html del archivo de Google');
});
