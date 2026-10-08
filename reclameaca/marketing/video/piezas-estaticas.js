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

/* ====================================================================== */
/*  TANDA 3 — días 16 a 22                                                 */
/* ====================================================================== */

const C7 = {
  id: 'carrusel-07-cobros-no-pedidos',
  titulo: 'Lo que te cobran sin que lo hayas pedido',
  formato: 'carrusel',
  tamano: [1080, 1350],
  laminas: [
    lam({ n: 1, total: 6, tema: 'dark', marca: true, html:
      `${ceja('Revisá tu factura', 'on-dark')}
       ${titular(['Lo que te cobran', 'sin que lo', 'hayas pedido.'], 'h1')}
       ${cuerpo('Seguros, asistencias, “packs”. Qué dice la ley.')}` }),

    lam({ n: 2, total: 6, html:
      `${ceja('Uno · Ley 24.240, art. 35', 'law')}
       <div class="ruled"><i class="rule"></i>${titular(['No te pueden cobrar', 'lo que no pediste.'], 'h2')}</div>
       ${cuerpo('Está prohibido ofrecerte algo que genere un cargo automático y te obligue a decir que no para no pagarlo.')}` }),

    lam({ n: 3, total: 6, html:
      `${ceja('Dos · Tu silencio no es un sí', 'law')}
       <div class="ruled"><i class="rule"></i>${titular(['No contestar', 'no es aceptar.'], 'h2')}</div>
       ${cuerpo('Si nunca dijiste que sí, no lo contrataste. Que no te hayas negado no lo convierte en un servicio tuyo.')}` }),

    lam({ n: 4, total: 6, html:
      `${ceja('Tres · Art. 35', 'law')}
       <div class="ruled"><i class="rule"></i>${titular(['Si te mandan algo', 'que no pediste,', 'no lo devolvés.'], 'h2')}</div>
       ${cuerpo('No estás obligado a guardarlo ni a devolverlo, aunque devolverlo no te cueste nada.')}` }),

    lam({ n: 5, total: 6, tema: 'orange', marca: false, html:
      `${ceja('Qué hacer', 'solid')}
       ${titular(['Pedí la baja', 'y el reintegro.'], 'h2')}
       ${cuerpo('Por escrito, con número de reclamo. Si te lo cobran en la tarjeta, impugnalo: tenés 30 días desde que recibís el resumen.')}` }),

    final(6, 6, ['¿Te lo siguen', 'cobrando?', 'Publicá el reclamo.'],
      'Queda con fecha, la empresa recibe el aviso y lo ve el próximo cliente.'),
  ],
};

const C8 = {
  id: 'carrusel-08-precio-publicado',
  titulo: 'El precio publicado es el que pagás',
  formato: 'carrusel',
  tamano: [1080, 1350],
  laminas: [
    lam({ n: 1, total: 6, tema: 'dark', marca: true, html:
      `${ceja('Precios', 'on-dark')}
       ${titular(['El precio', 'publicado es', 'el que pagás.'], 'h1')}
       ${cuerpo('En la góndola, en la vidriera y en la web.')}` }),

    lam({ n: 2, total: 6, html:
      `${ceja('Uno · Ley 24.240, art. 7', 'law')}
       <div class="ruled"><i class="rule"></i>${titular(['La oferta obliga', 'a quien la hace.'], 'h2')}</div>
       ${cuerpo('Mientras esté vigente. Si no la cumplen, la ley lo trata como una negativa injustificada de venta.')}` }),

    lam({ n: 3, total: 6, html:
      `${ceja('Dos · Art. 8', 'law')}
       <div class="ruled"><i class="rule"></i>${titular(['La publicidad es', 'parte del contrato.'], 'h2')}</div>
       ${cuerpo('Las cuotas, el descuento y las condiciones que te mostraron, te los tienen que respetar.')}` }),

    lam({ n: 4, total: 6, html:
      `${ceja('Tres · Las promos', 'law')}
       <div class="ruled"><i class="rule"></i>${titular(['Toda oferta tiene', 'que decir cuándo', 'empieza y termina.'], 'h2')}</div>
       ${cuerpo('Con la fecha precisa de inicio y de fin, y sus condiciones o limitaciones.')}` }),

    lam({ n: 5, total: 6, tema: 'orange', marca: false, html:
      `${ceja('Qué hacer', 'solid')}
       ${titular(['Foto al precio,', 'antes de pagar.'], 'h2')}
       ${cuerpo('Si en caja te cobran otro, mostrala y pedí el publicado. Y guardá el ticket.')}` }),

    final(6, 6, ['¿No te lo respetaron?', 'Publicá el reclamo.'],
      'Queda con fecha, la empresa recibe el aviso y lo ve el próximo cliente.'),
  ],
};

const C9 = {
  id: 'carrusel-09-como-reclamar',
  titulo: 'Cómo reclamar sin abogado, paso a paso',
  formato: 'carrusel',
  tamano: [1080, 1350],
  laminas: [
    lam({ n: 1, total: 7, tema: 'dark', marca: true, html:
      `${ceja('Guardalo', 'on-dark')}
       ${titular(['Cómo reclamar', 'sin abogado,', 'paso a paso.'], 'h1')}
       ${cuerpo('Vale para cualquier empresa y cualquier rubro.')}` }),

    lam({ n: 2, total: 7, html:
      `${ceja('Antes', 'law')}
       <div class="ruled"><i class="rule"></i>${titular(['Juntá las pruebas.'], 'h2')}</div>
       ${li('1', 'Factura o comprobante', '', 0)}
       ${li('2', 'Fechas y números de gestión', '', 0)}
       ${li('3', 'Mails, chats y capturas', '', 0)}` }),

    lam({ n: 3, total: 7, html:
      `${ceja('Paso 1', 'law')}
       <div class="ruled"><i class="rule"></i>${titular(['Reclamale a la', 'empresa por escrito.'], 'h2')}</div>
       ${cuerpo('Qué pasó, qué solución pedís y hasta cuándo. Pedí número de reclamo y guardalo.')}` }),

    lam({ n: 4, total: 7, html:
      `${ceja('Paso 2 · Consumo Protegido', 'law')}
       <div class="ruled"><i class="rule"></i>${titular(['Conciliación', 'gratis y en línea.'], 'h2')}</div>
       ${cuerpo('Una audiencia con la empresa y un conciliador, sin costo y sin necesidad de abogado (Ley 26.993).')}` }),

    lam({ n: 5, total: 7, html:
      `${ceja('Paso 3', 'law')}
       <div class="ruled"><i class="rule"></i>${titular(['Defensa del', 'Consumidor local.'], 'h2')}</div>
       ${cuerpo('La oficina de tu municipio o de tu provincia también recibe el reclamo, gratis.')}` }),

    lam({ n: 6, total: 7, tema: 'orange', marca: false, html:
      `${ceja('En paralelo', 'solid')}
       ${titular(['Dejalo público.'], 'h2')}
       ${cuerpo('Publicar en Reclame Acá no reemplaza esos pasos. Pero deja registro con fecha y la empresa recibe el aviso.')}` }),

    final(7, 7, ['Tu reclamo, visible', 'hasta que la empresa', 'responda.'],
      'Informativo: no reemplaza el asesoramiento de un abogado.'),
  ],
};

const H15 = img('historia-15-caja-cobros', 'Caja de preguntas: cobros',
  `${ceja('Contanos', 'on-dark')}
   ${titular(['¿Qué te cobraron', 'sin que lo', 'pidieras?'], 'h2')}
   ${cuerpo('Seguros, asistencias, “packs”. Las leemos todas.')}`, 'navy', true);

const H17 = img('historia-17-precio-publicado', 'Dato: precio publicado',
  `${ceja('En la góndola', 'solid')}
   <div class="huge" style="font-size:150px">Ese precio</div>
   ${titular(['es el que', 'tenés que pagar.'], 'h2')}
   ${cuerpo('Si en caja te cobran otro, pedí el publicado. Ley 24.240, art. 7.')}`, 'orange', true);

const H19 = img('historia-19-trato-digno', 'Dato: cobranzas',
  `${ceja('Cobranzas', 'on-dark')}
   ${titular(['Una carta de', 'cobranza no puede', 'parecer de un juzgado.'], 'h2')}
   ${cuerpo('Ley 24.240, artículo 8 bis. Y te tienen que tratar con dignidad.')}`, 'dark', true);

const H21 = img('historia-21-caja-guias', 'Caja de preguntas: próxima guía',
  `${ceja('Contanos', 'on-dark')}
   ${titular(['¿Sobre qué', 'querés la', 'próxima guía?'], 'h2')}
   ${cuerpo('Decinos el rubro o el problema. Las leemos todas.')}`, 'navy', true);

module.exports = [C4, C5, C6, H9, H11, H13, C7, C8, C9, H15, H17, H19, H21];
