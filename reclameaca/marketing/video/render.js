/* Renderiza cada pieza a MP4 (H.264, 1080x1920, 30 fps) listo para Instagram.
   Uso:  node render.js [id-de-pieza ...]        (sin argumentos, renderiza todas) */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { chromium } = require('playwright-core');
const ffmpeg = require('ffmpeg-static');

const DIR = __dirname;
const SALIDA = path.join(DIR, 'salida');
const FPS = 30;
const W = 1080, H = 1920;

const CHROME = process.env.CHROME_BIN ||
  ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome', '/usr/bin/chromium', '/usr/bin/google-chrome']
    .find(p => fs.existsSync(p));

function documento(pieza) {
  return `<!doctype html><html lang="es-AR"><head><meta charset="utf-8">
<link rel="stylesheet" href="lib/estilo.css"></head><body>
<div id="stage">
${pieza.escenas.join('\n')}
${pieza.progreso === false ? '' : '<div id="prog"><i></i></div>'}
</div>
<script src="lib/motor.js"></script></body></html>`;
}

async function render(pieza, browser) {
  const html = path.join(DIR, `.tmp-${process.pid}-${pieza.id}.html`);
  fs.writeFileSync(html, documento(pieza));

  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  await page.goto('file://' + html, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => window.LISTO === true);

  const dur = await page.evaluate(() => window.DURACION);
  const total = Math.round(dur * FPS);
  const mp4 = path.join(SALIDA, `${pieza.id}.mp4`);

  const ff = spawn(ffmpeg, [
    '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-i', 'pipe:0',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '18',
    '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-level', '4.2',
    '-movflags', '+faststart', '-r', String(FPS), mp4,
  ], { stdio: ['pipe', 'ignore', 'pipe'] });

  let err = '';
  ff.stderr.on('data', d => { err += d; });
  const fin = new Promise((res, rej) =>
    ff.on('close', c => c === 0 ? res() : rej(new Error('ffmpeg ' + c + '\n' + err.slice(-1500)))));

  process.stdout.write(`\n${pieza.id}  ${dur.toFixed(1)}s  ${total} cuadros  `);
  for (let f = 0; f < total; f++) {
    await page.evaluate(t => window.seek(t), f / FPS);
    const buf = await page.screenshot({ type: 'png' });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (f % 60 === 0) process.stdout.write('.');
  }
  ff.stdin.end();
  await fin;
  await page.close();
  try { fs.unlinkSync(html); } catch (e) { /* ya no está */ }

  const kb = (fs.statSync(mp4).size / 1024).toFixed(0);
  process.stdout.write(` ✓ ${kb} KB`);
  return { id: pieza.id, dur, mp4 };
}

(async () => {
  fs.mkdirSync(SALIDA, { recursive: true });
  const todas = require('./piezas.js');
  const pedidas = process.argv.slice(2);
  const lista = pedidas.length ? todas.filter(p => pedidas.includes(p.id)) : todas;
  if (!lista.length) { console.error('No hay piezas que coincidan.'); process.exit(1); }

  const browser = await chromium.launch({
    executablePath: CHROME,
    args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars', '--font-render-hinting=none',
           '--disable-lcd-text', '--force-color-profile=srgb'],
  });
  const hechas = [];
  for (const p of lista) hechas.push(await render(p, browser));
  await browser.close();

  console.log('\n\nListo:');
  for (const h of hechas) console.log(`  ${h.mp4}  (${h.dur.toFixed(1)}s)`);
})().catch(e => { console.error('\n' + e.stack); process.exit(1); });
