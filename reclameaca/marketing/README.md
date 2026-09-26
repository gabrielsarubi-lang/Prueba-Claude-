# Instagram de Reclame Acá — tanda 2

Contenido nuevo hecho **con el mismo sistema** que el que ya está publicado
(el de `marketing/` en el proyecto de Reclame Acá): los archivos de `video/lib/`,
`video/fonts/` y los scripts `render.js`, `render-img.js` y `previsualizar.js`
son copia exacta de esa carpeta, sin cambios. Lo único nuevo es el contenido:

| Archivo | Qué tiene |
|---|---|
| `video/piezas.js` | 3 reels y 3 historias en video |
| `video/piezas-estaticas.js` | 3 carruseles y 3 historias en imagen |
| `TANDA-02.md` | Calendario de los días 10 a 15, con el texto de cada posteo |
| `IDENTIDAD-VISUAL.md` | La guía de marca, copiada del proyecto |

La numeración sigue a la tanda 1 (reel-07, carrusel-04, historia-09…), así que se
puede sumar a `marketing/video/salida/` del proyecto sin pisar nada.

## Temas

Las tres guías del sitio que todavía no tenían contenido en Instagram:
**dar de baja un servicio**, **corte de luz** (Edenor y Edesur) y **aumento de la
prepaga**. Todo lo que dicen las piezas sale de esas guías, actualizadas el 11 de
septiembre de 2026.

## Uso

```bash
cd video
npm install
node render-img.js          # carruseles e historias en imagen → salida/
node render.js              # reels e historias en video → salida/
node previsualizar.js reel-08-corte-de-luz 4.4 10.8   # cuadros sueltos, para revisar
```

## Para pasarlo al proyecto

Copiá las piezas de `video/piezas.js` y `video/piezas-estaticas.js` al final de los
archivos del mismo nombre del proyecto (y sumalas al `module.exports`), y los
archivos de `video/salida/` a su `salida/`. Los textos de `TANDA-02.md` van al kit
y a `calendario.json` como días 10 a 15.
