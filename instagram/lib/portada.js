'use strict';

/**
 * Portadas de reel.
 *
 * Una portada no es un cuadro del video. Es la pieza que tiene que ganar dos
 * peleas distintas al mismo tiempo:
 *
 *   1. En la grilla del perfil, donde mide ~110px de ancho y nadie lee nada.
 *      Ahí sólo se percibe la mancha: el verde, la forma, la vía de cuatro
 *      pasos. Por eso la composición repite la del resto de la grilla — que se
 *      reconozca como nuestra antes de que se lea.
 *
 *   2. En la pestaña de reels y en el feed, donde sí se lee. Ahí manda la
 *      jerarquía de texto.
 *
 * Instagram recorta la portada distinto en cada lugar (1:1 en algunas vistas,
 * 4:5 en la grilla, 9:16 completo en la pestaña de reels). El único rectángulo
 * que sobrevive a los tres es el cuadrado del medio: de y=420 a y=1500. Los
 * márgenes de arriba y abajo de este archivo están puestos para que todo lo que
 * importa caiga adentro de esa zona, y no son los mismos que los de una
 * historia.
 */

// Medidos contra el cuadrado del medio, no contra la placa: con estos valores
// la composición entera (desde el eyebrow hasta la firma) entra en y=420..1500,
// que es lo único que sobrevive a los tres recortes. Un margen más chico se ve
// mejor a pantalla completa y pierde la firma en la grilla, que es donde la
// marca tiene que estar.
const ARRIBA = 445;
const ABAJO = 430;

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// *así* queda en verde; los saltos de línea del JSON se respetan.
function texto(s) {
  return esc(s)
    .replace(/\*([^*]+)\*/g, '<span class="ac">$1</span>')
    .replace(/\n/g, '<br>');
}

function documento(p, marca) {
  const c = marca.colores;
  const tp = marca.tipografia;
  const m = marca.medidas.historia;

  const firma = `${esc(marca.nombre.slice(0, marca.nombre_corte))}<span>${esc(marca.nombre.slice(marca.nombre_corte))}</span>`;

  // La vía va entera encendida: en la portada no es una animación en curso,
  // es el índice de lo que el video muestra. Cuatro palabras que, aun ilegibles
  // en miniatura, dibujan la forma de un proceso.
  const nodos = (p.pasos || []).map((r) => `
    <div class="nodo">
      <span class="punto"><i></i></span>
      <span class="rotulo">${esc(r)}</span>
    </div>`).join('');

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Portada — ${esc(p.archivo)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=${encodeURIComponent(tp.familia)}:wght@${tp.pesos}&display=swap" rel="stylesheet">
<style>
  *{box-sizing:border-box;margin:0;padding:0;}
  body{background:#000;}

  .placa{
    width:${m.ancho}px;height:${m.alto}px;position:relative;overflow:hidden;
    padding:${ARRIBA}px ${m.margen}px ${ABAJO}px;
    display:flex;flex-direction:column;
    font-family:'${tp.familia}',${tp.respaldo};
    -webkit-font-smoothing:antialiased;
    background:${c.tinta};color:${c.tinta_texto};
  }

  /* El mismo fondo que el reel: la portada y el primer cuadro del video
     tienen que ser la misma pieza, no dos cosas parecidas. */
  .grilla{
    position:absolute;left:-80px;top:-80px;width:calc(100% + 160px);height:calc(100% + 160px);
    background-image:radial-gradient(rgba(255,255,255,.055) 1.6px, transparent 1.6px);
    background-size:46px 46px;
  }
  .halo{
    position:absolute;left:50%;top:50%;width:1240px;height:1240px;
    transform:translate(-50%,-50%);pointer-events:none;
    background:radial-gradient(circle,rgba(47,224,174,.20) 0%,rgba(47,224,174,0) 60%);
  }

  .cabeza,.pie,.via,.centro{position:relative;z-index:3;}
  .cabeza{display:flex;align-items:center;gap:18px;}
  .eyebrow{
    font-size:24px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;
    color:${c.verde_sobre_oscuro};white-space:nowrap;
  }
  .raya{flex:1;height:1px;background:${c.linea_oscura};}

  /* ------------------------------------------------------------ el centro */
  .centro{flex:1;display:flex;flex-direction:column;justify-content:center;}

  /* La hora es lo mismo que abre el video. Que la portada y el primer segundo
     muestren el mismo dato hace que al tocar el reel no haya corte. */
  .hora{
    font-size:128px;font-weight:700;line-height:1;letter-spacing:-.02em;
    font-variant-numeric:tabular-nums;color:${c.verde_sobre_oscuro};
  }
  .hora small{
    display:block;margin-top:18px;
    font-size:26px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;
    color:${c.apagado_oscuro};
  }

  h1{
    margin-top:50px;
    font-size:84px;font-weight:700;line-height:1.08;letter-spacing:-.025em;
    text-wrap:balance;
  }
  h1 .ac{color:${c.verde_sobre_oscuro};}

  .bajada{
    margin-top:34px;max-width:860px;
    font-size:40px;font-weight:400;line-height:1.38;color:${c.texto_sobre_oscuro};
  }

  /* -------------------------------------------------------------- la vía */
  .via{margin-top:56px;height:124px;position:relative;}
  .riel{
    position:absolute;left:9px;right:9px;top:17px;height:3px;border-radius:2px;
    background:${c.verde_sobre_oscuro};opacity:.75;
  }
  .nodos{position:absolute;left:0;right:0;top:0;display:flex;justify-content:space-between;}
  .nodo{display:flex;flex-direction:column;align-items:center;gap:15px;width:160px;}
  .punto{
    width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;
    background:${c.tinta};border:3px solid ${c.verde_sobre_oscuro};
  }
  .punto i{display:block;width:14px;height:14px;border-radius:50%;background:${c.verde_sobre_oscuro};}
  .rotulo{
    font-size:21px;font-weight:600;letter-spacing:.11em;text-transform:uppercase;
    color:${c.tinta_texto};white-space:nowrap;
  }

  .pie{display:flex;align-items:center;justify-content:space-between;gap:24px;}
  .mark{font-size:34px;font-weight:700;color:${c.tinta_texto};}
  .mark span{color:${c.verde_sobre_oscuro};}
  .sitio{font-size:26px;font-weight:500;letter-spacing:.02em;color:${c.apagado_oscuro};}
</style>
</head>
<body>
<div class="placa">
  <div class="grilla"></div>
  <div class="halo"></div>

  <div class="cabeza">
    <span class="eyebrow">${esc(p.eyebrow)}</span>
    <span class="raya"></span>
  </div>

  <div class="centro">
    ${p.hora ? `<div class="hora">${esc(p.hora)}<small>${esc(p.hora_pie || '')}</small></div>` : ''}
    <h1>${texto(p.titulo)}</h1>
    ${p.bajada ? `<p class="bajada">${texto(p.bajada)}</p>` : ''}
  </div>

  <div class="via">
    <div class="riel"></div>
    <div class="nodos">${nodos}</div>
  </div>

  <div class="pie">
    <span class="mark">${firma}</span>
    <span class="sitio">${esc(marca.sitio)}</span>
  </div>
</div>
</body>
</html>`;
}

module.exports = { documento };
