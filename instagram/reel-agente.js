#!/usr/bin/env node
'use strict';

/**
 * Genera el reel de venta del agente de WhatsApp.
 *
 *   node reel-agente.js
 *
 * Es una pieza aparte de los reels de marca: dura 20 segundos, tiene escenas y
 * muestra una demostración del agente contestando. Pensada para historia
 * destacada o publicidad paga.
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const agente = require('./lib/reel-agente');

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

function leerJson(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); }
  catch (e) {
    console.error(`\n✗ No se pudo leer ${path.relative(RAIZ, p)}:\n  ${e.message}\n`);
    process.exit(1);
  }
}

async function main() {
  const archivo = process.argv[2] || 'reel-agente.json';
  const marca = leerJson(path.join(RAIZ, 'marca.json'));
  const g = leerJson(path.join(RAIZ, 'contenido', archivo));

  const salida = path.join(RAIZ, 'salida', 'reels');
  const trabajo = path.join(RAIZ, 'salida', '.html');
  const cuadros = path.join(RAIZ, 'salida', '.cuadros', g.archivo);
  fs.mkdirSync(salida, { recursive: true });
  fs.mkdirSync(trabajo, { recursive: true });
  fs.rmSync(cuadros, { recursive: true, force: true });
  fs.mkdirSync(cuadros, { recursive: true });

  const pagina = path.join(trabajo, `reel-${g.archivo}.html`);
  fs.writeFileSync(pagina, agente.documento(g, marca), 'utf8');

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
    viewport: { width: marca.medidas.historia.ancho, height: marca.medidas.historia.alto },
    deviceScaleFactor: 1
  });
  await p.goto('file://' + pagina, { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(800);

  const total = Math.round(g.duracion * FPS);
  const escena = p.locator('.placa');
  process.stdout.write(`  ${total} cuadros `);
  for (let i = 0; i < total; i++) {
    await p.evaluate((t) => window.__cuadro(t), i / FPS);
    await escena.screenshot({ path: path.join(cuadros, String(i).padStart(4, '0') + '.png') });
    if (i % 60 === 0) process.stdout.write('.');
  }
  await navegador.close();

  const destino = path.join(salida, `sarubia-reel-${g.archivo}.mp4`);
  execFileSync(ffmpeg, [
    '-y', '-framerate', String(FPS), '-i', path.join(cuadros, '%04d.png'),
    '-c:v', 'libx264', '-profile:v', 'high', '-pix_fmt', 'yuv420p',
    '-crf', '18', '-preset', 'slow', '-movflags', '+faststart', destino
  ], { stdio: ['ignore', 'ignore', 'pipe'] });

  fs.rmSync(cuadros, { recursive: true, force: true });
  const mb = (fs.statSync(destino).size / 1048576).toFixed(1);
  console.log(`\n\n  ✓ ${path.relative(RAIZ, destino)}  —  ${g.duracion}s, ${mb} MB, sin audio\n`);
}

main().catch((e) => { console.error('\n✗', e.message, '\n'); process.exit(1); });
