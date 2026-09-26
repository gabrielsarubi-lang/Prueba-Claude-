# Placas de Instagram — Reclame Acá

> **Ojo:** esta primera versión quedó reemplazada. El contenido que sigue la línea de
> lo que ya se publica está en [`marketing/`](marketing/), hecho con el mismo sistema
> del proyecto de Reclame Acá. Además, la placa del jueves de `semana-01` cita la
> Resolución 316/2018, que ya no está vigente (la reemplazó la Disposición 954/2025):
> no la publiques.

Generador de placas para Instagram con la identidad visual de
[reclameaca.com.ar](https://www.reclameaca.com.ar): el mismo azul, el mismo naranja,
el megáfono del logo y la tipografía Inter del sitio.

Es el mismo concepto que el generador de SARUBIA (`../instagram/`): **los textos y el
diseño viven separados.** Escribís los textos en un JSON y salen las imágenes listas
para publicar.

| Formato | Medida | Para qué |
|---|---|---|
| Post | 1080 × 1080 | El feed |
| Historia | 1080 × 1920 | Las stories |
| Carrusel | 1080 × 1080, numeradas | Guías paso a paso |

---

## Cómo está organizado

```
reclameaca/
├── marca.json                 La identidad: colores, tipografía, sitio, usuario
├── contenido/
│   ├── semana-01.json         Los TEXTOS de una semana (7 posts + 7 historias)
│   └── carruseles-01.json     Los textos de los carruseles
├── lib/
│   ├── plantilla.js           El DISEÑO. Se toca solo si cambia la estética.
│   ├── logo.svg               El megáfono, igual al del sitio
│   └── fuentes/               Inter, guardada acá para no depender de internet
├── generar.js                 Saca todos los PNG
└── salida/                    Las imágenes generadas y los textos para el pie
```

Está separado de `instagram/` a propósito: cada marca tiene su propio diseño, y
tocar uno no puede romper el otro.

---

## Correrlo

```bash
npm install                            # una sola vez
node generar.js                        # semana-01: posts, historias y textos.md
node generar.js carruseles-01.json     # los carruseles
node generar.js semana-01.json post    # solo los cuadrados (o: historia, carrusel)
```

Todo queda en `salida/<archivo>/`. Además de las imágenes sale **`textos.md`**, con el
pie y los hashtags de cada post listos para copiar y pegar.

Los carruseles quedan en una carpeta cada uno, con las láminas `01.png`, `02.png`…
**Instagram las sube en orden alfabético**, así que ese número es el orden del carrusel.

## Armar una semana nueva

1. Copiá `contenido/semana-01.json` a `contenido/semana-02.json`.
2. Cambiá los textos.
3. `node generar.js semana-02.json`

### Reglas para escribir los textos

| En el JSON | Qué hace |
|---|---|
| `\n` | Corta el renglón donde vos querés |
| `*palabra*` | Pinta esa palabra de naranja |
| `"fondo": "oscuro"` / `"claro"` | Alterná entre posts para que la grilla quede en damero |
| `"escala": "xl"` / `"l"` / `"m"` / `"s"` | Tamaño del título: `xl` corto, `s` placa con mucho contenido |
| `"fuente": "Ley 24.240, art. 34"` | Pone la norma a la vista, en una etiqueta con § |
| `"cta": "Publicá tu reclamo"` | Botón naranja |
| `"hueco": true` | Solo historias: libera la franja de abajo para encuesta, preguntas o enlace |

Cada post define su versión `post` y su versión `historia` por separado, porque el
corte de renglones que funciona en un cuadrado no funciona en un vertical.

### Los tipos de placa

| `tipo` | Qué muestra | Campos |
|---|---|---|
| `declaracion` | Una frase grande | `titulo`, `sub`, `hint`, `cta` |
| `cifra` | Un plazo enorme: "10 días", "6 meses" | `etiqueta`, `monto`, `nota`, `fuente` |
| `mito` | "Lo que te dicen" tachado / "Lo que dice la ley" | `mito`, `realidad`, `fuente` |
| `veredicto` | ¿Pueden o no pueden? — cartel verde o rojo | `veredicto`, `titulo`, `sub`, `fuente` |
| `reclamo` | La tarjeta de reclamo del sitio, con su estado | `titulo`, `empresa`, `estado`, `reclamo`, `extracto`, `categoria` |
| `pasos` | Lista numerada con líneas | `titulo`, `pasos` |
| `lista` | Grilla o lista numerada | `titulo`, `items`, `columnas` |
| `tabla` | Concepto a la izquierda, plazo a la derecha | `titulo`, `filas`, `nota` |
| `pregunta` | Pregunta con barra naranja | `titulo`, `sub`, `hint` |
| `punto` | Punto numerado de una serie | `numero`, `titulo`, `sub` |

Los estados de `reclamo` son los de la plataforma: `pendiente`, `en_proceso`,
`a_confirmar`, `resuelto`.

---

## Reglas de contenido

- **Todo derecho o plazo lleva su `fuente`.** Igual que las guías del sitio: una placa
  que dice "tenés 10 días" sin decir de dónde sale es una opinión.
- **Revisá los plazos contra las guías antes de publicar.** Las placas de ejemplo
  siguen la Ley 24.240, la Ley 25.065 y la Resolución 316/2018. Si una norma cambia,
  la placa se corrige antes de salir.
- **Ningún reclamo inventado contra una empresa con nombre.** La tarjeta `reclamo`
  lleva el cartel **"Ejemplo"** salvo que tenga `"real": true`, y eso solo se usa con
  un reclamo publicado de verdad en la plataforma y con permiso de quien lo escribió.
  En los ejemplos la empresa es genérica ("Tu proveedor de internet").
- **Nada de cifras inventadas.** Ni cantidad de reclamos ni porcentaje de resueltos
  hasta que sean números reales del sitio.
- **Las placas que resumen la ley dicen que son informativas**, como el aviso de las
  guías: no reemplazan a un abogado ni a Defensa del Consumidor.

## Cómo publicar

- Los fondos alternan oscuro y claro: si salteás un post, salteá dos para no romper
  el damero.
- Los hashtags van en el primer comentario, no en el pie.
- La historia va el mismo día que su post, unas horas después.
- La historia del sábado tiene hueco para una **caja de preguntas**: las respuestas
  son ideas para las próximas guías.

## Cambiar la identidad

Todo sale de `marca.json`. Cuando exista el usuario de Instagram, cargalo en
`handle` y los posts con `"pie_marca": "handle"` lo van a mostrar abajo a la derecha;
mientras esté vacío, el pie lleva el sitio.

El naranja de la marca (`#FF6B35`) sobre blanco no alcanza contraste en letra chica,
así que los textos chicos sobre fondo claro usan `acento_texto`, el mismo tono más
oscuro. Los títulos y el botón usan el naranja de siempre.
