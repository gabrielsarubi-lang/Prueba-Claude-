'use strict';

/**
 * El recorrido de un mensaje — motion graphics.
 *
 * Es la pieza más compleja del repo y vale explicar por qué está hecha así.
 *
 * Los otros reels son escenas que se cruzan: una se va, otra llega. Eso lee
 * como una presentación de diapositivas, no como animación. Acá los elementos
 * NO se reemplazan: la misma burbuja que llega en el paso 1 se achica en el 2,
 * se convierte en consulta en el 3 y vuelve como respuesta en el 4. Esa
 * continuidad es la diferencia entre un pase de placas y motion graphics.
 *
 * Tres cosas sostienen el video de punta a punta:
 *
 *   - La vía de progreso de arriba. Cuatro nodos que se encienden en orden y
 *     una barra que avanza. Dice en qué paso estamos sin narrarlo.
 *   - El fondo, que nunca está quieto. Una grilla de puntos que deriva despacio
 *     y el halo verde que respira. Sin eso, cada pausa parece un cuelgue.
 *   - La firma, visible desde el primer cuadro. En un feed casi nadie llega al
 *     final.
 *
 * Como en el resto, no hay transiciones de CSS: la página expone __cuadro(t)
 * que dibuja el estado exacto del segundo t. El cuadro 318 sale siempre igual,
 * que es lo único que permite exportar video parejo.
 */

const { esc, texto } = require('./plantilla');

/** Las ventanas de cada paso. El corte de los 15 s cae entre el 3 y el 4. */
const PASOS = [
  { id: 'llega',    rotulo: 'Llega',     desde: 0.60,  hasta: 4.80 },
  { id: 'entiende', rotulo: 'Entiende',  desde: 4.80,  hasta: 9.00 },
  { id: 'busca',    rotulo: 'Busca',     desde: 9.00,  hasta: 15.00 },
  { id: 'contesta', rotulo: 'Contesta',  desde: 15.00, hasta: 18.60 }
];
const DURACION = 22.0;

function documento(g, marca) {
  const c = marca.colores;
  const tp = marca.tipografia;
  const m = marca.medidas.historia;

  const firma = `${esc(marca.nombre.slice(0, marca.nombre_corte))}<span>${esc(marca.nombre.slice(marca.nombre_corte))}</span>`;

  const nodos = PASOS.map((p, i) => `
    <div class="nodo" data-i="${i}">
      <span class="punto"><i></i></span>
      <span class="rotulo">${esc(p.rotulo)}</span>
    </div>`).join('');

  const chips = g.entiende.chips.map((x, i) => `<span class="chip" data-i="${i}">${esc(x)}</span>`).join('');
  const datos = g.busca.devuelve.map((x, i) => `<span class="dato" data-i="${i}">${esc(x)}</span>`).join('');

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
    background:${c.tinta};color:${c.tinta_texto};
  }

  /* ---------------------------------------------------------- el fondo */
  .grilla{
    position:absolute;left:-80px;top:-80px;width:calc(100% + 160px);height:calc(100% + 160px);
    background-image:radial-gradient(rgba(255,255,255,.055) 1.6px, transparent 1.6px);
    background-size:46px 46px;
    will-change:transform;
  }
  .halo{
    position:absolute;left:50%;top:58%;width:1180px;height:1180px;
    transform:translate(-50%,-50%);pointer-events:none;will-change:transform,opacity;
    background:radial-gradient(circle,rgba(47,224,174,.19) 0%,rgba(47,224,174,0) 60%);
  }

  .cabeza,.pie,.via,.escenario{position:relative;z-index:3;}
  .cabeza{display:flex;align-items:center;gap:18px;}
  .eyebrow{
    font-size:24px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;
    color:${c.verde_sobre_oscuro};white-space:nowrap;
  }
  .raya{flex:1;height:1px;background:${c.linea_oscura};transform-origin:left center;}

  .pie{display:flex;align-items:center;justify-content:space-between;gap:24px;}
  .mark{font-size:34px;font-weight:700;color:${c.tinta_texto};}
  .mark span{color:${c.verde_sobre_oscuro};}
  .sitio{font-size:26px;font-weight:500;letter-spacing:.02em;color:${c.apagado_oscuro};}

  /* ------------------------------------------------- la vía de progreso */
    /* El alto deja lugar al punto cuando crece y al rótulo debajo: con menos,
     los rótulos se meten en el escenario y chocan con la burbuja. */
  .via{margin-top:50px;height:124px;}
  .riel{
    position:absolute;left:9px;right:9px;top:17px;height:3px;border-radius:2px;
    background:${c.linea_oscura};
  }
  .riel-lleno{
    position:absolute;left:0;top:0;height:100%;width:100%;border-radius:2px;
    background:${c.verde_sobre_oscuro};transform-origin:left center;transform:scaleX(0);
  }
  .nodos{position:absolute;left:0;right:0;top:0;display:flex;justify-content:space-between;}
  .nodo{display:flex;flex-direction:column;align-items:center;gap:15px;width:160px;}
  .punto{
    width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;
    background:${c.tinta};border:3px solid ${c.linea_oscura};will-change:transform;
  }
  .punto i{
    display:block;width:12px;height:12px;border-radius:50%;background:${c.linea_oscura};
    will-change:transform,background;
  }
  .rotulo{
    font-size:21px;font-weight:600;letter-spacing:.11em;text-transform:uppercase;
    color:${c.apagado_oscuro};white-space:nowrap;will-change:opacity,transform;
  }

  /* ----------------------------------------------------- el escenario */
  .escenario{flex:1;position:relative;}
  .cables{position:absolute;inset:0;width:100%;height:100%;overflow:visible;}
  .cable{
    fill:none;stroke:${c.verde_sobre_oscuro};stroke-width:3;stroke-linecap:round;
    opacity:.55;
  }

  .burbuja{
    position:absolute;border-radius:26px;padding:28px 32px;max-width:640px;
    will-change:transform,opacity;
  }
  .b-entra{left:0;top:52px;background:#181D24;border-bottom-left-radius:8px;}
  .b-sale{right:0;top:815px;background:${c.verde_sobre_oscuro};border-bottom-right-radius:8px;}
  .msj{display:block;font-size:34px;line-height:1.32;font-weight:500;}
  .b-entra .msj{color:${c.tinta_texto};}
  .b-sale .msj{color:#05231B;}
  .hora{display:block;font-size:22px;font-weight:500;margin-top:12px;font-variant-numeric:tabular-nums;}
  .b-entra .hora{color:${c.apagado_oscuro};}
  .b-sale .hora{color:rgba(5,35,27,.55);display:flex;align-items:center;gap:9px;justify-content:flex-end;}
  .tildes{letter-spacing:-5px;font-weight:700;}

  .puntos{display:flex;gap:12px;align-items:center;padding:7px 2px;}
  .puntos i{width:16px;height:16px;border-radius:50%;background:#05231B;opacity:.35;display:block;}

  /* anillo que sale de la burbuja al llegar */
  .onda{
    position:absolute;left:320px;top:134px;width:300px;height:300px;border-radius:50%;
    border:3px solid ${c.verde_sobre_oscuro};transform:translate(-50%,-50%) scale(0);
    will-change:transform,opacity;opacity:0;
  }

  /* --------------------------------------------------------- los chips */
  .chips{position:absolute;left:0;top:286px;display:flex;flex-wrap:wrap;gap:16px;width:620px;}
  .chip{
    font-size:27px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;
    padding:14px 22px;border-radius:999px;white-space:nowrap;
    background:rgba(47,224,174,.12);color:${c.verde_sobre_oscuro};
    border:1px solid rgba(47,224,174,.34);
    will-change:transform,opacity;opacity:0;
  }

  /* ------------------------------------------------- el nodo del sistema */
  .sistema{
    position:absolute;right:0;top:462px;width:340px;
    border:2px solid ${c.linea_oscura};border-radius:20px;padding:26px 24px;
    background:#11161C;will-change:transform,opacity;opacity:0;
  }
  .sis-tag{
    font-size:19px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;
    color:${c.apagado_oscuro};margin-bottom:12px;
  }
  .sis-n{font-size:33px;font-weight:700;letter-spacing:-.02em;}
  .sis-api{
    margin-top:14px;font-size:20px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;
    color:${c.verde_sobre_oscuro};display:flex;align-items:center;gap:10px;
  }
  .sis-api::before{
    content:"";width:12px;height:12px;border-radius:50%;background:${c.verde_sobre_oscuro};
  }

  /* la consulta que viaja por el cable */
  .viajero{
    position:absolute;width:26px;height:26px;border-radius:50%;
    background:${c.verde_sobre_oscuro};box-shadow:0 0 26px 7px rgba(47,224,174,.5);
    transform:translate(-50%,-50%);opacity:0;will-change:transform,opacity;
  }

  .datos{position:absolute;left:0;top:676px;display:flex;gap:18px;}
  .dato{
    font-size:38px;font-weight:800;letter-spacing:-.02em;font-variant-numeric:tabular-nums;
    padding:16px 26px;border-radius:14px;color:${c.verde_sobre_oscuro};
    background:rgba(47,224,174,.12);border:1px solid rgba(47,224,174,.4);
    will-change:transform,opacity;opacity:0;
  }

  /* ---------------------------------------------------------- el cierre */
  .cierre{
    position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;gap:40px;
    opacity:0;will-change:opacity;
  }
  .cierre h1{
    font-size:96px;font-weight:800;letter-spacing:-.03em;line-height:1.03;
  }
  .cierre .ac{color:${c.verde_sobre_oscuro};}
  .cta{
    display:inline-flex;align-self:flex-start;align-items:center;
    font-size:32px;font-weight:700;padding:26px 42px;border-radius:14px;
    background:${c.verde_sobre_oscuro};color:#05231B;transform-origin:left center;
  }
  .mascara{overflow:hidden;padding-bottom:.1em;margin-bottom:-.1em;}
  .mascara > span{display:inline-block;will-change:transform,opacity;}
</style>
</head>
<body>
<div class="placa">
  <div class="grilla"></div>
  <div class="halo"></div>

  <div class="cabeza"><span class="eyebrow">${esc(g.eyebrow)}</span><span class="raya"></span></div>

  <div class="via">
    <div class="riel"><div class="riel-lleno"></div></div>
    <div class="nodos">${nodos}</div>
  </div>

  <div class="escenario">
    <svg class="cables" viewBox="0 0 912 1000" preserveAspectRatio="none">
      <path class="cable" d="M 190 348 C 430 348 470 440 688 470"/>
    </svg>

    <div class="onda"></div>

    <div class="burbuja b-entra">
      <span class="msj">${esc(g.llega.texto)}</span>
      <span class="hora">${esc(g.llega.hora)}</span>
    </div>

    <div class="chips">${chips}</div>

    <div class="sistema">
      <div class="sis-tag">${esc(g.busca.tag)}</div>
      <div class="sis-n">${esc(g.busca.nombre)}</div>
      <div class="sis-api">${esc(g.busca.via)}</div>
    </div>

    <div class="viajero"></div>
    <div class="datos">${datos}</div>

    <div class="burbuja b-sale">
      <div class="puntos"><i></i><i></i><i></i></div>
      <div class="dicho">
        <span class="msj">${esc(g.contesta.texto)}</span>
        <span class="hora">${esc(g.contesta.hora)}<span class="tildes">✓✓</span></span>
      </div>
    </div>

    <div class="cierre">
      <h1>${texto(g.cierre.titulo)}</h1>
      <span class="cta">${esc(g.cierre.cta)}</span>
    </div>
  </div>

  <div class="pie">
    <span class="mark">${firma}</span>
    <span class="sitio">${esc(marca.sitio)}</span>
  </div>
</div>

<script>
const PASOS = ${JSON.stringify(PASOS)};
const DUR = ${DURACION};

/* ---------------------------------------------------------------- curvas */
const paso  = (t,a,b) => b <= a ? (t >= b ? 1 : 0) : Math.max(0, Math.min(1, (t-a)/(b-a)));
const suave = p => 1 - Math.pow(1-p, 3);
const suaveIO = p => p < .5 ? 4*p*p*p : 1 - Math.pow(-2*p+2, 3)/2;
const rebote = p => { const c1=1.70158, c3=c1+1; return 1 + c3*Math.pow(p-1,3) + c1*Math.pow(p-1,2); };
// Un pop con rebote amortiguado: entra pasada de rosca y se acomoda.
const elastico = p => p === 0 ? 0 : p === 1 ? 1
  : Math.pow(2, -9*p) * Math.sin((p*9 - .75) * (2*Math.PI/3)) + 1;

const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));

const grilla  = $('.grilla');
const halo    = $('.halo');
const eyebrow = $('.eyebrow');
const raya    = $('.raya');
const marca   = $('.mark');
const sitio   = $('.sitio');
const rielLleno = $('.riel-lleno');
const nodos   = $$('.nodo');
const cable   = $('.cable');
const onda    = $('.onda');
const bEntra  = $('.b-entra');
const chips   = $$('.chip');
const sistema = $('.sistema');
const viajero = $('.viajero');
const datos   = $$('.dato');
const bSale   = $('.b-sale');
const puntos  = $('.b-sale .puntos');
const dicho   = $('.b-sale .dicho');
const cierre  = $('.cierre');
const cta     = $('.cta');

/* El título del cierre sube renglón por renglón, cada uno tapado por su
   máscara. Es lo único que se reusa del motor viejo. */
const h1 = cierre.querySelector('h1');
const partes = h1.innerHTML.split(/<br\\s*\\/?>/i);
h1.innerHTML = partes.map(p => '<div class="mascara"><span>' + p + '</span></div>').join('');
const renglones = Array.from(h1.querySelectorAll('.mascara > span'));

/* El largo del cable, para dibujarlo con stroke-dashoffset. */
const largo = cable.getTotalLength();
cable.style.strokeDasharray = largo;
cable.style.strokeDashoffset = largo;

/* El escenario mide distinto que el viewBox del SVG, así que para mover el
   viajero sobre el cable hay que pasar de coordenadas del dibujo a píxeles. */
const caja = $('.escenario').getBoundingClientRect();
const escalaX = caja.width / 912, escalaY = caja.height / 1000;

function enCable(p) {
  const pt = cable.getPointAtLength(largo * p);
  return { x: pt.x * escalaX, y: pt.y * escalaY };
}

/* --------------------------------------------------------- estado inicial */
for (const el of [eyebrow, marca, sitio]) el.style.opacity = '0';
raya.style.transform = 'scaleX(0)';
bEntra.style.opacity = '0';
sistema.style.opacity = '0';
bSale.style.opacity = '0';
cierre.style.opacity = '0';
nodos.forEach(n => { n.querySelector('.rotulo').style.opacity = '.35'; });

const op = (el, v) => { el.style.opacity = String(Math.max(0, Math.min(1, v))); };

window.__cuadro = function (t) {
  /* ---- el fondo nunca se queda quieto ---- */
  const d = t / DUR;
  grilla.style.transform = 'translate(' + (-26 * d).toFixed(2) + 'px,' + (-46 * d).toFixed(2) + 'px)';
  halo.style.transform = 'translate(-50%,-50%) scale(' + (1 + .16 * Math.sin(t * .42)).toFixed(4) + ')';
  op(halo, .72 + .28 * Math.sin(t * .62));

  /* ---- el marco entra primero: en un feed nadie llega al final ---- */
  op(eyebrow, paso(t, .10, .55));
  raya.style.transform = 'scaleX(' + suave(paso(t, .20, .95)).toFixed(4) + ')';
  op(marca, paso(t, .18, .68));
  op(sitio, paso(t, .26, .76));

  /* ---- la vía de progreso ---- */
  const avance = Math.max(0, Math.min(1, (t - PASOS[0].desde) / (PASOS[3].hasta - PASOS[0].desde)));
  rielLleno.style.transform = 'scaleX(' + suaveIO(avance).toFixed(4) + ')';

  nodos.forEach((n, i) => {
    const P = PASOS[i];
    const vivo = t >= P.desde;
    const enc = paso(t, P.desde, P.desde + .45);
    const pt = n.querySelector('.punto');
    const nu = n.querySelector('.punto i');
    const ro = n.querySelector('.rotulo');
    const activo = t >= P.desde && t < P.hasta;
    // El nodo activo crece; los ya pasados quedan encendidos pero chicos.
    const escala = 1 + .34 * enc * (activo ? 1 : .34);
    pt.style.transform = 'scale(' + escala.toFixed(4) + ')';
    pt.style.borderColor = vivo ? '${c.verde_sobre_oscuro}' : '${c.linea_oscura}';
    nu.style.background = vivo ? '${c.verde_sobre_oscuro}' : '${c.linea_oscura}';
    nu.style.transform = 'scale(' + (vivo ? 1 + .3 * Math.sin(t * 6) * (activo ? 1 : 0) : 1).toFixed(3) + ')';
    ro.style.opacity = String(vivo ? (activo ? 1 : .5) : .28);
    ro.style.color = activo ? '${c.tinta_texto}' : '${c.apagado_oscuro}';
  });

  /* ---- 01 · LLEGA ---- */
  const pe = paso(t, .75, 1.55);
  op(bEntra, Math.min(1, pe * 2));
  // Entra desde abajo con rebote y se va achicando cuando empieza a entender.
  const achica = paso(t, 4.9, 5.7);
  const subeY = (1 - elastico(pe)) * 190 - achica * 54;
  bEntra.style.transform = 'translateY(' + subeY.toFixed(2) + 'px) scale(' + (1 - .14 * suave(achica)).toFixed(4) + ')';
  bEntra.style.transformOrigin = 'left top';

  // El anillo sale dos veces desde la burbuja, como un pulso de llegada.
  const po = Math.max(paso(t, 1.45, 2.45), paso(t, 2.05, 3.05));
  onda.style.transform = 'translate(-50%,-50%) scale(' + (.2 + 1.5 * suave(po)).toFixed(3) + ')';
  op(onda, po > 0 && po < 1 ? (1 - po) * .5 : 0);

  /* ---- 02 · ENTIENDE ---- */
  chips.forEach((ch, i) => {
    const a = 5.25 + i * .34;
    const p = paso(t, a, a + .5);
    const sale = paso(t, 9.25, 9.85);        // se juntan para irse por el cable
    op(ch, p * (1 - sale));
    const x = (1 - elastico(p)) * -46 + sale * (i * -28);
    ch.style.transform = 'translate(' + x.toFixed(2) + 'px,' + ((1 - suave(p)) * 26 + sale * 18).toFixed(2) + 'px)'
      + ' scale(' + (.82 + .18 * elastico(p) - sale * .22).toFixed(4) + ')';
  });

  /* ---- 03 · BUSCA — el momento que vende ---- */
  const ps = paso(t, 9.3, 10.1);
  op(sistema, ps);
  sistema.style.transform = 'translateX(' + ((1 - elastico(ps)) * 90).toFixed(2) + 'px) scale(' + (.92 + .08 * elastico(ps)).toFixed(4) + ')';

  // El cable se dibuja, y después el viajero lo recorre: ida con la consulta,
  // vuelta con el dato.
  const pc = paso(t, 10.0, 11.0);
  cable.style.strokeDashoffset = String(largo * (1 - suave(pc)));
  op(cable, pc * .55);

  const ida = paso(t, 11.0, 12.0);
  const vuelta = paso(t, 12.5, 13.5);
  let vis = 0, pos = 0;
  if (ida > 0 && ida < 1) { vis = 1; pos = suaveIO(ida); }
  else if (vuelta > 0 && vuelta < 1) { vis = 1; pos = 1 - suaveIO(vuelta); }
  op(viajero, vis);
  if (vis) {
    const q = enCable(pos);
    viajero.style.left = q.x + 'px';
    viajero.style.top = q.y + 'px';
  }

  // El sistema late justo cuando le llega la consulta.
  const late = paso(t, 12.0, 12.45);
  sistema.style.borderColor = late > 0 && late < 1 ? '${c.verde_sobre_oscuro}' : '${c.linea_oscura}';

  datos.forEach((dd, i) => {
    const a = 13.4 + i * .26;
    const p = paso(t, a, a + .45);
    const se = paso(t, 15.0, 15.6);
    op(dd, p * (1 - se));
    dd.style.transform = 'translateY(' + ((1 - elastico(p)) * 34 - se * 26).toFixed(2) + 'px)'
      + ' scale(' + (.86 + .14 * elastico(p)).toFixed(4) + ')';
  });

  /* ---- 04 · CONTESTA ---- */
  const pb = paso(t, 15.2, 15.9);
  op(bSale, Math.min(1, pb * 2));
  bSale.style.transformOrigin = 'right bottom';
  bSale.style.transform = 'translateY(' + ((1 - elastico(pb)) * 120).toFixed(2) + 'px) scale(' + (.88 + .12 * elastico(pb)).toFixed(4) + ')';

  // Primero escribe, después aparece el mensaje: igual que un chat de verdad.
  const escribiendo = t < 16.75;
  puntos.style.display = escribiendo ? 'flex' : 'none';
  dicho.style.display = escribiendo ? 'none' : 'block';
  if (escribiendo) {
    Array.from(puntos.children).forEach((pp, i) => {
      const f = (Math.sin((t * 2.7 - i * .22) * Math.PI * 2) + 1) / 2;
      pp.style.opacity = (.28 + .55 * f).toFixed(3);
    });
  }

  /* ---- el cierre ---- */
  const pf = paso(t, 18.5, 19.1);
  op(cierre, pf);
  // Todo lo anterior se apaga para que el remate quede solo.
  const apaga = 1 - pf;
  for (const el of [bEntra, bSale, sistema]) {
    el.style.opacity = String(Math.min(parseFloat(el.style.opacity || 0), apaga));
  }
  op(cable, Math.min(pc * .55, apaga * .55));
  datos.forEach(dd => op(dd, Math.min(parseFloat(dd.style.opacity || 0), apaga)));

  renglones.forEach((r, i) => {
    const a = 18.75 + i * .17;
    const p = paso(t, a, a + .62);
    r.style.opacity = String(Math.min(1, p * 1.8));
    r.style.transform = 'translateY(' + ((1 - suave(p)) * 116).toFixed(2) + 'px)';
  });
  const pcta = paso(t, 19.9, 20.5);
  op(cta, Math.min(1, pcta * 2));
  cta.style.transform = 'scale(' + (.72 + .28 * rebote(pcta)).toFixed(4) + ')';
};

window.__cuadro(0);
</script>
</body>
</html>`;
}

module.exports = { documento, PASOS, DURACION };
