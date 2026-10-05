#!/usr/bin/env node
'use strict';

/**
 * Genera la propuesta de taller en PDF.
 *
 *   node propuesta.js                          -> usa contenido/taller.json
 *   node propuesta.js "Cámara Inmobiliaria"    -> pisa el nombre de la institución
 *
 * Sale en salida/comercial/. El nombre del archivo lleva la institución, así
 * que no se pisan entre sí y queda claro qué se mandó a quién.
 */

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright-core');
const propuesta = require('./lib/propuesta');

const RAIZ = __dirname;
const CROMO = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

const tajo = (s) => s.toLowerCase()
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48) || 'propuesta';

async function main() {
  const marca = JSON.parse(fs.readFileSync(path.join(RAIZ, 'marca.json'), 'utf8'));
  const t = JSON.parse(fs.readFileSync(path.join(RAIZ, 'contenido', 'taller.json'), 'utf8'));
  if (process.argv[2]) t.institucion = process.argv[2];

  const destino = path.join(RAIZ, 'salida', 'comercial');
  const trabajo = path.join(RAIZ, 'salida', '.html');
  fs.mkdirSync(destino, { recursive: true });
  fs.mkdirSync(trabajo, { recursive: true });

  const html = path.join(trabajo, 'propuesta-taller.html');
  fs.writeFileSync(html, propuesta.documento(t, marca), 'utf8');

  const nav = await chromium.launch({
    executablePath: CROMO,
    args: ['--no-sandbox', '--font-render-hinting=none', '--force-color-profile=srgb']
  });
  const pagina = await nav.newPage();
  await pagina.goto('file://' + html, { waitUntil: 'networkidle' });
  await pagina.evaluate(() => document.fonts.ready);
  await pagina.waitForTimeout(400);

  const salida = path.join(destino, 'sarubia-taller-' + tajo(t.institucion) + '.pdf');
  await pagina.pdf({ path: salida, format: 'A4', printBackground: true,
                     margin: { top: 0, right: 0, bottom: 0, left: 0 } });
  await nav.close();

  const kb = Math.round(fs.statSync(salida).size / 1024);
  console.log('\n  ✓ ' + path.relative(RAIZ, salida) + '  —  2 páginas A4, ' + kb + ' KB\n');
}

main().catch((e) => { console.error('\n✗', e.message, '\n'); process.exit(1); });
