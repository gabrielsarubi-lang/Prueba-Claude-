# Placas de Instagram — SARUBIA

Generador de placas para Instagram con la identidad visual de
[sarubi-ia.com](https://sarubi-ia.com): mismo verde, misma tipografía, mismo tono.

Escribís los textos en un archivo JSON y salen las imágenes listas para publicar,
en los dos formatos:

| Formato | Medida | Para qué |
|---|---|---|
| Post | 1080 × 1080 | El feed |
| Historia | 1080 × 1920 | Las stories |

---

## Cómo está organizado

```
instagram/
├── marca.json              La identidad: colores, tipografía, datos de contacto
├── contenido/
│   ├── semana-01.json      Los TEXTOS de una semana. Es lo único que se toca.
│   └── precios-a-la-vista.json   Los textos de la tanda de carruseles e historias
├── lib/
│   └── plantilla.js        El DISEÑO. Se toca solo si cambia la estética.
├── generar.js              Saca los PNG de posts e historias
├── carrusel.js             Saca los PNG de los carruseles, numerados
└── salida/                 Las imágenes y los videos generados
```

La idea de fondo: **los textos y el diseño viven separados.** Cambiar lo que dice una
placa no puede romper cómo se ve, y rediseñar no obliga a reescribir los textos.

---

## Armar una semana nueva

1. Copiá `contenido/semana-01.json` a `contenido/semana-02.json`.
2. Cambiá los textos.
3. Corré:

```bash
node generar.js semana-02.json
```

Las imágenes quedan en `salida/semana-02/`.

### Reglas para escribir los textos

| En el JSON | Qué hace |
|---|---|
| `\n` | Corta el renglón del título donde vos querés |
| `*palabra*` | Pinta esa palabra de verde |
| `"fondo": "oscuro"` / `"claro"` | Alterná entre posts para que la grilla del perfil quede en damero |
| `"escala": "xl"` / `"l"` / `"m"` | Tamaño del título: `xl` corto, `m` largo |
| `"pie_marca": "sitio"` / `"handle"` | Qué se muestra abajo a la derecha **en el post**. La historia y el reel llevan siempre el sitio: Instagram ya muestra el usuario arriba de la pantalla, así que repetirlo no suma |

### Los diez tipos de placa

| `tipo` | Qué muestra | Campos que usa |
|---|---|---|
| `declaracion` | Una frase grande | `titulo`, `sub`, `hint`, `cta` |
| `oferta` | Precio y beneficios | `titulo`, `precio`, `precio_nota`, `checks` |
| `pasos` | Lista numerada con líneas | `titulo`, `pasos` |
| `mito` | Dos paneles enfrentados | `mito`, `realidad` |
| `lista` | Grilla o lista numerada | `titulo`, `items`, `columnas` |
| `pregunta` | Pregunta con barra verde | `titulo`, `sub`, `hint` |
| `cifra` | Un solo número, grande | `etiqueta`, `monto`, `nota` |
| `punto` | Punto numerado de una serie | `numero`, `titulo`, `sub` |
| `capacidad` | Puede / no puede, con cartel | `veredicto`, `titulo`, `sub` |
| `tabla` | Concepto a la izquierda, importe a la derecha | `titulo`, `filas`, `nota` |

En una lámina `capacidad` cuyo `veredicto` empieza con "no", la palabra entre
asteriscos **no sale verde**: el verde dice "esto suma" en todas las demás piezas y
ahí diría lo contrario del cartel.

Cada post define su versión `post` y su versión `historia` por separado, porque el
corte de renglones que funciona en un cuadrado no funciona en un vertical.

---

## Carruseles

Un carrusel es una secuencia de láminas cuadradas. Se escriben en el mismo archivo de
contenido, en el bloque `carruseles`:

```bash
node carrusel.js precios-a-la-vista.json                    # los tres
node carrusel.js precios-a-la-vista.json 1-cuanto-cuesta    # solo uno
```

Cada carrusel queda en su propia carpeta, con las láminas numeradas `01.png`, `02.png`,
`03.png`… **El número no es decorativo: Instagram sube las imágenes en orden alfabético,
y ese orden es el del carrusel.** Si se renombra un archivo, se reordena la pieza.

Cada lámina usa los mismos `tipo` que un post, así que no hay que aprender nada nuevo.
Lo único distinto es el pie: a la derecha lleva el **contador** (`03/08`) en vez del
sitio, porque es lo único que le falta saber a quien está pasando el dedo — cuánto
queda. La última lámina sí lleva el sitio, porque es donde alguien decide ir.

### Historias con sticker

Una historia que va a llevar encuesta, caja de preguntas o sticker de enlace se marca
con `"hueco": true`. Eso reserva la franja de abajo y sube el texto: sin eso, el
sticker se apoya encima de lo que escribiste.

---

## Cambiar la identidad

Todo sale de `marca.json`. Si mañana el verde de SARUBIA cambia, se toca ahí una vez
y se actualizan las 14 placas.

Las medidas de las historias dejan **290 px libres arriba y 300 px abajo** a propósito:
Instagram tapa esas franjas con su propia interfaz (la foto de perfil arriba, el campo
de "enviar mensaje" abajo). Por eso nunca hay texto ahí, y por eso el espacio de abajo
es donde va el sticker de enlace o la caja de preguntas.

---

## Correrlo

```bash
npm install        # una sola vez
node generar.js    # genera la semana-01
```

Hace falta Node.js y Chromium. Si no encuentra Chromium, el programa te lo dice y te
deja igual el HTML armado en `salida/.html/`, que podés abrir en cualquier navegador
y capturar a mano.

```bash
npx playwright install chromium    # si falta el navegador
```

---

## Cómo publicar

- **El orden importa para la grilla.** Los fondos alternan oscuro y claro. Si salteás
  un post, salteá dos para no romper el damero.
- **Los hashtags van en el primer comentario**, no en el pie. Se lee más limpio y el
  alcance es el mismo.
- **La historia va el mismo día que su post, unas horas después.** No al mismo tiempo:
  la historia recuerda, no anuncia.
- **Un solo post con precio por semana.** Repetir la oferta la desgasta.
- **Nada de métricas inventadas.** Ningún texto acá afirma un resultado que no pasó.
  Cuando haya un caso real de un cliente, ese va a ser el mejor post de todos.

---

## Las imágenes ya generadas

Las 14 placas de la semana 1 están guardadas en [`salida/semana-01/`](salida/semana-01/),
así se pueden descargar sin correr el generador.

Para bajarlas **todas juntas**: en la página principal del repositorio, botón verde
**Code** → **Download ZIP**.

Para bajar **una sola**: abrila desde la carpeta y usá el botón de descarga, o mantené
apretado sobre la imagen y "Guardar imagen".

---

## Reels animados

`reel.js` anima las mismas placas y las exporta como video:

```bash
node reel.js                        # los 7 reels de semana-01
node reel.js semana-01.json martes  # solo uno
node reel.js semana-02.json         # otra semana
```

Salen **MP4 de 1080 x 1920, H.264, 8 segundos**, que es lo que Instagram acepta para
Reels e historias. Quedan en `salida/reels/<semana>/`.

### No hay un guion aparte

El reel se arma con **los mismos textos** de `contenido/semana-*.json` que las placas
quietas, y reutiliza el diseño de `lib/plantilla.js`. Por eso una placa y su reel no
pueden discrepar: si cambias un titulo, cambian los dos.

`lib/reel.js` recorre la placa ya armada y le asigna a cada elemento su entrada,
siguiendo el orden en que esta escrito. Cada tipo de placa se mueve como pide su
contenido:

| Elemento | Como entra |
|---|---|
| Titulo | Renglon por renglon, subiendo tapado por su propia mascara |
| Precio | Aparece y el numero sube desde cero hasta el valor final |
| Beneficios, pasos, servicios | Uno detras de otro, desde la izquierda |
| Mito y realidad | Los dos paneles, con un respiro entre uno y otro |
| Boton | Salta a escena, con rebote |

El ultimo segundo y pico queda quieto a proposito: los Reels se repiten en loop y sin
esa pausa se hacen mareadores.

### Como funciona por dentro

La animacion no usa transiciones de CSS. La pagina expone una funcion `__cuadro(t)`
que dibuja el estado exacto del segundo `t`; el generador la llama 240 veces
(8 segundos a 30 cuadros por segundo), captura cada cuadro y los pega con ffmpeg.

Es deterministico: el cuadro 47 sale siempre igual, sin importar cuanto tardo el
navegador en capturarlo. Con transiciones de CSS el video saldria con tirones.

### El video sale mudo, y es a proposito

La musica se pone **dentro de Instagram**, desde su biblioteca: es gratis, esta
licenciada y el algoritmo favorece los videos que usan audio de su catalogo. Una pista
incrustada aca arriesgaria un reclamo de derechos y no sumaria alcance.

---

## Reel del agente de WhatsApp

Pieza aparte, para historia destacada o publicidad paga:

```bash
node reel-agente.js
```

Sale en `salida/reels/sarubia-reel-agente-whatsapp.mp4`. Dura 20 segundos y, a
diferencia de los reels de marca, tiene **escenas**: el contenido cambia en vez de
entrar sobre una placa fija. Por eso vive en `lib/reel-agente.js` y no encima de
`plantilla.js` — forzar una cosa dentro de la otra habria complicado las dos.

| Escena | Segundos | Que muestra |
|---|---|---|
| El problema | 0 – 3 | Son las 23:47 y un cliente pregunta el precio |
| La demostracion | 3 – 11,6 | El agente contestando, con indicador de "escribiendo" |
| Como funciona | 11,4 – 15 | Los tres pasos de la implementacion |
| La oferta | 15 – 20 | Precio, condiciones y boton |

### El corte de los 15 segundos

Las escenas estan cortadas para que el segundo 15 caiga **justo entre dos**. Si lo
subis como historia e Instagram lo parte en dos tramos, el corte queda limpio: el
primer tramo cuenta el problema, la demostracion y como funciona; el segundo, la
oferta. Cada uno se entiende solo.

Como reel o como anuncio pago va entero, sin cortes.

### La conversacion es un ejemplo

Los mensajes de la escena 2 son ilustrativos, no una charla real de un cliente.
**Cambialos por una consulta tipica de tu rubro**: cuanto mas se parezca a lo que te
preguntan todos los dias, mejor va a funcionar el anuncio. Se editan en
`contenido/reel-agente.json`, junto con los tiempos de "escribiendo" de cada
respuesta.

---

## Reels por escenas

`lib/reel-secuencia.js` es el hermano genérico de `reel-agente.js`: mismo marco
(encabezado arriba, firma y sitio abajo, desde el primer cuadro hasta el último) y
mismas escenas que se cruzan en el medio, pero acá **las escenas salen del JSON** en
vez de estar escritas a mano.

```bash
node reel-secuencia.js reel-presupuestos.json
```

Cada escena declara cuánto dura y el módulo las encadena con un cruce de 0,35 s. **La
duración total no se declara en ningún lado — es la suma.** Cambiar el ritmo es mover
un número del JSON.

| `tipo` de escena | Qué muestra | Campos |
|---|---|---|
| `frase` | Una frase grande | `etiqueta`, `titulo`, `sub` |
| `cifra` | Un número que sube desde cero | `etiqueta`, `monto`, `nota` |
| `cierre` | Tabla de precios y botón | `etiqueta`, `titulo`, `filas`, `nota`, `cta` |

### Los montos del reel de presupuestos son ilustrativos

Salen del rango que publican las agencias argentinas, no de tres presupuestos pedidos.
Por eso la primera escena dice **"busqué"** y no "pedí". Si alguna vez pedís
presupuestos reales, cambiá esa línea y los montos por los que te pasaron: el reel
funciona igual y pasa a ser una anécdota propia, que rinde más.

### Los precios tienen que coincidir con la web

`contenido/reel-agente.json` y `contenido/reel-presupuestos.json` repiten los precios
de [sarubi-ia.com/planes](https://sarubi-ia.com/planes). Si cambian allá, cambian acá y
se vuelven a generar los videos: un anuncio que promete un precio que la web no tiene
se discute en la primera factura.

---

## El avatar de Instagram

```bash
node logo.js
```

Saca las cuatro versiones en `salida/logo/`, a **1080 × 1080**, más una hoja que
las compara a los tamaños en que Instagram las muestra de verdad.

| Versión | Cuándo |
|---|---|
| `sarubi-ai` | La S, el nombre abajo y la etiqueta AI |
| `ese-punto` | La continuación del logo que ya está en el sitio |
| `ese-sola` | La misma sin el punto: la que mejor aguanta los 32 px del feed |
| `ese-verde` | Invertida. Sobre el fondo blanco de Instagram salta más |
| `palabra` | El wordmark entero, para comparar |

### Por qué no alcanza con el logo del sitio

`imagenes/logo.png` mide 260 × 260 y es un cuadrado redondeado con el punto casi
en la esquina. Instagram **recorta la foto a un círculo**, así que esa esquina —
con el punto adentro — es justo lo que se pierde. Acá el punto va sobre la
diagonal, a 382 px del centro: más adentro toca el brazo de la S, más afuera lo
come el recorte.

La otra razón es la resolución: Instagram pide 320 px de mínimo, pero guarda una
copia grande y la usa cuando alguien abre la foto de perfil.

### La decisión se toma mirando los 32 px

`comparacion.png` muestra cada versión a 320, 110, 56 y 32 px, sobre fondo claro
y sobre fondo oscuro. Los 32 px son el tamaño al que aparece al lado de cada
posteo, que es donde la ve la mayoría de la gente. Una versión que se entiende a
320 y se hace un borrón a 32 no sirve, por linda que sea.

### Cómo se escribe el nombre adentro del avatar

Sale de `marca.json`, de `avatar_nombre` y `avatar_sigla`, y no del corte
`nombre_corte`. Son dos cosas distintas: el corte parte **SARUB|IA**, que es la
sigla en castellano, y adentro del avatar va **sarubi AI**, igual que el usuario
de Instagram y el dominio. Si se tomara el corte, saldría "sarub AI".

### La S no es una tipografía

Es el dibujo del logo que ya existe, trazado del PNG original y guardado como
`lib/ese.svg`. Se genera con:

```bash
python3 herramientas/vectorizar-ese.py
```

No es un capricho: la S del logo tiene los **remates cortados en diagonal** y es
más angosta (0,79 de ancho por alto) que las candidatas obvias — Inter, Lato,
Source Sans, Open Sans y compañía cortan los remates casi en horizontal.
Reemplazarla por la más parecida sería cambiar el logo, no reproducirlo.

El trazado usa marching squares con interpolación lineal sobre el antialias del
PNG: el borde no cae en el píxel más cercano sino donde el antialias dice que
está, con precisión de fracción de píxel. Después limpia el temblor del borde
**sin tocar las esquinas**, que son justamente lo que define esta S, y pasa las
partes curvas a Bézier dejando los cuatro remates como rectas.

El resultado se superpone al original casi sin corrimiento, y ahora la letra se
dibuja nítida a cualquier tamaño en vez de ampliarse 3,5 veces desde un bitmap
de 98 px.

### El verde

El PNG viejo usa `#1DC89D`, que no está en `marca.json` — quedó de antes de que
la paleta estuviera definida. Estas versiones salen de `marca.json`, así que el
verde es `#2FE0AE`, el mismo de todas las placas y del sitio.
