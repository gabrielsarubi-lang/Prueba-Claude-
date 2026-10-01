# Datos de terceros

## Barrios de la Ciudad de Buenos Aires

- **Qué es:** el polígono de cada uno de los 48 barrios de CABA, en WGS84.
- **De dónde sale:** portal de datos abiertos del Gobierno de la Ciudad de
  Buenos Aires, conjunto *Barrios*.
  `https://cdn.buenosaires.gob.ar/datosabiertos/datasets/ministerio-de-educacion/barrios/barrios.geojson`
- **Licencia:** datos abiertos del GCBA, uso libre incluido el comercial, con
  mención de la fuente. La mención está acá y adentro de `lib/caba.json`.
- **Qué le hicimos:** `herramientas/mapa-caba.py` lo proyecta a coordenadas de
  pantalla, lo simplifica y saca el contorno de la ciudad por unión topológica.
  El resultado es `lib/caba.json`, que **no se edita a mano**: si hace falta
  cambiarlo, se cambia el script y se vuelve a correr.

      python3 herramientas/mapa-caba.py barrios.geojson

- **Por qué geometría real y no una silueta dibujada:** cualquiera que viva en
  Buenos Aires reconoce la forma de la ciudad. Una silueta aproximada se nota, y
  la pieza deja de ser profesional en el segundo en que alguien lo nota.
