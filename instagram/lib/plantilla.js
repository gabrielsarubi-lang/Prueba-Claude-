'use strict';

/**
 * Convierte los textos de contenido/*.json en el HTML de cada placa.
 * Acá vive el diseño. Los textos no se tocan desde este archivo.
 */

/** Escapa HTML para que un texto nunca rompa la maqueta. */
function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** *palabra* pasa a verde, \n pasa a salto de línea. */
function texto(s) {
  return esc(s)
    .replace(/\*([^*]+)\*/g, '<span class="ac">$1</span>')
    .replace(/\n/g, '<br>');
}

/** SARUB + IA, con el corte que define marca.json. */
function firma(marca) {
  const n = marca.nombre;
  const i = marca.nombre_corte;
  return `<span class="mark">${esc(n.slice(0, i))}<span>${esc(n.slice(i))}</span></span>`;
}

// ---------------------------------------------------------------- bloques

const bloques = {
  declaracion(d) {
    let h = `<h1 class="e-${d.escala || 'xl'}">${texto(d.titulo)}</h1>`;
    if (d.sub) h += `<p class="sub${d.sub_ancho ? ' ancho' : ''}">${texto(d.sub)}</p>`;
    if (d.hint) h += `<span class="hint">${texto(d.hint)}</span>`;
    return h;
  },

  oferta(d) {
    let h = `<h1 class="e-${d.escala || 'l'}">${texto(d.titulo)}</h1>`;
    h += `<div><div class="precio">${esc(d.precio)}</div>`;
    if (d.precio_nota) h += `<div class="precio-nota">${esc(d.precio_nota)}</div>`;
    h += `</div>`;
    if (d.checks && d.checks.length) {
      h += `<div class="checks">` + d.checks
        .map((c) => `<div class="check"><span class="tick">✓</span>${texto(c)}</div>`)
        .join('') + `</div>`;
    }
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
        <div class="panel-tag">Mito</div>
        <div class="panel-txt">${texto(d.mito)}</div>
      </div>
      <div class="panel real">
        <div class="panel-tag">Realidad</div>
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

  // Una sola cifra ocupando la lámina. Es el bloque de comparar precios: un
  // número por lámina, porque dos números juntos se leen como una tabla y
  // nadie compara tablas pasando el dedo.
  cifra(d) {
    let h = `<div class="cifra-et">${texto(d.etiqueta)}</div>`;
    h += `<div class="cifra-m">${texto(d.monto)}</div>`;
    if (d.nota) h += `<div class="cifra-n">${texto(d.nota)}</div>`;
    return h;
  },

  // Punto numerado de una serie: el número es grande porque en el carrusel
  // indica cuánto falta.
  punto(d) {
    let h = `<div class="punto-n">${esc(d.numero)}</div>`;
    h += `<h1 class="e-${d.escala || 'm'}">${texto(d.titulo)}</h1>`;
    if (d.sub) h += `<p class="sub${d.sub_ancho ? ' ancho' : ''}">${texto(d.sub)}</p>`;
    return h;
  },

  // Puede / no puede. El veredicto va en una etiqueta y pinta la lámina: verde
  // cuando suma, neutro cuando no. Sin colorear, las dos mitades se confunden.
  capacidad(d) {
    const no = /^no/i.test(String(d.veredicto || ''));
    let h = `<div class="ver ${no ? 'ver-no' : 'ver-si'}">${texto(d.veredicto)}</div>`;
    h += `<h1 class="e-${d.escala || 'm'}">${texto(d.titulo)}</h1>`;
    if (d.sub) h += `<p class="sub${d.sub_ancho ? ' ancho' : ''}">${texto(d.sub)}</p>`;
    return h;
  },

  // Concepto a la izquierda, importe a la derecha. Para mostrar los dos
  // numeros juntos, que es justamente lo que el rubro no muestra.
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
  // arriba de la pantalla, así que repetir el @ no suma, y el sitio es el único
  // destino para quien ve la pieza suelta. En post alterna, porque ahí no hay
  // ningún dato de contacto alrededor.
  const pieDerecha = o.pie_derecha != null
    ? o.pie_derecha
    : (formato === 'historia'
      ? marca.sitio
      : (item.pie_marca === 'handle' ? marca.handle : marca.sitio));

  const cta = d.cta ? `<span class="cta">${texto(d.cta)}</span>` : '';
  const extra = [o.clase, d.hueco ? 'hueco' : ''].filter(Boolean).join(' ');

  // El hueco del sticker no mide siempre lo mismo: una encuesta o una caja de
  // preguntas ocupan el doble que un sticker de enlace. "hueco": true usa la
  // medida grande; un número la fija a medida.
  const alto = (formato === 'historia' && typeof d.hueco === 'number')
    ? ` style="padding-bottom:${Math.round(d.hueco)}px"`
    : '';

  return `<div class="placa f-${formato} ${fondo}${extra ? ' ' + extra : ''}" id="${esc(id)}" data-archivo="${esc(item.archivo)}"${alto}>
  <div class="cabeza"><span class="eyebrow">${esc(item.eyebrow)}</span><span class="raya"></span></div>
  <div class="cuerpo">${armar(d)}${cta}</div>
  <div class="pie">${firma(marca)}<span class="handle">${esc(pieDerecha)}</span></div>
</div>`;
}

// ---------------------------------------------------------------- carrusel

/**
 * Una lámina de carrusel: es una placa cuadrada, con dos diferencias.
 *
 * El pie no repite el sitio en las diez láminas — a la derecha lleva el
 * contador (03/08), que es lo único que le falta saber a quien está pasando el
 * dedo: cuánto queda. La última sí lleva el sitio, porque es la lámina donde
 * alguien decide ir.
 *
 * @param {object} lam      una entrada de laminas[]
 * @param {object} carrusel el carrusel que la contiene (aporta el eyebrow)
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

/** Documento con todas las láminas de todos los carruseles de un archivo. */
function documentoCarrusel(contenido, marca) {
  const t = marca.tipografia;
  const placas = (contenido.carruseles || [])
    .map((c) => c.laminas.map((l, i) => lamina(l, c, marca, i, c.laminas.length)).join('\n'))
    .join('\n');

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>${esc(marca.nombre)} — carruseles</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=${encodeURIComponent(t.familia)}:wght@${t.pesos}&display=swap" rel="stylesheet">
<style>${estilos(marca)}</style>
</head>
<body>
${placas}
</body>
</html>`;
}

// ---------------------------------------------------------------- estilos

function estilos(marca) {
  const c = marca.colores;
  const m = marca.medidas;
  const t = marca.tipografia;

  return `
  :root{
    --tinta:${c.tinta}; --tinta-texto:${c.tinta_texto}; --texto:${c.texto};
    --suave:${c.suave}; --apagado:${c.apagado}; --apagado-osc:${c.apagado_oscuro};
    --linea:${c.linea}; --linea-osc:${c.linea_oscura};
    --verde:${c.verde}; --verde-fuerte:${c.verde_fuerte}; --verde-claro:${c.verde_claro};
    --verde-osc:${c.verde_sobre_oscuro}; --texto-osc:${c.texto_sobre_oscuro};
    --verde-prof:${c.verde_profundo};
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

  .oscuro::after{
    content:"";position:absolute;pointer-events:none;
    background:radial-gradient(circle,rgba(47,224,174,.16) 0%,rgba(47,224,174,0) 62%);
  }
  .f-post.oscuro::after{right:-260px;bottom:-300px;width:900px;height:900px;}
  .f-historia.oscuro::after{right:-300px;bottom:-200px;width:1000px;height:1000px;}
  .claro::after{
    content:"";position:absolute;pointer-events:none;
    background:radial-gradient(circle,rgba(14,158,122,.10) 0%,rgba(14,158,122,0) 64%);
  }
  .f-post.claro::after{right:-300px;top:-340px;width:860px;height:860px;}
  .f-historia.claro::after{right:-330px;top:80px;width:940px;height:940px;}

  .cabeza{display:flex;align-items:center;gap:18px;position:relative;z-index:2;}
  .eyebrow{font-weight:600;letter-spacing:.16em;text-transform:uppercase;}
  .f-post .eyebrow{font-size:22px;}
  .f-historia .eyebrow{font-size:24px;}
  .oscuro .eyebrow{color:var(--verde-osc);}
  .claro .eyebrow{color:var(--verde);}
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
  .f-historia h1{letter-spacing:-.028em;line-height:1.03;}
  .f-historia h1.e-xl{font-size:104px;}
  .f-historia h1.e-l{font-size:88px;}
  .f-historia h1.e-m{font-size:72px;}
  .ac{color:var(--verde);}
  .oscuro .ac{color:var(--verde-osc);}

  .sub{font-weight:400;line-height:1.42;max-width:20ch;}
  .sub.ancho{max-width:26ch;}
  .f-post .sub{font-size:31px;}
  .f-historia .sub{font-size:36px;max-width:19ch;line-height:1.4;}
  .oscuro .sub{color:var(--texto-osc);}
  .claro .sub{color:var(--apagado);}

  .pie{display:flex;align-items:flex-end;justify-content:space-between;position:relative;z-index:2;gap:24px;}
  .f-historia .pie{align-items:center;}
  .mark{font-weight:700;letter-spacing:.005em;}
  .f-post .mark{font-size:30px;}
  .f-historia .mark{font-size:34px;}
  .oscuro .mark{color:var(--tinta-texto);}
  .claro .mark{color:var(--texto);}
  .mark span{color:var(--verde);}
  .oscuro .mark span{color:var(--verde-osc);}
  .handle{font-weight:500;letter-spacing:.02em;}
  .f-post .handle{font-size:24px;}
  .f-historia .handle{font-size:26px;}
  .oscuro .handle{color:var(--apagado-osc);}
  .claro .handle{color:var(--apagado);}

  .cta{
    display:inline-flex;align-items:center;gap:13px;align-self:flex-start;
    font-weight:700;border-radius:var(--radio);letter-spacing:-.005em;white-space:nowrap;
  }
  .f-post .cta{font-size:27px;padding:20px 34px;}
  .f-historia .cta{font-size:30px;padding:24px 38px;border-radius:12px;}
  .oscuro .cta{background:var(--verde-osc);color:#05231B;}
  .claro .cta{background:var(--verde);color:#FFFFFF;}

  /* --- oferta --- */
  .precio{font-weight:800;letter-spacing:-.03em;line-height:1;color:var(--verde);}
  .f-post .precio{font-size:110px;}
  .f-historia .precio{font-size:128px;}
  .precio-nota{font-weight:500;letter-spacing:.1em;text-transform:uppercase;color:var(--apagado);}
  .f-post .precio-nota{font-size:23px;margin-top:14px;}
  .f-historia .precio-nota{font-size:26px;margin-top:16px;}
  .checks{display:flex;flex-direction:column;}
  .f-post .checks{gap:17px;}
  .f-historia .checks{gap:22px;}
  .check{display:flex;align-items:center;font-weight:500;}
  .f-post .check{gap:16px;font-size:29px;}
  .f-historia .check{gap:20px;font-size:34px;}
  .tick{
    flex-shrink:0;display:flex;align-items:center;justify-content:center;
    font-weight:700;background:var(--verde-claro);color:var(--verde-fuerte);
  }
  .f-post .tick{width:30px;height:30px;border-radius:8px;font-size:19px;}
  .f-historia .tick{width:38px;height:38px;border-radius:10px;font-size:23px;}
  .oscuro .tick{background:rgba(47,224,174,.14);color:var(--verde-osc);}

  /* --- pasos --- */
  .pasos{display:flex;flex-direction:column;}
  .paso{display:flex;align-items:baseline;border-top:1px solid var(--linea-osc);}
  .claro .paso{border-top-color:var(--linea);}
  .paso:last-child{border-bottom:1px solid var(--linea-osc);}
  .claro .paso:last-child{border-bottom-color:var(--linea);}
  .f-post .paso{gap:30px;padding:27px 0;}
  .f-historia .paso{gap:34px;padding:36px 0;}
  .paso-n{
    font-weight:700;letter-spacing:.06em;color:var(--verde-osc);
    flex-shrink:0;font-variant-numeric:tabular-nums;
  }
  .claro .paso-n{color:var(--verde);}
  .f-post .paso-n{font-size:26px;width:52px;}
  .f-historia .paso-n{font-size:30px;width:62px;}
  .paso-t{font-weight:700;letter-spacing:-.015em;}
  .f-post .paso-t{font-size:44px;}
  .f-historia .paso-t{font-size:54px;letter-spacing:-.018em;}

  /* --- mito / realidad --- */
  .panel{border-radius:var(--radio);}
  .f-post .panel{padding:38px 40px;}
  .f-historia .panel{padding:46px 48px;border-radius:12px;}
  .panel-tag{font-weight:600;letter-spacing:.15em;text-transform:uppercase;}
  .f-post .panel-tag{font-size:21px;margin-bottom:16px;}
  .f-historia .panel-tag{font-size:24px;margin-bottom:20px;}
  .panel-txt{font-weight:600;line-height:1.24;letter-spacing:-.015em;}
  .f-post .panel-txt{font-size:39px;}
  .f-historia .panel-txt{font-size:46px;line-height:1.22;letter-spacing:-.018em;}
  .panel.mito{background:var(--suave);}
  .panel.mito .panel-tag{color:var(--apagado);}
  .panel.mito .panel-txt{color:#7A828F;}
  .panel.real{background:var(--verde-claro);}
  .panel.real .panel-tag{color:var(--verde-fuerte);}
  .panel.real .panel-txt{color:var(--verde-prof);}

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
  .lista.col-1 .celda{
    flex-direction:row;align-items:baseline;gap:28px;padding:30px 0;
  }
  .celda-n{
    font-weight:700;letter-spacing:.08em;color:var(--verde-osc);
    font-variant-numeric:tabular-nums;flex-shrink:0;
  }
  .claro .celda-n{color:var(--verde);}
  .lista.col-2 .celda-n{font-size:19px;}
  .lista.col-1 .celda-n{font-size:24px;width:50px;}
  .celda-t{font-weight:600;letter-spacing:-.01em;line-height:1.22;}
  .lista.col-2 .celda-t{font-size:28px;}
  .lista.col-1 .celda-t{font-size:42px;letter-spacing:-.015em;line-height:1.15;}

  /* --- cifra --- */
  .cifra-et{font-weight:600;letter-spacing:.14em;text-transform:uppercase;}
  .f-post .cifra-et{font-size:26px;}
  .f-historia .cifra-et{font-size:28px;}
  .oscuro .cifra-et{color:var(--verde-osc);}
  .claro .cifra-et{color:var(--verde);}
  .cifra-m{
    font-weight:800;letter-spacing:-.035em;line-height:.98;
    font-variant-numeric:tabular-nums;text-wrap:balance;
  }
  .f-post .cifra-m{font-size:104px;}
  .f-historia .cifra-m{font-size:118px;}
  .cifra-n{font-weight:500;letter-spacing:.11em;text-transform:uppercase;}
  .f-post .cifra-n{font-size:24px;}
  .f-historia .cifra-n{font-size:27px;}
  .oscuro .cifra-n{color:var(--apagado-osc);}
  .claro .cifra-n{color:var(--apagado);}

  /* --- punto numerado --- */
  .punto-n{
    font-weight:800;letter-spacing:-.02em;line-height:1;
    font-variant-numeric:tabular-nums;
  }
  .f-post .punto-n{font-size:78px;}
  .f-historia .punto-n{font-size:90px;}
  .oscuro .punto-n{color:var(--verde-osc);}
  .claro .punto-n{color:var(--verde);}

  /* --- puede / no puede --- */
  .ver{
    align-self:flex-start;font-weight:700;letter-spacing:.14em;text-transform:uppercase;
    border-radius:99px;
  }
  .f-post .ver{font-size:24px;padding:14px 26px;}
  .f-historia .ver{font-size:27px;padding:16px 30px;}
  .ver-si{background:var(--verde-claro);color:var(--verde-fuerte);}
  .oscuro .ver-si{background:rgba(47,224,174,.14);color:var(--verde-osc);}
  .ver-no{background:var(--suave);color:var(--apagado);}
  .oscuro .ver-no{background:#1A1F27;color:var(--apagado-osc);}
  /* En una lámina "no puede", la palabra resaltada no va en verde: el verde
     dice "esto suma" en todas las demás piezas y acá diría lo contrario del
     cartel. Queda en la tinta del título, que igual pesa por el tamaño. */
  .ver-no ~ h1 .ac{color:inherit;}

  /* --- tabla de dos columnas --- */
  .tabla{display:flex;flex-direction:column;}
  .fila{
    display:flex;align-items:baseline;justify-content:space-between;gap:24px;
    border-top:1px solid var(--linea-osc);
  }
  .claro .fila{border-top-color:var(--linea);}
  .fila:last-child{border-bottom:1px solid var(--linea-osc);}
  .claro .fila:last-child{border-bottom-color:var(--linea);}
  .f-post .fila{padding:26px 0;}
  .f-historia .fila{padding:34px 0;}
  .fila-k{font-weight:500;}
  .f-post .fila-k{font-size:32px;}
  .f-historia .fila-k{font-size:38px;}
  .oscuro .fila-k{color:var(--texto-osc);}
  .claro .fila-k{color:var(--apagado);}
  .fila-v{
    font-weight:800;letter-spacing:-.025em;font-variant-numeric:tabular-nums;
    white-space:nowrap;color:var(--verde);
  }
  .oscuro .fila-v{color:var(--verde-osc);}
  .f-post .fila-v{font-size:54px;}
  .f-historia .fila-v{font-size:62px;}
  .tabla-n{font-weight:400;line-height:1.4;max-width:26ch;}
  .f-post .tabla-n{font-size:27px;}
  .f-historia .tabla-n{font-size:32px;}
  .oscuro .tabla-n{color:var(--texto-osc);}
  .claro .tabla-n{color:var(--apagado);}

  /* El contador del carrusel: mismos números de ancho fijo, así no baila de
     lámina en lámina. */
  .lamina .handle{font-variant-numeric:tabular-nums;letter-spacing:.06em;}

  /* Historia con hueco: deja libre la franja donde va el sticker de encuesta,
     de preguntas o de enlace. Sin esto el texto queda tapado. Esta es la
     medida grande; "hueco": <número> la pisa con un padding a medida. */
  .f-historia.hueco .cuerpo{justify-content:flex-start;padding-top:72px;}
  .f-historia.hueco .pie{margin-top:auto;}
  .f-historia.hueco{padding-bottom:620px;}

  /* --- pregunta --- */
  .regla{border-radius:3px;background:var(--verde);}
  .f-post .regla{width:76px;height:5px;}
  .f-historia .regla{width:92px;height:6px;}
  .hint{font-weight:600;letter-spacing:.02em;display:inline-flex;align-items:center;gap:12px;}
  .f-post .hint{font-size:24px;}
  .f-historia .hint{font-size:28px;}
  .claro .hint{color:var(--verde-fuerte);}
  .oscuro .hint{color:var(--verde-osc);}
  `;
}

/** Documento completo con todas las placas de un formato. */
function documento(contenido, marca, formato) {
  const t = marca.tipografia;
  const placas = contenido.posts.map((item) => placa(item, marca, formato)).join('\n');

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>${esc(marca.nombre)} — ${esc(formato)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=${encodeURIComponent(t.familia)}:wght@${t.pesos}&display=swap" rel="stylesheet">
<style>${estilos(marca)}</style>
</head>
<body>
${placas}
</body>
</html>`;
}

module.exports = { documento, documentoCarrusel, placa, lamina, estilos, texto, esc };
