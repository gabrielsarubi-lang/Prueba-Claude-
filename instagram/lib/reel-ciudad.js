'use strict';

/**
 * "Buenos Aires escribe" — motion graphics sobre el mapa real de la ciudad.
 *
 * Por qué un mapa y no más burbujas de chat: una burbuja cuenta UNA consulta.
 * El problema que vendemos no es una consulta, es el volumen y la dispersión —
 * que te escriben de todos lados y a cualquier hora, y que vos no podés estar.
 * Eso no se dibuja con una conversación; se dibuja con un territorio que se
 * enciende en ocho lugares a la vez.
 *
 * Y por qué claro: las otras piezas son oscuras, y sobre fondo oscuro el brillo
 * hace el trabajo de separar los planos. Acá no hay brillo, así que lo hacen la
 * sombra y el blanco de las tarjetas. Es otra disciplina, no el mismo diseño
 * con los colores dados vuelta.
 *
 * La geometría sale de caba.json (datos abiertos del Gobierno de la Ciudad).
 * Los tiempos viven acá y no en el JSON porque están atados entre sí.
 */

const CABA = require('./caba.json');

const DURACION = 20.0;

// El acto 3 cierra en el segundo 15 justo: si se sube como historia, el corte
// de Instagram cae entre el problema y la respuesta, y los dos tramos se
// entienden solos.
const T = {
  borde:    [0.35, 3.00],
  relleno:  [1.55, 3.10],
  barrios:  [2.05, 3.55],
  titulos:  [[0.95, 4.40], [5.05, 10.30], [10.95, 14.80]],
  pin0:     4.55, pinCada: 0.50,
  cuenta1:  [5.20, 10.10],
  hub:      [10.70, 11.45],
  arco0:    11.05, arcoCada: 0.22, arcoViaje: 1.30,
  cuenta2:  [11.90, 14.60],
  salida:   [14.90, 15.80],
  cierre:   [15.45, 16.60],
  cta:      [16.80, 17.40]
};

const MAPA_ANCHO = 780;
const ESCALA = MAPA_ANCHO / CABA.ancho;
const MAPA_ALTO = Math.round(CABA.alto * ESCALA);

// Donde convergen todos los arcos. Cae sobre Caballito, que es el centro
// geográfico de la ciudad: no es una posición elegida por conveniencia visual.
const HUB = [492, 470];

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function texto(s) {
  return esc(s)
    .replace(/\*([^*]+)\*/g, '<span class="ac">$1</span>')
    .replace(/\n/g, '<br>');
}

function centroDe(nombre) {
  const b = CABA.barrios.find((x) => x.nombre === nombre);
  if (!b) throw new Error('El barrio "' + nombre + '" no está en caba.json.');
  return b.centro;
}

/* Arco de un pin al hub. La curva se comba siempre para el mismo lado — el
   control sale perpendicular a la recta, con un signo fijo — así los ocho
   arcos giran juntos en vez de parecer ocho rayas sueltas. */
function arco(desde, hasta) {
  const dx = hasta[0] - desde[0], dy = hasta[1] - desde[1];
  const largo = Math.hypot(dx, dy) || 1;
  const mx = (desde[0] + hasta[0]) / 2, my = (desde[1] + hasta[1]) / 2;
  const k = largo * 0.17;
  const cx = mx + (-dy / largo) * k, cy = my + (dx / largo) * k;
  return 'M ' + desde[0].toFixed(1) + ' ' + desde[1].toFixed(1) +
         ' Q ' + cx.toFixed(1) + ' ' + cy.toFixed(1) +
         ' ' + hasta[0].toFixed(1) + ' ' + hasta[1].toFixed(1);
}

function documento(g, marca) {
  const c = marca.colores;
  const tp = marca.tipografia;
  const m = marca.medidas.historia;

  const firma = `${esc(marca.nombre.slice(0, marca.nombre_corte))}<span>${esc(marca.nombre.slice(marca.nombre_corte))}</span>`;

  const pines = g.pines.map((p) => {
    const ct = centroDe(p.barrio);
    return { nombre: p.barrio, hora: p.hora, x: ct[0], y: ct[1], d: p.desvio || [0, 0] };
  });

  const sendasBarrios = CABA.barrios
    .map((b) => `<path d="${b.d}"/>`).join('');

  const sendasArcos = pines
    .map((p, i) => `<path class="arco" data-i="${i}" d="${arco([p.x, p.y], HUB)}"/>`).join('');

  const viajeros = pines
    .map((_, i) => `<circle class="viajero" data-i="${i}" r="11"/>`).join('');

  const marcasPin = pines.map((p, i) => `
    <div class="pin" data-i="${i}" style="left:${(p.x * ESCALA).toFixed(1)}px;top:${(p.y * ESCALA).toFixed(1)}px">
      <span class="aro"></span>
      <span class="bolita"></span>
      <span class="chapa" style="transform:translate(-50%,-100%) translate(${p.d[0]}px,${p.d[1]}px)">
        <b>${esc(p.hora)}</b><i>${esc(p.nombre)}</i>
      </span>
    </div>`).join('');

  const titulares = g.titulares
    .map((t, i) => `<h1 class="tit" data-i="${i}">${texto(t)}</h1>`).join('');

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Reel — ${esc(g.archivo)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=${encodeURIComponent(tp.familia)}:wght@${tp.pesos}&display=swap" rel="stylesheet">
<style>
  *{box-sizing:border-box;margin:0;padding:0;}
  body{background:#000;}

  .placa{
    width:${m.ancho}px;height:${m.alto}px;position:relative;overflow:hidden;
    padding:${m.margen_arriba}px ${m.margen}px ${m.margen_abajo}px;
    display:flex;flex-direction:column;
    font-family:'${tp.familia}',${tp.respaldo};
    -webkit-font-smoothing:antialiased;
    background:#FAFBFC;color:${c.texto};
  }

  /* El fondo claro no puede ser blanco liso: queda plano y se nota que es una
     plantilla. Una trama muy tenue y un brillo verde apenas visible le dan
     profundidad sin ensuciar el blanco de las tarjetas. */
  .trama{
    position:absolute;left:-80px;top:-80px;width:calc(100% + 160px);height:calc(100% + 160px);
    background-image:radial-gradient(rgba(16,20,28,.05) 1.6px, transparent 1.6px);
    background-size:46px 46px;will-change:transform;
  }
  .brillo{
    position:absolute;left:50%;top:56%;width:1320px;height:1320px;
    transform:translate(-50%,-50%);pointer-events:none;will-change:transform,opacity;
    background:radial-gradient(circle,rgba(14,158,122,.13) 0%,rgba(14,158,122,0) 62%);
  }

  .cabeza,.titulares,.lienzo-caja,.contador,.pie,.cierre{position:relative;z-index:3;}

  .cabeza{display:flex;align-items:center;gap:18px;}
  .eyebrow{
    font-size:23px;font-weight:600;letter-spacing:.15em;text-transform:uppercase;
    color:${c.verde_fuerte};white-space:nowrap;
  }
  .raya{flex:1;height:1px;background:${c.linea};transform-origin:left center;}

  /* --------------------------------------------------------- los titulares */
  .titulares{margin-top:44px;height:136px;}
  .tit{
    position:absolute;left:0;top:0;right:0;
    font-size:60px;font-weight:700;line-height:1.12;letter-spacing:-.022em;
    color:${c.texto};will-change:opacity,transform;
  }
  .tit .ac{color:${c.verde};}

  /* ------------------------------------------------------------- el mapa */
  .lienzo-caja{
    margin:30px auto 0;width:${MAPA_ANCHO}px;height:${MAPA_ALTO}px;position:relative;
    will-change:transform,opacity;
  }
  svg.lienzo{position:absolute;inset:0;width:100%;height:100%;overflow:visible;}

  .relleno{fill:#E7F4EF;}
  .barrios path{fill:none;stroke:rgba(11,127,98,.22);stroke-width:1.1;}
  .borde{
    fill:none;stroke:${c.verde_fuerte};stroke-width:3.4;
    stroke-linejoin:round;stroke-linecap:round;
  }
  .arco{
    fill:none;stroke:${c.verde_fuerte};stroke-width:6;stroke-linecap:round;opacity:0;
  }
  .viajero{fill:${c.verde_fuerte};stroke:#FAFBFC;stroke-width:4;opacity:0;}

  /* ------------------------------------------------------------- los pines */
  .pin{position:absolute;width:0;height:0;}
  .aro,.bolita{
    position:absolute;left:0;top:0;border-radius:50%;
    transform:translate(-50%,-50%);will-change:transform,opacity;
  }
  .aro{width:30px;height:30px;border:3px solid ${c.verde};opacity:0;}
  .bolita{
    width:17px;height:17px;background:${c.verde_fuerte};
    box-shadow:0 0 0 5px #FAFBFC;
  }
  /* La chapa es una tarjeta, no texto suelto: sobre un mapa con relleno el
     texto plano se pierde, y la sombra es lo único que lo despega. */
  .chapa{
    position:absolute;left:0;top:-22px;display:block;white-space:nowrap;
    padding:9px 15px 10px;border-radius:12px;background:#fff;
    border:1px solid ${c.linea};
    box-shadow:0 2px 4px rgba(16,20,28,.05),0 10px 26px rgba(16,20,28,.10);
    will-change:transform,opacity;
  }
  .chapa b{
    display:block;font-size:27px;font-weight:700;line-height:1;letter-spacing:-.01em;
    font-variant-numeric:tabular-nums;color:${c.texto};
  }
  .chapa i{
    display:block;margin-top:4px;font-style:normal;
    font-size:16px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;
    color:${c.apagado};
  }
  .pin.listo .chapa b{color:${c.verde_fuerte};}

  /* --------------------------------------------------------------- el hub */
  .hub{
    position:absolute;left:${(HUB[0] * ESCALA).toFixed(1)}px;top:${(HUB[1] * ESCALA).toFixed(1)}px;
    transform:translate(-50%,-50%);width:268px;
    padding:20px 22px;border-radius:20px;background:#fff;
    border:1px solid ${c.linea};
    box-shadow:0 3px 6px rgba(16,20,28,.06),0 18px 44px rgba(16,20,28,.14);
    opacity:0;will-change:transform,opacity;
  }
  .hub .tag{
    font-size:16px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;
    color:${c.verde_fuerte};
  }
  .hub .nom{margin-top:7px;font-size:25px;font-weight:600;color:${c.texto};}
  .hub .est{
    margin-top:12px;display:flex;align-items:center;gap:9px;
    font-size:18px;font-weight:500;color:${c.apagado};
  }
  .hub .led{
    width:11px;height:11px;border-radius:50%;background:${c.verde};
    box-shadow:0 0 0 0 rgba(14,158,122,.45);will-change:box-shadow;
  }
  /* El pulso sale del hub hacia afuera cuando le llega un mensaje. */
  .pulso{
    position:absolute;left:${(HUB[0] * ESCALA).toFixed(1)}px;top:${(HUB[1] * ESCALA).toFixed(1)}px;
    width:40px;height:40px;margin:-20px 0 0 -20px;border-radius:50%;
    border:3px solid ${c.verde};opacity:0;will-change:transform,opacity;
  }

  /* ---------------------------------------------------------- el contador */
  .contador{
    margin-top:26px;padding:18px 26px;border-radius:18px;background:#fff;
    border:1px solid ${c.linea};
    box-shadow:0 2px 4px rgba(16,20,28,.04),0 12px 30px rgba(16,20,28,.07);
    display:flex;align-items:center;gap:22px;opacity:0;will-change:opacity;
  }
  .c-texto{flex:1;min-width:0;position:relative;height:60px;}
  .c-rot{
    position:absolute;left:0;top:0;right:0;
    font-size:21px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;
    color:${c.apagado};will-change:opacity,transform;
  }
  .c-barra{
    position:absolute;left:0;bottom:4px;width:100%;height:7px;border-radius:4px;
    background:${c.linea};overflow:hidden;
  }
  .c-barra i{
    display:block;height:100%;border-radius:4px;background:${c.verde};
    transform-origin:left center;transform:scaleX(0);will-change:transform;
  }
  .c-num{
    font-size:62px;font-weight:700;line-height:1;letter-spacing:-.03em;
    font-variant-numeric:tabular-nums;color:${c.texto};will-change:color;
  }

  /* ---------------------------------------------------------- el cierre */
  .cierre{
    position:absolute;left:${m.margen}px;right:${m.margen}px;top:50%;
    transform:translateY(-50%);opacity:0;z-index:5;
  }
  .cierre h2{
    font-size:86px;font-weight:700;line-height:1.08;letter-spacing:-.03em;color:${c.texto};
  }
  .cierre h2 .ac{color:${c.verde};}
  .mascara{overflow:hidden;}
  .mascara > span{display:block;will-change:transform;}
  .cta{
    display:inline-block;margin-top:42px;padding:20px 32px;border-radius:999px;
    background:${c.verde};color:#fff;font-size:30px;font-weight:600;letter-spacing:.01em;
    box-shadow:0 8px 26px rgba(14,158,122,.32);opacity:0;will-change:opacity,transform;
  }

  .pie{
    margin-top:auto;padding-top:30px;
    display:flex;align-items:center;justify-content:space-between;gap:24px;
  }
  .mark{font-size:33px;font-weight:700;color:${c.texto};}
  .mark span{color:${c.verde};}
  .sitio{font-size:25px;font-weight:500;color:${c.apagado};}
</style>
</head>
<body>
<div class="placa">
  <div class="trama"></div>
  <div class="brillo"></div>

  <div class="cabeza">
    <span class="eyebrow">${esc(g.eyebrow)}</span>
    <span class="raya"></span>
  </div>

  <div class="titulares">${titulares}</div>

  <div class="lienzo-caja">
    <svg class="lienzo" viewBox="${CABA.viewBox}" preserveAspectRatio="xMidYMid meet">
      <path class="relleno" d="${CABA.contorno}"/>
      <g class="barrios">${sendasBarrios}</g>
      <path class="borde" d="${CABA.contorno}"/>
      <g class="arcos">${sendasArcos}</g>
      <g class="viajeros">${viajeros}</g>
    </svg>
    ${marcasPin}
    <span class="pulso"></span>
    <div class="hub">
      <div class="tag">${esc(g.hub.tag)}</div>
      <div class="nom">${esc(g.hub.nombre)}</div>
      <div class="est"><span class="led"></span>${esc(g.hub.estado)}</div>
    </div>
  </div>

  <div class="contador">
    <div class="c-texto">
      <span class="c-rot" data-i="0">${esc(g.contador.problema)}</span>
      <span class="c-rot" data-i="1">${esc(g.contador.solucion)}</span>
      <span class="c-barra"><i></i></span>
    </div>
    <span class="c-num">0</span>
  </div>

  <div class="cierre">
    <h2>${texto(g.cierre.titulo)}</h2>
    <span class="cta">${esc(g.cierre.cta)}</span>
  </div>

  <div class="pie">
    <span class="mark">${firma}</span>
    <span class="sitio">${esc(marca.sitio)}</span>
  </div>
</div>

<script>
const T = ${JSON.stringify(T)};
const DUR = ${DURACION};
const TOTAL = ${Number(g.contador.total)};
const N = ${pines.length};

const paso  = (t,a,b) => b <= a ? (t >= b ? 1 : 0) : Math.max(0, Math.min(1, (t-a)/(b-a)));
const suave = p => 1 - Math.pow(1-p, 3);
const suaveIO = p => p < .5 ? 4*p*p*p : 1 - Math.pow(-2*p+2, 3)/2;
const elastico = p => p === 0 ? 0 : p === 1 ? 1
  : Math.pow(2, -9*p) * Math.sin((p*9 - .75) * (2*Math.PI/3)) + 1;

const $  = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const op = (el,v) => { el.style.opacity = String(Math.max(0, Math.min(1, v))); };

const trama   = $('.trama');
const brillo  = $('.brillo');
const eyebrow = $('.eyebrow');
const raya    = $('.raya');
const tits    = $$('.tit');
const caja    = $('.lienzo-caja');
const relleno = $('.relleno');
const grupoB  = $('.barrios');
const borde   = $('.borde');
const arcos   = $$('.arco');
const viajeros= $$('.viajero');
const pins    = $$('.pin');
const hub     = $('.hub');
const led     = $('.led');
const pulso   = $('.pulso');
const contador= $('.contador');
const rots    = $$('.c-rot');
const barra   = $('.c-barra i');
const num     = $('.c-num');
const cierre  = $('.cierre');
const cta     = $('.cta');
const pie     = $('.pie');

/* El contorno se dibuja con stroke-dashoffset: hay que medirlo primero. */
const largoBorde = borde.getTotalLength();
borde.style.strokeDasharray = largoBorde;

const largosArco = arcos.map(a => a.getTotalLength());
arcos.forEach((a,i) => { a.style.strokeDasharray = largosArco[i]; });

/* El cierre sube renglón por renglón, cada uno tapado por su máscara. */
const h2 = cierre.querySelector('h2');
h2.innerHTML = h2.innerHTML.split(/<br\\s*\\/?>/i)
  .map(p => '<div class="mascara"><span>' + p + '</span></div>').join('');
const renglones = Array.from(h2.querySelectorAll('.mascara > span'));

function cuadro(t) {
  /* ---- el fondo, nunca del todo quieto ---- */
  trama.style.transform = 'translate(' + (-(t*5.5)%46).toFixed(2) + 'px,' + (-(t*3.2)%46).toFixed(2) + 'px)';
  const resp = 1 + Math.sin(t*0.62)*0.045;
  brillo.style.transform = 'translate(-50%,-50%) scale(' + resp.toFixed(4) + ')';
  op(brillo, 0.72 + Math.sin(t*0.62)*0.1);

  /* ---- la chapa fija ---- */
  op(eyebrow, paso(t,.10,.55));
  raya.style.transform = 'scaleX(' + suave(paso(t,.20,.95)).toFixed(4) + ')';
  op(pie, paso(t,.18,.70));

  /* ---- el mapa se dibuja a sí mismo ---- */
  const pb = suaveIO(paso(t, T.borde[0], T.borde[1]));
  borde.style.strokeDashoffset = (largoBorde * (1 - pb)).toFixed(1);
  op(relleno, suave(paso(t, T.relleno[0], T.relleno[1])) * .95);
  op(grupoB,  suave(paso(t, T.barrios[0], T.barrios[1])));

  /* ---- los titulares se cruzan ---- */
  tits.forEach((el, i) => {
    const v = T.titulos[i];
    const entra = paso(t, v[0], v[0] + .55);
    const sale  = paso(t, v[1], v[1] + .40);
    op(el, entra - sale);
    const y = (1 - suave(entra)) * 30 - suave(sale) * 26;
    el.style.transform = 'translateY(' + y.toFixed(1) + 'px)';
  });

  /* ---- los pines ---- */
  for (let i = 0; i < N; i++) {
    const t0 = T.pin0 + i * T.pinCada;
    const p = paso(t, t0, t0 + .60);
    const e = p === 0 ? 0 : elastico(p);
    const pin = pins[i];
    pin.style.opacity = p > 0 ? '1' : '0';
    pin.querySelector('.bolita').style.transform = 'translate(-50%,-50%) scale(' + e.toFixed(4) + ')';
    const ch = pin.querySelector('.chapa');
    const pc = paso(t, t0 + .12, t0 + .60);
    op(ch, pc);
    ch.style.transform = ch.style.transform.replace(/ scale\\([^)]*\\)/, '')
      + ' scale(' + (0.86 + 0.14 * suave(pc)).toFixed(4) + ')';

    /* El aro late mientras el mensaje está sin contestar, y se apaga cuando
       el arco de ese pin ya salió: el latido es la espera, no un adorno. */
    const salio = t >= T.arco0 + i * T.arcoCada;
    const aro = pin.querySelector('.aro');
    if (p > 0 && !salio) {
      const f = ((t - t0) % 1.6) / 1.6;
      aro.style.transform = 'translate(-50%,-50%) scale(' + (1 + f * 1.9).toFixed(3) + ')';
      op(aro, (1 - f) * .55);
    } else {
      op(aro, 0);
    }
    pin.classList.toggle('listo', salio);
  }

  /* ---- el contador ---- */
  op(contador, paso(t, T.cuenta1[0] - .45, T.cuenta1[0]));
  const c1 = suaveIO(paso(t, T.cuenta1[0], T.cuenta1[1]));
  const c2 = suaveIO(paso(t, T.cuenta2[0], T.cuenta2[1]));
  const fase2 = paso(t, T.cuenta2[0] - .26, T.cuenta2[0]);
  num.textContent = String(Math.round(fase2 > 0 ? TOTAL * c2 : TOTAL * c1));
  num.style.color = fase2 > .5 ? '${c.verde_fuerte}' : '${c.texto}';
  rots.forEach((r, i) => {
    const v = i === 0 ? 1 - fase2 : fase2;
    op(r, v);
    r.style.transform = 'translateY(' + ((1 - v) * (i === 0 ? -26 : 26)).toFixed(1) + 'px)';
  });
  barra.style.transform = 'scaleX(' + c2.toFixed(4) + ')';
  barra.parentNode.style.opacity = String(fase2);

  /* ---- el hub ---- */
  const ph = paso(t, T.hub[0], T.hub[1]);
  op(hub, ph);
  hub.style.transform = 'translate(-50%,-50%) scale(' + (ph === 0 ? .8 : (0.8 + 0.2 * elastico(ph))).toFixed(4) + ')';
  const lat = (Math.sin(t * 4.2) * .5 + .5);
  led.style.boxShadow = '0 0 0 ' + (lat * 9).toFixed(1) + 'px rgba(14,158,122,' + (0.30 * (1 - lat)).toFixed(3) + ')';

  /* ---- los arcos viajan al hub ---- */
  let ultimoImpacto = -9;
  for (let i = 0; i < N; i++) {
    const t0 = T.arco0 + i * T.arcoCada;
    const p = paso(t, t0, t0 + T.arcoViaje);
    const q = suaveIO(p);
    arcos[i].style.strokeDashoffset = (largosArco[i] * (1 - q)).toFixed(1);
    op(arcos[i], p > 0 ? .85 * (1 - paso(t, 14.05, 14.80)) : 0);
    const v = viajeros[i];
    if (p > 0 && p < 1) {
      const pt = arcos[i].getPointAtLength(largosArco[i] * q);
      v.setAttribute('cx', pt.x); v.setAttribute('cy', pt.y);
      op(v, 1);
    } else { op(v, 0); }
    if (p === 1 && t0 + T.arcoViaje > ultimoImpacto) ultimoImpacto = t0 + T.arcoViaje;
  }
  /* Un anillo sale del hub cada vez que aterriza un mensaje. */
  const dp = t - ultimoImpacto;
  if (dp >= 0 && dp < .8) {
    const f = dp / .8;
    pulso.style.transform = 'scale(' + (1 + f * 5.5).toFixed(3) + ')';
    op(pulso, (1 - f) * .5);
  } else { op(pulso, 0); }

  /* ---- el mapa se va y entra el cierre ---- */
  const ps = suaveIO(paso(t, T.salida[0], T.salida[1]));
  caja.style.transform = 'scale(' + (1 - ps * .10).toFixed(4) + ') translateY(' + (ps * -34).toFixed(1) + 'px)';
  op(caja, 1 - ps);
  op(contador, (t < T.cuenta1[0] - .45 ? 0 : 1) * (1 - ps));
  tits.forEach((el) => { if (ps > 0) op(el, 0); });

  op(cierre, paso(t, T.cierre[0], T.cierre[0] + .3));
  renglones.forEach((r, i) => {
    const a = T.cierre[0] + i * .16;
    const q = suave(paso(t, a, a + .75));
    r.style.transform = 'translateY(' + ((1 - q) * 112).toFixed(1) + '%)';
  });
  const pc = paso(t, T.cta[0], T.cta[1]);
  op(cta, pc);
  cta.style.transform = 'translateY(' + ((1 - suave(pc)) * 22).toFixed(1) + 'px)';
}

window.__cuadro = cuadro;
cuadro(0);
</script>
</body>
</html>`;
}

module.exports = { documento, DURACION };
