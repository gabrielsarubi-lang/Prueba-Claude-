'use strict';

/**
 * Propuesta de taller, en PDF A4.
 *
 * No es una pieza de Instagram, pero vive en la misma caja de herramientas
 * porque usa el mismo Chromium y la misma marca.
 *
 * La propuesta se manda a una institución distinta cada vez, así que lo único
 * que cambia es el nombre: por eso es un generador y no un documento suelto.
 * Un PDF editado a mano se desactualiza el día que cambian los precios.
 *
 * Está maquetada en milímetros, no en píxeles. Es para imprimir y para mandar
 * por WhatsApp, y en los dos casos lo que manda es la hoja A4.
 */

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function documento(t, marca) {
  const c = marca.colores;
  const tp = marca.tipografia;
  const firma = `${esc(marca.nombre.slice(0, marca.nombre_corte))}<span>${esc(marca.nombre.slice(marca.nombre_corte))}</span>`;

  const total = t.programa.reduce((a, b) => a + b.min, 0);

  const filas = t.programa.map((p) => `
    <div class="fila${p.destacado ? ' marcada' : ''}">
      <div class="min">${p.min}'</div>
      <div class="que">
        <div class="qt">${esc(p.titulo)}</div>
        <div class="qd">${esc(p.detalle)}</div>
      </div>
    </div>`).join('');

  const lleva = t.se_lleva.map((x) => `<li>${esc(x)}</li>`).join('');

  const ficha = [
    ['Duración', t.formato.duracion],
    ['Modalidad', t.formato.modalidad],
    ['Cupo', t.formato.cupo],
    ['Aporta la institución', t.formato.aporta_institucion],
    ['Aporta SARUBIA', t.formato.aporta_sarubia]
  ].map(([k, v]) => `<div class="par"><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('');

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Propuesta de taller — ${esc(t.institucion)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=${encodeURIComponent(tp.familia)}:wght@${tp.pesos}&display=swap" rel="stylesheet">
<style>
  @page{size:A4;margin:0;}
  *{box-sizing:border-box;margin:0;padding:0;}
  html,body{background:#fff;}
  body{
    font-family:'${tp.familia}',${tp.respaldo};
    -webkit-font-smoothing:antialiased;color:${c.texto};
  }
  .hoja{
    width:210mm;height:297mm;padding:18mm 20mm 15mm;position:relative;
    background:#fff;overflow:hidden;
    page-break-after:always;break-after:page;
  }
  .hoja:last-child{page-break-after:auto;break-after:auto;}

  /* ------------------------------------------------------------- cabeza */
  .cab{display:flex;align-items:baseline;justify-content:space-between;
       padding-bottom:4mm;border-bottom:.4mm solid ${c.linea};}
  .mark{font-size:13pt;font-weight:700;letter-spacing:-.01em;}
  .mark span{color:${c.verde};}
  .cab .rot{font-size:8pt;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:${c.apagado};}

  .para{margin-top:7mm;font-size:8.5pt;font-weight:600;letter-spacing:.13em;
        text-transform:uppercase;color:${c.verde_fuerte};}
  h1{margin-top:3mm;font-size:21pt;font-weight:700;line-height:1.2;letter-spacing:-.02em;max-width:150mm;}
  .bajada{margin-top:4mm;font-size:11pt;line-height:1.5;color:${c.apagado};max-width:155mm;}

  h2{margin-top:9mm;font-size:9pt;font-weight:700;letter-spacing:.13em;
     text-transform:uppercase;color:${c.verde_fuerte};}
  h2 + *{margin-top:3mm;}
  /* El primer titulo de una hoja no necesita el aire que separa secciones. */
  h2.primero{margin-top:7mm;}
  p{font-size:10.5pt;line-height:1.55;}

  ul{list-style:none;}
  ul li{position:relative;padding-left:7mm;margin-bottom:2.6mm;font-size:10.5pt;line-height:1.5;}
  ul li::before{
    content:'';position:absolute;left:0;top:2.1mm;width:3mm;height:3mm;border-radius:50%;
    background:${c.verde_claro};border:.5mm solid ${c.verde};
  }

  /* ------------------------------------------------------------ programa */
  .fila{display:flex;gap:6mm;padding:2.9mm 0;border-bottom:.3mm solid ${c.linea};}
  .fila:last-child{border-bottom:0;}
  .min{
    width:12mm;flex:none;text-align:right;font-size:10pt;font-weight:700;
    font-variant-numeric:tabular-nums;color:${c.apagado};padding-top:.3mm;
  }
  .qt{font-size:11pt;font-weight:600;line-height:1.3;}
  .qd{margin-top:1.2mm;font-size:9.5pt;line-height:1.42;color:${c.apagado};}
  /* El bloque de la demo va marcado: es lo que diferencia este taller de una
     charla, y es lo primero que mira el que decide si lo contrata. */
  .fila.marcada{
    background:${c.verde_claro};border-radius:2.5mm;border-bottom:0;
    padding:3.6mm 4mm;margin:1.5mm -4mm;
  }
  .fila.marcada .min{color:${c.verde_fuerte};}
  .fila.marcada .qt{color:${c.verde_fuerte};}
  .fila.marcada .qd{color:${c.texto};}
  .total{margin-top:3.5mm;font-size:9.5pt;color:${c.apagado};}
  .total b{color:${c.texto};font-weight:600;}

  /* --------------------------------------------------------------- ficha */
  .par{display:flex;gap:5mm;padding:2.6mm 0;border-bottom:.3mm solid ${c.linea};}
  .par:last-child{border-bottom:0;}
  dt{width:45mm;flex:none;font-size:9.5pt;font-weight:600;color:${c.apagado};}
  dd{font-size:10.5pt;line-height:1.45;}

  .caja{
    margin-top:3mm;padding:6mm;border-radius:3mm;
    background:${c.suave};border:.3mm solid ${c.linea};
  }
  .caja p{font-size:10.5pt;}
  .honorario{font-size:15pt;font-weight:700;letter-spacing:-.01em;}

  .pie{
    position:absolute;left:20mm;right:20mm;bottom:13mm;
    padding-top:4mm;border-top:.4mm solid ${c.linea};
    display:flex;align-items:baseline;justify-content:space-between;gap:6mm;
    font-size:9pt;color:${c.apagado};
  }
  .pie b{color:${c.texto};font-weight:600;}
</style>
</head>
<body>

<div class="hoja">
  <div class="cab">
    <span class="mark">${firma}</span>
    <span class="rot">Propuesta de taller</span>
  </div>

  <div class="para">Para ${esc(t.institucion)}</div>
  <h1>${esc(t.titulo)}</h1>
  <p class="bajada">${esc(t.bajada)}</p>

  <h2>A quién está dirigido</h2>
  <p>${esc(t.para_quien)}</p>

  <h2>Qué se lleva cada asistente</h2>
  <ul>${lleva}</ul>

  <h2>Formato y requisitos</h2>
  <div>${ficha}</div>

  <div class="pie">
    <span><b>${esc(t.contacto.nombre)}</b> · ${esc(t.contacto.sitio)} · ${esc(t.contacto.mail)}</span>
    <span>1 / 2</span>
  </div>
</div>

<div class="hoja">
  <div class="cab">
    <span class="mark">${firma}</span>
    <span class="rot">Propuesta de taller</span>
  </div>

  <h2 class="primero">Programa</h2>
  <div class="prog">${filas}</div>
  <p class="total">Duración total: <b>${total} minutos</b>.</p>

  <h2>Quién lo dicta</h2>
  <p>${esc(t.quien)}</p>

  <h2>Condiciones</h2>
  <div class="caja">
    ${t.honorario
      ? `<div class="honorario">${esc(t.honorario)}</div><p style="margin-top:2mm">${esc(t.nota_honorario)}</p>`
      : `<p>${esc(t.nota_honorario)}</p>`}
  </div>

  <div class="pie">
    <span><b>${esc(t.contacto.nombre)}</b> · ${esc(t.contacto.sitio)} · ${esc(t.contacto.mail)}</span>
    <span>2 / 2</span>
  </div>
</div>

</body>
</html>`;
}

module.exports = { documento };
