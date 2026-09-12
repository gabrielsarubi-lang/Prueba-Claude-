'use strict';

/**
 * Arma la página que se anima cuadro por cuadro para el reel.
 *
 * La animación no usa CSS animations a propósito: expone una función
 * window.__cuadro(t) que dibuja el estado exacto del segundo t. Así el
 * render es determinista — el cuadro 47 siempre sale igual — que es lo que
 * hace falta para exportar video sin saltos.
 */

const { esc } = require('./plantilla');

function documento(guion, marca) {
  const c = marca.colores;
  const t = marca.tipografia;
  const m = marca.medidas.historia;
  const claro = guion.fondo !== 'oscuro';

  const lineas = guion.titulo
    .map((l, i) => `<div class="linea" data-i="${i}"><span${l.verde ? ' class="ac"' : ''}>${esc(l.texto)}</span></div>`)
    .join('');

  const checks = guion.checks.items
    .map((x, i) => `<div class="check" data-i="${i}"><span class="tick">✓</span><span>${esc(x)}</span></div>`)
    .join('');

  const firma = `${esc(marca.nombre.slice(0, marca.nombre_corte))}<span>${esc(marca.nombre.slice(marca.nombre_corte))}</span>`;

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Reel — ${esc(guion.archivo)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=${encodeURIComponent(t.familia)}:wght@${t.pesos}&display=swap" rel="stylesheet">
<style>
  *{box-sizing:border-box;margin:0;padding:0;}
  body{background:#000;}

  #escena{
    width:${m.ancho}px;height:${m.alto}px;position:relative;overflow:hidden;
    padding:${m.margen_arriba}px ${m.margen}px ${m.margen_abajo}px;
    display:flex;flex-direction:column;
    font-family:'${t.familia}',${t.respaldo};
    -webkit-font-smoothing:antialiased;
    background:${claro ? '#FFFFFF' : c.tinta};
    color:${claro ? c.texto : c.tinta_texto};
  }

  /* Fondo ambiente: respira lento durante todo el reel. */
  #halo{
    position:absolute;right:-330px;top:80px;width:940px;height:940px;
    pointer-events:none;transform-origin:center;
    background:radial-gradient(circle,
      ${claro ? 'rgba(14,158,122,.13)' : 'rgba(47,224,174,.19)'} 0%,
      ${claro ? 'rgba(14,158,122,0)' : 'rgba(47,224,174,0)'} 64%);
  }

  .capa{position:relative;z-index:2;}

  #cabeza{display:flex;align-items:center;gap:18px;}
  #eyebrow{
    font-size:24px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;
    color:${claro ? c.verde : c.verde_sobre_oscuro};white-space:nowrap;
  }
  #raya{flex:1;height:1px;background:${claro ? c.linea : c.linea_oscura};transform-origin:left center;}

  #cuerpo{flex:1;display:flex;flex-direction:column;justify-content:center;gap:44px;}

  #titulo{font-weight:800;letter-spacing:-.028em;line-height:1.03;font-size:88px;}
  /* Cada línea entra desde abajo tapada por su propia máscara. */
  .linea{overflow:hidden;padding-bottom:.08em;margin-bottom:-.08em;}
  .linea span{display:inline-block;will-change:transform,opacity;}
  .ac{color:${claro ? c.verde : c.verde_sobre_oscuro};}

  #precio{
    font-size:128px;font-weight:800;letter-spacing:-.03em;line-height:1;
    color:${claro ? c.verde : c.verde_sobre_oscuro};
    font-variant-numeric:tabular-nums;transform-origin:left center;will-change:transform,opacity;
  }
  #nota{
    font-size:26px;font-weight:500;letter-spacing:.1em;text-transform:uppercase;
    color:${c.apagado};margin-top:16px;
  }

  #checks{display:flex;flex-direction:column;gap:22px;}
  .check{display:flex;align-items:center;gap:20px;font-size:34px;font-weight:500;will-change:transform,opacity;}
  .tick{
    width:38px;height:38px;border-radius:10px;flex-shrink:0;
    display:flex;align-items:center;justify-content:center;font-size:23px;font-weight:700;
    background:${claro ? c.verde_claro : 'rgba(47,224,174,.14)'};
    color:${claro ? c.verde_fuerte : c.verde_sobre_oscuro};
  }

  #pie{display:flex;align-items:center;justify-content:space-between;gap:24px;}
  #marca{font-size:34px;font-weight:700;color:${claro ? c.texto : c.tinta_texto};will-change:transform,opacity;}
  #marca span{color:${claro ? c.verde : c.verde_sobre_oscuro};}
  #cta{
    display:inline-flex;align-items:center;gap:14px;white-space:nowrap;
    font-size:30px;font-weight:700;padding:24px 38px;border-radius:12px;letter-spacing:-.005em;
    background:${claro ? c.verde : c.verde_sobre_oscuro};
    color:${claro ? '#FFFFFF' : '#05231B'};
    transform-origin:center;will-change:transform,opacity;
  }
</style>
</head>
<body>
<div id="escena">
  <div id="halo"></div>
  <div id="cabeza" class="capa">
    <span id="eyebrow">${esc(guion.eyebrow)}</span>
    <span id="raya"></span>
  </div>
  <div id="cuerpo" class="capa">
    <div id="titulo">${lineas}</div>
    <div id="bloque-precio">
      <div id="precio">${esc(guion.precio.moneda)} 0</div>
      <div id="nota">${esc(guion.precio.nota)}</div>
    </div>
    <div id="checks">${checks}</div>
  </div>
  <div id="pie" class="capa">
    <span id="marca">${firma}</span>
    <span id="cta">${esc(guion.cta.texto)}</span>
  </div>
</div>

<script>
const G = ${JSON.stringify(guion)};

/* ---- curvas ---- */
const paso  = (t,a,b) => Math.max(0, Math.min(1, (t-a)/(b-a)));
const suave = p => 1 - Math.pow(1-p, 3);                 // frena al llegar
const rebote = p => {                                    // se pasa y vuelve
  const c1 = 1.70158, c3 = c1 + 1;
  return 1 + c3*Math.pow(p-1,3) + c1*Math.pow(p-1,2);
};

const $  = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));

const eEyebrow = $('#eyebrow');
const eRaya    = $('#raya');
const eHalo    = $('#halo');
const ePrecio  = $('#precio');
const eNota    = $('#nota');
const eCta     = $('#cta');
const eMarca   = $('#marca');
const eLineas  = $$('.linea span');
const eChecks  = $$('.check');

/** Aparece subiendo. */
function entrar(el, t, desde, dur, alto, curva) {
  const p = (curva || suave)(paso(t, desde, desde + dur));
  el.style.opacity = String(Math.min(1, paso(t, desde, desde + dur * 0.55)));
  el.style.transform = 'translateY(' + ((1 - p) * alto).toFixed(2) + 'px)';
}

window.__cuadro = function (t) {
  // Ambiente: una respiración lenta de punta a punta.
  eHalo.style.transform = 'scale(' + (1 + 0.09 * (t / G.duracion)).toFixed(4) + ')';

  entrar(eEyebrow, t, 0.10, 0.50, 18);
  eRaya.style.transform = 'scaleX(' + suave(paso(t, 0.22, 0.95)).toFixed(4) + ')';

  // Título: cada línea sube tapada por su máscara.
  eLineas.forEach((el, i) => {
    const L = G.titulo[i];
    entrar(el, t, L.entra, L.rebote ? 0.70 : 0.60, 110, L.rebote ? rebote : suave);
  });

  // Precio: entra y el número sube hasta el valor final.
  const P = G.precio;
  const pe = suave(paso(t, P.entra, P.entra + 0.45));
  ePrecio.style.opacity = String(pe);
  ePrecio.style.transform = 'scale(' + (0.88 + 0.12 * pe).toFixed(4) + ')';

  const cuenta = suave(paso(t, P.cuenta_desde, P.cuenta_hasta));
  const valor = Math.round(P.hasta * cuenta);
  ePrecio.textContent = P.moneda + ' ' + valor.toLocaleString('es-AR');

  eNota.style.opacity = String(suave(paso(t, P.nota_entra, P.nota_entra + 0.4)));

  // Checks: uno detrás de otro, entrando desde la izquierda.
  eChecks.forEach((el, i) => {
    const desde = G.checks.entra + i * G.checks.escalonado;
    const p = suave(paso(t, desde, desde + 0.45));
    el.style.opacity = String(p);
    el.style.transform = 'translateX(' + ((1 - p) * -34).toFixed(2) + 'px)';
  });

  // Cierre.
  const pc = rebote(paso(t, G.cta.entra, G.cta.entra + 0.55));
  eCta.style.opacity = String(Math.min(1, paso(t, G.cta.entra, G.cta.entra + 0.3)));
  eCta.style.transform = 'scale(' + (0.7 + 0.3 * pc).toFixed(4) + ')';

  entrar(eMarca, t, G.marca_entra, 0.45, 16);
};

window.__cuadro(0);
</script>
</body>
</html>`;
}

module.exports = { documento };
