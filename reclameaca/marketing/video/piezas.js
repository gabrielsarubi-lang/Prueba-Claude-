/* Piezas de VIDEO para Reclame Acá — tanda 2: reels e historias animadas.
   Sigue a la tanda 1 (reel-01 a reel-06, historia-01 a historia-08).
   Contenido legal tomado de las guías del propio sitio (reclameaca.com.ar/guias),
   actualizadas el 11 de septiembre de 2026:
     /guias/dar-de-baja-un-servicio
     /guias/corte-de-luz-edenor-edesur
     /guias/aumento-prepaga
   Cada escena es HTML plano; el motor la anima según data-anim / data-at / data-d. */

const { LOGO, esc, ceja, titular, cuerpo, placaLey, li, cierre } = require('./lib/bloques.js');

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

module.exports = [R7, R8, R9, H10, H12, H14];
