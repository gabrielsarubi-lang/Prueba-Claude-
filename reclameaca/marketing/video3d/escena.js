/* Reel explicativo 3D de Reclame Acá.
   Todo es función del tiempo: window.seek(t) deja la escena exactamente en el
   segundo t, sin requestAnimationFrame. Así el render cuadro a cuadro sale
   idéntico en cualquier máquina, igual que el motor de ../video. */

import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

// Las tarjetas dibujan texto en canvas: primero tiene que estar cargada Inter.
await Promise.all(['400', '500', '600', '700', '800'].map((w) => document.fonts.load(`${w} 40px Inter`)));
await document.fonts.ready;

const W = 1080, H = 1920;
const DURACION = 30.4;

const C = {
  navy900: '#0f2338', navy800: '#16324f', navy700: '#1f4166',
  orange: '#ff6b35', orange600: '#e85a2a',
  text: '#1a2433', text2: '#5b6b7c', muted: '#8a97a6', bg: '#f5f7fa', border: '#e2e8f0',
};

/* ------------------------------------------------------------ utilidades */

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const k = (t, a, b) => clamp((t - a) / (b - a));              // progreso 0..1 entre a y b
const lerp = (a, b, p) => a + (b - a) * p;
const ease = {
  out: (p) => (p >= 1 ? 1 : 1 - Math.pow(2, -10 * p)),         // easeOutExpo
  inOut: (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2),
  back: (p) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); },
  in: (p) => p * p * p,
};

// Azar con semilla: el confeti y las partículas caen igual en cada render.
function azar(semilla) {
  let s = semilla >>> 0;
  return () => { s = (s + 0x6D2B79F5) >>> 0; let x = s; x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61); return ((x ^ (x >>> 14)) >>> 0) / 4294967296; };
}

function lienzo(w, h) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  return [c, c.getContext('2d')];
}

function textura(canvas) {
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

/* ------------------------------------------------------------ render */

const canvas = document.getElementById('gl');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(1);
renderer.setSize(W, H, false);
renderer.toneMapping = THREE.NeutralToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(30, W / H, 0.1, 120);

// Fondo: el mismo degradé navy del hero del sitio, con el halo naranja.
{
  const [c, g] = lienzo(540, 960);
  let gr = g.createRadialGradient(540 * 0.18, 960 * 0.22, 0, 540 * 0.18, 960 * 0.22, 960 * 0.62);
  gr.addColorStop(0, C.navy700); gr.addColorStop(1, C.navy900);
  g.fillStyle = gr; g.fillRect(0, 0, 540, 960);
  gr = g.createRadialGradient(470, 90, 0, 470, 90, 300);
  gr.addColorStop(0, 'rgba(255,107,53,.26)'); gr.addColorStop(1, 'rgba(255,107,53,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 540, 960);
  gr = g.createRadialGradient(40, 900, 0, 40, 900, 300);
  gr.addColorStop(0, 'rgba(255,107,53,.14)'); gr.addColorStop(1, 'rgba(255,107,53,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 540, 960);
  scene.background = textura(c);
}
scene.fog = new THREE.Fog(0x0f2338, 22, 46);

// Reflejos de estudio para los materiales con clearcoat.
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.75;

const key = new THREE.DirectionalLight(0xffffff, 1.6);
key.position.set(4, 9, 6);
key.castShadow = true;
key.shadow.mapSize.set(1024, 1024);
key.shadow.camera.left = -6; key.shadow.camera.right = 6;
key.shadow.camera.top = 6; key.shadow.camera.bottom = -6;
key.shadow.radius = 6; key.shadow.bias = -0.0006;
scene.add(key);
scene.add(new THREE.AmbientLight(0x9fb4cc, 0.35));
const rim = new THREE.PointLight(0xff6b35, 40, 18, 2);   // contraluz naranja
rim.position.set(-4.5, 2.5, -3);
scene.add(rim);

// Piso de sombras invisible: solo recibe la sombra de lo que flota encima.
const piso = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.ShadowMaterial({ opacity: 0.28 }));
piso.rotation.x = -Math.PI / 2;
piso.position.y = -3.6;
piso.receiveShadow = true;
scene.add(piso);

/* ------------------------------------------------------------ partículas */

const particulas = (() => {
  const N = 520, r = azar(7);
  const base = new Float32Array(N * 3), vel = new Float32Array(N), col = new Float32Array(N * 3);
  const naranja = new THREE.Color(C.orange), blanco = new THREE.Color('#cfdcea');
  for (let i = 0; i < N; i++) {
    base[i * 3] = (r() - 0.5) * 16;
    base[i * 3 + 1] = (r() - 0.5) * 24;
    base[i * 3 + 2] = -14 + r() * 16;
    vel[i] = 0.08 + r() * 0.22;
    const c = r() < 0.35 ? naranja : blanco;
    col.set([c.r, c.g, c.b], i * 3);
  }
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(N * 3);
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const [cv, g] = lienzo(64, 64);
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(255,255,255,.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  const mat = new THREE.PointsMaterial({ size: 0.09, map: textura(cv), vertexColors: true, transparent: true,
    opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true });
  const pts = new THREE.Points(geo, mat);
  pts.frustumCulled = false;
  scene.add(pts);
  return (t) => {
    for (let i = 0; i < N; i++) {
      pos[i * 3] = base[i * 3] + Math.sin(t * 0.35 + i) * 0.25;
      pos[i * 3 + 1] = ((base[i * 3 + 1] + t * vel[i] + 12) % 24 + 24) % 24 - 12;
      pos[i * 3 + 2] = base[i * 3 + 2];
    }
    geo.attributes.position.needsUpdate = true;
  };
})();

/* ------------------------------------------------------------ megáfono */

// El logo del sitio (viewBox 64x64) llevado a 3D: el mismo cono, las mismas tres ondas.
const L = (x, y) => new THREE.Vector2((x - 32) / 20, (32 - y) / 20);

const blancoMat = () => new THREE.MeshPhysicalMaterial({ color: 0xc8d1dc, roughness: 0.3, envMapIntensity: 0.45, metalness: 0,
  clearcoat: 1, clearcoatRoughness: 0.12, emissive: new THREE.Color(C.orange), emissiveIntensity: 0 });

function crearMegafono() {
  const g = new THREE.Group();

  const disco = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 0.34, 128),
    new THREE.MeshPhysicalMaterial({ color: 0x0b1b2d, roughness: 0.4, metalness: 0.2, clearcoat: 1, clearcoatRoughness: 0.15, envMapIntensity: 0.18 }));
  disco.rotation.x = Math.PI / 2;
  disco.castShadow = true;
  g.add(disco);

  const aro = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.045, 24, 160),
    new THREE.MeshStandardMaterial({ color: C.orange, emissive: new THREE.Color(C.orange), emissiveIntensity: 2.4, roughness: 0.4 }));
  g.add(aro);

  const forma = new THREE.Shape([L(17, 27), L(36, 17), L(36, 47), L(17, 37)]);
  const cono = new THREE.Mesh(new THREE.ExtrudeGeometry(forma, { depth: 0.26, bevelEnabled: true,
    bevelThickness: 0.07, bevelSize: 0.09, bevelSegments: 8, curveSegments: 12 }), blancoMat());
  cono.position.z = 0.2;
  cono.castShadow = true;
  g.add(cono);

  const ondas = [];
  for (const [a, b] of [[[43, 23], [50, 19]], [[44, 32], [52, 32]], [[43, 41], [50, 45]]]) {
    const p = L(...a), q = L(...b), d = q.clone().sub(p);
    const m = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, d.length(), 10, 20), blancoMat());
    m.position.set((p.x + q.x) / 2, (p.y + q.y) / 2, 0.36);
    m.rotation.z = Math.atan2(d.y, d.x) - Math.PI / 2;
    m.castShadow = true;
    g.add(m); ondas.push(m);
  }
  scene.add(g);
  return { g, ondas, cono, aro };
}
const mega = crearMegafono();

/* Anillos de "aviso": salen en ondas desde un punto, como el sonido del megáfono. */
function crearPings(n = 3) {
  const g = new THREE.Group();
  const anillos = [];
  for (let i = 0; i < n; i++) {
    const m = new THREE.Mesh(new THREE.TorusGeometry(1, 0.012, 12, 160),
      new THREE.MeshBasicMaterial({ color: C.orange, transparent: true, opacity: 0, depthWrite: false, toneMapped: false }));
    g.add(m); anillos.push(m);
  }
  scene.add(g);
  return {
    g,
    update(t, t0, r0 = 1.7, r1 = 4.2, cada = 0.45, vida = 1.6, veces = 3) {
      anillos.forEach((m, i) => {
        let best = 0, s = 1;
        for (let v = 0; v < veces; v++) {
          const ini = t0 + (i + v * n) * cada;
          const p = (t - ini) / vida;
          if (p >= 0 && p <= 1) { best = (1 - p) * 0.75; s = lerp(r0, r1, ease.out(p)); }
        }
        m.material.opacity = best;
        m.scale.setScalar(s);
        m.visible = best > 0.001;
      });
    },
  };
}
const pingMega = crearPings();
const pingCard = crearPings();

/* ------------------------------------------------------------ teléfono */

const telefono = (() => {
  const g = new THREE.Group();
  const cuerpo = new THREE.Mesh(new RoundedBoxGeometry(2.05, 4.1, 0.24, 8, 0.28),
    new THREE.MeshPhysicalMaterial({ color: 0x0a1726, roughness: 0.3, metalness: 0.6, clearcoat: 1, clearcoatRoughness: 0.15 }));
  cuerpo.castShadow = true;
  g.add(cuerpo);
  const [cv, ctx] = lienzo(440, 900);
  const tex = textura(cv);
  const pantalla = new THREE.Mesh(new THREE.PlaneGeometry(1.86, 3.8),
    new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }));
  pantalla.position.z = 0.125;
  g.add(pantalla);
  scene.add(g);

  let ultimo = -1;
  function dibujar(seg) {
    if (seg === ultimo) return; ultimo = seg;
    const g2 = ctx;
    const gr = g2.createLinearGradient(0, 0, 0, 900);
    gr.addColorStop(0, '#16324f'); gr.addColorStop(1, '#0b1a2b');
    g2.fillStyle = gr; g2.beginPath(); g2.roundRect(0, 0, 440, 900, 52); g2.fill();
    g2.textAlign = 'center';
    g2.fillStyle = '#8fa3ba'; g2.font = '600 26px Inter'; g2.fillText('Atención al cliente', 220, 170);
    g2.fillStyle = '#ffffff'; g2.font = '800 112px Inter';
    const total = 38 * 60 + 9 + seg, mm = Math.floor(total / 60), ss = String(total % 60).padStart(2, '0');
    g2.fillText(`${mm}:${ss}`, 220, 330);
    g2.fillStyle = '#cfdcea'; g2.font = '500 30px Inter';
    g2.fillText('En espera' + '.'.repeat(1 + (seg % 3)), 220, 390);
    g2.fillStyle = 'rgba(255,255,255,.08)';
    g2.beginPath(); g2.roundRect(60, 470, 320, 96, 22); g2.fill();
    g2.fillStyle = '#cfdcea'; g2.font = '500 25px Inter';
    g2.fillText('Su llamada es muy', 220, 510); g2.fillText('importante para nosotros', 220, 545);
    g2.fillStyle = '#e0433b';
    g2.beginPath(); g2.arc(220, 760, 58, 0, Math.PI * 2); g2.fill();
    g2.strokeStyle = '#fff'; g2.lineWidth = 12; g2.lineCap = 'round';
    g2.beginPath(); g2.moveTo(190, 768); g2.quadraticCurveTo(220, 742, 250, 768); g2.stroke();
    tex.needsUpdate = true;
  }
  return { g, dibujar };
})();

/* ------------------------------------------------------------ tarjetas */

const ESTADOS = {
  pendiente:   { label: 'Pendiente',   fg: '#4a5c72', bg: '#eaeef2' },
  en_proceso:  { label: 'En proceso',  fg: '#1f4166', bg: '#e3ebf5' },
  a_confirmar: { label: 'A confirmar', fg: '#b7791f', bg: '#fdf3e0' },
  resuelto:    { label: 'Resuelto',    fg: '#1e9e62', bg: '#e7f7ef' },
};

function pill(g, x, y, texto, fg, bg, size = 30, punto = true) {
  g.font = `800 ${size}px Inter`;
  const txt = texto.toUpperCase();
  g.letterSpacing = `${size * 0.04}px`;
  const w = g.measureText(txt).width + (punto ? size * 2.2 : size * 1.4);
  const h = size * 1.9;
  g.fillStyle = bg; g.beginPath(); g.roundRect(x - w, y, w, h, h / 2); g.fill();
  g.fillStyle = fg;
  if (punto) { g.beginPath(); g.arc(x - w + size * 0.95, y + h / 2, size * 0.2, 0, Math.PI * 2); g.fill(); }
  g.textAlign = 'left'; g.textBaseline = 'middle';
  g.fillText(txt, x - w + (punto ? size * 1.45 : size * 0.7), y + h / 2 + 1);
  g.letterSpacing = '0px';
  return w;
}

/* Dibuja la tarjeta de reclamo del sitio: la misma estructura que .reclamo-card. */
function dibujarReclamo(g, w, h, d) {
  g.clearRect(0, 0, w, h);
  g.fillStyle = '#ffffff'; g.beginPath(); g.roundRect(0, 0, w, h, 44); g.fill();
  g.textBaseline = 'alphabetic'; g.textAlign = 'left';
  // empresa
  g.fillStyle = C.navy800; g.beginPath(); g.roundRect(64, 58, 72, 72, 16); g.fill();
  g.fillStyle = '#fff'; g.font = '800 40px Inter'; g.textAlign = 'center';
  g.fillText(d.inicial, 100, 108);
  g.textAlign = 'left'; g.fillStyle = C.text; g.font = '600 36px Inter';
  g.fillText(d.empresa, 158, 106);
  // estado
  const e = ESTADOS[d.estado];
  pill(g, w - 64, 60, e.label, e.fg, e.bg, 27);
  // título
  g.textBaseline = 'alphabetic'; g.textAlign = 'left';
  g.fillStyle = C.text; g.font = '800 58px Inter'; g.letterSpacing = '-1.2px';
  d.titulo.forEach((l, i) => g.fillText(l, 64, 238 + i * 70));
  g.letterSpacing = '0px';
  g.fillStyle = C.text2; g.font = '500 33px Inter';
  (d.extracto || []).forEach((l, i) => g.fillText(l, 64, 238 + d.titulo.length * 70 + 22 + i * 46));
  // pie
  g.font = '700 26px Inter';
  const cw = g.measureText(d.categoria).width + 44;
  g.fillStyle = C.bg; g.beginPath(); g.roundRect(64, h - 112, cw, 58, 29); g.fill();
  g.fillStyle = C.text2; g.textBaseline = 'middle'; g.fillText(d.categoria, 86, h - 82);
  g.textAlign = 'right'; g.fillStyle = C.muted; g.font = '800 24px Inter'; g.letterSpacing = '3px';
  g.fillText('EJEMPLO', w - 64, h - 82);
  g.letterSpacing = '0px'; g.textAlign = 'left'; g.textBaseline = 'alphabetic';
}

function crearTarjeta(ancho, alto, pxW, pxH) {
  const g = new THREE.Group();
  const caja = new THREE.Mesh(new RoundedBoxGeometry(ancho, alto, 0.09, 6, 0.13),
    new THREE.MeshPhysicalMaterial({ color: 0xdfe5ec, roughness: 0.45, clearcoat: 0.4, clearcoatRoughness: 0.3, envMapIntensity: 0.5 }));
  caja.castShadow = true;
  g.add(caja);
  const [cv, ctx] = lienzo(pxW, pxH);
  const tex = textura(cv);
  const cara = new THREE.Mesh(new THREE.PlaneGeometry(ancho, alto),
    new THREE.MeshBasicMaterial({ map: tex, color: 0xeeeeee, transparent: true, toneMapped: false }));
  cara.position.z = 0.047;
  g.add(cara);
  scene.add(g);
  return { g, ctx, tex, cv, caja, cara };
}

// La tarjeta protagonista. Empresa genérica y cartel "Ejemplo": la cuenta oficial
// nunca acusa a una empresa con nombre propio (ver IDENTIDAD-VISUAL.md).
const card = crearTarjeta(3.7, 2.4, 1100, 714);
const RECLAMO = {
  inicial: 'T', empresa: 'Tu proveedor de internet', categoria: 'Telecomunicaciones',
  titulo: ['Di de baja el servicio y', 'me lo siguen cobrando'],
  extracto: ['Pedí la baja el 3 de agosto. En septiembre', 'me volvió a llegar la factura.'],
};
let estadoDibujado = '';
function estadoEn(t) {
  if (t < 15.0) return 'pendiente';
  if (t < 17.6) return 'en_proceso';
  if (t < 19.9) return 'a_confirmar';
  return 'resuelto';
}

// La respuesta pública de la empresa.
const resp = crearTarjeta(3.3, 1.42, 990, 426);
{
  const g = resp.ctx, w = 990, h = 426;
  g.fillStyle = '#ffffff'; g.beginPath(); g.roundRect(0, 0, w, h, 40); g.fill();
  g.fillStyle = C.orange; g.beginPath(); g.roundRect(0, 0, 14, h, [40, 0, 0, 40]); g.fill();
  g.fillStyle = C.navy800; g.beginPath(); g.roundRect(56, 52, 60, 60, 14); g.fill();
  g.fillStyle = '#fff'; g.font = '800 34px Inter'; g.textAlign = 'center'; g.fillText('T', 86, 94);
  g.textAlign = 'left'; g.fillStyle = C.muted; g.font = '800 24px Inter'; g.letterSpacing = '2.5px';
  g.fillText('RESPUESTA PÚBLICA DE LA EMPRESA', 136, 92);
  g.letterSpacing = '0px'; g.fillStyle = C.text; g.font = '600 38px Inter';
  g.fillText('Ya procesamos la baja. El reintegro', 56, 196);
  g.fillText('impacta en tu próxima factura.', 56, 246);
  g.fillStyle = C.text2; g.font = '500 28px Inter';
  g.fillText('Hace 2 horas', 56, 340);
  resp.tex.needsUpdate = true;
}

/* ------------------------------------------------------------ tilde y confeti */

const tilde = (() => {
  const g = new THREE.Group();
  const verde = new THREE.MeshPhysicalMaterial({ color: '#1e9e62', emissive: new THREE.Color('#1e9e62'),
    emissiveIntensity: 0.9, roughness: 0.25, clearcoat: 1 });
  const disco = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.22, 64), verde);
  disco.rotation.x = Math.PI / 2; disco.castShadow = true;
  g.add(disco);
  const aro = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.035, 16, 96),
    new THREE.MeshBasicMaterial({ color: '#7dffc0', toneMapped: false }));
  g.add(aro);
  const blanco = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.2, clearcoat: 1 });
  const seg = (a, b) => {
    const d = b.clone().sub(a);
    const m = new THREE.Mesh(new THREE.CapsuleGeometry(0.075, d.length(), 8, 16), blanco);
    m.position.set((a.x + b.x) / 2, (a.y + b.y) / 2, 0.16);
    m.rotation.z = Math.atan2(d.y, d.x) - Math.PI / 2;
    g.add(m);
  };
  seg(new THREE.Vector2(-0.28, 0.0), new THREE.Vector2(-0.07, -0.21));
  seg(new THREE.Vector2(-0.07, -0.21), new THREE.Vector2(0.3, 0.2));
  scene.add(g);
  return g;
})();

const confeti = (() => {
  const N = 220, r = azar(42);
  const geo = new THREE.PlaneGeometry(0.075, 0.13);
  const mat = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, toneMapped: false });
  const m = new THREE.InstancedMesh(geo, mat, N);
  const paleta = [C.orange, '#ffffff', '#1e9e62', '#ffb08f', '#cfdcea'].map((c) => new THREE.Color(c));
  const datos = [];
  for (let i = 0; i < N; i++) {
    const ang = r() * Math.PI * 2, vel = 2.2 + r() * 4.2, elev = r() * 0.9 + 0.2;
    datos.push({ v: new THREE.Vector3(Math.cos(ang) * vel * 0.8, Math.sin(elev) * vel * 1.05 + 1.2, (r() - 0.3) * vel * 0.9),
      spin: new THREE.Vector3(r() * 9, r() * 9, r() * 9), delay: r() * 0.12 });
    m.setColorAt(i, paleta[Math.floor(r() * paleta.length)]);
  }
  m.frustumCulled = false;
  scene.add(m);
  const o = new THREE.Object3D();
  return (t, t0, origen) => {
    for (let i = 0; i < N; i++) {
      const d = datos[i], dt = t - t0 - d.delay;
      if (dt < 0 || dt > 3.6) { o.scale.setScalar(0); }
      else {
        const drag = 1 - Math.exp(-dt * 1.6);
        o.position.set(origen.x + d.v.x * drag / 1.6, origen.y + d.v.y * drag / 1.6 - 1.6 * dt * dt * 0.5, origen.z + d.v.z * drag / 1.6);
        o.rotation.set(d.spin.x * dt, d.spin.y * dt, d.spin.z * dt);
        o.scale.setScalar(dt > 2.8 ? 1 - (dt - 2.8) / 0.8 : 1);
      }
      o.updateMatrix(); m.setMatrixAt(i, o.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  };
})();

/* ------------------------------------------------------------ pared de reclamos */

const VARIANTES = [
  { inicial: 'B', empresa: 'Tu banco', categoria: 'Bancos y Finanzas', estado: 'resuelto', titulo: ['Me cobraron dos veces', 'el mismo consumo'] },
  { inicial: 'T', empresa: 'Tienda online', categoria: 'E-commerce', estado: 'en_proceso', titulo: ['El pedido nunca', 'llegó a mi casa'] },
  { inicial: 'S', empresa: 'Service técnico', categoria: 'Electrodomésticos', estado: 'pendiente', titulo: ['La heladera volvió', 'del service igual'] },
  { inicial: 'A', empresa: 'Aerolínea', categoria: 'Turismo y Pasajes', estado: 'resuelto', titulo: ['Me cancelaron el vuelo', 'sin ningún aviso'] },
  { inicial: 'D', empresa: 'Distribuidora', categoria: 'Servicios Públicos', estado: 'en_proceso', titulo: ['Tres cortes de luz', 'en una semana'] },
  { inicial: 'R', empresa: 'Tienda de ropa', categoria: 'Indumentaria', estado: 'a_confirmar', titulo: ['Nunca me reintegraron', 'la devolución'] },
];

const pared = (() => {
  const grupos = [];
  const r = azar(99);
  const geo = new THREE.PlaneGeometry(3.7, 2.4);
  const slots = [];
  for (let fila = 0; fila < 9; fila++) for (let col = 0; col < 4; col++) {
    const x = (col - 1.5) * 4.3 + (fila % 2 ? 1.0 : -1.0);
    const y = (fila - 4) * 2.95;
    if (Math.abs(x) < 2.6 && Math.abs(y) < 1.6) continue;     // el hueco de la protagonista
    slots.push({ x, y, z: -1.2 - r() * 4.5, ry: (r() - 0.5) * 0.25, rx: (r() - 0.5) * 0.15, fase: r() * 6, delay: r() * 1.0 });
  }
  VARIANTES.forEach((v, vi) => {
    const [cv, ctx] = lienzo(1100, 714);
    dibujarReclamo(ctx, 1100, 714, v);
    const mat = new THREE.MeshBasicMaterial({ map: textura(cv), color: 0xe6e6e6, transparent: true, opacity: 0, toneMapped: false, depthWrite: false });
    const mine = slots.filter((_, i) => i % VARIANTES.length === vi);
    const m = new THREE.InstancedMesh(geo, mat, mine.length);
    m.frustumCulled = false;
    scene.add(m);
    grupos.push({ m, mat, mine });
  });
  const o = new THREE.Object3D();
  return (t) => {
    for (const g of grupos) {
      let vis = 0;
      g.mine.forEach((s, i) => {
        const p = ease.out(k(t, 23.4 + s.delay, 25.0 + s.delay));
        const fuera = k(t, 27.4, 28.4);
        o.position.set(s.x, s.y + Math.sin(t * 0.6 + s.fase) * 0.08, s.z - (1 - p) * 6 - fuera * 4);
        o.rotation.set(s.rx, s.ry, 0);
        o.scale.setScalar(0.92);
        o.updateMatrix(); g.m.setMatrixAt(i, o.matrix);
        vis = Math.max(vis, p);
      });
      g.m.instanceMatrix.needsUpdate = true;
      g.mat.opacity = clamp(k(t, 23.3, 24.6)) * (1 - k(t, 27.4, 28.3)) * 0.92;
      g.m.visible = g.mat.opacity > 0.002;
    }
  };
})();

/* ------------------------------------------------------------ post-proceso */

const rt = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 4 });
const composer = new EffectComposer(renderer, rt);
composer.setPixelRatio(1);
composer.setSize(W, H);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(W / 2, H / 2), 0.7, 0.6, 1.0);
composer.addPass(bloom);
composer.addPass(new OutputPass());

// Grano, viñeta y una aberración cromática mínima en los bordes. El grano usa
// el tiempo como semilla: cambia en cada cuadro pero es reproducible.
const grade = new ShaderPass({
  uniforms: { tDiffuse: { value: null }, uTime: { value: 0 } },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
  fragmentShader: `
    uniform sampler2D tDiffuse; uniform float uTime; varying vec2 vUv;
    float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233)) + uTime*43.17) * 43758.5453); }
    void main(){
      vec2 c = vUv - 0.5;
      float d = dot(c, c);
      vec2 off = c * d * 0.004;
      vec3 col;
      col.r = texture2D(tDiffuse, vUv + off).r;
      col.g = texture2D(tDiffuse, vUv).g;
      col.b = texture2D(tDiffuse, vUv - off).b;
      col *= mix(1.0, 0.72, smoothstep(0.08, 0.55, d * 1.6));
      col += (hash(vUv * vec2(1080., 1920.)) - 0.5) * 0.035;
      gl_FragColor = vec4(col, 1.0);
    }`,
});
composer.addPass(grade);

/* ------------------------------------------------------------ texto HTML */

const capas = [...document.querySelectorAll('.capa')].map((el) => ({
  el, ini: +el.dataset.ini, fin: +el.dataset.fin,
  items: [...el.querySelectorAll('[data-a]')].map((n) => ({ n, a: n.dataset.a, at: +n.dataset.at })),
}));
const bug = document.getElementById('bug');
const velo = document.getElementById('velo');
const barra = document.querySelector('#prog i');

function texto(t) {
  for (const c of capas) {
    const dentro = t >= c.ini - 0.01 && t < c.fin + 0.45;
    if (!dentro) { c.el.style.opacity = 0; continue; }
    // entra de golpe (cada línea anima sola) y sale con un fundido corto
    const salida = c.fin >= 99 ? 0 : k(t, c.fin - 0.05, c.fin + 0.4);
    c.el.style.opacity = (1 - salida).toFixed(3);
    c.el.style.transform = `translate3d(0,${(-salida * 40).toFixed(1)}px,0)`;
    for (const it of c.items) {
      const p = k(t, it.at, it.at + (it.a === 'linea' ? 0.62 : 0.55));
      const o = ease.out(p);
      if (it.a === 'linea') {
        it.n.style.transform = `translate3d(0,${((1 - o) * 118).toFixed(2)}%,0)`;
        it.n.style.opacity = clamp(p * 3).toFixed(3);
      } else {
        it.n.style.transform = `translate3d(0,${((1 - o) * 30).toFixed(2)}px,0)`;
        it.n.style.opacity = clamp(p * 1.7).toFixed(3);
      }
    }
  }
  velo.style.opacity = (k(t, 23.2, 24.0) * (1 - k(t, 27.4, 28.0))).toFixed(3);
  const fb = k(t, 27.5, 28.0);
  const sinBug = k(t, 23.2, 23.7) * (1 - k(t, 27.0, 27.5));
  bug.style.opacity = (k(t, 0.3, 0.8) * (1 - fb) * (1 - sinBug)).toFixed(3);
  barra.style.transform = `scaleX(${clamp(t / DURACION).toFixed(4)})`;
}

/* ------------------------------------------------------------ coreografía */

const FOCO_Y = -1.15;   // el 3D vive en el medio-abajo de la pantalla; arriba va el texto
const tmp = new THREE.Vector3();

function seek(t) {
  /* cámara: respira siempre un poco, y cada escena tiene su movimiento */
  let camZ = 14, camX = 0, camY = 0.4;
  camZ -= ease.inOut(k(t, 0, 4.2)) * 1.2;                         // se acerca al teléfono
  camZ += ease.inOut(k(t, 4.0, 5.2)) * 1.2;
  camX += Math.sin(t * 0.37) * 0.25; camY += Math.sin(t * 0.29) * 0.15;
  camZ += ease.inOut(k(t, 23.3, 25.6)) * 9.5;                      // se aleja: aparece la pared
  camY += ease.inOut(k(t, 23.3, 25.6)) * 1.2;
  camZ -= ease.inOut(k(t, 27.3, 28.6)) * 10.5;                     // vuelve para el cierre
  camY -= ease.inOut(k(t, 27.3, 28.6)) * 1.2;
  camera.position.set(camX, camY, camZ);
  camera.lookAt(camX * 0.4, FOCO_Y + 1.15 + camY * 0.3, 0);
  camera.updateProjectionMatrix();

  particulas(t);

  /* 1 · teléfono en espera (0 – 4.2) */
  {
    const entra = ease.out(k(t, 0, 1.0));
    const sale = ease.in(k(t, 3.5, 4.4));
    const g = telefono.g;
    g.visible = t < 4.5;
    g.position.set(0, -0.6 + (1 - entra) * -2.5 + Math.sin(t * 1.4) * 0.06 - sale * 6, -sale * 3);
    g.rotation.set(-0.12 + Math.sin(t * 0.9) * 0.03, -0.42 + t * 0.09 + sale * 1.4, 0.06 - sale * 0.6);
    // vibra un instante con "Nadie te llamó"
    if (t > 2.0 && t < 2.5) g.position.x += Math.sin(t * 90) * 0.035 * (1 - k(t, 2.0, 2.5));
    g.scale.setScalar(lerp(0.68, 0.8, entra));
    telefono.dibujar(Math.floor(t));
  }

  /* 2 · el megáfono (entra 4.2, se va 8.9, vuelve en el cierre 27.6) */
  {
    const g = mega.g;
    const entra = ease.out(k(t, 4.2, 5.5));
    const sale = ease.in(k(t, 8.5, 9.3));
    const vuelve = ease.out(k(t, 27.7, 29.0));
    const enEsc2 = t < 9.4;
    g.visible = (t > 4.15 && enEsc2) || t > 27.6;
    if (enEsc2) {
      g.position.set(0, -0.6 + (1 - entra) * -1.2 + sale * 7, lerp(-14, 0, entra));
      g.rotation.set(-0.15 + Math.sin(t * 0.8) * 0.05, (1 - entra) * -Math.PI * 1.6 + Math.sin(t * 0.7) * 0.22, 0);
      g.scale.setScalar(0.74);
    } else {
      g.position.set(0, -0.5 + Math.sin(t * 1.2) * 0.05, lerp(-12, 0, vuelve));
      g.rotation.set(-0.12, (1 - vuelve) * Math.PI * 1.5 + Math.sin(t * 0.8) * 0.2, 0);
      g.scale.setScalar(0.82);
    }
    // las ondas se encienden en naranja, una detrás de otra, como un sonido
    mega.ondas.forEach((o, i) => {
      const base = enEsc2 ? 5.2 : 28.4;
      const pulso = Math.max(0, Math.sin((t - base) * 4.2 - i * 0.9));
      o.material.emissiveIntensity = t > base ? pulso * 1.6 : 0;
    });
    mega.aro.material.emissiveIntensity = 1.6 + Math.sin(t * 3) * 0.6;
    pingMega.g.position.copy(g.position);
    pingMega.g.rotation.copy(g.rotation);
    pingMega.g.scale.setScalar(g.scale.x);
    if (enEsc2) pingMega.update(t, 5.3, 1.7, 2.6); else pingMega.update(t, 28.6, 1.7, 2.15, 0.45, 1.6, 2);
  }

  /* 3-6 · la tarjeta de reclamo */
  {
    const g = card.g;
    const entra = ease.out(k(t, 8.7, 10.0));
    g.visible = t > 8.6 && t < 28.4;
    const e = estadoEn(t);
    if (e !== estadoDibujado) {
      dibujarReclamo(card.ctx, 1100, 714, { ...RECLAMO, estado: e });
      card.tex.needsUpdate = true; estadoDibujado = e;
    }
    // salto cada vez que cambia el estado
    let salto = 0;
    for (const tc of [15.0, 17.6, 19.9]) { const p = k(t, tc, tc + 0.45); if (p > 0 && p < 1) salto = Math.max(salto, Math.sin(p * Math.PI) * 0.06); }

    const sube = ease.inOut(k(t, 14.3, 15.2));                // deja lugar a la respuesta
    const pared = ease.inOut(k(t, 23.3, 25.4));               // se suma a la pared
    const vaAtras = ease.in(k(t, 27.3, 28.3));
    const x = 0, y = -0.3 + (1 - entra) * -5 + sube * 0.42 - pared * 0.42 + Math.sin(t * 1.1) * 0.04;
    g.position.set(x, y, lerp(-6, 0, entra) - vaAtras * 6);
    g.rotation.set(lerp(-0.9, -0.08, entra) + Math.sin(t * 0.7) * 0.03,
      lerp(0.9, -0.16, entra) + Math.sin(t * 0.5) * 0.06 + pared * 0.16,
      lerp(-0.35, 0, entra));
    g.scale.setScalar((1 + salto) * 0.85 * lerp(1, 0.92, pared));

    // aviso a la empresa: ondas desde la tarjeta
    pingCard.g.position.set(g.position.x, g.position.y, g.position.z - 0.1);
    pingCard.g.rotation.copy(g.rotation);
    pingCard.g.scale.set(1.06, 0.7, 1);
    pingCard.update(t, 13.9, 1.6, 3.0, 0.32, 1.25, 2);
  }

  /* respuesta pública de la empresa (15.0 – 23.4) */
  {
    const g = resp.g;
    const entra = ease.out(k(t, 15.4, 16.6));
    const sale = ease.in(k(t, 22.8, 23.6));
    g.visible = t > 15.3 && t < 23.7;
    const c = card.g.position;
    g.position.set(c.x + (1 - entra) * 6 + sale * -0.2, c.y - 1.72 - sale * 0.3, c.z + 0.35 - sale * 2);
    g.rotation.set(-0.06, -0.22 + (1 - entra) * 0.8, (1 - entra) * -0.2);
    g.scale.setScalar(0.85 * (1 - sale * 0.4));
    resp.cara.material.opacity = 1 - sale;
    resp.caja.material.transparent = sale > 0; resp.caja.material.opacity = 1 - sale;
  }

  /* 5 · tilde verde y confeti (19.9) */
  {
    const p = k(t, 19.9, 20.6);
    const sale = ease.in(k(t, 23.0, 23.6));
    tilde.visible = t > 19.85 && t < 23.7;
    const c = card.g.position;
    tilde.position.set(c.x + 1.25, c.y + 0.82, c.z + 0.6);
    tilde.scale.setScalar(Math.max(0.001, ease.back(p) * 0.72 * (1 - sale)));
    tilde.rotation.set(0.1, (1 - ease.out(p)) * Math.PI * 2 + Math.sin(t * 1.3) * 0.2, 0);
    confeti(t, 19.95, tmp.set(c.x + 1.2, c.y + 0.8, c.z + 0.8));
  }

  /* 6 · la pared de reclamos */
  pared(t);
  piso.visible = t < 23.3 || t > 28.4;
  const niebla = ease.inOut(k(t, 23.3, 25.0)) * (1 - k(t, 27.3, 28.4));
  scene.fog.near = lerp(22, 17, niebla); scene.fog.far = lerp(46, 36, niebla);

  // la contraluz acompaña al protagonista de cada escena
  rim.intensity = 40 + Math.sin(t * 0.8) * 8;

  texto(t);
  grade.uniforms.uTime.value = (Math.round(t * 30) % 97) * 0.731;
  composer.render();
}

window.seek = seek;
window.DURACION = DURACION;

dibujarReclamo(card.ctx, 1100, 714, { ...RECLAMO, estado: 'pendiente' });
card.tex.needsUpdate = true;
seek(0);
window.LISTO = true;
