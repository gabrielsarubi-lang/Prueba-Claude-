#!/usr/bin/env node
'use strict';

/**
 * Pega el sello de marca al final de un reel.
 *
 *   node pegar-sello.js sarubia-reel-recorrido-de-un-mensaje.mp4
 *   node pegar-sello.js sarubia-reel-buenos-aires-escribe.mp4 claro
 *   node pegar-sello.js                     -> lista los reels disponibles
 *
 * Deja el original intacto y escribe uno nuevo terminado en -con-sello.mp4.
 * Los dos videos salen del mismo generador, así que comparten medida, cuadros
 * por segundo y codec: se pegan sin recodificar, y por eso tarda un segundo y
 * no pierde calidad.
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const RAIZ = __dirname;
const REELS = path.join(RAIZ, 'salida', 'reels');
// Hay dos sellos: el oscuro y el claro. El claro es para las piezas de
// fondo claro, donde cortar a negro al final se siente un golpe.
const SELLO = (tono) => path.join(REELS, tono === 'claro' ? 'sarubia-sello-claro.mp4' : 'sarubia-sello.mp4');

function ffmpeg() {
  try { return require('ffmpeg-static'); }
  catch (e) { return '/usr/bin/ffmpeg'; }
}

function listar() {
  const hay = fs.existsSync(REELS)
    ? fs.readdirSync(REELS).filter((f) => f.endsWith('.mp4') && !f.includes('sello'))
    : [];
  console.log('\nReels disponibles:\n');
  hay.forEach((f) => console.log('  ' + f));
  console.log('\nUsá:  node pegar-sello.js <archivo>\n');
}

function main() {
  const arg = process.argv[2];
  const tono = process.argv[3] === 'claro' ? 'claro' : 'oscuro';
  if (!arg) return listar();

  if (!fs.existsSync(SELLO(tono))) {
    console.error('\n✗ Falta el sello. Generalo con:  node sello.js\n');
    process.exit(1);
  }
  const origen = path.isAbsolute(arg) ? arg : path.join(REELS, arg);
  if (!fs.existsSync(origen)) {
    console.error(`\n✗ No encontré ${arg}\n`);
    return listar();
  }

  const destino = origen.replace(/\.mp4$/, '-con-sello.mp4');
  const lista = path.join(RAIZ, 'salida', '.html', 'pegar.txt');
  fs.mkdirSync(path.dirname(lista), { recursive: true });
  fs.writeFileSync(lista, `file '${origen}'\nfile '${SELLO(tono)}'\n`, 'utf8');

  execFileSync(ffmpeg(), [
    '-y', '-f', 'concat', '-safe', '0', '-i', lista,
    '-c', 'copy', '-movflags', '+faststart', destino
  ], { stdio: ['ignore', 'ignore', 'pipe'] });
  fs.rmSync(lista, { force: true });

  const mb = (fs.statSync(destino).size / 1048576).toFixed(1);
  console.log(`\n  ✓ ${path.relative(RAIZ, destino)}  —  ${mb} MB\n`);
}

main();
