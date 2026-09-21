'use strict';

/**
 * El avatar de Instagram, en varias versiones.
 *
 * Instagram recorta la imagen a un círculo y después la muestra chica: 110 px
 * en el perfil y 32 px al lado de cada posteo. Eso manda dos decisiones que no
 * se pueden discutir:
 *
 *   1. Nada importante cerca de los bordes, porque el círculo se come las
 *      esquinas del cuadrado que subís.
 *   2. Cuantos menos elementos, mejor. A 32 px una palabra no se lee; una
 *      letra sí.
 *
 * Por eso el punto verde entra más adentro que en el logo original: ahí estaba
 * casi pegado a la esquina, que en un círculo es justo lo que se recorta.
 */

const { esc } = require('./plantilla');

const LADO = 1080;

/** Cada versión: qué dibuja y sobre qué fondo. */
const VERSIONES = [
  {
    id: 'sarubi-ai',
    nombre: 'S con la palabra',
    nota: 'La S, el nombre abajo y la etiqueta AI. Se lee en el perfil; en el feed queda la S.',
    fondo: 'tinta',
    marca: 'conjunto',
    punto: true
  },
  {
    id: 'ese-punto',
    nombre: 'S con punto',
    nota: 'La continuación del logo que ya usás. Es la recomendada.',
    fondo: 'tinta',
    marca: 'letra',
    punto: true
  },
  {
    id: 'ese-sola',
    nombre: 'S sola',
    nota: 'La misma sin el punto. Es la que mejor aguanta los 32 px del feed.',
    fondo: 'tinta',
    marca: 'letra',
    punto: false
  },
  {
    id: 'ese-verde',
    nombre: 'S sobre verde',
    nota: 'Invertida. Sobre el fondo blanco de Instagram salta más que la oscura.',
    fondo: 'verde',
    marca: 'letra',
    punto: false
  },
  {
    id: 'palabra',
    nombre: 'La palabra entera',
    nota: 'Se lee en el perfil y no se lee en el feed. Está para que compares.',
    fondo: 'tinta',
    marca: 'palabra',
    punto: false
  }
];

function pieza(v, marca) {
  const n = marca.nombre;
  const i = marca.nombre_corte;

  let contenido;
  if (v.marca === 'palabra') {
    contenido = `<div class="palabra">${esc(n.slice(0, i))}<span>${esc(n.slice(i))}</span></div>`;
  } else if (v.marca === 'conjunto') {
    contenido = `<div class="conjunto">
      <div class="letra chica">${esc(n[0])}</div>
      <div class="renglon">
        <span class="nombre">${esc(marca.avatar_nombre)}</span>
        <span class="sigla">${esc(marca.avatar_sigla)}</span>
      </div>
    </div>`;
  } else {
    contenido = `<div class="letra">${esc(n[0])}</div>`;
  }

  return `<div class="avatar f-${v.fondo}" id="${esc(v.id)}">
    ${contenido}
    ${v.punto ? `<span class="punto${v.marca === 'conjunto' ? ' alto' : ''}"></span>` : ''}
  </div>`;
}

function estilos(marca) {
  const c = marca.colores;
  const t = marca.tipografia;

  return `
  *{box-sizing:border-box;margin:0;padding:0;}
  body{background:#2a2f36;display:flex;flex-wrap:wrap;gap:40px;padding:40px;}

  .avatar{
    width:${LADO}px;height:${LADO}px;position:relative;overflow:hidden;
    display:flex;align-items:center;justify-content:center;
    font-family:'${t.familia}',${t.respaldo};
    -webkit-font-smoothing:antialiased;
  }
  .f-tinta{background:${c.tinta};}
  .f-verde{background:${c.verde_sobre_oscuro};}

  /* El halo de las placas, para que el avatar no sea un rectángulo plano al
     lado de todo lo demás. Va abajo a la derecha, donde el círculo lo corta
     en diagonal y queda como una luz que entra. */
  .f-tinta::after{
    content:"";position:absolute;right:-180px;bottom:-200px;width:820px;height:820px;
    background:radial-gradient(circle,rgba(47,224,174,.20) 0%,rgba(47,224,174,0) 62%);
  }

  .letra{
    font-size:660px;font-weight:800;line-height:1;letter-spacing:-.02em;
    position:relative;z-index:2;
    /* La "S" de Inter carga un poco arriba: sin esto queda alta en el círculo. */
    transform:translateY(-14px);
  }
  .f-tinta .letra{color:${c.tinta_texto};}
  .f-verde .letra{color:${c.tinta};}

  /* La S con el nombre abajo. El bloque entero se centra como una sola pieza:
     si se centrara la S sola, el nombre colgaría del círculo. */
  .conjunto{
    position:relative;z-index:2;display:flex;flex-direction:column;
    align-items:center;gap:0;
  }
  .letra.chica{font-size:600px;transform:none;}
  .renglon{display:flex;align-items:center;gap:22px;}
  .nombre{
    font-size:118px;font-weight:500;letter-spacing:-.02em;line-height:1;
    color:${c.tinta_texto};
  }
  .sigla{
    font-size:64px;font-weight:700;letter-spacing:.04em;line-height:1;
    padding:16px 22px;border-radius:16px;
    background:rgba(47,224,174,.15);color:${c.verde_sobre_oscuro};
  }

  .palabra{
    font-size:190px;font-weight:800;letter-spacing:-.035em;line-height:1;
    position:relative;z-index:2;color:${c.tinta_texto};
  }
  .palabra span{color:${c.verde_sobre_oscuro};}

  /* El punto va en la diagonal de arriba a la derecha, a 382 px del centro.
     Más adentro toca el brazo de la S; más afuera lo recorta el círculo (el
     borde exterior queda a 462 de 540, con 78 px de aire). */
  .punto{
    position:absolute;z-index:3;width:160px;height:160px;border-radius:50%;
    background:${c.verde_sobre_oscuro};
    top:calc(50% - 270px - 80px);
    left:calc(50% + 270px - 80px);
  }
  /* En la versión con el nombre, el punto sube: va arriba y apenas a la
     derecha, a 455 px del centro. Ahí queda como un satélite de la S en vez de
     un adorno pegado a ella, y el borde exterior cae a 514 de 540, con 26 px
     de aire antes del recorte circular. */
  .punto.alto{
    width:118px;height:118px;
    top:calc(50% - 405px - 59px);
    left:calc(50% + 207px - 59px);
  }
  `;
}

function documento(marca) {
  const t = marca.tipografia;
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>${esc(marca.nombre)} — avatar</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=${encodeURIComponent(t.familia)}:wght@${t.pesos}&display=swap" rel="stylesheet">
<style>${estilos(marca)}</style>
</head>
<body>
${VERSIONES.map((v) => pieza(v, marca)).join('\n')}
</body>
</html>`;
}

// ------------------------------------------------- hoja de comparación

/** Los tamaños reales a los que Instagram muestra el avatar. */
const TAMANOS = [
  { px: 320, donde: 'Al abrir la foto' },
  { px: 110, donde: 'En el perfil' },
  { px: 56,  donde: 'Historias y sugeridos' },
  { px: 32,  donde: 'Al lado de cada posteo' }
];

/**
 * Las cuatro versiones a los tamaños en que se van a ver de verdad, sobre los
 * dos fondos de Instagram. La decisión no se toma mirando un PNG de 1080: se
 * toma mirando el de 32.
 */
function documentoComparacion(marca) {
  const t = marca.tipografia;

  const fila = (v) => {
    const circulos = TAMANOS.map((s) => `
      <div class="celda">
        <div class="circulo" style="width:${s.px}px;height:${s.px}px">
          <div class="lente" style="transform:scale(${(s.px / LADO).toFixed(5)})">
            ${pieza(v, marca).replace(`id="${v.id}"`, '')}
          </div>
        </div>
        <span class="medida">${s.px} px</span>
      </div>`).join('');

    return `<div class="fila">
      <div class="rotulo"><h3>${esc(v.nombre)}</h3><p>${esc(v.nota)}</p></div>
      <div class="tira claro">${circulos}</div>
      <div class="tira oscuro">${circulos}</div>
    </div>`;
  };

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>${esc(marca.nombre)} — comparación</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=${encodeURIComponent(t.familia)}:wght@${t.pesos}&display=swap" rel="stylesheet">
<style>
${estilos(marca)}
  body{
    background:#FFFFFF;display:block;padding:56px;width:1600px;
    font-family:'${t.familia}',${t.respaldo};-webkit-font-smoothing:antialiased;
  }
  h1{font-size:40px;font-weight:800;letter-spacing:-.03em;color:${marca.colores.texto};}
  .intro{font-size:19px;color:${marca.colores.apagado};margin:12px 0 44px;max-width:62ch;line-height:1.5;}

  .fila{display:flex;align-items:center;gap:36px;padding:34px 0;border-top:1px solid ${marca.colores.linea};}
  .rotulo{width:280px;flex-shrink:0;}
  .rotulo h3{font-size:23px;font-weight:700;letter-spacing:-.02em;color:${marca.colores.texto};}
  .rotulo p{font-size:15px;color:${marca.colores.apagado};margin-top:7px;line-height:1.45;}

  .tira{
    flex:1;display:flex;align-items:center;gap:30px;
    padding:26px 30px;border-radius:14px;
  }
  .tira.claro{background:#FFFFFF;border:1px solid ${marca.colores.linea};}
  .tira.oscuro{background:${marca.colores.tinta};}

  .celda{display:flex;flex-direction:column;align-items:center;gap:11px;}
  .circulo{border-radius:50%;overflow:hidden;position:relative;flex-shrink:0;}
  /* El avatar se dibuja siempre a 1080 y se encoge acá, así lo que se compara
     es exactamente el archivo que se sube. */
  .lente{position:absolute;top:0;left:0;width:${LADO}px;height:${LADO}px;transform-origin:top left;}
  .medida{font-size:12px;font-weight:600;letter-spacing:.08em;}
  .claro .medida{color:${marca.colores.apagado};}
  .oscuro .medida{color:${marca.colores.apagado_oscuro};}
</style>
</head>
<body>
<h1>El avatar, a los tamaños reales</h1>
<p class="intro">Instagram recorta la foto a un círculo y la muestra chica. Estos son los cuatro tamaños en que se va a ver, sobre los dos fondos de la aplicación. La versión se elige mirando la columna de 32 px, no la de 320.</p>
${VERSIONES.map(fila).join('\n')}
</body>
</html>`;
}

module.exports = { documento, documentoComparacion, VERSIONES, TAMANOS, LADO };
