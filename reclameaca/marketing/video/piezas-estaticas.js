/* Piezas ESTÁTICAS — tanda 2: carruseles (1080x1350) e historias en imagen (1080x1920).
   Sigue a la tanda 1 (carrusel-01 a carrusel-03, historia-04 a historia-06).
   Usan los mismos bloques que los videos, renderizados en su estado final.
   Contenido legal tomado de las guías del sitio (reclameaca.com.ar/guias). */

const { LOGO, esc, ceja, titular, cuerpo, placaLey, li, cierre } = require('./lib/bloques.js');

const pag = (n, total) => `<span class="pag">${n}/${total}</span>`;
const swipe = () => `<span class="swipe"><i class="arr">→</i>Seguí</span>`;

/* Lámina de carrusel: una escena sin animación pendiente, con paginador. */
const lam = ({ tema = 'light', marca = false, wrap = '', html, n, total, mas = true }) => {
  const e = esc({ dur: 1, tema, marca, wrap, html });
  const extra = pag(n, total) + (mas ? swipe() : '');
  return e.replace('</section>', extra + '</section>');
};

/* Lámina final: logo, titular, bajada y URL, sin "Seguí". */
const final = (n, total, lineas, texto) => lam({ n, total, tema: 'navy', marca: false, wrap: 'center', mas: false, html:
  `<div style="align-self:center">${LOGO(160).replace('class="mk"', 'class="cta-logo"')}</div>
   ${titular(lineas, 'h2')}
   ${cuerpo(texto)}
   <div class="url">reclameaca.com.ar</div>` });

/* ====================================================================== */
/*  CARRUSEL 4 — Dar de baja un servicio                                   */
/* ====================================================================== */

const C4 = {
  id: 'carrusel-04-baja-servicio',
  titulo: 'Cómo dar de baja cualquier servicio',
  formato: 'carrusel',
  tamano: [1080, 1350],
  laminas: [
    lam({ n: 1, total: 6, tema: 'dark', marca: true, html:
      `${ceja('Internet, celular, streaming', 'on-dark')}
       ${titular(['Cómo dar de baja', 'un servicio', 'sin vueltas.'], 'h1')}
       ${cuerpo('Lo que dice la norma y qué hacer si te siguen cobrando.')}` }),

    lam({ n: 2, total: 6, html:
      `${ceja('Uno · Disposición 954/2025', 'law')}
       <div class="ruled"><i class="rule"></i>${titular(['El Botón de baja', 'va a simple vista.'], 'h2')}</div>
       ${cuerpo('En un lugar destacado, desde el primer acceso a la web. Sin cuenta, sin registro y sin ningún otro trámite.')}` }),

    lam({ n: 3, total: 6, html:
      `${ceja('Dos · En 24 horas', 'law')}
       <div class="ruled"><i class="rule"></i>${titular(['Te mandan el código', 'de tu pedido.'], 'h2')}</div>
       ${cuerpo('Por el mismo medio. Guardalo: es la prueba de que pediste la baja y de qué día fue.')}` }),

    lam({ n: 4, total: 6, html:
      `${ceja('Tres · Art. 10 ter', 'law')}
       <div class="ruled"><i class="rule"></i>${titular(['Por el mismo medio', 'con el que contrataste.'], 'h2')}</div>
       ${cuerpo('Si fue por teléfono o por internet, la baja también. Y la constancia escrita llega en 72 horas, sin costo.')}` }),

    lam({ n: 5, total: 6, tema: 'orange', marca: false, html:
      `${ceja('Si te siguen cobrando', 'solid')}
       ${titular(['Frenalo desde', 'tu banco.'], 'h2')}
       ${cuerpo('Si es débito, dalo de baja en el banco y pedí lo debitado en los últimos 30 días. Si es tarjeta, impugná el resumen: tenés 30 días.')}` }),

    final(6, 6, ['¿No te dejan irte?', 'Publicá el reclamo.'],
      'Queda con fecha, la empresa recibe el aviso y lo ve el próximo cliente.'),
  ],
};

/* ====================================================================== */
/*  CARRUSEL 5 — Corte de luz                                              */
/* ====================================================================== */

const C5 = {
  id: 'carrusel-05-corte-de-luz',
  titulo: 'Corte de luz: cuándo te tienen que pagar',
  formato: 'carrusel',
  tamano: [1080, 1350],
  laminas: [
    lam({ n: 1, total: 6, tema: 'dark', marca: true, html:
      `${ceja('Edenor y Edesur', 'on-dark')}
       ${titular(['Corte de luz:', 'cuándo te tienen', 'que pagar.'], 'h1')}
       ${cuerpo('El resarcimiento existe. Pero no llega solo.')}` }),

    lam({ n: 2, total: 6, html:
      `${ceja('Antes · Descartá dos cosas', 'law')}
       <div class="ruled"><i class="rule"></i>${titular(['¿Es de tu casa', 'o es programado?'], 'h2')}</div>
       ${cuerpo('Revisá la térmica y el tablero. Los cortes por obras se tienen que avisar con al menos 48 horas.')}` }),

    lam({ n: 3, total: 6, html:
      `${ceja('Durante el corte', 'law')}
       <div class="ruled"><i class="rule"></i>${titular(['Reclamá y guardá', 'el número.'], 'h2')}</div>
       ${cuerpo('Anotá a qué hora se cortó y a qué hora volvió. Sin ese número no podés pedir nada después.')}` }),

    lam({ n: 4, total: 6, html:
      `${ceja('Cuándo te corresponde', 'law')}
       <div class="ruled"><i class="rule"></i>${titular(['Alcanza con', 'una de las dos.'], 'h2')}</div>
       ${li('15h', 'Un corte de 15 horas seguidas o más', '', 0)}
       ${li('4', 'Cuatro cortes o más en el mismo mes', 'Contados por mes calendario', 0)}` }),

    lam({ n: 5, total: 6, tema: 'orange', marca: false, html:
      `${ceja('Cómo se cobra', 'solid')}
       ${titular(['Lo pedís al ente', 'regulador. Es gratis.'], 'h2')}
       ${cuerpo('En línea o al 0800 333 3000. Se acredita en pesos en tu factura, y si supera el importe, en las siguientes.')}` }),

    final(6, 6, ['¿Se te quemó', 'un artefacto?'],
      'También se reclama. No lo tires ni lo arregles sin el presupuesto del técnico por escrito.'),
  ],
};

/* ====================================================================== */
/*  CARRUSEL 6 — Aumento de la prepaga                                     */
/* ====================================================================== */

const C6 = {
  id: 'carrusel-06-prepaga',
  titulo: 'Las reglas que siguen vigentes en la prepaga',
  formato: 'carrusel',
  tamano: [1080, 1350],
  laminas: [
    lam({ n: 1, total: 7, tema: 'dark', marca: true, html:
      `${ceja('Aumento de la prepaga', 'on-dark')}
       ${titular(['Precios libres', 'no quiere decir', 'sin reglas.'], 'h1')}
       ${cuerpo('Estas siguen vigentes después del DNU 70/2023. Valen para cualquier prepaga.')}` }),

    lam({ n: 2, total: 7, html:
      `${ceja('Uno · Res. SSS 2155/2024', 'law')}
       <div class="ruled"><i class="rule"></i>${titular(['Cada aumento', 'se avisa con', 'porcentaje y', 'cuota nueva.'], 'h2')}</div>
       ${cuerpo('De forma clara y destacada, dentro de los 5 días posteriores a que el INDEC publica la inflación del mes.')}` }),

    lam({ n: 3, total: 7, html:
      `${ceja('Dos · La factura', 'law')}
       <div class="ruled"><i class="rule"></i>${titular(['Te tienen que', 'desglosar el cobro.'], 'h2')}</div>
       ${li('1', 'El costo base del plan', '', 0)}
       ${li('2', 'Adicionales y ajustes por edad', '', 0)}
       ${li('3', 'Aportes, impuestos y tasas', 'Si no viene, pedíselo por escrito', 0)}` }),

    lam({ n: 4, total: 7, html:
      `${ceja('Tres · Ley 26.682, art. 17', 'law')}
       <div class="ruled"><i class="rule"></i>${titular(['Por edad, como', 'mucho 3 veces más.'], 'h2')}</div>
       ${cuerpo('Es la diferencia máxima entre la franja de edad más barata y la más cara.')}` }),

    lam({ n: 5, total: 7, html:
      `${ceja('Cuatro · Art. 12', 'law')}
       <div class="ruled"><i class="rule"></i>${titular(['Más de 65 y 10 años', 'de antigüedad: sin', 'aumento por edad.'], 'h2')}</div>
       ${cuerpo('Los aumentos generales sí te alcanzan. Si te aplicaron uno por edad, se denuncia gratis ante la Superintendencia.')}` }),

    lam({ n: 6, total: 7, tema: 'orange', marca: false, html:
      `${ceja('Cinco · Art. 9', 'solid')}
       ${titular(['Te podés ir cuando', 'quieras, sin multa.'], 'h2')}
       ${cuerpo('Avisando con 30 días de anticipación, de forma que quede constancia.')}` }),

    final(7, 7, ['¿No te responde?', 'Dejalo público.'],
      'La prepaga recibe el aviso y otros afiliados lo ven.'),
  ],
};

/* ====================================================================== */
/*  HISTORIAS EN IMAGEN — 1080x1920, con la franja del sticker libre       */
/* ====================================================================== */

const img = (id, titulo, html, tema = 'dark', marca = true) => ({
  id, titulo, formato: 'historia-img', tamano: [1080, 1920],
  laminas: [esc({ dur: 1, tema, marca, wrap: 'top', html: `<style>.wrap{bottom:760px}</style>${html}` })],
});

const H9 = img('historia-09-caja-baja', 'Caja de preguntas: bajas',
  `${ceja('Contanos', 'on-dark')}
   ${titular(['¿Qué servicio', 'no te dejan', 'dar de baja?'], 'h2')}
   ${cuerpo('Internet, celular, cable, streaming. Las leemos todas.')}`, 'navy', true);

const H11 = img('historia-11-luz-15-horas', 'Dato: corte de 15 horas',
  `${ceja('Si se corta la luz', 'solid')}
   <div class="huge" style="font-size:150px">15 horas</div>
   ${titular(['seguidas, y te', 'corresponde un pago.'], 'h2')}
   ${cuerpo('O 4 cortes en el mismo mes. Pero hay que pedirlo.')}`, 'orange', true);

const H13 = img('historia-13-prepaga-reglas', 'Prepaga: tres números',
  `${ceja('Aumento de la prepaga', 'on-dark')}
   ${titular(['Tres números', 'para tener a mano.'], 'h2')}
   ${li('65', 'Sin aumento por edad', 'Con más de 65 años y 10 de antigüedad', 0)}
   ${li('3x', 'Tope entre franjas de edad', 'De la más barata a la más cara', 0)}
   ${li('30', 'Días de aviso para irte', 'Sin multa', 0)}`, 'dark', true);

module.exports = [C4, C5, C6, H9, H11, H13];
