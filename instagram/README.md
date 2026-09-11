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
│   └── semana-01.json      Los TEXTOS de una semana. Es lo único que se toca.
├── lib/
│   └── plantilla.js        El DISEÑO. Se toca solo si cambia la estética.
├── generar.js              El programa que junta las dos cosas y saca los PNG
└── salida/                 Las imágenes generadas (no se guardan en git)
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
| `"pie_marca": "sitio"` / `"handle"` | Qué se muestra abajo a la derecha |

### Los seis tipos de placa

| `tipo` | Qué muestra | Campos que usa |
|---|---|---|
| `declaracion` | Una frase grande | `titulo`, `sub`, `cta` |
| `oferta` | Precio y beneficios | `titulo`, `precio`, `precio_nota`, `checks` |
| `pasos` | Lista numerada con líneas | `titulo`, `pasos` |
| `mito` | Dos paneles enfrentados | `mito`, `realidad` |
| `lista` | Grilla o lista numerada | `titulo`, `items`, `columnas` |
| `pregunta` | Pregunta con barra verde | `titulo`, `sub`, `hint` |

Cada post define su versión `post` y su versión `historia` por separado, porque el
corte de renglones que funciona en un cuadrado no funciona en un vertical.

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
