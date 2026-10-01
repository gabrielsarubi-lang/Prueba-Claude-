/* Renderiza el reel 3D a MP4 (H.264, 1080x1920, 30 fps), igual que ../video/render.js.
   Uso:
     node render.js                      -> salida/reel-3d-como-funciona.mp4
     node render.js --tanda 300          -> solo 300 cuadros nuevos (se retoma después)
     node render.js --previa 2.5 6 11    -> un PNG por segundo pedido, en salida/previa/

   La página usa módulos ES (three.js), que el navegador no carga desde file://.
   Por eso se levanta un servidor local mínimo solo mientras dura el render. */

const fs = require('fs');
const path = require('path');
const http = require('http');
const { spawn } = require('child_process');
const { chromium } = require('playwright-core');
const ffmpeg = require('ffmpeg-static');

const DIR = __dirname;
const RAIZ = path.join(DIR, '..');                 // marketing/: sirve también ../video/fonts
const SALIDA = path.join(DIR, 'salida');
const FPS = 30, W = 1080, H = 1920;
const NOMBRE = 'reel-3d-como-funciona';

const CHROME = process.env.CHROME_BIN ||
  ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome', '/usr/bin/chromium', '/usr/bin/google-chrome']
    .find((p) => fs.existsSync(p));

const TIPOS = { '.html': 'text/html', '.js': 'text/javascript', '.woff2': 'font/woff2', '.json': 'application/json' };

function servidor() {
  return new Promise((ok) => {
    const s = http.createServer((req, res) => {
      const ruta = path.normalize(path.join(RAIZ, decodeURIComponent(req.url.split('?')[0])));
      if (!ruta.startsWith(RAIZ) || !fs.existsSync(ruta) || fs.statSync(ruta).isDirectory()) {
        res.writeHead(404); return res.end();
      }
      res.writeHead(200, { 'Content-Type': TIPOS[path.extname(ruta)] || 'application/octet-stream' });
      fs.createReadStream(ruta).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok(s));
  });
}

async function abrir(browser, puerto) {
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => console.error('\n[página]', e.message));
  page.on('console', (m) => { if (m.type() === 'error') console.error('\n[consola]', m.text()); });
  await page.goto(`http://127.0.0.1:${puerto}/video3d/index.html`, { waitUntil: 'load' });
  await page.waitForFunction(() => window.LISTO === true, null, { timeout: 120000 });
  return page;
}

(async () => {
  const args = process.argv.slice(2);
  const previa = args[0] === '--previa';
  const srv = await servidor();
  const puerto = srv.address().port;

  // SwiftShader: WebGL por software, para que renderice también en máquinas sin GPU.
  const browser = await chromium.launch({
    executablePath: CHROME,
    args: ['--no-sandbox', '--hide-scrollbars', '--font-render-hinting=none', '--disable-lcd-text',
           '--force-color-profile=srgb', '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
           '--ignore-gpu-blocklist'],
  });
  const page = await abrir(browser, puerto);
  const dur = await page.evaluate(() => window.DURACION);

  if (previa) {
    const dir = path.join(SALIDA, 'previa');
    fs.mkdirSync(dir, { recursive: true });
    for (const t of args.slice(1).map(Number)) {
      const t0 = Date.now();
      await page.evaluate((x) => window.seek(x), t);
      const f = path.join(dir, `${NOMBRE}_${t.toFixed(2)}s.png`);
      await page.screenshot({ path: f });
      console.log(`  ${path.relative(DIR, f)}  (${Date.now() - t0} ms)`);
    }
  } else {
    // Cada cuadro se guarda en salida/.cuadros/ y una corrida nueva saltea los que
    // ya existen: si el render se corta, se retoma donde quedó. "--tanda N" corta
    // después de N cuadros nuevos, para correrlo en tramos.
    const CUADROS = path.join(SALIDA, '.cuadros');
    fs.mkdirSync(CUADROS, { recursive: true });
    const i = args.indexOf('--tanda');
    const tanda = i >= 0 ? Number(args[i + 1]) : Infinity;
    const total = Math.round(dur * FPS);
    const archivo = (f) => path.join(CUADROS, `${String(f).padStart(5, '0')}.png`);

    const t0 = Date.now();
    let hechos = 0;
    process.stdout.write(`${NOMBRE}  ${dur.toFixed(1)}s  ${total} cuadros\n`);
    for (let f = 0; f < total && hechos < tanda; f++) {
      if (fs.existsSync(archivo(f))) continue;
      await page.evaluate((x) => window.seek(x), f / FPS);
      const tmp = archivo(f) + '.tmp';
      await page.screenshot({ path: tmp, type: 'png' });
      fs.renameSync(tmp, archivo(f));          // nunca queda un cuadro a medio escribir
      hechos++;
      if (hechos % 30 === 0) {
        const faltan = total - fs.readdirSync(CUADROS).filter((n) => n.endsWith('.png')).length;
        const seg = (Date.now() - t0) / 1000 / hechos;
        process.stdout.write(`  cuadro ${f}  faltan ${faltan}  ~${Math.round((faltan * seg) / 60)} min\n`);
      }
    }

    const listos = fs.readdirSync(CUADROS).filter((n) => n.endsWith('.png')).length;
    if (listos < total) {
      console.log(`\nTramo listo: ${listos}/${total} cuadros. Volvé a correr el mismo comando para seguir.`);
    } else {
      const mp4 = path.join(SALIDA, `${NOMBRE}.mp4`);
      await new Promise((ok, mal) => {
        const ff = spawn(ffmpeg, [
          '-y', '-framerate', String(FPS), '-i', path.join(CUADROS, '%05d.png'),
          '-c:v', 'libx264', '-preset', 'slow', '-crf', '17',
          '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-level', '4.2',
          '-movflags', '+faststart', '-r', String(FPS), mp4,
        ], { stdio: ['ignore', 'ignore', 'pipe'] });
        let err = '';
        ff.stderr.on('data', (d) => { err += d; });
        ff.on('close', (c) => (c === 0 ? ok() : mal(new Error('ffmpeg ' + c + '\n' + err.slice(-1500)))));
      });
      console.log(`\nListo: ${path.relative(DIR, mp4)}  (${(fs.statSync(mp4).size / 1048576).toFixed(1)} MB)`);
      console.log('Los cuadros sueltos de salida/.cuadros/ ya se pueden borrar.');
    }
  }

  await browser.close();
  srv.close();
})().catch((e) => { console.error('\n' + e.stack); process.exit(1); });
