# Reel 3D — "Cómo funciona Reclame Acá"

Motion graphics en 3D, vertical 1080×1920, 30 fps, unos 30 segundos. Explica la
plataforma de punta a punta con los colores, la tipografía y el logo del sitio.
Sale en `salida/reel-3d-como-funciona.mp4`.

## Guion

| Segundos | En pantalla | En 3D |
|---|---|---|
| 0 – 4,2 | *Lo que pasa siempre* — "Llamaste. Esperaste. **Nadie** te llamó." | Un teléfono en espera, con el contador que sigue corriendo |
| 4,2 – 8,6 | *Reclame Acá* — "Tu reclamo, visible hasta que la empresa responda." | El megáfono del logo, en volumen, entra girando y suelta ondas |
| 8,6 – 13,6 | *Paso 1* — "Contá qué pasó." | La tarjeta de reclamo del sitio llega volando. Estado: **Pendiente** |
| 13,6 – 18,8 | *Paso 2* — "La empresa recibe el aviso y responde en público." | Ondas de aviso desde la tarjeta, aparece la respuesta pública. **En proceso → A confirmar** |
| 18,8 – 23,4 | *Paso 3* — "¿Dice que lo resolvió? Lo confirmás vos." | El estado pasa a **Resuelto**, salta el tilde verde con confeti |
| 23,4 – 27,6 | *Queda público* — "Y le sirve al próximo que está por comprar." | La cámara se aleja y la tarjeta se suma a una pared de reclamos |
| 27,6 – 30,4 | "Publicá tu reclamo." · reclameaca.com.ar | Vuelve el megáfono, con las ondas encendidas |

Los estados y sus colores son los de la plataforma, y el cierre usa las frases de
la marca ("Gratis, público y sin vueltas").

## Los chiches

- **Megáfono 3D construido desde el logo**: el mismo cono y las mismas tres ondas
  del `logo.svg` del sitio, extruidos con bisel y clearcoat.
- **Iluminación de estudio**: mapa de entorno para los reflejos, luz principal con
  sombras suaves y una contraluz naranja.
- **Bloom** solo en lo que brilla de verdad: el aro naranja, las ondas encendidas
  y el tilde. Los blancos de las tarjetas quedan por debajo del umbral, así el texto
  se lee.
- **Partículas** flotando en todo el video, **confeti** físico (con gravedad y
  rozamiento) y **ondas de aviso** que se expanden.
- **Cámara viva**: respira todo el tiempo, se acerca y se aleja según la escena,
  con niebla en profundidad para la pared de reclamos.
- **Acabado de cine**: grano de película, viñeta y una aberración cromática mínima
  en los bordes.
- **Texto tipográfico real**, no dibujado en 3D: Inter, las mismas cejas y la misma
  entrada línea por línea que los reels de `../video`.

## Reglas de marca que respeta

- **Ningún reclamo real ni empresa con nombre propio.** Las tarjetas dicen "Tu
  proveedor de internet", "Tu banco", "Aerolínea"… y todas llevan el cartel
  **EJEMPLO** (ver `../IDENTIDAD-VISUAL.md`, "Límite editorial").
- **Sin cifras inventadas**: no dice cuántos reclamos hay ni qué porcentaje se resuelve.
- **Zona segura de Instagram**: el texto arranca a los 300 px y nada importante baja
  de los 1550 px, que es donde la app pone sus botones.
- **Sin audio**, igual que el resto de los reels: la música se elige en Instagram al
  publicar.

## Cómo se genera

```bash
npm install                                  # three, playwright-core, ffmpeg-static
node render.js                               # el video completo → salida/
node render.js --tanda 300                   # solo 300 cuadros nuevos; se retoma con el mismo comando
node render.js --previa 2.4 11 21 25.6       # cuadros sueltos → salida/previa/
```

`escena.js` arma la escena con three.js, y `window.seek(t)` la deja exactamente en
el segundo `t`, sin `requestAnimationFrame`. Así cada cuadro sale siempre igual,
como en el motor de `../video`.

`render.js` levanta un servidor local mínimo, porque three.js son módulos y el
navegador no los carga desde `file://`. Después captura los 912 cuadros y se los
pasa a ffmpeg.

En una máquina sin placa de video renderiza por software (SwiftShader), a unos
4 segundos por cuadro, o sea alrededor de una hora. Con GPU es mucho más rápido.

Cada cuadro se guarda en `salida/.cuadros/` antes de armar el video. Si el render
se corta, al volver a correrlo saltea los cuadros que ya existen y sigue desde ahí.
Cuando están los 912, arma el MP4 solo.

## Cambiar algo

- **Textos**: están en `index.html`. Cada línea tiene `data-at`, el segundo en que entra.
- **Tiempos de la animación 3D**: están en la función `seek()` de `escena.js`,
  marcados por escena.
- **Contenido de las tarjetas**: `RECLAMO` y `VARIANTES` en `escena.js`.
