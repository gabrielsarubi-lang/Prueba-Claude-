'use strict';

/**
 * Las portadas de las historias destacadas, y la serie que va adentro de cada una.
 *
 * La portada es un caso especial y conviene entender por qué antes de tocarla:
 * en el perfil se ve como un círculo de unos 64 px. A ese tamaño no se lee
 * ninguna palabra. Por eso las portadas son un ÍCONO y no un texto — el nombre
 * del rubro lo pone Instagram abajo del círculo, que es donde sí se lee.
 *
 * Las historias de adentro son placas verticales comunes: las arma plantilla.js
 * igual que las del feed, así una destacada y un posteo no pueden discrepar de
 * estilo.
 */

const plantilla = require('./plantilla');
const { esc } = plantilla;

/**
 * Íconos de trazo, en una caja de 24. Mismo lenguaje que los del sitio: trazo
 * parejo, puntas redondeadas, nada de relleno. A 64 px lo único que sobrevive
 * es la silueta, así que ninguno tiene detalles finos.
 */
const ICONOS = {
  chat: '<path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 20l1.1-5.5A8.38 8.38 0 0 1 4 11.5 8.5 8.5 0 0 1 12.5 3a8.38 8.38 0 0 1 8.5 8.5z"/>',
  casa: '<path d="M3.5 10.5 12 3.5l8.5 7"/><path d="M5.5 12.2V20h13v-7.8"/><path d="M10 20v-5h4v5"/>',
  cruz: '<rect x="3.5" y="3.5" width="17" height="17" rx="4"/><path d="M12 8v8"/><path d="M8 12h8"/>',
  destello: '<path d="M12 3.2 13.9 9 19.8 10.9 13.9 12.8 12 18.6 10.1 12.8 4.2 10.9 10.1 9z"/><path d="M18.6 16.2 19.4 18.4 21.6 19.2 19.4 20 18.6 22.2 17.8 20 15.6 19.2 17.8 18.4z"/>',
  pesa: '<path d="M4.2 9.6v4.8"/><path d="M7 7.4v9.2"/><path d="M17 7.4v9.2"/><path d="M19.8 9.6v4.8"/><path d="M7 12h10"/>',
  // El auto necesita ruedas redondas de verdad: con dos rayitas debajo de una
  // caja, a 64 px parece un banco de plaza.
  auto: '<path d="M5 13.4 6.4 9.3A2 2 0 0 1 8.3 7.9h7.4a2 2 0 0 1 1.9 1.4l1.4 4.1"/><path d="M3.6 13.4h16.8v3.4H3.6z"/><circle cx="7.6" cy="17.6" r="1.6"/><circle cx="16.4" cy="17.6" r="1.6"/>',
  caja: '<path d="M12 3.4 20.3 7.6v8.8L12 20.6 3.7 16.4V7.6z"/><path d="M3.7 7.6 12 11.8l8.3-4.2"/><path d="M12 11.8v8.8"/>'
};

const LADO = { ancho: 1080, alto: 1920 };

function portada(d, marca) {
  const icono = ICONOS[d.icono];
  if (!icono) throw new Error(`Ícono desconocido: "${d.icono}" (en "${d.slug}").`);
  return `<div class="portada" id="portada-${esc(d.slug)}">
  <div class="disco">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
         stroke-linecap="round" stroke-linejoin="round">${icono}</svg>
  </div>
</div>`;
}

function estilos(marca) {
  const c = marca.colores;
  return `
  .portada{
    width:${LADO.ancho}px;height:${LADO.alto}px;position:relative;overflow:hidden;
    display:flex;align-items:center;justify-content:center;
    background:${c.tinta};
  }
  .portada::after{
    content:"";position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);
    width:1100px;height:1100px;pointer-events:none;
    background:radial-gradient(circle,rgba(47,224,174,.14) 0%,rgba(47,224,174,0) 58%);
  }
  /* El recorte del círculo se lleva todo menos el centro. El ícono entra en una
     caja de 360, que a 64 px deja la silueta entera y todavía con aire. */
  .disco{
    position:relative;z-index:2;width:360px;height:360px;
    display:flex;align-items:center;justify-content:center;
    color:${c.verde_sobre_oscuro};
  }
  .disco svg{width:100%;height:100%;display:block;}
  `;
}

/** Portadas y series de todas las destacadas, en una sola página. */
function documento(contenido, marca) {
  const t = marca.tipografia;

  const piezas = contenido.destacadas.map((d) => {
    const historias = d.historias.map((h, i) => {
      const item = {
        archivo: `${d.slug}-${String(i + 1).padStart(2, '0')}`,
        tipo: h.tipo,
        fondo: h.fondo,
        eyebrow: h.eyebrow || d.nombre,
        foto: h.foto || d.foto,
        encuadre: h.encuadre || d.encuadre
      };
      item.historia = h.historia;
      return plantilla.placa(item, marca, 'historia');
    }).join('\n');
    return portada(d, marca) + '\n' + historias;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>${esc(marca.nombre)} — destacadas</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=${encodeURIComponent(t.familia)}:wght@${t.pesos}&display=swap" rel="stylesheet">
<style>${plantilla.estilos(marca)}${estilos(marca)}</style>
</head>
<body>
${piezas}
</body>
</html>`;
}

module.exports = { documento, portada, ICONOS, LADO };
