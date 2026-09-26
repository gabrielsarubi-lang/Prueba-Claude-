/* Renderiza las piezas estáticas (carruseles e historias en imagen) a PNG.
   Uso:  node render-img.js [id-de-pieza ...]     (sin argumentos, todas) */

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright-core');

const DIR = __dirname;
const SALIDA = path.join(DIR, 'salida');
const CHROME = process.env.CHROME_BIN ||
  ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome', '/usr/bin/chromium']
    .find(p => fs.existsSync(p));

function documento(lamina, [w, h], feed) {
  return `<!doctype html><html lang="es-AR"><head><meta charset="utf-8">
<link rel="stylesheet" href="lib/estilo.css">
<style>:root{--W:${w}px;--H:${h}px}</style></head>
<body class="${feed ? 'feed' : ''}"><div id="stage">${lamina}</div>
<script src="lib/motor.js"></script></body></html>`;
}

async function render(pieza, browser) {
  const [w, h] = pieza.tamano;
  const feed = pieza.formato === 'carrusel';
  const carpeta = feed ? path.join(SALIDA, pieza.id) : SALIDA;
  fs.mkdirSync(carpeta, { recursive: true });

  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  process.stdout.write(`\n${pieza.id}  ${w}x${h}  `);

  const hechas = [];
  for (let i = 0; i < pieza.laminas.length; i++) {
    const tmp = path.join(DIR, `.tmp-${process.pid}-${pieza.id}-${i}.html`);
    fs.writeFileSync(tmp, documento(pieza.laminas[i], pieza.tamano, feed));
    await page.goto('file://' + tmp, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    // El motor anima; para una imagen fija lo dejamos en el estado final.
    await page.evaluate(() => window.seek(0.999));

    const nombre = feed
      ? `${String(i + 1).padStart(2, '0')}.png`
      : `${pieza.id}.png`;
    const destino = path.join(carpeta, nombre);
    await page.screenshot({ path: destino });
    try { fs.unlinkSync(tmp); } catch (e) { /* ya no está */ }
    hechas.push(destino);
    process.stdout.write('.');
  }
  await page.close();
  process.stdout.write(` ✓ ${hechas.length} PNG`);
  return hechas;
}

(async () => {
  const todas = require('./piezas-estaticas.js');
  const pedidas = process.argv.slice(2);
  const lista = pedidas.length ? todas.filter(p => pedidas.includes(p.id)) : todas;
  if (!lista.length) { console.error('No hay piezas que coincidan.'); process.exit(1); }

  const browser = await chromium.launch({
    executablePath: CHROME,
    args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars', '--font-render-hinting=none',
           '--disable-lcd-text', '--force-color-profile=srgb'],
  });
  const todo = [];
  for (const p of lista) todo.push(...await render(p, browser));
  await browser.close();
  console.log(`\n\nListo: ${todo.length} imágenes en salida/`);
})().catch(e => { console.error('\n' + e.stack); process.exit(1); });
