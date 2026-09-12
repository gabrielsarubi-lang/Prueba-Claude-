'use strict';

/**
 * Reel de venta del agente de WhatsApp.
 *
 * A diferencia de los reels de marca, este tiene ESCENAS: el contenido cambia a
 * lo largo del video en vez de entrar sobre una placa fija. Por eso vive en su
 * propio módulo y no encima de plantilla.js — forzar una cosa dentro de la otra
 * habría complicado las dos.
 *
 * Lo que se mantiene igual es el marco: el encabezado arriba y la firma con el
 * sitio abajo están desde el primer cuadro hasta el último, y las escenas pasan
 * en el medio.
 */

const { esc, texto } = require('./plantilla');

/** Ventanas de cada escena, en segundos. Se superponen 0.35s para el cruce. */
const ESCENAS = [
  { id: 'hook',   desde: 0.0,   hasta: 3.00 },
  { id: 'chat',   desde: 2.75,  hasta: 11.60 },
  { id: 'como',   desde: 11.35, hasta: 15.00 },
  { id: 'oferta', desde: 15.00, hasta: 20.00 }
];

function burbuja(m, t) {
  const mio = m.de === 'agente';
  const tipeo = m.tipeo || 0;
  return `<div class="fila ${mio ? 'mia' : 'suya'}" data-t="${t}" data-k="burbuja"${tipeo ? ` data-tipeo="${tipeo}"` : ''}>
      <div class="burbuja">
        ${tipeo ? '<div class="puntos"><i></i><i></i><i></i></div>' : ''}
        <div class="dicho"><span class="msj">${esc(m.texto)}</span><span class="hora">${esc(m.hora)}</span></div>
      </div>
    </div>`;
}

function documento(g, marca) {
  const c = marca.colores;
  const tp = marca.tipografia;
  const m = marca.medidas.historia;

  // Las burbujas entran con el ritmo de una charla real: la respuesta del
  // agente tarda lo que tarda el indicador de "escribiendo". Las pausas son
  // cortas a propósito — el remate tiene que quedar en pantalla el tiempo
  // suficiente para leerse antes de que corte la escena.
  let reloj = 0.55;
  const mensajes = g.chat.mensajes.map((msj) => {
    const html = burbuja(msj, reloj.toFixed(2));
    reloj += (msj.tipeo || 0) + (msj.de === 'agente' ? 0.85 : 1.25);
    return html;
  }).join('');
  const tRemate = (reloj + 0.1).toFixed(2);

  const pasos = g.como.pasos.map((p, i) => `
    <div class="paso-c" data-t="${(0.55 + i * 0.42).toFixed(2)}" data-k="lateral">
      <span class="paso-n">${String(i + 1).padStart(2, '0')}</span>
      <div><div class="paso-t">${esc(p.t)}</div><div class="paso-d">${esc(p.d)}</div></div>
    </div>`).join('');

  const checks = g.oferta.checks.map((x, i) => `
    <div class="check" data-t="${(1.35 + i * 0.16).toFixed(2)}" data-k="lateral">
      <span class="tick">✓</span>${esc(x)}
    </div>`).join('');

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
    pointer-events:none;transform-origin:center;
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

  /* Las escenas se apilan en el mismo lugar y se cruzan. */
  .lienzo{flex:1;position:relative;z-index:2;}
  .escena{
    position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;
  }
  /* El chat crece hacia abajo, así que arranca abajo del encabezado y no
     centrado; el respiro lo separa de la línea de arriba. */
  .escena[data-modo="arriba"]{justify-content:flex-start;padding-top:62px;}
  [data-t]{will-change:transform,opacity;}

  h1{font-weight:800;letter-spacing:-.028em;line-height:1.03;font-size:96px;}
  .ac{color:${c.verde_sobre_oscuro};}
  .sub{font-size:36px;line-height:1.4;color:${c.texto_sobre_oscuro};max-width:20ch;}

  .hora-grande{
    font-size:30px;font-weight:700;letter-spacing:.14em;color:${c.verde_sobre_oscuro};
    font-variant-numeric:tabular-nums;margin-bottom:28px;
  }
  .hook-sub{margin-top:38px;}

  /* ---------------------------------------------------------------- chat */
  .titulo-chico{
    font-size:44px;font-weight:700;letter-spacing:-.02em;margin-bottom:38px;
  }
  .fila{display:flex;margin-bottom:22px;}
  .fila.suya{justify-content:flex-start;}
  .fila.mia{justify-content:flex-end;}
  .burbuja{
    max-width:74%;border-radius:22px;padding:26px 30px;
    display:flex;align-items:center;min-height:96px;
  }
  .suya .burbuja{background:#181D24;border-bottom-left-radius:8px;}
  .mia .burbuja{background:${c.verde_sobre_oscuro};border-bottom-right-radius:8px;}
  .dicho{display:block;}
  .msj{font-size:31px;line-height:1.35;font-weight:500;}
  .suya .msj{color:${c.tinta_texto};}
  .mia .msj{color:#05231B;}
  .hora{
    display:block;font-size:21px;font-weight:500;margin-top:10px;
    font-variant-numeric:tabular-nums;
  }
  .suya .hora{color:${c.apagado_oscuro};}
  .mia .hora{color:rgba(5,35,27,.55);}

  .puntos{display:flex;gap:11px;align-items:center;padding:4px 2px;}
  .puntos i{width:15px;height:15px;border-radius:50%;background:#05231B;opacity:.35;display:block;}

  .remate{
    font-size:34px;font-weight:700;letter-spacing:-.015em;margin-top:14px;
    color:${c.verde_sobre_oscuro};
  }

  /* --------------------------------------------------------- cómo funciona */
  .paso-c{display:flex;gap:30px;align-items:flex-start;padding:30px 0;border-top:1px solid ${c.linea_oscura};}
  .paso-c:last-of-type{border-bottom:1px solid ${c.linea_oscura};}
  .paso-n{
    font-size:28px;font-weight:700;letter-spacing:.06em;color:${c.verde_sobre_oscuro};
    width:58px;flex-shrink:0;font-variant-numeric:tabular-nums;padding-top:8px;
  }
  .paso-t{font-size:42px;font-weight:700;letter-spacing:-.018em;line-height:1.15;}
  .paso-d{font-size:27px;color:${c.texto_sobre_oscuro};margin-top:8px;line-height:1.35;}

  /* ------------------------------------------------------------- oferta */
  .etiqueta{
    font-size:24px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;
    color:${c.verde_sobre_oscuro};margin-bottom:26px;
  }
  .precio{
    font-size:132px;font-weight:800;letter-spacing:-.03em;line-height:1;
    color:${c.verde_sobre_oscuro};font-variant-numeric:tabular-nums;transform-origin:left center;
  }
  .checks{display:flex;flex-direction:column;gap:22px;margin-top:46px;}
  .check{display:flex;align-items:center;gap:20px;font-size:34px;font-weight:500;}
  .tick{
    width:38px;height:38px;border-radius:10px;flex-shrink:0;
    display:flex;align-items:center;justify-content:center;font-size:23px;font-weight:700;
    background:rgba(47,224,174,.14);color:${c.verde_sobre_oscuro};
  }
  .cta{
    display:inline-flex;align-items:center;gap:14px;align-self:flex-start;
    font-size:32px;font-weight:700;padding:26px 42px;border-radius:12px;
    background:${c.verde_sobre_oscuro};color:#05231B;margin-top:52px;transform-origin:left center;
  }
</style>
</head>
<body>
<div class="placa">
  <div class="cabeza">
    <span class="eyebrow">${esc(g.eyebrow)}</span><span class="raya"></span>
  </div>

  <div class="lienzo">

    <div class="escena" id="hook">
      <div class="hora-grande" data-t="0.35" data-k="fade">${esc(g.hook.hora)}</div>
      <h1 data-t="0.55" data-k="sube">${texto(g.hook.titulo)}</h1>
      <p class="sub hook-sub" data-t="1.5" data-k="fade">${texto(g.hook.sub)}</p>
    </div>

    <div class="escena" id="chat" data-modo="arriba">
      <div class="titulo-chico" data-t="0.15" data-k="fade">${esc(g.chat.titulo)}</div>
      ${mensajes}
      <div class="remate" data-t="${tRemate}" data-k="sube">${esc(g.chat.remate)}</div>
    </div>

    <div class="escena" id="como">
      <h1 style="font-size:64px" data-t="0.15" data-k="sube">${esc(g.como.titulo)}</h1>
      <div style="margin-top:40px">${pasos}</div>
    </div>

    <div class="escena" id="oferta">
      <div class="etiqueta" data-t="0.3" data-k="fade">${esc(g.oferta.etiqueta)}</div>
      <div class="precio" data-t="0.55" data-k="precio">${esc(g.oferta.precio)}</div>
      <div class="checks">${checks}</div>
      <span class="cta" data-t="2.25" data-k="pop">${texto(g.oferta.cta)}</span>
    </div>

  </div>

  <div class="pie">
    <span class="mark">${firma}</span>
    <span class="sitio">${esc(marca.sitio)}</span>
  </div>
</div>

<script>
const ESCENAS = ${JSON.stringify(ESCENAS)};
const DURACION = ${g.duracion};
const CRUCE = 0.35;

const paso   = (t,a,b) => b <= a ? (t >= b ? 1 : 0) : Math.max(0, Math.min(1, (t-a)/(b-a)));
const suave  = p => 1 - Math.pow(1-p, 3);
const rebote = p => { const c1=1.70158, c3=c1+1; return 1 + c3*Math.pow(p-1,3) + c1*Math.pow(p-1,2); };

const pinturas = {
  fade(el, p)    { el.style.opacity = String(p); el.style.transform = 'translateY(' + ((1-suave(p))*22).toFixed(2) + 'px)'; },
  sube(el, p)    { el.style.opacity = String(Math.min(1, p*1.8)); el.style.transform = 'translateY(' + ((1-suave(p))*48).toFixed(2) + 'px)'; },
  lateral(el, p) { el.style.opacity = String(p); el.style.transform = 'translateX(' + ((1-suave(p))*-34).toFixed(2) + 'px)'; },
  precio(el, p)  { el.style.opacity = String(p); el.style.transform = 'scale(' + (0.88+0.12*suave(p)).toFixed(4) + ')'; },
  pop(el, p)     { el.style.opacity = String(Math.min(1, p*2)); el.style.transform = 'scale(' + (0.72+0.28*rebote(p)).toFixed(4) + ')'; },
  burbuja(el, p) { el.style.opacity = String(Math.min(1, p*1.6)); el.style.transform = 'scale(' + (0.9+0.1*rebote(p)).toFixed(4) + ')'; }
};

const escenas = ESCENAS.map(e => {
  const el = document.getElementById(e.id);
  return { ...e, el, partes: Array.from(el.querySelectorAll('[data-t]')).map(p => ({
    el: p,
    t: parseFloat(p.dataset.t),
    k: p.dataset.k || 'fade',
    tipeo: p.dataset.tipeo ? parseFloat(p.dataset.tipeo) : 0,
    puntos: p.querySelector('.puntos'),
    dicho: p.querySelector('.dicho')
  })) };
});

for (const e of escenas) {
  e.el.style.opacity = '0';
  for (const p of e.partes) { p.el.style.opacity = '0'; if (p.k === 'burbuja') p.el.style.transformOrigin = p.el.classList.contains('mia') ? 'right bottom' : 'left bottom'; }
}

window.__cuadro = function (t) {
  // Respiración del fondo, de punta a punta.
  document.querySelector('.placa').style.setProperty('--halo', String(1 + 0.09 * (t / DURACION)));

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

      // El agente "escribe" antes de contestar: primero los puntos, después
      // el mensaje. La burbuja crece al cambiar, igual que en un chat real.
      if (p.tipeo) {
        const listo = local >= p.t + p.tipeo;
        p.puntos.style.display = listo ? 'none' : 'flex';
        p.dicho.style.display  = listo ? 'block' : 'none';
        if (!listo) {
          // Los tres puntos laten por turno.
          const ciclo = (local - p.t) * 2.6;
          Array.from(p.puntos.children).forEach((punto, i) => {
            const f = (Math.sin((ciclo - i * 0.22) * Math.PI * 2) + 1) / 2;
            punto.style.opacity = (0.28 + 0.55 * f).toFixed(3);
          });
        }
      }
    }
  }
};

window.__cuadro(0);
</script>
</body>
</html>`;
}

module.exports = { documento, ESCENAS };
