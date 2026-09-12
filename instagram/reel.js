#!/usr/bin/env node
'use strict';

/**
 * Genera los reels de una semana en MP4.
 *
 *   node reel.js                          -> todos los de semana-01.json
 *   node reel.js semana-01.json martes    -> solo el que diga "martes"
 *   node reel.js semana-02.json           -> otra semana
 *
 * Toma los mismos textos que las placas quietas, así una placa y su reel
 * nunca discrepan. El video sale mudo a propósito: la música se pone dentro
 * de Instagram, donde está licenciada y el algoritmo la favorece.
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const reel = require('./lib/reel');

const RAIZ = __dirname;
const DURACION = 8;   // segundos
const FPS = 30;

const CHROME = [
  process.env.CHROME_PATH,
  '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  '/opt/pw-browsers/chromium/chrome-linux/chrome',
  '/usr/bin/chromium',
  '/usr/bin/google-chrome'
].filter(Boolean);

const existe = (lista) => lista.find((p) => p && fs.existsSync(p)) || null;

function buscarFfmpeg() {
  try {
    return require('ffmpeg-static');
  } catch (e) {
    return existe([process.env.FFMPEG_PATH, '/usr/bin/ffmpeg', '/usr/local/bin/ffmpeg']);
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
  const archivo = process.argv[2] || 'semana-01.json';
  const filtro = process.argv[3];

  const marca = leerJson(path.join(RAIZ, 'marca.json'));
  const contenido = leerJson(path.join(RAIZ, 'contenido', archivo));

  const posts = contenido.posts.filter(
    (p) => p.historia && (!filtro || p.archivo.includes(filtro) || p.dia.toLowerCase().includes(filtro.toLowerCase()))
  );
  if (!posts.length) {
    console.error(`\n✗ Ningún post coincide con "${filtro}".\n`);
    process.exit(1);
  }

  const nombreSemana = path.basename(archivo, '.json');
  const salida = path.join(RAIZ, 'salida', 'reels', nombreSemana);
  const trabajo = path.join(RAIZ, 'salida', '.html');
  fs.mkdirSync(salida, { recursive: true });
  fs.mkdirSync(trabajo, { recursive: true });

  const chrome = existe(CHROME);
  if (!chrome) {
    console.error('\n✗ No encontré Chromium. Instalalo con:  npx playwright install chromium\n');
    process.exit(1);
  }
  const ffmpeg = buscarFfmpeg();
  if (!ffmpeg) {
    console.error('\n✗ Falta ffmpeg. Instalalo con:  npm install\n');
    process.exit(1);
  }

  const { chromium } = require('playwright-core');
  const navegador = await chromium.launch({
    executablePath: chrome,
    args: ['--no-sandbox', '--font-render-hinting=none', '--force-color-profile=srgb']
  });

  const hechos = [];

  for (const item of posts) {
    const dur = (item.reel && item.reel.duracion) || DURACION;
    const cuadrosN = Math.round(dur * FPS);

    const pagina = path.join(trabajo, `reel-${item.archivo}.html`);
    fs.writeFileSync(pagina, reel.documento(item, marca, { duracion: dur }), 'utf8');

    const cuadros = path.join(RAIZ, 'salida', '.cuadros', item.archivo);
    fs.rmSync(cuadros, { recursive: true, force: true });
    fs.mkdirSync(cuadros, { recursive: true });

    const p = await navegador.newPage({
      viewport: { width: marca.medidas.historia.ancho, height: marca.medidas.historia.alto },
      deviceScaleFactor: 1
    });
    await p.goto('file://' + pagina, { waitUntil: 'networkidle' });
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(700);

    const escena = p.locator('.placa');
    process.stdout.write(`  ${item.dia.padEnd(10)} `);
    for (let i = 0; i < cuadrosN; i++) {
      await p.evaluate((t) => window.__cuadro(t), i / FPS);
      await escena.screenshot({ path: path.join(cuadros, String(i).padStart(4, '0') + '.png') });
      if (i % 40 === 0) process.stdout.write('.');
    }
    await p.close();

    const destino = path.join(salida, `sarubia-reel-${item.archivo}.mp4`);
    execFileSync(ffmpeg, [
      '-y',
      '-framerate', String(FPS),
      '-i', path.join(cuadros, '%04d.png'),
      '-c:v', 'libx264',
      '-profile:v', 'high',
      '-pix_fmt', 'yuv420p',      // sin esto, muchos reproductores no lo abren
      '-crf', '18',
      '-preset', 'slow',
      '-movflags', '+faststart',
      destino
    ], { stdio: ['ignore', 'ignore', 'pipe'] });

    fs.rmSync(cuadros, { recursive: true, force: true });
    const mb = (fs.statSync(destino).size / 1048576).toFixed(1);
    console.log(` ${dur}s, ${mb} MB`);
    hechos.push(destino);
  }

  await navegador.close();
  console.log(`\n${hechos.length} reels en ${path.relative(RAIZ, salida)}/ — sin audio\n`);
}

main().catch((e) => {
  console.error('\n✗', e.message, '\n');
  process.exit(1);
});
