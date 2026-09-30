#!/usr/bin/env node
'use strict';

/**
 * Genera las historias destacadas: la portada de cada una y la serie que va
 * adentro.
 *
 *   node destacadas.js                 -> todas
 *   node destacadas.js inmobiliarias   -> solo esa
 *
 * Cada destacada queda en su propia carpeta, con la portada aparte y las
 * historias numeradas 01, 02, 03… porque ese es el orden en que hay que
 * subirlas: Instagram arma la destacada en el orden en que las agregás.
 */

const fs = require('fs');
const path = require('path');
const destacada = require('./lib/destacada');

const RAIZ = __dirname;
const CHROME = [
  process.env.CHROME_PATH,
  '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  '/opt/pw-browsers/chromium/chrome-linux/chrome',
  '/usr/bin/chromium',
  '/usr/bin/google-chrome'
].filter(Boolean);

const existe = (l) => l.find((p) => p && fs.existsSync(p)) || null;

function leerJson(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); }
  catch (e) {
    console.error(`\n✗ No se pudo leer ${path.relative(RAIZ, p)}:\n  ${e.message}\n`);
    process.exit(1);
  }
}

async function main() {
  const filtro = process.argv[2];
  const marca = leerJson(path.join(RAIZ, 'marca.json'));
  const contenido = leerJson(path.join(RAIZ, 'contenido', 'destacadas.json'));

  const lista = contenido.destacadas.filter((d) => !filtro || d.slug.includes(filtro));
  if (!lista.length) {
    console.error(`\n✗ Ninguna destacada coincide con "${filtro}".\n`);
    process.exit(1);
  }

  const base = path.join(RAIZ, 'salida', 'destacadas');
  const trabajo = path.join(RAIZ, 'salida', '.html');
  fs.mkdirSync(trabajo, { recursive: true });

  const pagina = path.join(trabajo, 'destacadas.html');
  fs.writeFileSync(pagina, destacada.documento({ destacadas: lista }, marca), 'utf8');

  const chrome = existe(CHROME);
  if (!chrome) {
    console.error('\n✗ No encontré Chromium. Instalalo con:  npx playwright install chromium');
    console.error(`  El HTML igual quedó en ${path.relative(RAIZ, pagina)}\n`);
    process.exit(1);
  }

  const { chromium } = require('playwright-core');
  const navegador = await chromium.launch({
    executablePath: chrome,
    args: ['--no-sandbox', '--font-render-hinting=none', '--force-color-profile=srgb']
  });
  // El viewport va más grande que la pieza a propósito. Con uno del tamaño
  // exacto, la captura de un elemento que mide justo la pantalla sale a veces
  // con una franja del fondo de la página: el navegador todavía está
  // acomodando el scroll cuando se dispara la foto.
  const p = await navegador.newPage({
    viewport: { width: destacada.LADO.ancho + 120, height: destacada.LADO.alto + 120 },
    deviceScaleFactor: 1
  });
  await p.goto('file://' + pagina, { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(1000);

  let total = 0;
  for (const d of lista) {
    const carpeta = path.join(base, d.slug);
    fs.mkdirSync(carpeta, { recursive: true });
    process.stdout.write(`  ${d.slug.padEnd(26)}`);

    await p.locator(`#portada-${d.slug}`).screenshot({ path: path.join(carpeta, 'portada.png') });
    process.stdout.write('○');
    total++;

    for (let i = 0; i < d.historias.length; i++) {
      const n = String(i + 1).padStart(2, '0');
      await p.locator(`#historia-${d.slug}-${n}`).screenshot({ path: path.join(carpeta, `${n}.png`) });
      process.stdout.write('·');
      total++;
    }
    console.log(`  ${d.historias.length} historias`);
  }

  await navegador.close();
  console.log(`\n${total} imágenes en ${path.relative(RAIZ, base)}/ — ${lista.length} destacadas\n`);
}

main().catch((e) => { console.error('\n✗', e.message, '\n'); process.exit(1); });
