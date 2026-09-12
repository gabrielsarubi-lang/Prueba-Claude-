'use strict';

/**
 * Arma la página que se anima cuadro por cuadro para un reel.
 *
 * No redibuja el diseño: toma la placa vertical que ya genera plantilla.js y le
 * pone el movimiento encima. Así una placa y su reel no pueden discrepar, y un
 * cambio de diseño llega a los dos a la vez.
 *
 * La animación tampoco usa transiciones de CSS: la página expone una función
 * window.__cuadro(t) que dibuja el estado exacto del segundo t. El render queda
 * determinista — el cuadro 47 sale siempre igual — que es lo que hace falta para
 * exportar video parejo.
 */

const plantilla = require('./plantilla');

/** Estilos que solo necesita la versión animada. */
const ESTILOS_REEL = `
  body{background:#000;display:block;padding:0;}
  .placa{margin:0;}
  /* Cada renglón del título sube tapado por su propia máscara. */
  .mascara{overflow:hidden;padding-bottom:.09em;margin-bottom:-.09em;}
  .mascara > span{display:inline-block;will-change:transform,opacity;}
  .anim{will-change:transform,opacity;}
`;

function documento(item, marca, opciones) {
  const dur = (opciones && opciones.duracion) || 8;
  const t = marca.tipografia;

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Reel — ${plantilla.esc(item.archivo)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=${encodeURIComponent(t.familia)}:wght@${t.pesos}&display=swap" rel="stylesheet">
<style>${plantilla.estilos(marca)}${ESTILOS_REEL}</style>
</head>
<body>
${plantilla.placa(item, marca, 'historia')}
<script>
const DURACION = ${dur};

/* ---------------------------------------------------------------- curvas */
const paso   = (t,a,b) => b <= a ? (t >= b ? 1 : 0) : Math.max(0, Math.min(1, (t-a)/(b-a)));
const suave  = p => 1 - Math.pow(1-p, 3);            // frena al llegar
const rebote = p => {                                 // se pasa y vuelve
  const c1 = 1.70158, c3 = c1 + 1;
  return 1 + c3*Math.pow(p-1,3) + c1*Math.pow(p-1,2);
};

const placa  = document.querySelector('.placa');
const cuerpo = placa.querySelector('.cuerpo');
const pie    = placa.querySelector('.pie');

/* ------------------------------------------- partir el título en renglones */
const h1 = cuerpo.querySelector('h1');
let renglones = [];
if (h1) {
  const partes = h1.innerHTML.split(/<br\\s*\\/?>/i);
  h1.innerHTML = partes.map(p => '<div class="mascara"><span>' + p + '</span></div>').join('');
  renglones = Array.from(h1.querySelectorAll('.mascara > span'));
}

/* --------------------------------------------------- inventario de entradas
   Se recorre el cuerpo en el orden en que está escrito, para que el
   movimiento siga la lectura y no un orden inventado aparte. */
const grupos = [];

for (const hijo of Array.from(cuerpo.children)) {
  if (hijo === h1) {
    renglones.forEach(el => grupos.push({ k:'sube', els:[el], alto:110, d:0.62, paso:0.18 }));
    continue;
  }

  const precio = hijo.querySelector ? hijo.querySelector('.precio') : null;
  if (precio) {
    grupos.push({ k:'precio', els:[precio], d:0.5, paso:0.5 });
    const nota = hijo.querySelector('.precio-nota');
    if (nota) grupos.push({ k:'fade', els:[nota], alto:12, d:0.4, paso:0.3 });
    continue;
  }

  const sueltos = hijo.querySelectorAll ? hijo.querySelectorAll('.check, .paso') : [];
  if (sueltos.length) {
    sueltos.forEach(el => grupos.push({ k:'lateral', els:[el], d:0.48, paso:0.15 }));
    continue;
  }

  // La lista es una grilla con líneas: si se desvanece celda por celda se ven
  // las juntas, así que entra el bloque entero y escalona el texto de adentro.
  if (hijo.classList && hijo.classList.contains('lista')) {
    grupos.push({ k:'fade', els:[hijo], alto:0, d:0.4, paso:0.12 });
    hijo.querySelectorAll('.celda').forEach(c => {
      grupos.push({ k:'lateral', els:Array.from(c.children), d:0.45, paso:0.13 });
    });
    continue;
  }

  if (hijo.classList && hijo.classList.contains('panel')) {
    grupos.push({ k:'escala', els:[hijo], d:0.55, paso:0.5 });
    continue;
  }

  if (hijo.classList && hijo.classList.contains('regla')) {
    grupos.push({ k:'raya', els:[hijo], d:0.5, paso:0.18 });
    continue;
  }

  grupos.push({ k:'fade', els:[hijo], alto:22, d:0.55, paso:0.25 });
}

/* ----------------------------------------------------------- línea de tiempo */
const guion = [];
const eyebrow = placa.querySelector('.eyebrow');
const raya    = placa.querySelector('.raya');
const marca   = pie.querySelector('.mark');
const cierre  = pie.querySelector('.cta') || pie.querySelector('.handle');

// La firma entra al principio, junto con el encabezado. En un feed casi nadie
// llega al final: si la marca aparece recién ahí, el video no la construye.
guion.push({ k:'fade',  els:[eyebrow], t:0.12, d:0.50, alto:18 });
guion.push({ k:'fade',  els:[marca],   t:0.20, d:0.55, alto:16 });
guion.push({ k:'raya',  els:[raya],    t:0.25, d:0.75 });

let reloj = 0.55;
for (const g of grupos) {
  guion.push(Object.assign({}, g, { t: reloj }));
  reloj += g.paso;
}
const finCuerpo = reloj + 0.4;

// El cierre espera a que el cuerpo termine, pero nunca tan tarde que no quede
// un segundo de descanso: los reels se repiten, y sin pausa se hace mareador.
const tCierre = Math.min(Math.max(finCuerpo, DURACION - 1.9), DURACION - 1.25);
if (cierre) {
  guion.push({ k: cierre.classList.contains('cta') ? 'pop' : 'fade', els:[cierre], t:tCierre, d:0.55, alto:16 });
}

/* -------------------------------------------------- el precio cuenta hacia arriba */
const elPrecio = cuerpo.querySelector('.precio');
let cuenta = null;
if (elPrecio) {
  const crudo = elPrecio.textContent;
  const digitos = crudo.replace(/[^0-9]/g, '');
  const inicio = (guion.find(g => g.k === 'precio') || { t: 0 }).t;
  cuenta = {
    prefijo: crudo.slice(0, crudo.search(/[0-9]/)),
    hasta: parseInt(digitos, 10) || 0,
    desde: inicio + 0.18,
    fin: inicio + 1.15
  };
}

/* ---------------------------------------------------------------- dibujar */
const pinturas = {
  fade(el, p, g) {
    el.style.opacity = String(p);
    if (g.alto) el.style.transform = 'translateY(' + ((1 - suave(p)) * g.alto).toFixed(2) + 'px)';
  },
  sube(el, p, g) {
    el.style.opacity = String(Math.min(1, p * 1.8));
    el.style.transform = 'translateY(' + ((1 - suave(p)) * g.alto).toFixed(2) + 'px)';
  },
  lateral(el, p) {
    el.style.opacity = String(p);
    el.style.transform = 'translateX(' + ((1 - suave(p)) * -34).toFixed(2) + 'px)';
  },
  escala(el, p) {
    el.style.opacity = String(p);
    el.style.transform = 'scale(' + (0.94 + 0.06 * suave(p)).toFixed(4) + ')';
  },
  precio(el, p) {
    el.style.opacity = String(p);
    el.style.transform = 'scale(' + (0.88 + 0.12 * suave(p)).toFixed(4) + ')';
  },
  pop(el, p) {
    el.style.opacity = String(Math.min(1, p * 2));
    el.style.transform = 'scale(' + (0.70 + 0.30 * rebote(p)).toFixed(4) + ')';
  },
  raya(el, p) {
    el.style.opacity = '1';
    el.style.transform = 'scaleX(' + suave(p).toFixed(4) + ')';
  }
};

// Todo arranca invisible y con su origen de transformación puesto.
for (const g of guion) {
  for (const el of g.els) {
    el.classList.add('anim');
    el.style.opacity = '0';
    if (g.k === 'raya') el.style.transformOrigin = 'left center';
    if (g.k === 'precio' || g.k === 'escala') el.style.transformOrigin = 'left center';
  }
}

const halo = document.createElement('style');
halo.textContent = '.placa::after{transform-origin:center;}';
document.head.appendChild(halo);

window.__cuadro = function (t) {
  for (const g of guion) {
    const p = paso(t, g.t, g.t + g.d);
    for (const el of g.els) pinturas[g.k](el, p, g);
  }
  if (cuenta) {
    const v = Math.round(cuenta.hasta * suave(paso(t, cuenta.desde, cuenta.fin)));
    elPrecio.textContent = cuenta.prefijo + v.toLocaleString('es-AR');
  }
};

window.__cuadro(0);
</script>
</body>
</html>`;
}

module.exports = { documento };
