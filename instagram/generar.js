#!/usr/bin/env node
'use strict';

/**
 * Genera las placas de Instagram a partir de los textos de contenido/.
 *
 *   node generar.js                      -> usa contenido/semana-01.json
 *   node generar.js semana-02.json       -> usa ese archivo
 *   node generar.js semana-02.json posts -> solo los cuadrados
 *
 * Las imágenes quedan en salida/<semana>/.
 */

const fs = require('fs');
const path = require('path');
const { documento } = require('./lib/plantilla');

const RAIZ = __dirname;
const CHROME_POSIBLES = [
  process.env.CHROME_PATH,
  '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  '/opt/pw-browsers/chromium/chrome-linux/chrome',
  '/usr/bin/chromium',
  '/usr/bin/google-chrome'
].filter(Boolean);

function leerJson(p) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (e) {
    console.error(`\n✗ No se pudo leer ${path.relative(RAIZ, p)}:\n  ${e.message}\n`);
    process.exit(1);
  }
}

function buscarChrome() {
  for (const p of CHROME_POSIBLES) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

async function main() {
  const archivo = process.argv[2] || 'semana-01.json';
  const soloFormato = process.argv[3];
  const formatos = soloFormato ? [soloFormato] : ['post', 'historia'];

  const marca = leerJson(path.join(RAIZ, 'marca.json'));
  const contenido = leerJson(path.join(RAIZ, 'contenido', archivo));

  const nombreSemana = path.basename(archivo, '.json');
  const salida = path.join(RAIZ, 'salida', nombreSemana);
  const trabajo = path.join(RAIZ, 'salida', '.html');
  fs.mkdirSync(salida, { recursive: true });
  fs.mkdirSync(trabajo, { recursive: true });

  // 1. Armar el HTML de cada formato.
  const paginas = {};
  for (const formato of formatos) {
    const html = documento(contenido, marca, formato);
    const destino = path.join(trabajo, `${formato}.html`);
    fs.writeFileSync(destino, html, 'utf8');
    paginas[formato] = destino;
  }

  // 2. Renderizar a PNG.
  const chrome = buscarChrome();
  if (!chrome) {
    console.error('\n✗ No encontré Chromium para renderizar.');
    console.error('  Instalalo con:  npx playwright install chromium');
    console.error('  o apuntá la variable CHROME_PATH a un Chrome existente.');
    console.error(`\n  El HTML sí quedó armado en ${path.relative(RAIZ, trabajo)}/ —`);
    console.error('  podés abrirlo en un navegador y capturar a mano.\n');
    process.exit(1);
  }

  let chromium;
  try {
    ({ chromium } = require('playwright-core'));
  } catch (e) {
    console.error('\n✗ Falta playwright-core. Instalalo con:  npm install\n');
    process.exit(1);
  }

  const navegador = await chromium.launch({
    executablePath: chrome,
    args: ['--no-sandbox', '--font-render-hinting=none']
  });

  let total = 0;
  for (const formato of formatos) {
    const alto = formato === 'historia' ? marca.medidas.historia.alto : marca.medidas.post.alto;
    const pagina = await navegador.newPage({
      viewport: { width: 1200, height: Math.min(alto + 80, 2000) },
      deviceScaleFactor: 1
    });
    await pagina.goto('file://' + paginas[formato], { waitUntil: 'networkidle' });
    await pagina.evaluate(() => document.fonts.ready);
    await pagina.waitForTimeout(1000);

    for (const item of contenido.posts) {
      if (!item[formato]) continue;
      const prefijo = formato === 'historia' ? 'sarubia-historia-' : 'sarubia-';
      const destino = path.join(salida, `${prefijo}${item.archivo}.png`);
      await pagina.locator(`#${formato}-${item.archivo}`).screenshot({ path: destino });
      console.log('  ✓', path.relative(RAIZ, destino));
      total++;
    }
    await pagina.close();
  }

  await navegador.close();
  console.log(`\n${total} imágenes en ${path.relative(RAIZ, salida)}/\n`);
}

main().catch((e) => {
  console.error('\n✗', e.message, '\n');
  process.exit(1);
});
