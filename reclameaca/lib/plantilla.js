'use strict';

/**
 * Convierte los textos de contenido/*.json en el HTML de cada placa.
 * Acá vive el diseño. Los textos no se tocan desde este archivo.
 */

const fs = require('fs');
const path = require('path');

/** Escapa HTML para que un texto nunca rompa la maqueta. */
function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** *palabra* pasa a naranja, \n pasa a salto de línea. */
function texto(s) {
  return esc(s)
    .replace(/\*([^*]+)\*/g, '<span class="ac">$1</span>')
    .replace(/\n/g, '<br>');
}

// El megáfono es el mismo SVG del sitio, sin tocar. Se lee una vez.
// Inter va embebida en el HTML: sin depender de Google Fonts, la placa sale
// igual con o sin internet, y el HTML de salida/.html/ se abre en cualquier lado.
const FUENTES = (() => {
  const dir = path.join(__dirname, 'fuentes');
  return fs.readFileSync(path.join(dir, 'inter.css'), 'utf8')
    .replace(/url\(([^)]+\.woff2)\)/g, (_, f) =>
      `url(data:font/woff2;base64,${fs.readFileSync(path.join(dir, f)).toString('base64')})`);
})();

const LOGO = fs.readFileSync(path.join(__dirname, 'logo.svg'), 'utf8')
  .replace(/<svg /, '<svg class="logo" ')
  .replace(/ width="64" height="64"/, '');

/** Megáfono + "Reclame Acá", con el corte que define marca.json. */
function firma(marca) {
  const n = marca.nombre;
  const i = marca.nombre_corte;
  return `<span class="mark">${LOGO}<span class="mark-t">${esc(n.slice(0, i))}<span>${esc(n.slice(i))}</span></span></span>`;
}

// Los mismos estados que usa la plataforma, con los mismos colores.
const ESTADOS = {
  pendiente: 'Pendiente',
  en_proceso: 'En proceso',
  a_confirmar: 'A confirmar',
  resuelto: 'Resuelto'
};

// ---------------------------------------------------------------- bloques

const bloques = {
  declaracion(d) {
    let h = `<h1 class="e-${d.escala || 'xl'}">${texto(d.titulo)}</h1>`;
    if (d.sub) h += `<p class="sub${d.sub_ancho ? ' ancho' : ''}">${texto(d.sub)}</p>`;
    if (d.hint) h += `<span class="hint">${texto(d.hint)}</span>`;
    return h;
  },

  pasos(d) {
    let h = `<h1 class="e-${d.escala || 'm'}">${texto(d.titulo)}</h1>`;
    h += `<div class="pasos">` + d.pasos
      .map((p, i) => `<div class="paso"><span class="paso-n">${String(i + 1).padStart(2, '0')}</span><span class="paso-t">${texto(p)}</span></div>`)
      .join('') + `</div>`;
    return h;
  },

  mito(d) {
    return `<div class="panel mito">
        <div class="panel-tag">${esc(d.mito_tag || 'Lo que te dicen')}</div>
        <div class="panel-txt">${texto(d.mito)}</div>
      </div>
      <div class="panel real">
        <div class="panel-tag">${esc(d.realidad_tag || 'Lo que dice la ley')}</div>
        <div class="panel-txt">${texto(d.realidad)}</div>
      </div>`;
  },

  lista(d) {
    let h = `<h1 class="e-${d.escala || 'm'}">${texto(d.titulo)}</h1>`;
    const celdas = d.items
      .map((t, i) => `<div class="celda"><span class="celda-n">${String(i + 1).padStart(2, '0')}</span><span class="celda-t">${texto(t)}</span></div>`)
      .join('');
    h += `<div class="lista ${d.columnas === 1 ? 'col-1' : 'col-2'}">${celdas}</div>`;
    return h;
  },

  // Un solo número ocupando la placa. Es el formato de los plazos: "10 días",
  // "6 meses". El plazo es lo que la gente recuerda y lo que la empresa espera
  // que no sepas.
  cifra(d) {
    let h = `<div class="cifra-et">${texto(d.etiqueta)}</div>`;
    h += `<div class="cifra-m">${texto(d.monto)}</div>`;
    if (d.nota) h += `<div class="cifra-n">${texto(d.nota)}</div>`;
    return h;
  },

  punto(d) {
    let h = `<div class="punto-n">${esc(d.numero)}</div>`;
    h += `<h1 class="e-${d.escala || 'm'}">${texto(d.titulo)}</h1>`;
    if (d.sub) h += `<p class="sub${d.sub_ancho ? ' ancho' : ''}">${texto(d.sub)}</p>`;
    return h;
  },

  // ¿Pueden o no pueden? El cartel pinta la placa: verde cuando la empresa
  // puede (y está bien), rojo cuando no puede y lo hace igual.
  veredicto(d) {
    const no = /^no/i.test(String(d.veredicto || ''));
    let h = `<div class="ver ${no ? 'ver-no' : 'ver-si'}">${texto(d.veredicto)}</div>`;
    h += `<h1 class="e-${d.escala || 'm'}">${texto(d.titulo)}</h1>`;
    if (d.sub) h += `<p class="sub${d.sub_ancho ? ' ancho' : ''}">${texto(d.sub)}</p>`;
    return h;
  },

  // Concepto a la izquierda, plazo a la derecha. Para juntar varios plazos en
  // una sola placa guardable.
  tabla(d) {
    let h = '';
    if (d.titulo) h += `<h1 class="e-${d.escala || 'm'}">${texto(d.titulo)}</h1>`;
    h += `<div class="tabla">` + d.filas
      .map((f) => `<div class="fila"><span class="fila-k">${texto(f.k)}</span><span class="fila-v">${texto(f.v)}</span></div>`)
      .join('') + `</div>`;
    if (d.nota) h += `<p class="tabla-n">${texto(d.nota)}</p>`;
    return h;
  },

  pregunta(d) {
    let h = `<div class="regla"></div>`;
    h += `<h1 class="e-${d.escala || 'l'}">${texto(d.titulo)}</h1>`;
    if (d.sub) h += `<p class="sub${d.sub_ancho ? ' ancho' : ''}">${texto(d.sub)}</p>`;
    if (d.hint) h += `<span class="hint">${texto(d.hint)}</span>`;
    return h;
  },

  // La tarjeta de reclamo, igual a la del sitio. Si el reclamo no es uno real
  // publicado en la plataforma, lleva el cartel "Ejemplo" sí o sí: un reclamo
  // inventado contra una empresa con nombre y apellido no se publica nunca.
  reclamo(d) {
    const estado = ESTADOS[d.estado] ? d.estado : 'pendiente';
    let h = '';
    if (d.titulo) h += `<h1 class="e-${d.escala || 'm'}">${texto(d.titulo)}</h1>`;
    h += `<div class="rc">
      <div class="rc-top">
        <span class="rc-emp"><span class="rc-ini">${esc(String(d.empresa || '?').trim().charAt(0).toUpperCase())}</span>${esc(d.empresa)}</span>
        <span class="badge b-${estado}">${ESTADOS[estado]}</span>
      </div>
      <div class="rc-t">${texto(d.reclamo)}</div>
      ${d.extracto ? `<div class="rc-x">${texto(d.extracto)}</div>` : ''}
      <div class="rc-meta">
        ${d.categoria ? `<span class="badge b-cat">${esc(d.categoria)}</span>` : '<span></span>'}
        ${d.real ? `<span>${esc(d.cuando || '')}</span>` : '<span class="rc-ej">Ejemplo</span>'}
      </div>
    </div>`;
    if (d.sub) h += `<p class="sub${d.sub_ancho ? ' ancho' : ''}">${texto(d.sub)}</p>`;
    return h;
  }
};

// ---------------------------------------------------------------- placa

/**
 * @param {object} item   una entrada de contenido/*.json
 * @param {object} marca  marca.json
 * @param {'post'|'historia'} formato
 */
function placa(item, marca, formato, opciones) {
  const o = opciones || {};
  const d = item[formato];
  if (!d) throw new Error(`El post "${item.archivo}" no tiene datos para el formato "${formato}".`);

  const armar = bloques[item.tipo];
  if (!armar) throw new Error(`Tipo de placa desconocido: "${item.tipo}" (en "${item.archivo}").`);

  const fondo = item.fondo === 'claro' ? 'claro' : 'oscuro';
  const id = `${formato}-${item.archivo}`;

  // En historia el pie lleva siempre el sitio: Instagram ya muestra el usuario
  // arriba. En post se puede elegir el usuario, si ya está cargado en marca.json.
  const pieDerecha = o.pie_derecha != null
    ? o.pie_derecha
    : (formato === 'post' && item.pie_marca === 'handle' && marca.handle ? marca.handle : marca.sitio);

  const cta = d.cta ? `<span class="cta">${texto(d.cta)}</span>` : '';
  // La fuente va a la vista, como en las guías del sitio: una placa que dice
  // "tenés 10 días" sin decir de dónde sale es una opinión.
  const fuente = d.fuente ? `<span class="fuente"><b>§</b>${esc(d.fuente)}</span>` : '';
  const extra = [o.clase, d.hueco ? 'hueco' : ''].filter(Boolean).join(' ');

  const alto = (formato === 'historia' && typeof d.hueco === 'number')
    ? ` style="padding-bottom:${Math.round(d.hueco)}px"`
    : '';

  return `<div class="placa f-${formato} ${fondo}${extra ? ' ' + extra : ''}" id="${esc(id)}" data-archivo="${esc(item.archivo)}"${alto}>
  <div class="cabeza"><span class="eyebrow">${esc(item.eyebrow)}</span><span class="raya"></span></div>
  <div class="cuerpo">${armar(d)}${cta}${fuente}</div>
  <div class="pie">${firma(marca)}<span class="handle">${esc(pieDerecha)}</span></div>
</div>`;
}

// ---------------------------------------------------------------- carrusel

/**
 * Una lámina de carrusel: una placa cuadrada con el contador (03/08) a la
 * derecha del pie en vez del sitio. La última lleva el sitio, porque es donde
 * alguien decide ir.
 */
function lamina(lam, carrusel, marca, i, total) {
  const n = String(i + 1).padStart(2, '0');
  const item = {
    archivo: `${carrusel.archivo}-${n}`,
    tipo: lam.tipo,
    fondo: lam.fondo,
    eyebrow: lam.eyebrow || carrusel.eyebrow,
    post: lam
  };
  const ultima = i === total - 1;
  return placa(item, marca, 'post', {
    clase: 'lamina',
    pie_derecha: ultima ? marca.sitio : `${n}/${String(total).padStart(2, '0')}`
  });
}

// ---------------------------------------------------------------- estilos

function estilos(marca) {
  const c = marca.colores;
  const m = marca.medidas;
  const t = marca.tipografia;
  const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(',');
  const ac = rgb(c.acento);

  return `
  :root{
    --tinta:${c.tinta}; --tinta-2:${c.tinta_2}; --tinta-texto:${c.tinta_texto}; --texto:${c.texto};
    --suave:${c.suave}; --apagado:${c.apagado}; --apagado-osc:${c.apagado_oscuro};
    --linea:${c.linea}; --linea-osc:${c.linea_oscura}; --texto-osc:${c.texto_sobre_oscuro};
    --ac:${c.acento}; --ac-fuerte:${c.acento_fuerte}; --ac-claro:${c.acento_claro}; --ac-texto:${c.acento_texto};
    --ok:${c.resuelto}; --ok-bg:${c.resuelto_fondo};
    --proc:${c.en_proceso}; --proc-bg:${c.en_proceso_fondo};
    --pend:${c.pendiente}; --pend-bg:${c.pendiente_fondo};
    --mal:${c.peligro}; --mal-bg:${c.peligro_fondo};
    --radio:${m.radio}px;
  }
  *{box-sizing:border-box;margin:0;padding:0;}
  body{
    background:#2a2f36;
    font-family:'${t.familia}',${t.respaldo};
    display:flex;flex-direction:column;align-items:center;gap:40px;padding:40px;
  }

  .placa{
    position:relative;overflow:hidden;display:flex;flex-direction:column;
    font-family:'${t.familia}',${t.respaldo};
    -webkit-font-smoothing:antialiased;
  }
  .f-post{width:${m.post.ancho}px;height:${m.post.alto}px;padding:${m.post.margen}px;}
  .f-historia{
    width:${m.historia.ancho}px;height:${m.historia.alto}px;
    padding:${m.historia.margen_arriba}px ${m.historia.margen}px ${m.historia.margen_abajo}px;
  }

  .oscuro{background:var(--tinta);color:var(--tinta-texto);}
  .claro{background:#FFFFFF;color:var(--texto);}

  /* Las ondas del megáfono: tres arcos finos que salen de la esquina. Es el
     mismo gesto del logo, en grande, y reemplaza al brillo difuso. */
  .placa::after{
    content:"";position:absolute;pointer-events:none;border-radius:50%;
    background:radial-gradient(circle closest-side,
      transparent calc(100% - 196px), rgba(${ac},.10) calc(100% - 196px), rgba(${ac},.10) calc(100% - 190px),
      transparent calc(100% - 190px), transparent calc(100% - 100px),
      rgba(${ac},.16) calc(100% - 100px), rgba(${ac},.16) calc(100% - 94px),
      transparent calc(100% - 94px), transparent calc(100% - 6px),
      rgba(${ac},.24) calc(100% - 6px), rgba(${ac},.24) 100%, transparent 100%);
  }
  .claro::after{opacity:.85;}
  .f-post::after{right:-300px;top:-300px;width:640px;height:640px;}
  .f-historia::after{right:-340px;top:-40px;width:720px;height:720px;}

  .cabeza{display:flex;align-items:center;gap:18px;position:relative;z-index:2;}
  .eyebrow{font-weight:600;letter-spacing:.16em;text-transform:uppercase;}
  .f-post .eyebrow{font-size:22px;}
  .f-historia .eyebrow{font-size:24px;}
  .oscuro .eyebrow{color:var(--ac);}
  .claro .eyebrow{color:var(--ac-texto);}
  .raya{flex:1;height:1px;}
  .oscuro .raya{background:var(--linea-osc);}
  .claro .raya{background:var(--linea);}

  .cuerpo{
    flex:1;display:flex;flex-direction:column;justify-content:center;
    position:relative;z-index:2;
  }
  .f-post .cuerpo{gap:34px;}
  .f-historia .cuerpo{gap:44px;}

  h1{font-weight:800;letter-spacing:-.025em;line-height:1.04;text-wrap:balance;}
  .f-post h1.e-xl{font-size:92px;}
  .f-post h1.e-l{font-size:76px;}
  .f-post h1.e-m{font-size:64px;}
  .f-post h1.e-s{font-size:52px;}
  .f-historia h1{letter-spacing:-.028em;line-height:1.03;}
  .f-historia h1.e-xl{font-size:104px;}
  .f-historia h1.e-l{font-size:88px;}
  .f-historia h1.e-m{font-size:72px;}
  .f-historia h1.e-s{font-size:60px;}
  .ac{color:var(--ac);}
  .claro .ac{color:var(--ac-fuerte);}

  .sub{font-weight:400;line-height:1.42;max-width:20ch;}
  .sub.ancho{max-width:26ch;}
  .f-post .sub{font-size:31px;}
  .f-historia .sub{font-size:36px;max-width:19ch;line-height:1.4;}
  .oscuro .sub{color:var(--texto-osc);}
  .claro .sub{color:var(--apagado);}
  .sub .ac{font-weight:600;}
  .claro .sub .ac{color:var(--ac-texto);}

  .pie{display:flex;align-items:center;justify-content:space-between;position:relative;z-index:2;gap:24px;}
  .mark{display:inline-flex;align-items:center;font-weight:700;letter-spacing:-.01em;}
  .f-post .mark{font-size:30px;gap:14px;}
  .f-historia .mark{font-size:34px;gap:16px;}
  .logo{display:block;flex-shrink:0;}
  .f-post .logo{width:52px;height:52px;}
  .f-historia .logo{width:58px;height:58px;}
  /* Sobre el azul de la placa el círculo del logo desaparece; un aro fino lo
     vuelve a recortar sin cambiar el dibujo. */
  .oscuro .logo{border-radius:50%;box-shadow:0 0 0 2px var(--linea-osc);}
  .oscuro .mark{color:var(--tinta-texto);}
  .claro .mark{color:var(--texto);}
  .mark-t span{color:var(--ac);}
  .claro .mark-t span{color:var(--ac-fuerte);}
  .handle{font-weight:500;letter-spacing:.02em;}
  .f-post .handle{font-size:24px;}
  .f-historia .handle{font-size:26px;}
  .oscuro .handle{color:var(--apagado-osc);}
  .claro .handle{color:var(--apagado);}

  .cta{
    display:inline-flex;align-items:center;gap:13px;align-self:flex-start;
    font-weight:700;border-radius:var(--radio);letter-spacing:-.005em;white-space:nowrap;
    background:var(--ac);color:#FFFFFF;
  }
  .f-post .cta{font-size:27px;padding:20px 34px;}
  .f-historia .cta{font-size:30px;padding:24px 38px;border-radius:12px;}

  .fuente{
    display:inline-flex;align-items:center;align-self:flex-start;
    font-weight:600;letter-spacing:.02em;border-radius:99px;
  }
  .fuente b{font-weight:800;}
  .f-post .fuente{font-size:22px;padding:11px 22px 11px 18px;gap:10px;}
  .f-historia .fuente{font-size:26px;padding:13px 26px 13px 22px;gap:12px;}
  .oscuro .fuente{background:var(--tinta-2);color:var(--texto-osc);}
  .oscuro .fuente b{color:var(--ac);}
  .claro .fuente{background:var(--suave);color:var(--apagado);}
  .claro .fuente b{color:var(--ac-texto);}

  /* --- pasos --- */
  .pasos{display:flex;flex-direction:column;}
  .paso{display:flex;align-items:baseline;border-top:1px solid var(--linea-osc);}
  .claro .paso{border-top-color:var(--linea);}
  .paso:last-child{border-bottom:1px solid var(--linea-osc);}
  .claro .paso:last-child{border-bottom-color:var(--linea);}
  .f-post .paso{gap:30px;padding:24px 0;}
  .f-historia .paso{gap:34px;padding:34px 0;}
  .paso-n{
    font-weight:700;letter-spacing:.06em;color:var(--ac);
    flex-shrink:0;font-variant-numeric:tabular-nums;
  }
  .claro .paso-n{color:var(--ac-texto);}
  .f-post .paso-n{font-size:26px;width:52px;}
  .f-historia .paso-n{font-size:30px;width:62px;}
  .paso-t{font-weight:700;letter-spacing:-.015em;line-height:1.15;}
  .f-post .paso-t{font-size:40px;}
  .f-historia .paso-t{font-size:50px;letter-spacing:-.018em;}

  /* --- lo que te dicen / lo que dice la ley --- */
  .panel{border-radius:var(--radio);}
  .f-post .panel{padding:38px 40px;}
  .f-historia .panel{padding:46px 48px;border-radius:12px;}
  .panel-tag{font-weight:600;letter-spacing:.15em;text-transform:uppercase;}
  .f-post .panel-tag{font-size:21px;margin-bottom:16px;}
  .f-historia .panel-tag{font-size:24px;margin-bottom:20px;}
  .panel-txt{font-weight:600;line-height:1.24;letter-spacing:-.015em;}
  .f-post .panel-txt{font-size:38px;}
  .f-historia .panel-txt{font-size:46px;line-height:1.22;letter-spacing:-.018em;}
  .panel.mito{background:var(--suave);}
  .oscuro .panel.mito{background:var(--tinta-2);}
  .panel.mito .panel-tag{color:var(--apagado);}
  .oscuro .panel.mito .panel-tag{color:var(--apagado-osc);}
  .panel.mito .panel-txt{color:#7A8796;text-decoration:line-through;text-decoration-thickness:2px;text-decoration-color:rgba(122,135,150,.55);}
  .oscuro .panel.mito .panel-txt{color:#8FA3BA;}
  .panel.real{background:var(--ac-claro);}
  .panel.real .panel-tag{color:var(--ac-texto);}
  .panel.real .panel-txt{color:var(--texto);}
  .panel.real .ac{color:var(--ac-texto);}

  /* --- lista --- */
  .lista{
    display:grid;gap:1px;background:var(--linea-osc);
    border-top:1px solid var(--linea-osc);border-bottom:1px solid var(--linea-osc);
  }
  .claro .lista{background:var(--linea);border-color:var(--linea);}
  .lista.col-2{grid-template-columns:1fr 1fr;}
  .lista.col-1{grid-template-columns:1fr;}
  .celda{background:var(--tinta);display:flex;flex-direction:column;}
  .claro .celda{background:#FFFFFF;}
  .lista.col-2 .celda{padding:28px 26px;gap:11px;}
  .lista.col-2 .celda:nth-child(odd){padding-left:0;}
  .lista.col-1 .celda{flex-direction:row;align-items:baseline;gap:28px;padding:30px 0;}
  .celda-n{
    font-weight:700;letter-spacing:.08em;color:var(--ac);
    font-variant-numeric:tabular-nums;flex-shrink:0;
  }
  .claro .celda-n{color:var(--ac-texto);}
  .lista.col-2 .celda-n{font-size:19px;}
  .lista.col-1 .celda-n{font-size:24px;width:50px;}
  .celda-t{font-weight:600;letter-spacing:-.01em;line-height:1.22;}
  .lista.col-2 .celda-t{font-size:30px;}
  .lista.col-1 .celda-t{font-size:42px;letter-spacing:-.015em;line-height:1.15;}
  .f-historia .lista.col-2 .celda-t{font-size:34px;}
  .f-historia .lista.col-2 .celda{padding:36px 26px;}

  /* --- cifra --- */
  .cifra-et{font-weight:600;letter-spacing:.14em;text-transform:uppercase;line-height:1.3;}
  .f-post .cifra-et{font-size:26px;}
  .f-historia .cifra-et{font-size:28px;}
  .oscuro .cifra-et{color:var(--ac);}
  .claro .cifra-et{color:var(--ac-texto);}
  .cifra-m{
    font-weight:800;letter-spacing:-.04em;line-height:.95;
    font-variant-numeric:tabular-nums;text-wrap:balance;
  }
  .f-post .cifra-m{font-size:180px;}
  .f-historia .cifra-m{font-size:200px;}
  .cifra-n{font-weight:500;line-height:1.35;max-width:22ch;}
  .f-post .cifra-n{font-size:32px;}
  .f-historia .cifra-n{font-size:38px;max-width:18ch;}
  .oscuro .cifra-n{color:var(--texto-osc);}
  .claro .cifra-n{color:var(--apagado);}

  /* --- punto numerado --- */
  .punto-n{font-weight:800;letter-spacing:-.02em;line-height:1;font-variant-numeric:tabular-nums;}
  .f-post .punto-n{font-size:78px;}
  .f-historia .punto-n{font-size:90px;}
  .oscuro .punto-n{color:var(--ac);}
  .claro .punto-n{color:var(--ac-fuerte);}

  /* --- veredicto: pueden / no pueden --- */
  .ver{
    align-self:flex-start;font-weight:700;letter-spacing:.14em;text-transform:uppercase;
    border-radius:99px;
  }
  .f-post .ver{font-size:24px;padding:14px 26px;}
  .f-historia .ver{font-size:27px;padding:16px 30px;}
  .ver-si{background:var(--ok-bg);color:var(--ok);}
  .ver-no{background:var(--mal-bg);color:var(--mal);}
  .oscuro .ver-si{background:rgba(30,158,98,.18);color:#5FD49B;}
  .oscuro .ver-no{background:rgba(224,67,59,.18);color:#FF8A83;}

  /* --- tabla de dos columnas --- */
  .tabla{display:flex;flex-direction:column;}
  .fila{
    display:flex;align-items:baseline;justify-content:space-between;gap:24px;
    border-top:1px solid var(--linea-osc);
  }
  .claro .fila{border-top-color:var(--linea);}
  .fila:last-child{border-bottom:1px solid var(--linea-osc);}
  .claro .fila:last-child{border-bottom-color:var(--linea);}
  .f-post .fila{padding:24px 0;}
  .f-historia .fila{padding:34px 0;}
  .fila-k{font-weight:500;line-height:1.25;}
  .f-post .fila-k{font-size:32px;}
  .f-historia .fila-k{font-size:38px;}
  .oscuro .fila-k{color:var(--texto-osc);}
  .claro .fila-k{color:var(--apagado);}
  .fila-v{
    font-weight:800;letter-spacing:-.025em;font-variant-numeric:tabular-nums;
    white-space:nowrap;color:var(--ac);
  }
  .claro .fila-v{color:var(--ac-fuerte);}
  .f-post .fila-v{font-size:50px;}
  .f-historia .fila-v{font-size:58px;}
  .tabla-n{font-weight:400;line-height:1.4;max-width:30ch;}
  .f-post .tabla-n{font-size:25px;}
  .f-historia .tabla-n{font-size:30px;}
  .oscuro .tabla-n{color:var(--texto-osc);}
  .claro .tabla-n{color:var(--apagado);}

  /* --- tarjeta de reclamo (la misma del sitio) --- */
  .rc{
    background:#FFFFFF;color:var(--texto);border:1px solid var(--linea);
    border-radius:16px;display:flex;flex-direction:column;
    box-shadow:0 12px 32px rgba(15,35,56,.12);
  }
  .oscuro .rc{border-color:transparent;box-shadow:0 18px 50px rgba(0,0,0,.35);}
  .f-post .rc{padding:36px 38px;gap:20px;}
  .f-historia .rc{padding:44px 46px;gap:24px;}
  .rc-top{display:flex;align-items:center;justify-content:space-between;gap:16px;}
  .rc-emp{display:inline-flex;align-items:center;font-weight:600;}
  .f-post .rc-emp{font-size:26px;gap:14px;}
  .f-historia .rc-emp{font-size:30px;gap:16px;}
  .rc-ini{
    display:flex;align-items:center;justify-content:center;border-radius:8px;
    background:var(--tinta-2);color:#fff;font-weight:700;
  }
  .f-post .rc-ini{width:46px;height:46px;font-size:22px;}
  .f-historia .rc-ini{width:54px;height:54px;font-size:26px;}
  .badge{font-weight:600;border-radius:99px;white-space:nowrap;}
  .f-post .badge{font-size:20px;padding:8px 18px;}
  .f-historia .badge{font-size:23px;padding:9px 20px;}
  .b-pendiente{background:var(--pend-bg);color:var(--pend);}
  .b-en_proceso{background:var(--proc-bg);color:var(--proc);}
  .b-a_confirmar{background:var(--ac-claro);color:var(--ac-texto);}
  .b-resuelto{background:var(--ok-bg);color:var(--ok);}
  .b-cat{background:var(--suave);color:var(--apagado);}
  .rc-t{font-weight:700;letter-spacing:-.015em;line-height:1.18;}
  .f-post .rc-t{font-size:38px;}
  .f-historia .rc-t{font-size:46px;}
  .rc-x{color:var(--apagado);line-height:1.42;}
  .f-post .rc-x{font-size:25px;}
  .f-historia .rc-x{font-size:30px;}
  .rc-meta{display:flex;align-items:center;justify-content:space-between;color:var(--apagado);}
  .f-post .rc-meta{font-size:21px;}
  .f-historia .rc-meta{font-size:24px;}
  .rc-ej{font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:#8A97A6;}

  /* El contador del carrusel: números de ancho fijo, así no baila. */
  .lamina .handle{font-variant-numeric:tabular-nums;letter-spacing:.06em;}

  /* Historia con hueco para el sticker de encuesta, preguntas o enlace. */
  .f-historia.hueco .cuerpo{justify-content:flex-start;padding-top:72px;}
  .f-historia.hueco .pie{margin-top:auto;}
  .f-historia.hueco{padding-bottom:620px;}

  /* --- pregunta --- */
  .regla{border-radius:3px;background:var(--ac);}
  .f-post .regla{width:76px;height:5px;}
  .f-historia .regla{width:92px;height:6px;}
  .hint{font-weight:600;letter-spacing:.02em;display:inline-flex;align-items:center;gap:12px;}
  .f-post .hint{font-size:24px;}
  .f-historia .hint{font-size:28px;}
  .claro .hint{color:var(--ac-texto);}
  .oscuro .hint{color:var(--ac);}
  `;
}

function envolver(marca, titulo, placas) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>${esc(marca.nombre)} — ${esc(titulo)}</title>
<style>${FUENTES}${estilos(marca)}</style>
</head>
<body>
${placas}
</body>
</html>`;
}

/** Documento completo con todas las placas de un formato. */
function documento(contenido, marca, formato) {
  const placas = contenido.posts
    .filter((item) => item[formato])
    .map((item) => placa(item, marca, formato)).join('\n');
  return envolver(marca, formato, placas);
}

/** Documento con todas las láminas de todos los carruseles de un archivo. */
function documentoCarrusel(contenido, marca) {
  const placas = (contenido.carruseles || [])
    .map((c) => c.laminas.map((l, i) => lamina(l, c, marca, i, c.laminas.length)).join('\n'))
    .join('\n');
  return envolver(marca, 'carruseles', placas);
}

module.exports = { documento, documentoCarrusel, placa, lamina, estilos, texto, esc };
