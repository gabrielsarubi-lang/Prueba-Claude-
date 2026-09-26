#!/usr/bin/env node
'use strict';

/**
 * Genera las placas de Instagram de Reclame Acá a partir de contenido/.
 *
 *   node generar.js                              -> contenido/semana-01.json
 *   node generar.js semana-02.json               -> ese archivo
 *   node generar.js semana-02.json post          -> solo los cuadrados
 *   node generar.js semana-02.json historia      -> solo las historias
 *   node generar.js carruseles.json carrusel     -> solo los carruseles
 *
 * Un mismo archivo puede traer "posts" (post + historia) y "carruseles".
 * Sin tercer argumento se genera todo lo que haya.
 *
 * Todo queda en salida/<archivo>/. Los carruseles, en una carpeta cada uno,
 * con las láminas numeradas 01, 02, 03… porque Instagram las sube en orden
 * alfabético y ese orden es el del carrusel.
 */

const fs = require('fs');
const path = require('path');
const { documento, documentoCarrusel } = require('./lib/plantilla');

const RAIZ = __dirname;
const PREFIJO = 'reclameaca-';
const CHROME = [
  process.env.CHROME_PATH,
  '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  '/opt/pw-browsers/chromium/chrome-linux/chrome',
  '/usr/bin/chromium',
  '/usr/bin/google-chrome'
].filter(Boolean);

function leerJson(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); }
  catch (e) {
    console.error(`\n✗ No se pudo leer ${path.relative(RAIZ, p)}:\n  ${e.message}\n`);
    process.exit(1);
  }
}

async function main() {
  const archivo = process.argv[2] || 'semana-01.json';
  const solo = process.argv[3];

  const marca = leerJson(path.join(RAIZ, 'marca.json'));
  const contenido = leerJson(path.join(RAIZ, 'contenido', archivo));

  const nombre = path.basename(archivo, '.json');
  const salida = path.join(RAIZ, 'salida', nombre);
  const trabajo = path.join(RAIZ, 'salida', '.html');
  fs.mkdirSync(trabajo, { recursive: true });

  // 1. Armar el HTML de cada tanda.
  const tandas = [];
  const posts = contenido.posts || [];
  for (const formato of ['post', 'historia']) {
    if (solo && solo !== formato) continue;
    if (!posts.some((p) => p[formato])) continue;
    tandas.push({ formato, html: documento(contenido, marca, formato), alto: marca.medidas[formato].alto });
  }
  if ((!solo || solo === 'carrusel') && (contenido.carruseles || []).length) {
    tandas.push({ formato: 'carrusel', html: documentoCarrusel(contenido, marca), alto: marca.medidas.post.alto });
  }
  if (!tandas.length) {
    console.error(`\n✗ No hay nada para generar${solo ? ` en formato "${solo}"` : ''} en ${archivo}.\n`);
    process.exit(1);
  }
  for (const t of tandas) {
    t.pagina = path.join(trabajo, `${nombre}-${t.formato}.html`);
    fs.writeFileSync(t.pagina, t.html, 'utf8');
  }

  // 2. Renderizar a PNG.
  const chrome = CHROME.find((p) => fs.existsSync(p));
  if (!chrome) {
    console.error('\n✗ No encontré Chromium para renderizar.');
    console.error('  Instalalo con:  npx playwright install chromium');
    console.error('  o apuntá la variable CHROME_PATH a un Chrome existente.');
    console.error(`\n  El HTML sí quedó armado en ${path.relative(RAIZ, trabajo)}/ —`);
    console.error('  podés abrirlo en un navegador y capturar a mano.\n');
    process.exit(1);
  }

  let chromium;
  try { ({ chromium } = require('playwright-core')); }
  catch (e) {
    console.error('\n✗ Falta playwright-core. Instalalo con:  npm install\n');
    process.exit(1);
  }

  const navegador = await chromium.launch({
    executablePath: chrome,
    args: ['--no-sandbox', '--font-render-hinting=none', '--force-color-profile=srgb']
  });

  let total = 0;
  for (const t of tandas) {
    const pagina = await navegador.newPage({
      viewport: { width: 1200, height: Math.min(t.alto + 80, 2000) },
      deviceScaleFactor: 1
    });
    await pagina.goto('file://' + t.pagina, { waitUntil: 'networkidle' });
    await pagina.evaluate(() => document.fonts.ready);
    await pagina.waitForTimeout(800);

    if (t.formato === 'carrusel') {
      for (const c of contenido.carruseles) {
        const carpeta = path.join(salida, c.archivo);
        fs.mkdirSync(carpeta, { recursive: true });
        for (let i = 0; i < c.laminas.length; i++) {
          const n = String(i + 1).padStart(2, '0');
          await pagina.locator(`#post-${c.archivo}-${n}`).screenshot({ path: path.join(carpeta, `${n}.png`) });
          total++;
        }
        console.log(`  ✓ ${path.relative(RAIZ, carpeta)}/  (${c.laminas.length} láminas)`);
      }
    } else {
      fs.mkdirSync(salida, { recursive: true });
      for (const item of posts) {
        if (!item[t.formato]) continue;
        const pre = t.formato === 'historia' ? `${PREFIJO}historia-` : PREFIJO;
        const destino = path.join(salida, `${pre}${item.archivo}.png`);
        await pagina.locator(`#${t.formato}-${item.archivo}`).screenshot({ path: destino });
        console.log('  ✓', path.relative(RAIZ, destino));
        total++;
      }
    }
    await pagina.close();
  }

  await navegador.close();

  // 3. Los textos del pie de cada post, listos para copiar y pegar.
  if (posts.some((p) => p.pie) && (!solo || solo === 'post')) {
    const md = [`# ${contenido.semana || nombre} — textos para publicar`, ''];
    for (const p of posts) {
      if (!p.pie) continue;
      md.push(`## ${p.dia ? p.dia + ' — ' : ''}${p.archivo}`, '');
      if (p.objetivo) md.push(`_${p.objetivo}_`, '');
      md.push('**Pie:**', '', p.pie, '');
      if (p.hashtags) md.push('**Primer comentario:**', '', p.hashtags, '');
    }
    const destino = path.join(salida, 'textos.md');
    fs.writeFileSync(destino, md.join('\n'), 'utf8');
    console.log('  ✓', path.relative(RAIZ, destino));
  }

  console.log(`\n${total} imágenes en ${path.relative(RAIZ, salida)}/\n`);
}

main().catch((e) => { console.error('\n✗', e.message, '\n'); process.exit(1); });
