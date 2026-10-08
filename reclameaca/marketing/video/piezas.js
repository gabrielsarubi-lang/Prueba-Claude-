/* Piezas de VIDEO para Reclame Acá — tanda 2: reels e historias animadas.
   Sigue a la tanda 1 (reel-01 a reel-06, historia-01 a historia-08).
   Contenido legal tomado de las guías del propio sitio (reclameaca.com.ar/guias),
   actualizadas el 11 de septiembre de 2026:
     /guias/dar-de-baja-un-servicio
     /guias/corte-de-luz-edenor-edesur
     /guias/aumento-prepaga
   Cada escena es HTML plano; el motor la anima según data-anim / data-at / data-d. */

const { LOGO, bug, esc, ceja, titular, cuerpo, placaLey, li, cierre } = require('./lib/bloques.js');

/* ====================================================================== */
/*  REELS                                                                  */
/* ====================================================================== */

const R7 = {
  id: 'reel-07-baja-servicio',
  titulo: 'Dar de baja un servicio',
  formato: 'reel',
  escenas: [
    esc({ dur: 2.8, tema: 'dark', html:
      `${ceja('Lo que te dicen', 'on-dark', 0)}
       ${titular(['“Para la baja', 'tenés que llamar', 'al 0800.”'], 'h1', 0.22, 0.1)}` }),

    esc({ dur: 1.7, tema: 'orange', marca: false, wrap: 'center', html:
      `<div class="huge" data-anim="pop" data-at="0" data-d="0.5">No</div>
       ${cuerpo('Si te vende por internet, te deja irte por internet.', 0.45)}` }),

    placaLey({ dur: 3.6, articulo: 'Disposición 954/2025',
      lineas: ['El Botón de baja', 'tiene que estar', 'a simple vista.'],
      texto: 'Desde el primer acceso a la web, sin cuenta ni registro. Y en 24 horas te mandan el código de tu pedido.' }),

    placaLey({ dur: 3.5, articulo: 'Ley 24.240 · Art. 10 ter',
      lineas: ['Contrataste por', 'teléfono o internet:', 'la baja, igual.'],
      texto: 'Y la constancia por escrito te la tienen que mandar dentro de las 72 horas, sin costo.' }),

    esc({ dur: 3.5, tema: 'dark', html:
      `${ceja('¿No encontrás el botón?', 'on-dark', 0)}
       ${li('1', 'Sacá capturas de la página', 'Que se vea que no está o que da error', 0.3)}
       ${li('2', 'Pedí la baja igual, por escrito', 'Mail, formulario o chat. Guardá la constancia', 0.52)}
       ${li('3', 'Anotá la fecha', 'Lo que te cobren desde ese día se reclama', 0.74)}` }),

    esc({ dur: 2.9, tema: 'dark', html:
      `${titular(['Vale para internet,', 'celular, cable', 'y streaming.'], 'h2', 0.05, 0.09)}
       ${cuerpo('Y para cualquier servicio que se contrate por internet.', 0.45)}` }),

    cierre(3.2, ['¿No te dejan irte?', 'Publicá el reclamo.'], 'Gratis, público y sin vueltas.'),
  ],
};

const R8 = {
  id: 'reel-08-corte-de-luz',
  titulo: 'Corte de luz: el resarcimiento',
  formato: 'reel',
  escenas: [
    esc({ dur: 2.8, tema: 'dark', html:
      `${ceja('Edenor y Edesur', 'on-dark', 0)}
       ${titular(['Se cortó', 'la luz.', 'Otra vez.'], 'h1', 0.2, 0.09)}
       ${cuerpo('Lo que hagas mientras estás a oscuras define si después te pagan.', 0.6)}` }),

    esc({ dur: 1.8, tema: 'orange', marca: false, wrap: 'center', html:
      `<div class="huge" data-anim="pop" data-at="0" data-d="0.5">Reclamo<br>primero</div>
       ${cuerpo('Sin número de reclamo, no hay resarcimiento.', 0.45)}` }),

    placaLey({ dur: 3.6, articulo: 'Durante el corte',
      lineas: ['Reclamá y guardá', 'el número.'],
      texto: 'Anotá a qué hora se cortó y a qué hora volvió. Si se repite, un reclamo por cada corte.' }),

    esc({ dur: 3.6, tema: 'light', html:
      `${ceja('Cuándo te corresponde', 'law', 0)}
       ${li('15h', 'Un corte de 15 horas seguidas o más', '', 0.28)}
       ${li('4', 'Cuatro cortes o más en el mismo mes', '', 0.5)}
       ${cuerpo('Te lo pagan como crédito en la factura.', 0.72)}` }),

    placaLey({ dur: 3.5, articulo: 'Ante el ente regulador',
      lineas: ['No llega solo:', 'hay que pedirlo.'],
      texto: 'Es gratis. En línea o por teléfono al 0800 333 3000, con tu número de cliente y cada número de reclamo.' }),

    esc({ dur: 3.0, tema: 'dark', html:
      `${titular(['¿Se te quemó', 'la heladera?'], 'h2', 0.05, 0.09)}
       ${cuerpo('También se reclama. No la tires ni la mandes a arreglar sin el presupuesto del técnico por escrito.', 0.4)}` }),

    cierre(3.0, ['Y dejalo público.'], 'Así tus vecinos ven que no es un caso aislado.'),
  ],
};

const R9 = {
  id: 'reel-09-prepaga',
  titulo: 'Aumento de la prepaga',
  formato: 'reel',
  escenas: [
    esc({ dur: 2.8, tema: 'dark', html:
      `${ceja('Llegó la factura', 'on-dark', 0)}
       ${titular(['Otra vez', 'aumentó la', 'prepaga.'], 'h1', 0.2, 0.09)}
       ${cuerpo('Los precios son libres desde 2023. Las reglas, no.', 0.6)}` }),

    esc({ dur: 1.7, tema: 'orange', marca: false, wrap: 'center', html:
      `<div class="huge" data-anim="pop" data-at="0" data-d="0.5">4 reglas</div>
       ${cuerpo('Que siguen vigentes.', 0.45)}` }),

    placaLey({ dur: 3.6, articulo: 'Res. SSS 2155/2024',
      lineas: ['Te tienen que avisar', 'el porcentaje y', 'la cuota nueva.'],
      texto: 'De forma clara, dentro de los 5 días posteriores a que el INDEC publica la inflación del mes.' }),

    placaLey({ dur: 3.6, articulo: 'Ley 26.682 · Art. 12',
      lineas: ['Más de 65 años y', '10 de antigüedad:', 'sin aumento por edad.'],
      texto: 'Sí te alcanzan los aumentos generales, los que se aplican a todos los afiliados.' }),

    placaLey({ dur: 3.3, articulo: 'Ley 26.682 · Art. 17',
      lineas: ['Por edad, la cuota', 'no puede variar', 'más de 3 veces.'],
      texto: 'Entre la franja de edad más barata y la más cara.' }),

    placaLey({ dur: 3.3, articulo: 'Ley 26.682 · Art. 9',
      lineas: ['Te podés ir cuando', 'quieras, sin multa.'],
      texto: 'Avisando con 30 días de anticipación, de forma que quede constancia.' }),

    esc({ dur: 2.9, tema: 'dark', html:
      `${titular(['¿No te responde?'], 'h2', 0.05)}
       ${cuerpo('Reclamale por escrito. Si no lo resuelve, la Superintendencia de Servicios de Salud recibe la denuncia gratis: 0800-222-72583.', 0.3)}` }),

    cierre(3.0, ['Y dejalo público.'], 'Otros afiliados lo van a ver.'),
  ],
};

/* ====================================================================== */
/*  HISTORIAS — dejan libre la franja de los stickers                      */
/* ====================================================================== */

const historia = (id, titulo, escenas) => ({ id, titulo, formato: 'historia', progreso: false, escenas });

const H10 = historia('historia-10-guia-baja', 'Guía: dar de baja un servicio', [
  esc({ dur: 6.0, tema: 'navy', wrap: 'top', html:
    `<style>.wrap{bottom:760px}</style>
     ${ceja('Guía', 'accent', 0)}
     ${titular(['Cómo dar de baja', 'cualquier servicio', 'sin vueltas.'], 'h2', 0.2, 0.1)}
     ${cuerpo('El Botón de baja, la constancia en 72 horas y qué hacer si te siguen cobrando.', 0.72)}` }),
]);

const H12 = historia('historia-12-encuesta-luz', 'Encuesta: cortes de luz', [
  esc({ dur: 6.0, tema: 'dark', wrap: 'top', html:
    `<style>.wrap{bottom:760px}</style>
     ${ceja('Contanos', 'on-dark', 0)}
     ${titular(['¿Te quedaste', 'sin luz más de una', 'vez este año?'], 'h2', 0.2, 0.1)}
     ${cuerpo('Guardá cada número de reclamo: sin eso no hay resarcimiento.', 0.7)}` }),
]);

const H14 = historia('historia-14-encuesta-prepaga', 'Encuesta: aviso del aumento', [
  esc({ dur: 6.0, tema: 'navy', wrap: 'top', html:
    `<style>.wrap{bottom:760px}</style>
     ${ceja('Contanos', 'on-dark', 0)}
     ${titular(['¿Te avisaron', 'el último aumento', 'con el porcentaje?'], 'h2', 0.2, 0.1)}
     ${cuerpo('Te lo tienen que informar claro, con la cuota nueva.', 0.7)}` }),
]);

/* ====================================================================== */
/*  TENDENCIA — la publicidad antes del homenaje a Messi (6/10/2026)       */
/* ====================================================================== */

/* Se sube a la conversación sin nombrar al sponsor ni usar imágenes del
   partido: el chiste es la sensación que todos conocemos, no la empresa. */

const momento = (n, lineas, sub) => esc({ dur: 2.6, tema: 'light', html:
  `${ceja(n, 'law', 0)}
   <div class="ruled">
     <i class="rule" data-anim="regla" data-at="0.08" data-d="0.6"></i>
     ${titular(lineas, 'h2', 0.14, 0.08)}
   </div>
   ${sub ? cuerpo(sub, 0.55) : ''}` });

const R10 = {
  id: 'reel-10-sin-publicidad',
  titulo: 'Momentos en los que nadie quiere publicidad',
  formato: 'reel',
  escenas: [
    esc({ dur: 2.6, tema: 'dark', html:
      `${ceja('Lo que vimos anoche', 'on-dark', 0)}
       ${titular(['Esperábamos', 'un homenaje.'], 'h1', 0.2, 0.1)}` }),

    esc({ dur: 1.9, tema: 'orange', marca: false, wrap: 'center', html:
      `<div class="huge" data-anim="pop" data-at="0" data-d="0.5">Primero<br>el sponsor</div>` }),

    esc({ dur: 2.3, tema: 'dark', html:
      `${titular(['Momentos en los que', 'nadie quiere', 'publicidad:'], 'h2', 0.05, 0.09)}` }),

    momento('01', ['Esperás el homenaje', 'a Messi.'], ''),
    momento('02', ['Llevás 40 minutos', 'en el 0800.'], '“Su llamada es muy importante para nosotros.”'),
    momento('03', ['Querés darte de baja', 'y te ofrecen', '“un plan mejor”.'], ''),
    momento('04', ['Pedís la devolución', 'y te mandan', 'un cupón.'], ''),

    esc({ dur: 3.2, tema: 'dark', html:
      `${ceja('Reclame Acá', 'on-dark', 0)}
       ${titular(['Acá la empresa', 'responde en público.'], 'h2', 0.18, 0.09)}
       ${cuerpo('Sin musiquita de espera. Sin publicidad antes.', 0.6)}` }),

    cierre(3.0, ['Tu reclamo,', 'sin cortes comerciales.'], 'Gratis, público y sin vueltas.'),
  ],
};

/* Versión con la captura del show de drones. La imagen la aportó el
   cliente: es de la transmisión y muestra la marca del sponsor, así que
   usarla es decisión suya. La versión sin imágenes de terceros es R10. */
const FOTO = 'assets/drones-monumental.webp';
// Abre con la captura: es el gancho del primer segundo.
const escenaFoto = `<section class="scene on-dark" data-dur="3.4">
  <div class="bg bg-dark"></div>
  <div style="position:absolute;inset:-80px;background:url(${FOTO}) center/cover;filter:blur(40px) brightness(.32) saturate(1.2)"></div>
  <div class="glow"></div>
  <div class="wrap" style="gap:36px">
    ${ceja('Anoche, en el Monumental', 'on-dark', 0)}
    ${titular(['Esperábamos', 'un homenaje.'], 'h2', 0.25, 0.1)}
    <div data-anim="pop" data-at="0" data-d="0.55" style="border-radius:26px;overflow:hidden;box-shadow:0 30px 90px rgba(0,0,0,.55);border:1px solid rgba(255,255,255,.12)">
      <img src="${FOTO}" data-anim="deriva" data-at="0" data-d="3.4" style="display:block;width:100%;transform-origin:50% 50%">
    </div>
    <p class="kicker" data-anim="sube" data-at="1.3" data-d="0.6" data-dist="30" style="color:#fff">Y antes del homenaje…</p>
  </div>
  ${bug()}
</section>`;

const R10F = {
  id: 'reel-10-sin-publicidad-con-foto',
  titulo: 'Momentos en los que nadie quiere publicidad (con la captura de los drones)',
  formato: 'reel',
  escenas: [escenaFoto, ...R10.escenas.slice(1)],
};

/* ====================================================================== */
/*  TANDA 3 — días 16 a 22                                                 */
/*  Ley 24.240: arts. 7, 8, 8 bis y 35. Ley 26.951 (No Llame).            */
/*  Ley 26.993 (Consumo Protegido / COPREC).                              */
/* ====================================================================== */

const R11 = {
  id: 'reel-11-cobros-no-pedidos',
  titulo: 'Cobros que no pediste',
  formato: 'reel',
  escenas: [
    esc({ dur: 2.8, tema: 'dark', html:
      `${ceja('Revisá tu factura', 'on-dark', 0)}
       ${titular(['Un seguro, una', 'asistencia, un', '“servicio extra”.'], 'h2', 0.2, 0.09)}
       ${cuerpo('Que nunca pediste.', 0.6)}` }),

    esc({ dur: 1.8, tema: 'orange', marca: false, wrap: 'center', html:
      `<div class="huge" data-anim="pop" data-at="0" data-d="0.5">No lo<br>pediste</div>
       ${cuerpo('Entonces no lo pagás.', 0.45)}` }),

    placaLey({ dur: 3.6, articulo: 'Ley 24.240 · Art. 35',
      lineas: ['No te pueden cobrar', 'algo que no pediste.'],
      texto: 'Aunque no hayas dicho que no. No pueden obligarte a negarte para que no te lo cobren.' }),

    placaLey({ dur: 3.4, articulo: 'Si te lo mandan igual',
      lineas: ['No tenés que', 'devolverlo', 'ni guardarlo.'],
      texto: 'Si te enviaron algo que no pediste, la ley no te obliga a conservarlo ni a restituirlo.' }),

    esc({ dur: 3.6, tema: 'dark', html:
      `${ceja('Qué hacer', 'on-dark', 0)}
       ${li('1', 'Revisá cada renglón de la factura', 'Celular, tarjeta, cable, banco', 0.3)}
       ${li('2', 'Pedí la baja y el reintegro por escrito', 'Con número de reclamo', 0.52)}
       ${li('3', 'Si es en la tarjeta, impugnalo', 'Tenés 30 días desde el resumen', 0.74)}` }),

    cierre(3.2, ['¿Te lo siguen', 'cobrando?', 'Publicá el reclamo.'], 'Gratis, público y sin vueltas.'),
  ],
};

const R12 = {
  id: 'reel-12-precio-publicado',
  titulo: 'El precio publicado es el que pagás',
  formato: 'reel',
  escenas: [
    esc({ dur: 2.8, tema: 'dark', html:
      `${ceja('En la caja', 'on-dark', 0)}
       ${titular(['En la góndola', 'decía otro', 'precio.'], 'h1', 0.2, 0.09)}
       ${cuerpo('“Es que no lo actualizaron.”', 0.6)}` }),

    esc({ dur: 1.8, tema: 'orange', marca: false, wrap: 'center', html:
      `<div class="huge" data-anim="pop" data-at="0" data-d="0.5">Pagás el<br>publicado</div>` }),

    placaLey({ dur: 3.6, articulo: 'Ley 24.240 · Art. 7',
      lineas: ['La oferta publicada', 'obliga a quien', 'la publica.'],
      texto: 'Mientras esté vigente. Y si no la cumplen, la ley lo trata como una negativa injustificada de venta.' }),

    placaLey({ dur: 3.5, articulo: 'Ley 24.240 · Art. 8',
      lineas: ['Lo que dice la', 'publicidad, es parte', 'del contrato.'],
      texto: 'Las cuotas, el descuento y las condiciones que te mostraron, te los tienen que respetar.' }),

    esc({ dur: 3.6, tema: 'dark', html:
      `${ceja('Qué hacer', 'on-dark', 0)}
       ${li('1', 'Sacale una foto al precio', 'Góndola, vidriera o pantalla', 0.3)}
       ${li('2', 'Pedí que te cobren el publicado', 'Antes de pagar', 0.52)}
       ${li('3', 'Guardá el ticket', 'Es la prueba de lo que te cobraron', 0.74)}` }),

    cierre(3.2, ['¿No te lo respetaron?', 'Publicá el reclamo.'], 'Gratis, público y sin vueltas.'),
  ],
};

const R13 = {
  id: 'reel-13-trato-digno',
  titulo: 'Cobranzas: trato digno',
  formato: 'reel',
  escenas: [
    esc({ dur: 3.0, tema: 'dark', html:
      `${ceja('Te llegó una carta', 'on-dark', 0)}
       ${titular(['Con sello, número', 'de expediente y', 'tono de juzgado.'], 'h2', 0.2, 0.09)}
       ${cuerpo('Pero era de la empresa de cobranzas.', 0.65)}` }),

    esc({ dur: 1.7, tema: 'orange', marca: false, wrap: 'center', html:
      `<div class="huge" data-anim="pop" data-at="0" data-d="0.5">No vale</div>
       ${cuerpo('Y la ley lo dice con todas las letras.', 0.45)}` }),

    placaLey({ dur: 3.6, articulo: 'Ley 24.240 · Art. 8 bis',
      lineas: ['Un reclamo de deuda', 'no puede parecer', 'judicial.'],
      texto: 'Si no es de un juzgado, no pueden darle apariencia de reclamo judicial.' }),

    placaLey({ dur: 3.5, articulo: 'Trato digno · Art. 8 bis',
      lineas: ['Nada de situaciones', 'vergonzantes ni', 'intimidatorias.'],
      texto: 'Te tienen que tratar con dignidad. También cuando te reclaman una deuda.' }),

    esc({ dur: 3.4, tema: 'dark', html:
      `${titular(['¿Te llaman', 'para venderte algo?'], 'h2', 0.05, 0.09)}
       ${cuerpo('Anotate gratis en el Registro Nacional No Llame (Ley 26.951). No pueden llamar a los números anotados para ofrecerte productos o servicios.', 0.4)}` }),

    cierre(3.2, ['¿Te trataron mal?', 'Dejalo público.'], 'Con fecha, y a la vista del próximo cliente.'),
  ],
};

const R14 = {
  id: 'reel-14-sin-abogado',
  titulo: 'Reclamar sin abogado',
  formato: 'reel',
  escenas: [
    esc({ dur: 2.8, tema: 'dark', html:
      `${ceja('Lo que muchos creen', 'on-dark', 0)}
       ${titular(['“Para reclamar', 'necesito', 'un abogado.”'], 'h1', 0.22, 0.1)}` }),

    esc({ dur: 1.7, tema: 'orange', marca: false, wrap: 'center', html:
      `<div class="huge" data-anim="pop" data-at="0" data-d="0.5">No</div>
       ${cuerpo('Hay un camino gratis antes de un juicio.', 0.45)}` }),

    placaLey({ dur: 3.3, articulo: 'Paso 1',
      lineas: ['Reclamale a la', 'empresa por escrito.'],
      texto: 'Contá qué pasó, qué solución pedís, y guardá el número de reclamo.' }),

    placaLey({ dur: 3.6, articulo: 'Paso 2 · Consumo Protegido',
      lineas: ['Conciliación', 'gratis y en línea.'],
      texto: 'Una audiencia con la empresa y un conciliador, sin costo y sin necesidad de abogado (Ley 26.993).' }),

    placaLey({ dur: 3.3, articulo: 'Paso 3',
      lineas: ['O andá a Defensa', 'del Consumidor.'],
      texto: 'La oficina de tu municipio o de tu provincia también recibe el reclamo, gratis.' }),

    esc({ dur: 3.3, tema: 'dark', html:
      `${titular(['Y en paralelo,', 'dejalo público.'], 'h2', 0.05, 0.09)}
       ${cuerpo('Publicar en Reclame Acá no reemplaza esos pasos. Pero deja registro con fecha y la empresa recibe el aviso.', 0.4)}` }),

    cierre(3.2, ['Tu reclamo, visible', 'hasta que la empresa', 'responda.'], 'Gratis, público y sin vueltas.'),
  ],
};

const H16 = historia('historia-16-encuesta-cobros', 'Encuesta: cobros no pedidos', [
  esc({ dur: 6.0, tema: 'dark', wrap: 'top', html:
    `<style>.wrap{bottom:760px}</style>
     ${ceja('Contanos', 'on-dark', 0)}
     ${titular(['¿Revisaste tu', 'factura este mes?'], 'h2', 0.2, 0.1)}
     ${cuerpo('Buscá cargos que no pediste: seguros, asistencias, “packs”.', 0.7)}` }),
]);

const H18 = historia('historia-18-encuesta-precio', 'Encuesta: precio en caja', [
  esc({ dur: 6.0, tema: 'navy', wrap: 'top', html:
    `<style>.wrap{bottom:760px}</style>
     ${ceja('Contanos', 'on-dark', 0)}
     ${titular(['¿Te cobraron en', 'caja más que en', 'la góndola?'], 'h2', 0.2, 0.1)}
     ${cuerpo('El precio publicado es el que tenés que pagar.', 0.7)}` }),
]);

const H20 = historia('historia-20-encuesta-abogado', 'Encuesta: reclamar sin abogado', [
  esc({ dur: 6.0, tema: 'dark', wrap: 'top', html:
    `<style>.wrap{bottom:760px}</style>
     ${ceja('Contanos', 'on-dark', 0)}
     ${titular(['¿Sabías que podés', 'reclamar sin', 'abogado?'], 'h2', 0.2, 0.1)}
     ${cuerpo('La conciliación en Consumo Protegido es gratis.', 0.7)}` }),
]);

module.exports = [R7, R8, R9, H10, H12, H14, R10, R10F, R11, R12, R13, R14, H16, H18, H20];
