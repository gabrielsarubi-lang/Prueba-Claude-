#!/usr/bin/env node
'use strict';

/**
 * Genera las láminas de los carruseles a partir de los textos de contenido/.
 *
 *   node carrusel.js precios-a-la-vista.json
 *   node carrusel.js precios-a-la-vista.json 1-cuanto-cuesta   -> solo ese
 *
 * Cada carrusel queda en su propia carpeta, numerado 01, 02, 03… porque
 * Instagram sube las imágenes en orden alfabético y ese orden es el del
 * carrusel. Si se renombra un archivo, se reordena la pieza.
 */

const fs = require('fs');
const path = require('path');
const { documentoCarrusel } = require('./lib/plantilla');

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
  const archivo = process.argv[2] || 'precios-a-la-vista.json';
  const filtro = process.argv[3];

  const marca = leerJson(path.join(RAIZ, 'marca.json'));
  const contenido = leerJson(path.join(RAIZ, 'contenido', archivo));

  const carruseles = (contenido.carruseles || [])
    .filter((c) => !filtro || c.archivo.includes(filtro));
  if (!carruseles.length) {
    console.error(`\n✗ No hay carruseles${filtro ? ` que coincidan con "${filtro}"` : ''} en ${archivo}.\n`);
    process.exit(1);
  }

  const nombre = path.basename(archivo, '.json');
  const base = path.join(RAIZ, 'salida', nombre);
  const trabajo = path.join(RAIZ, 'salida', '.html');
  fs.mkdirSync(trabajo, { recursive: true });

  const pagina = path.join(trabajo, `carrusel-${nombre}.html`);
  fs.writeFileSync(pagina, documentoCarrusel({ carruseles }, marca), 'utf8');

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
  const p = await navegador.newPage({
    viewport: { width: 1200, height: 1160 },
    deviceScaleFactor: 1
  });
  await p.goto('file://' + pagina, { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(1000);

  let total = 0;
  for (const c of carruseles) {
    const carpeta = path.join(base, c.archivo);
    fs.mkdirSync(carpeta, { recursive: true });
    process.stdout.write(`  ${c.archivo} `);
    for (let i = 0; i < c.laminas.length; i++) {
      const n = String(i + 1).padStart(2, '0');
      await p.locator(`#post-${c.archivo}-${n}`).screenshot({
        path: path.join(carpeta, `${n}.png`)
      });
      process.stdout.write('·');
      total++;
    }
    console.log(`  ${c.laminas.length} láminas`);
  }

  await navegador.close();
  console.log(`\n${total} láminas en ${path.relative(RAIZ, base)}/\n`);
}

main().catch((e) => { console.error('\n✗', e.message, '\n'); process.exit(1); });
