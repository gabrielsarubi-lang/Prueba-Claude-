#!/usr/bin/env node
'use strict';

/**
 * Genera un reel en MP4 a partir de un guion de contenido/.
 *
 *   node reel.js                     -> usa contenido/reel-martes.json
 *   node reel.js reel-viernes.json
 *
 * Dibuja cada cuadro con el navegador y los pega con ffmpeg. El video sale
 * mudo a propósito: la música se pone dentro de Instagram, que es gratis,
 * está licenciada y el algoritmo la favorece.
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const reel = require('./lib/reel');

const RAIZ = __dirname;

const CHROME = [
  process.env.CHROME_PATH,
  '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  '/opt/pw-browsers/chromium/chrome-linux/chrome',
  '/usr/bin/chromium',
  '/usr/bin/google-chrome'
].filter(Boolean);

function primeroQueExista(lista) {
  for (const p of lista) if (p && fs.existsSync(p)) return p;
  return null;
}

function buscarFfmpeg() {
  try {
    return require('ffmpeg-static');
  } catch (e) {
    return primeroQueExista([process.env.FFMPEG_PATH, '/usr/bin/ffmpeg', '/usr/local/bin/ffmpeg']);
  }
}

function leerJson(p) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (e) {
    console.error(`\n✗ No se pudo leer ${path.relative(RAIZ, p)}:\n  ${e.message}\n`);
    process.exit(1);
  }
}

async function main() {
  const archivo = process.argv[2] || 'reel-martes.json';

  const marca = leerJson(path.join(RAIZ, 'marca.json'));
  const guion = leerJson(path.join(RAIZ, 'contenido', archivo));

  const fps = guion.cuadros_por_segundo || 30;
  const total = Math.round(guion.duracion * fps);

  const salida = path.join(RAIZ, 'salida', 'reels');
  const cuadros = path.join(RAIZ, 'salida', '.cuadros', guion.archivo);
  fs.rmSync(cuadros, { recursive: true, force: true });
  fs.mkdirSync(cuadros, { recursive: true });
  fs.mkdirSync(salida, { recursive: true });

  // 1. La página que sabe dibujarse en cualquier instante.
  const pagina = path.join(RAIZ, 'salida', '.html', `reel-${guion.archivo}.html`);
  fs.mkdirSync(path.dirname(pagina), { recursive: true });
  fs.writeFileSync(pagina, reel.documento(guion, marca), 'utf8');

  // 2. Un PNG por cuadro.
  const chrome = primeroQueExista(CHROME);
  if (!chrome) {
    console.error('\n✗ No encontré Chromium. Instalalo con:  npx playwright install chromium\n');
    process.exit(1);
  }

  const { chromium } = require('playwright-core');
  const navegador = await chromium.launch({
    executablePath: chrome,
    args: ['--no-sandbox', '--font-render-hinting=none', '--force-color-profile=srgb']
  });
  const p = await navegador.newPage({
    viewport: { width: marca.medidas.historia.ancho, height: marca.medidas.historia.alto },
    deviceScaleFactor: 1
  });
  await p.goto('file://' + pagina, { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(800);

  const escena = p.locator('#escena');
  process.stdout.write(`  Dibujando ${total} cuadros `);
  for (let i = 0; i < total; i++) {
    await p.evaluate((t) => window.__cuadro(t), i / fps);
    await escena.screenshot({ path: path.join(cuadros, String(i).padStart(4, '0') + '.png') });
    if (i % 30 === 0) process.stdout.write('.');
  }
  process.stdout.write(' listo\n');
  await navegador.close();

  // 3. Pegarlos en un MP4 que Instagram acepte.
  const ffmpeg = buscarFfmpeg();
  if (!ffmpeg) {
    console.error('\n✗ Falta ffmpeg. Instalalo con:  npm install ffmpeg-static');
    console.error(`  Los cuadros quedaron en ${path.relative(RAIZ, cuadros)}/\n`);
    process.exit(1);
  }

  const destino = path.join(salida, `sarubia-reel-${guion.archivo}.mp4`);
  execFileSync(ffmpeg, [
    '-y',
    '-framerate', String(fps),
    '-i', path.join(cuadros, '%04d.png'),
    '-c:v', 'libx264',
    '-profile:v', 'high',
    '-pix_fmt', 'yuv420p',   // sin esto, muchos reproductores no lo abren
    '-crf', '18',
    '-preset', 'slow',
    '-movflags', '+faststart',
    destino
  ], { stdio: ['ignore', 'ignore', 'pipe'] });

  fs.rmSync(cuadros, { recursive: true, force: true });

  const mb = (fs.statSync(destino).size / 1048576).toFixed(1);
  console.log(`\n  ✓ ${path.relative(RAIZ, destino)}  —  ${guion.duracion}s, ${mb} MB, sin audio\n`);
}

main().catch((e) => {
  console.error('\n✗', e.message, '\n');
  process.exit(1);
});
