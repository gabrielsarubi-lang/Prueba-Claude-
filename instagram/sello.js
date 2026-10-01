#!/usr/bin/env node
'use strict';

/**
 * Genera el sello de marca, para pegar al final de los reels.
 *
 *   node sello.js            -> vertical, 1080 x 1920
 *   node sello.js post       -> cuadrado, 1080 x 1080
 *
 * Son dos segundos y medio y el último medio segundo queda quieto: un sello
 * que termina en movimiento se corta mal cuando lo pegás atrás de otro video.
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const sello = require('./lib/sello');

const RAIZ = __dirname;
const FPS = 30;
const CHROME = [
  process.env.CHROME_PATH,
  '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  '/opt/pw-browsers/chromium/chrome-linux/chrome',
  '/usr/bin/chromium',
  '/usr/bin/google-chrome'
].filter(Boolean);

const existe = (l) => l.find((p) => p && fs.existsSync(p)) || null;

function buscarFfmpeg() {
  try { return require('ffmpeg-static'); }
  catch (e) { return existe([process.env.FFMPEG_PATH, '/usr/bin/ffmpeg', '/usr/local/bin/ffmpeg']); }
}

async function main() {
  const formato = process.argv[2] === 'post' ? 'post' : 'historia';
  const marca = JSON.parse(fs.readFileSync(path.join(RAIZ, 'marca.json'), 'utf8'));
  const med = formato === 'post' ? marca.medidas.post : marca.medidas.historia;

  const salida = path.join(RAIZ, 'salida', 'reels');
  const trabajo = path.join(RAIZ, 'salida', '.html');
  const cuadros = path.join(RAIZ, 'salida', '.cuadros', 'sello');
  fs.mkdirSync(salida, { recursive: true });
  fs.mkdirSync(trabajo, { recursive: true });
  fs.rmSync(cuadros, { recursive: true, force: true });
  fs.mkdirSync(cuadros, { recursive: true });

  const pagina = path.join(trabajo, `sello-${formato}.html`);
  fs.writeFileSync(pagina, sello.documento(marca, { formato }), 'utf8');

  const chrome = existe(CHROME);
  if (!chrome) { console.error('\n✗ No encontré Chromium.\n'); process.exit(1); }
  const ffmpeg = buscarFfmpeg();
  if (!ffmpeg) { console.error('\n✗ Falta ffmpeg. Instalalo con:  npm install\n'); process.exit(1); }

  const { chromium } = require('playwright-core');
  const navegador = await chromium.launch({
    executablePath: chrome,
    args: ['--no-sandbox', '--font-render-hinting=none', '--force-color-profile=srgb']
  });
  const p = await navegador.newPage({
    viewport: { width: med.ancho + 120, height: med.alto + 120 },
    deviceScaleFactor: 1
  });
  await p.goto('file://' + pagina, { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(800);

  const total = Math.round(sello.DURACION * FPS);
  process.stdout.write(`  ${total} cuadros `);
  for (let i = 0; i < total; i++) {
    await p.evaluate((t) => window.__cuadro(t), i / FPS);
    await p.locator('.placa').screenshot({ path: path.join(cuadros, String(i).padStart(4, '0') + '.png') });
    if (i % 20 === 0) process.stdout.write('.');
  }
  await navegador.close();

  const destino = path.join(salida, `sarubia-sello${formato === 'post' ? '-cuadrado' : ''}.mp4`);
  execFileSync(ffmpeg, [
    '-y', '-framerate', String(FPS), '-i', path.join(cuadros, '%04d.png'),
    '-c:v', 'libx264', '-profile:v', 'high', '-pix_fmt', 'yuv420p',
    '-crf', '18', '-preset', 'slow', '-movflags', '+faststart', destino
  ], { stdio: ['ignore', 'ignore', 'pipe'] });

  fs.rmSync(cuadros, { recursive: true, force: true });
  const mb = (fs.statSync(destino).size / 1048576).toFixed(1);
  console.log(`\n\n  ✓ ${path.relative(RAIZ, destino)}  —  ${sello.DURACION}s, ${mb} MB, sin audio\n`);
}

main().catch((e) => { console.error('\n✗', e.message, '\n'); process.exit(1); });
