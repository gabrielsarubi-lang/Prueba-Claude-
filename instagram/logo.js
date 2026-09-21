#!/usr/bin/env node
'use strict';

/**
 * Genera el avatar de Instagram en sus cuatro versiones, más una hoja que las
 * compara a los tamaños en que Instagram las muestra de verdad.
 *
 *   node logo.js
 *
 * Sale todo en salida/logo/. Los PNG son de 1080 x 1080: Instagram pide 320
 * como mínimo, pero guarda una copia grande y la usa cuando alguien abre la
 * foto, así que conviene darle resolución de sobra.
 */

const fs = require('fs');
const path = require('path');
const logo = require('./lib/logo');

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
  const marca = leerJson(path.join(RAIZ, 'marca.json'));

  const salida = path.join(RAIZ, 'salida', 'logo');
  const trabajo = path.join(RAIZ, 'salida', '.html');
  fs.mkdirSync(salida, { recursive: true });
  fs.mkdirSync(trabajo, { recursive: true });

  const pagAvatares = path.join(trabajo, 'logo.html');
  const pagHoja = path.join(trabajo, 'logo-comparacion.html');
  fs.writeFileSync(pagAvatares, logo.documento(marca), 'utf8');
  fs.writeFileSync(pagHoja, logo.documentoComparacion(marca), 'utf8');

  const chrome = existe(CHROME);
  if (!chrome) {
    console.error('\n✗ No encontré Chromium. Instalalo con:  npx playwright install chromium');
    console.error(`  El HTML igual quedó en ${path.relative(RAIZ, trabajo)}/\n`);
    process.exit(1);
  }

  const { chromium } = require('playwright-core');
  const navegador = await chromium.launch({
    executablePath: chrome,
    args: ['--no-sandbox', '--font-render-hinting=none', '--force-color-profile=srgb']
  });

  // 1. Cada versión, a 1080.
  const p = await navegador.newPage({
    viewport: { width: 1200, height: 1160 },
    deviceScaleFactor: 1
  });
  await p.goto('file://' + pagAvatares, { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(900);

  for (const v of logo.VERSIONES) {
    const destino = path.join(salida, `sarubia-avatar-${v.id}.png`);
    await p.locator(`#${v.id}`).screenshot({ path: destino });
    console.log('  ✓', path.relative(RAIZ, destino));
  }
  await p.close();

  // 2. La hoja de comparación.
  const h = await navegador.newPage({ viewport: { width: 1600, height: 1200 }, deviceScaleFactor: 1 });
  await h.goto('file://' + pagHoja, { waitUntil: 'networkidle' });
  await h.evaluate(() => document.fonts.ready);
  await h.waitForTimeout(900);
  const hoja = path.join(salida, 'comparacion.png');
  await h.screenshot({ path: hoja, fullPage: true });
  console.log('  ✓', path.relative(RAIZ, hoja));
  await h.close();

  await navegador.close();
  console.log(`\n${logo.VERSIONES.length} versiones en ${path.relative(RAIZ, salida)}/ — 1080 x 1080\n`);
}

main().catch((e) => { console.error('\n✗', e.message, '\n'); process.exit(1); });
