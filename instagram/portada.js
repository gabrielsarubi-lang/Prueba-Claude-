#!/usr/bin/env node
'use strict';

/**
 * Genera las portadas de los reels.
 *
 *   node portada.js              -> todas
 *   node portada.js recorrido    -> sólo las que coincidan
 *
 * Salen en salida/portadas/ como PNG de 1080x1920, que es lo que Instagram
 * pide al subir una portada propia.
 */

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright-core');
const portada = require('./lib/portada');

const RAIZ = __dirname;
const CROMO = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

async function main() {
  const filtro = process.argv[2];
  const marca = JSON.parse(fs.readFileSync(path.join(RAIZ, 'marca.json'), 'utf8'));
  const datos = JSON.parse(fs.readFileSync(path.join(RAIZ, 'contenido', 'portadas.json'), 'utf8'));

  const lista = datos.portadas.filter((p) => !filtro || p.archivo.includes(filtro));
  if (!lista.length) { console.log('\nNo hay portadas que coincidan con "' + filtro + '".\n'); return; }

  const destino = path.join(RAIZ, 'salida', 'portadas');
  fs.mkdirSync(destino, { recursive: true });
  const borrador = path.join(RAIZ, 'salida', '.html');
  fs.mkdirSync(borrador, { recursive: true });

  const nav = await chromium.launch({
    executablePath: CROMO,
    args: ['--no-sandbox', '--font-render-hinting=none', '--force-color-profile=srgb']
  });
  // La ventana va más grande que la placa a propósito: si mide exacto, el
  // screenshot puede dispararse mientras la página todavía está acomodando el
  // scroll y agarrar el fondo en vez del elemento.
  const pagina = await nav.newPage({ viewport: { width: 1200, height: 2040 }, deviceScaleFactor: 1 });

  console.log('');
  for (const p of lista) {
    const html = path.join(borrador, 'portada-' + p.archivo + '.html');
    fs.writeFileSync(html, portada.documento(p, marca));
    await pagina.goto('file://' + html, { waitUntil: 'networkidle' });
    await pagina.evaluate(() => document.fonts.ready);
    await pagina.waitForTimeout(350);

    const salida = path.join(destino, 'sarubia-portada-' + p.archivo + '.png');
    await pagina.locator('.placa').screenshot({ path: salida });
    const kb = Math.round(fs.statSync(salida).size / 1024);
    console.log('  ✓ salida/portadas/sarubia-portada-' + p.archivo + '.png  —  1080x1920, ' + kb + ' KB');
  }
  console.log('');

  await nav.close();
}

main().catch((e) => { console.error(e); process.exit(1); });
