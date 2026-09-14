'use strict';

/**
 * Reel de escenas encadenadas.
 *
 * Es el hermano genérico de reel-agente.js: mismo marco (encabezado arriba,
 * firma y sitio abajo, desde el primer cuadro hasta el último) y mismas escenas
 * que se cruzan en el medio, pero acá las escenas salen del JSON en vez de estar
 * escritas a mano. Sirve para cualquier reel que sea una secuencia de frases y
 * cifras — el de los tres presupuestos es el primero.
 *
 * Las ventanas de tiempo se calculan solas: cada escena declara cuánto dura y
 * el módulo las encadena con un cruce fijo. Así se cambia el ritmo moviendo un
 * número del JSON, sin tocar código.
 */

const { esc, texto } = require('./plantilla');

const CRUCE = 0.35;   // segundos de superposición entre una escena y la que sigue

/** Convierte las duraciones del JSON en ventanas absolutas. */
function ventanas(escenas) {
  let reloj = 0;
  return escenas.map((e, i) => {
    const desde = i === 0 ? 0 : reloj - CRUCE;
    const hasta = reloj + e.dur;
    reloj = hasta;
    return { id: 'e' + i, desde: +desde.toFixed(2), hasta: +hasta.toFixed(2) };
  });
}

/** Duración total: el final de la última escena. */
function duracion(escenas) {
  const v = ventanas(escenas);
  return v[v.length - 1].hasta;
}

// ---------------------------------------------------------------- escenas

const tipos = {
  frase(e) {
    let h = '';
    if (e.etiqueta) h += `<div class="etiqueta" data-t="0.15" data-k="fade">${esc(e.etiqueta)}</div>`;
    h += `<h1 data-t="0.35" data-k="sube">${texto(e.titulo)}</h1>`;
    if (e.sub) h += `<p class="sub" data-t="1.05" data-k="fade">${texto(e.sub)}</p>`;
    return h;
  },

  cifra(e) {
    let h = `<div class="etiqueta" data-t="0.15" data-k="fade">${esc(e.etiqueta)}</div>`;
    // data-cuenta hace que el número suba desde cero: es el gesto que convierte
    // un dato en un golpe, y acá el golpe es el precio.
    h += `<div class="monto" data-t="0.45" data-k="monto" data-cuenta="1">${esc(e.monto)}</div>`;
    if (e.nota) h += `<div class="nota" data-t="1.25" data-k="fade">${esc(e.nota)}</div>`;
    return h;
  },

  cierre(e) {
    let h = `<div class="etiqueta" data-t="0.15" data-k="fade">${esc(e.etiqueta)}</div>`;
    if (e.titulo) h += `<h1 class="chico" data-t="0.3" data-k="sube">${texto(e.titulo)}</h1>`;
    h += `<div class="tabla">` + e.filas.map((f, i) => `
      <div class="fila" data-t="${(0.75 + i * 0.28).toFixed(2)}" data-k="lateral">
        <span class="fila-k">${esc(f.k)}</span><span class="fila-v">${esc(f.v)}</span>
      </div>`).join('') + `</div>`;
    if (e.nota) h += `<p class="nota-pie" data-t="${(0.95 + e.filas.length * 0.28).toFixed(2)}" data-k="fade">${texto(e.nota)}</p>`;
    if (e.cta) h += `<span class="cta" data-t="${(1.35 + e.filas.length * 0.28).toFixed(2)}" data-k="pop">${texto(e.cta)}</span>`;
    return h;
  }
};

// ---------------------------------------------------------------- documento

function documento(g, marca) {
  const c = marca.colores;
  const tp = marca.tipografia;
  const m = marca.medidas.historia;

  const VENT = ventanas(g.escenas);
  const DUR = duracion(g.escenas);

  const escenas = g.escenas.map((e, i) => {
    const armar = tipos[e.tipo];
    if (!armar) throw new Error(`Tipo de escena desconocido: "${e.tipo}" (escena ${i + 1}).`);
    return `<div class="escena ${e.fondo === 'claro' ? 'claro' : ''}" id="${VENT[i].id}">${armar(e)}</div>`;
  }).join('\n');

  const firma = `${esc(marca.nombre.slice(0, marca.nombre_corte))}<span>${esc(marca.nombre.slice(marca.nombre_corte))}</span>`;

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
  .placa::after{
    content:"";position:absolute;right:-300px;bottom:-200px;width:1000px;height:1000px;
    pointer-events:none;
    background:radial-gradient(circle,rgba(47,224,174,.17) 0%,rgba(47,224,174,0) 62%);
  }

  .cabeza,.pie{position:relative;z-index:3;}
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

  .lienzo{flex:1;position:relative;z-index:2;}
  .escena{
    position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;
    gap:34px;
  }
  [data-t]{will-change:transform,opacity;}

  h1{font-weight:800;letter-spacing:-.028em;line-height:1.04;font-size:92px;}
  h1.chico{font-size:72px;}
  .ac{color:${c.verde_sobre_oscuro};}
  .sub{font-size:36px;line-height:1.4;color:${c.texto_sobre_oscuro};max-width:20ch;}

  .etiqueta{
    font-size:26px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;
    color:${c.verde_sobre_oscuro};
  }
  .monto{
    font-size:136px;font-weight:800;letter-spacing:-.035em;line-height:1;
    font-variant-numeric:tabular-nums;transform-origin:left center;
  }
  .nota{
    font-size:27px;font-weight:500;letter-spacing:.11em;text-transform:uppercase;
    color:${c.apagado_oscuro};
  }

  .tabla{display:flex;flex-direction:column;}
  .fila{
    display:flex;align-items:baseline;justify-content:space-between;gap:24px;
    padding:30px 0;border-top:1px solid ${c.linea_oscura};
  }
  .fila:last-child{border-bottom:1px solid ${c.linea_oscura};}
  .fila-k{font-size:36px;font-weight:500;color:${c.texto_sobre_oscuro};}
  .fila-v{
    font-size:60px;font-weight:800;letter-spacing:-.025em;white-space:nowrap;
    font-variant-numeric:tabular-nums;color:${c.verde_sobre_oscuro};
  }
  .nota-pie{font-size:30px;line-height:1.4;color:${c.texto_sobre_oscuro};max-width:24ch;}

  .cta{
    display:inline-flex;align-items:center;gap:14px;align-self:flex-start;
    font-size:32px;font-weight:700;padding:26px 42px;border-radius:12px;
    background:${c.verde_sobre_oscuro};color:#05231B;transform-origin:left center;
  }
</style>
</head>
<body>
<div class="placa">
  <div class="cabeza"><span class="eyebrow">${esc(g.eyebrow)}</span><span class="raya"></span></div>
  <div class="lienzo">
${escenas}
  </div>
  <div class="pie">
    <span class="mark">${firma}</span>
    <span class="sitio">${esc(marca.sitio)}</span>
  </div>
</div>

<script>
const VENT = ${JSON.stringify(VENT)};
const DURACION = ${DUR};
const CRUCE = ${CRUCE};

const paso   = (t,a,b) => b <= a ? (t >= b ? 1 : 0) : Math.max(0, Math.min(1, (t-a)/(b-a)));
const suave  = p => 1 - Math.pow(1-p, 3);
const rebote = p => { const c1=1.70158, c3=c1+1; return 1 + c3*Math.pow(p-1,3) + c1*Math.pow(p-1,2); };

const pinturas = {
  fade(el, p)    { el.style.opacity = String(p); el.style.transform = 'translateY(' + ((1-suave(p))*20).toFixed(2) + 'px)'; },
  sube(el, p)    { el.style.opacity = String(Math.min(1, p*1.8)); el.style.transform = 'translateY(' + ((1-suave(p))*52).toFixed(2) + 'px)'; },
  lateral(el, p) { el.style.opacity = String(p); el.style.transform = 'translateX(' + ((1-suave(p))*-34).toFixed(2) + 'px)'; },
  monto(el, p)   { el.style.opacity = String(p); el.style.transform = 'scale(' + (0.88+0.12*suave(p)).toFixed(4) + ')'; },
  pop(el, p)     { el.style.opacity = String(Math.min(1, p*2)); el.style.transform = 'scale(' + (0.72+0.28*rebote(p)).toFixed(4) + ')'; }
};

const escenas = VENT.map(v => {
  const el = document.getElementById(v.id);
  const partes = Array.from(el.querySelectorAll('[data-t]')).map(n => {
    const parte = { el:n, t:parseFloat(n.dataset.t), k:n.dataset.k || 'fade' };
    // El número sube desde cero. Se guarda el texto original para reconstruirlo
    // con el separador de miles de acá, no el del navegador.
    if (n.dataset.cuenta) {
      const crudo = n.textContent;
      const i = crudo.search(/[0-9]/);
      if (i >= 0) {
        const fin = crudo.length - [...crudo].reverse().join('').search(/[0-9]/);
        parte.cuenta = {
          antes: crudo.slice(0, i),
          despues: crudo.slice(fin),
          hasta: parseInt(crudo.slice(i, fin).replace(/[^0-9]/g, ''), 10) || 0
        };
      }
    }
    return parte;
  });
  return { ...v, el, partes };
});

for (const e of escenas) {
  e.el.style.opacity = '0';
  for (const p of e.partes) p.el.style.opacity = '0';
}

window.__cuadro = function (t) {
  for (const e of escenas) {
    const entra = paso(t, e.desde, e.desde + CRUCE);
    const sale  = 1 - paso(t, e.hasta - CRUCE, e.hasta);
    const vis = Math.min(entra, sale);
    e.el.style.opacity = String(vis);
    e.el.style.visibility = vis <= 0.001 ? 'hidden' : 'visible';
    if (vis <= 0.001) continue;

    const local = t - e.desde;
    for (const p of e.partes) {
      pinturas[p.k](p.el, paso(local, p.t, p.t + 0.5), p);
      if (p.cuenta) {
        const v = Math.round(p.cuenta.hasta * suave(paso(local, p.t + 0.12, p.t + 1.05)));
        p.el.textContent = p.cuenta.antes + v.toLocaleString('es-AR') + p.cuenta.despues;
      }
    }
  }
};

window.__cuadro(0);
</script>
</body>
</html>`;
}

module.exports = { documento, duracion, ventanas };
