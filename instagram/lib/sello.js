'use strict';

/**
 * El sello de marca: dos segundos y medio para pegar al final de cada reel.
 *
 * La S se dibuja antes de llenarse. Es el recurso clásico del logo animado y
 * acá sale casi gratis, porque el contorno que trazamos del PNG original es un
 * path cerrado: el mismo que se usa como relleno sirve como trazo, y se dibuja
 * con stroke-dashoffset. Primero aparece la silueta en verde, después se llena
 * de blanco y el trazo se apaga.
 *
 * Después cae el punto, entra el nombre tapado por su máscara y queda el sitio.
 * El último medio segundo es quieto a propósito: un sello que termina en
 * movimiento se corta mal cuando lo pegás atrás de otro video.
 */

const fs = require('fs');
const path = require('path');
const { esc } = require('./plantilla');

const ESE = fs.readFileSync(path.join(__dirname, 'ese.svg'), 'utf8');
const VIEWBOX = ESE.match(/viewBox="([^"]+)"/)[1];
const TRAZO = ESE.match(/ d="([^"]+)"/)[1];

const DURACION = 2.6;

function documento(marca, opciones) {
  const o = opciones || {};
  const c = marca.colores;
  const tp = marca.tipografia;
  const m = o.formato === 'post' ? marca.medidas.post : marca.medidas.historia;

  // Las piezas claras necesitan su propio sello: cortar de 20 segundos de
  // blanco a un cuadro negro es un golpe, no un cierre de marca.
  const claro = o.tono === 'claro';
  const t = claro ? {
    fondo: '#FAFBFC', letra: c.texto, acento: c.verde,
    sigla_fondo: 'rgba(14,158,122,.13)', apagado: c.apagado
  } : {
    fondo: c.tinta, letra: c.tinta_texto, acento: c.verde_sobre_oscuro,
    sigla_fondo: 'rgba(47,224,174,.15)', apagado: c.apagado_oscuro
  };

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>${esc(marca.nombre)} — sello</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=${encodeURIComponent(tp.familia)}:wght@${tp.pesos}&display=swap" rel="stylesheet">
<style>
  *{box-sizing:border-box;margin:0;padding:0;}
  body{background:#000;}
  .placa{
    width:${m.ancho}px;height:${m.alto}px;position:relative;overflow:hidden;
    display:flex;flex-direction:column;align-items:center;justify-content:center;gap:46px;
    background:${t.fondo};
    font-family:'${tp.familia}',${tp.respaldo};
    -webkit-font-smoothing:antialiased;
  }
  .halo{
    position:absolute;left:50%;top:50%;width:1200px;height:1200px;
    transform:translate(-50%,-50%);pointer-events:none;
    background:radial-gradient(circle,rgba(47,224,174,.20) 0%,rgba(47,224,174,0) 58%);
    will-change:transform,opacity;
  }
  .caja{position:relative;z-index:2;}
  .ese{display:block;height:430px;width:auto;overflow:visible;}
  .relleno{fill:${t.letra};}
  .contorno{fill:none;stroke:${t.acento};stroke-width:1.6;stroke-linejoin:round;}
  .punto{
    position:absolute;z-index:3;width:104px;height:104px;border-radius:50%;
    background:${t.acento};
    top:-26px;right:-118px;will-change:transform,opacity;
  }
  .nombre{
    position:relative;z-index:2;display:flex;align-items:center;gap:22px;
  }
  .mascara{overflow:hidden;padding-bottom:.12em;margin-bottom:-.12em;}
  .mascara > span{display:inline-block;will-change:transform,opacity;}
  .raiz{font-size:112px;font-weight:500;letter-spacing:-.02em;line-height:1;color:${t.letra};}
  .sigla{
    font-size:62px;font-weight:700;letter-spacing:.04em;line-height:1;
    padding:16px 22px;border-radius:16px;
    background:${t.sigla_fondo};color:${t.acento};
    will-change:transform,opacity;
  }
  .sitio{
    position:relative;z-index:2;font-size:30px;font-weight:500;letter-spacing:.06em;
    color:${t.apagado};will-change:opacity,transform;
  }
</style>
</head>
<body>
<div class="placa">
  <div class="halo"></div>

  <div class="caja">
    <svg class="ese" viewBox="${VIEWBOX}">
      <path class="relleno" d="${TRAZO}"/>
      <path class="contorno" d="${TRAZO}"/>
    </svg>
    <span class="punto"></span>
  </div>

  <div class="nombre">
    <div class="mascara"><span class="raiz">${esc(marca.avatar_nombre)}</span></div>
    <span class="sigla">${esc(marca.avatar_sigla)}</span>
  </div>

  <span class="sitio">${esc(marca.sitio)}</span>
</div>

<script>
const DUR = ${DURACION};
const paso  = (t,a,b) => b <= a ? (t >= b ? 1 : 0) : Math.max(0, Math.min(1, (t-a)/(b-a)));
const suave = p => 1 - Math.pow(1-p, 3);
const suaveIO = p => p < .5 ? 4*p*p*p : 1 - Math.pow(-2*p+2, 3)/2;
const rebote = p => { const c1=1.70158, c3=c1+1; return 1 + c3*Math.pow(p-1,3) + c1*Math.pow(p-1,2); };

const $ = s => document.querySelector(s);
const halo = $('.halo'), relleno = $('.relleno'), contorno = $('.contorno');
const punto = $('.punto'), raiz = $('.raiz'), sigla = $('.sigla'), sitio = $('.sitio');

const largo = contorno.getTotalLength();
contorno.style.strokeDasharray = largo;

const op = (el, v) => { el.style.opacity = String(Math.max(0, Math.min(1, v))); };

window.__cuadro = function (t) {
  halo.style.transform = 'translate(-50%,-50%) scale(' + (.82 + .3 * suave(paso(t, 0, 1.6))).toFixed(4) + ')';
  op(halo, paso(t, .1, 1.0) * .9);

  // 1. La silueta se dibuja.
  const pd = paso(t, .05, .95);
  contorno.style.strokeDashoffset = String(largo * (1 - suaveIO(pd)));
  // 2. Se llena, y el trazo se apaga para no dejar un borde verde pegado.
  const pr = paso(t, .72, 1.12);
  op(relleno, pr);
  op(contorno, pd > 0 ? 1 - pr : 0);

  // 3. El punto cae desde arriba y rebota en su lugar.
  const pp = paso(t, .95, 1.35);
  op(punto, Math.min(1, pp * 3));
  punto.style.transform = 'translateY(' + ((1 - rebote(pp)) * -150).toFixed(2) + 'px)'
    + ' scale(' + (.5 + .5 * rebote(pp)).toFixed(4) + ')';

  // 4. El nombre sube tapado por su máscara; la sigla entra después.
  const pn = paso(t, 1.25, 1.85);
  op(raiz, Math.min(1, pn * 1.8));
  raiz.style.transform = 'translateY(' + ((1 - suave(pn)) * 118).toFixed(2) + 'px)';
  const ps = paso(t, 1.55, 1.95);
  op(sigla, Math.min(1, ps * 2));
  sigla.style.transform = 'scale(' + (.74 + .26 * rebote(ps)).toFixed(4) + ')';

  // 5. El sitio, y de ahí al final queda quieto.
  const pt = paso(t, 1.85, 2.2);
  op(sitio, pt);
  sitio.style.transform = 'translateY(' + ((1 - suave(pt)) * 22).toFixed(2) + 'px)';
};

window.__cuadro(0);
</script>
</body>
</html>`;
}

module.exports = { documento, DURACION };
