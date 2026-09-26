/* Bloques comunes a todas las piezas: logo, temas, escenas y plantillas de texto.
   Los usan tanto piezas.js (video) como piezas-estaticas.js (carruseles e imágenes). */

const LOGO = (s) => `<svg class="mk" viewBox="0 0 64 64" width="${s}" height="${s}" style="width:${s}px;height:${s}px">
  <circle cx="32" cy="32" r="32" fill="#0f2338"/>
  <path d="M17 27 L36 17 L36 47 L17 37 Z" fill="#fff" stroke="#fff" stroke-width="4" stroke-linejoin="round"/>
  <path d="M43 23 L50 19" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
  <path d="M44 32 L52 32" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
  <path d="M43 41 L50 45" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
</svg>`;

const bug = () => `<div class="bug" data-anim="fade" data-at="0.35" data-d="0.5">
  ${LOGO(60)}<div class="tx">Reclame Acá<small>reclameaca.com.ar</small></div></div>`;

const TEMAS = {
  dark:   { bg: 'bg-dark',   tono: 'on-dark',   glow: true  },
  navy:   { bg: 'bg-navy',   tono: 'on-dark',   glow: true  },
  light:  { bg: 'bg-light',  tono: 'on-light',  glow: false },
  orange: { bg: 'bg-orange', tono: 'on-orange', glow: false },
};

function esc({ dur, tema = 'dark', marca = true, wrap = '', html }) {
  const t = TEMAS[tema];
  return `<section class="scene ${t.tono}" data-dur="${dur}">
  <div class="bg ${t.bg}"></div>
  ${t.glow ? '<div class="glow"></div><div class="glow glow-b"></div>' : ''}
  <div class="wrap ${wrap}">${html}</div>
  ${marca ? bug() : ''}
</section>`;
}

/* Bloques reutilizables ------------------------------------------------ */

const ceja = (txt, estilo = 'on-dark', at = 0) =>
  `<span class="eyebrow ${estilo}" data-anim="sube" data-at="${at}" data-d="0.5" data-dist="26"><i class="dot"></i>${txt}</span>`;

// Titular revelado línea por línea con máscara
const titular = (lineas, tag = 'h2', at = 0.12, paso = 0.09) =>
  `<${tag}>${lineas.map((l, i) => `<span style="display:block;overflow:hidden"><span style="display:block" data-anim="linea" data-at="${(at + i * paso).toFixed(2)}" data-d="0.62">${l}</span></span>`).join('')}</${tag}>`;

const cuerpo = (txt, at = 0.5) =>
  `<p class="body" data-anim="sube" data-at="${at}" data-d="0.6" data-dist="34">${txt}</p>`;

// Placa legal: regla naranja + cita de artículo + titular + bajada
const placaLey = ({ dur, articulo, lineas, texto }) => esc({
  dur, tema: 'light',
  html: `${ceja(articulo, 'law', 0)}
    <div class="ruled">
      <i class="rule" data-anim="regla" data-at="0.1" data-d="0.7"></i>
      ${titular(lineas, 'h2', 0.2)}
    </div>
    ${texto ? cuerpo(texto, 0.6) : ''}`
});

const li = (n, txt, sub, at) =>
  `<div class="li" data-anim="sube" data-at="${at}" data-d="0.55" data-dist="40">
     <span class="n">${n}</span><span class="tx">${txt}${sub ? `<small>${sub}</small>` : ''}</span></div>`;

const cierre = (dur, titulo, sub) => esc({
  dur, tema: 'navy', marca: false, wrap: 'center',
  html: `<div data-anim="pop" data-at="0" data-d="0.7" style="align-self:center">${LOGO(188).replace('class="mk"', 'class="cta-logo"')}</div>
    ${titular(titulo, 'h2', 0.3)}
    ${sub ? `<p class="body" data-anim="sube" data-at="0.62" data-d="0.6" data-dist="30">${sub}</p>` : ''}
    <div class="url" data-anim="sube" data-at="0.8" data-d="0.6" data-dist="26">reclameaca.com.ar</div>`
});

module.exports = { LOGO, bug, TEMAS, esc, ceja, titular, cuerpo, placaLey, li, cierre };
