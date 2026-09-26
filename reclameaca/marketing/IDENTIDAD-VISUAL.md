# Identidad visual de Reclame Acá

Relevada desde el sitio en producción (`reclameaca.com.ar`), archivos
`assets/css/style.css`, `assets/img/logo.svg` y `assets/img/favicon.svg`.
Esta es la referencia para que todo el contenido de redes se vea como el producto.

## De qué se trata la marca

Reclame Acá es una plataforma independiente donde los consumidores argentinos
publican reclamos contra empresas y las empresas responden **en público**.

- **Promesa:** "Tu reclamo, visible hasta que la empresa responda."
- **Bajada de marca:** "Tu voz como consumidor."
- **Propuesta de valor:** "Gratis, público y sin vueltas."
- **Insight central:** un reclamo por privado se pierde; uno público queda como
  antecedente y le sirve al próximo que está por comprar.
- **Dos audiencias:** el consumidor que reclama y la empresa que quiere cuidar
  su reputación (CTA "Soy una empresa" / "Crear cuenta de empresa").
- **Activo diferencial:** las guías legales (`/guias/`), bien investigadas y
  citando artículos concretos. Es el mejor material para contenido social.

### Arquitectura del producto
- Categorías: Telecomunicaciones · Bancos y Finanzas · E-commerce · Indumentaria ·
  Servicios Públicos · Turismo y Pasajes · Electrodomésticos · Seguros.
- Estados de un reclamo: Pendiente → En proceso → Resuelto (a confirmar) →
  Resuelto / Rechazado. **El consumidor es quien confirma**, no la empresa.
- Reputación de empresa: Excelente · Buena · Regular · Mala · Sin calificar,
  con un score de "% resueltos".

## Paleta

| Token | Hex | Uso |
|---|---|---|
| `--navy-900` | `#0f2338` | Fondo principal, header, logo, fondos de video |
| `--navy-800` | `#16324f` | Degradés y banda de CTA |
| `--navy-700` | `#1f4166` | Punto claro del degradé del hero |
| `--orange-500` | `#ff6b35` | **Color de acción.** Botones, palabra destacada, acentos |
| `--orange-600` | `#e85a2a` | Hover / naranja sobre fondo claro |
| `--orange-50` | `#fff1eb` | Fondo suave de acento |
| `--bg` | `#f5f7fa` | Fondo de página claro |
| `--surface` | `#ffffff` | Tarjetas |
| `--border` | `#e2e8f0` | Bordes |
| `--text-primary` | `#1a2433` | Texto principal |
| `--text-secondary` | `#5b6b7c` | Bajadas |
| `--text-muted` | `#8a97a6` | Metadatos |
| `--success` | `#1e9e62` | Estado resuelto |
| `--warning` | `#b7791f` | Estado a confirmar |
| `--danger` | `#e0433b` | Estado rechazado |
| `--pending` | `#4a5c72` | Estado pendiente |

**Regla de oro:** el naranja es el color de la acción, no un color de relleno.
Una sola cosa naranja por pantalla: el botón, o la palabra que importa, no las dos.

## Tipografía

**Inter** (Google Fonts), pesos 400 / 500 / 600 / 700 / 800.

| Rol | Peso | Tracking | Interlínea |
|---|---|---|---|
| Titular grande | 800 | `-0.02em` a `-0.035em` | 1.02 – 1.12 |
| Subtítulo de sección | 700/800 | `-0.01em` | 1.2 |
| Cuerpo | 400/500 | 0 | 1.38 – 1.5 |
| Badge / etiqueta | 700/800 | `+0.02em` a `+0.10em`, MAYÚSCULAS | 1 |

Los titulares van con tracking **negativo** y los badges con tracking **positivo**:
ese contraste es buena parte de la personalidad de la marca.

## Logo

Un megáfono blanco dentro de un círculo `#0f2338`. Hay dos versiones y cada una
tiene su lugar:

- `logo.svg` — cono + tres ondas de sonido. Para 36 px o más.
- `favicon.svg` — cono más grande y solo dos ondas, trazo más grueso.
  Para tamaños chicos, donde el trazo fino se empasta.

Sobre fondo navy el círculo desaparece y queda solo el megáfono blanco: así se
ve en el header del sitio y está bien que sea así.

## Geometría y profundidad

- Radios: `6px` (botones, inputs), `10px` (tarjetas), `16px` (bandas grandes),
  `999px` (badges).
- Sombras siempre teñidas de navy, nunca negro puro:
  `0 4px 16px rgba(15,35,56,.08)` y `0 12px 32px rgba(15,35,56,.12)`.
- Fondo estrella del hero: `radial-gradient(circle at 15% 20%, #1f4166, #0f2338 60%)`
  con un halo naranja difuso arriba a la derecha. Es la textura de marca y está
  replicada en los videos.

## Tono de voz

Rioplatense, de vos, corto y sin adornos. Frases que ya usa el sitio y conviene
sostener: *"Gratis, público y sin vueltas"*, *"Contá qué pasó"*, *"En pocas palabras"*,
*"Dejalo público"*.

**Sí:** afirmar con precisión y citar el artículo que lo respalda.
**No:** indignación genérica, insultos a empresas, promesas de resultado
("te devolvemos la plata"), ni consejo legal personalizado.

### Límite editorial importante
El sitio nombra empresas porque publica reclamos de usuarios, que son de ellos.
El contenido **propio de la marca** nombra empresas solo en contexto neutro o
educativo ("cómo reclamar un corte a Edenor o Edesur"), nunca acusándolas desde
la cuenta oficial. La acusación la hace el usuario en su reclamo; la marca aporta
la plataforma y la información.
