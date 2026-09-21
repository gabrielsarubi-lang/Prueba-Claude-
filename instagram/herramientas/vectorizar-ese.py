#!/usr/bin/env python3
"""
Vectoriza la S del logo original.

El logo de SARUBIA es un PNG de 260 x 265: la S mide 98 x 124 píxeles. Para el
avatar hace falta a 436, y ampliar un bitmap 3,5 veces deja los bordes blandos
— en un logo eso se nota.

Tampoco sirve reemplazarla por una tipografía: la S del logo tiene los remates
cortados en diagonal y es más angosta que las candidatas obvias (Inter, Lato,
Source Sans y compañía). Cambiarla por la más parecida sería cambiar el logo.

Así que se traza el contorno del bitmap y se guarda como SVG. Marching squares
con interpolación lineal sobre el antialias del PNG: el borde no cae en el
píxel más cercano sino donde el antialias dice que está, con precisión de
fracción de píxel. Después se limpia el ruido sin tocar las esquinas, que son
justamente lo que define esta S.

    python3 herramientas/vectorizar-ese.py
"""

import math
import os
import struct
import zlib

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ORIGEN = '/home/user/sarubisolutions.github.io/imagenes/logo.png'
DESTINO = os.path.join(RAIZ, 'lib', 'ese.svg')

# La caja donde vive la letra. Deja afuera el punto verde, que es otra pieza.
CAJA = (70, 90, 190, 235)   # x0, y0, x1, y1

NIVEL = 0.5          # el borde: mitad tinta, mitad letra
EPSILON = 0.28       # simplificación, en píxeles del original
ANGULO_ESQUINA = 38  # grados: más que esto es una esquina y no se suaviza


# ----------------------------------------------------------------- el PNG

def leer_png(ruta):
    d = open(ruta, 'rb').read()
    pos, idat, ancho, alto, tipo = 8, b'', 0, 0, 0
    while pos < len(d):
        largo = struct.unpack('>I', d[pos:pos + 4])[0]
        etiqueta = d[pos + 4:pos + 8]
        datos = d[pos + 8:pos + 8 + largo]
        if etiqueta == b'IHDR':
            ancho, alto, _, tipo = struct.unpack('>IIBB', datos[:10])
        elif etiqueta == b'IDAT':
            idat += datos
        pos += 12 + largo

    crudo = zlib.decompress(idat)
    canales = 4 if tipo == 6 else 3
    paso = ancho * canales
    filas, previa, i = [], bytearray(paso), 0
    for _ in range(alto):
        filtro = crudo[i]; i += 1
        linea = bytearray(crudo[i:i + paso]); i += paso
        for x in range(paso):
            a = linea[x - canales] if x >= canales else 0
            b = previa[x]
            c = previa[x - canales] if x >= canales else 0
            if filtro == 1:
                linea[x] = (linea[x] + a) & 255
            elif filtro == 2:
                linea[x] = (linea[x] + b) & 255
            elif filtro == 3:
                linea[x] = (linea[x] + (a + b) // 2) & 255
            elif filtro == 4:
                p = a + b - c
                pa, pb, pc = abs(p - a), abs(p - b), abs(p - c)
                pr = a if (pa <= pb and pa <= pc) else (b if pb <= pc else c)
                linea[x] = (linea[x] + pr) & 255
        filas.append(bytes(linea)); previa = linea
    return ancho, alto, canales, filas


def campo(ancho, alto, canales, filas):
    """
    Cuánto tiene de letra cada píxel, de 0 a 1.

    Se mide por el canal más bajo de los tres, no por el brillo: el punto verde
    es brillante y por brillo entraría, pero su canal más bajo es 29 — tan bajo
    como el fondo. Así la letra queda sola sin tener que recortar a mano.
    """
    x0, y0, x1, y1 = CAJA
    an, al = x1 - x0, y1 - y0
    FONDO, LETRA = 8.0, 240.0
    campo = []
    for y in range(al):
        fila = []
        for x in range(an):
            o = (x + x0) * canales
            p = filas[y + y0]
            v = (min(p[o], p[o + 1], p[o + 2]) - FONDO) / (LETRA - FONDO)
            fila.append(min(1.0, max(0.0, v)))
        campo.append(fila)
    return an, al, campo


# --------------------------------------------------------- marching squares

def contorno(an, al, c):
    """El borde donde el campo vale NIVEL, con precisión de fracción de píxel."""

    def cruce(va, vb):
        return 0.5 if va == vb else (NIVEL - va) / (vb - va)

    segmentos = []
    for y in range(al - 1):
        for x in range(an - 1):
            v = (c[y][x], c[y][x + 1], c[y + 1][x + 1], c[y + 1][x])
            caso = sum((1 << i) for i, t in enumerate(v) if t >= NIVEL)
            if caso in (0, 15):
                continue
            arriba  = (x + cruce(v[0], v[1]), y)
            derecha = (x + 1, y + cruce(v[1], v[2]))
            abajo   = (x + cruce(v[3], v[2]), y + 1)
            izq     = (x, y + cruce(v[0], v[3]))
            tabla = {
                1: [(izq, arriba)],      2: [(arriba, derecha)],
                3: [(izq, derecha)],     4: [(derecha, abajo)],
                5: [(izq, abajo), (derecha, arriba)],
                6: [(arriba, abajo)],    7: [(izq, abajo)],
                8: [(abajo, izq)],       9: [(abajo, arriba)],
                10: [(arriba, izq), (abajo, derecha)],
                11: [(abajo, derecha)],  12: [(derecha, izq)],
                13: [(derecha, arriba)], 14: [(arriba, izq)]
            }
            segmentos.extend(tabla[caso])

    # Encadenar los segmentos sueltos en un recorrido cerrado.
    clave = lambda p: (round(p[0], 6), round(p[1], 6))
    desde = {}
    for a, b in segmentos:
        desde.setdefault(clave(a), []).append(b)

    caminos = []
    usados = set()
    for a, b in segmentos:
        k = clave(a)
        if k in usados:
            continue
        camino = [a]
        actual = b
        while True:
            camino.append(actual)
            usados.add(clave(actual))
            siguientes = desde.get(clave(actual))
            if not siguientes:
                break
            proximo = siguientes.pop()
            if clave(proximo) == clave(camino[0]):
                break
            actual = proximo
        if len(camino) > 20:
            caminos.append(camino)
    caminos.sort(key=len, reverse=True)
    return caminos


# ------------------------------------------------------------- limpieza

def angulo(p, q, r):
    ax, ay = q[0] - p[0], q[1] - p[1]
    bx, by = r[0] - q[0], r[1] - q[1]
    na, nb = math.hypot(ax, ay), math.hypot(bx, by)
    if na == 0 or nb == 0:
        return 0.0
    cos = max(-1.0, min(1.0, (ax * bx + ay * by) / (na * nb)))
    return math.degrees(math.acos(cos))


def suavizar(p):
    """
    Promedia cada punto con sus vecinos, salvo en las esquinas.

    El antialias del PNG deja el borde temblando una décima de píxel. Eso a
    tamaño original no se ve y ampliado sí. Pero un promedio ciego redondearía
    los remates en diagonal, que es lo que distingue a esta S — por eso los
    puntos que doblan fuerte quedan como están.
    """
    n = len(p)
    salida = []
    for i in range(n):
        a, b, c = p[(i - 1) % n], p[i], p[(i + 1) % n]
        if angulo(a, b, c) > ANGULO_ESQUINA:
            salida.append(b)
        else:
            salida.append(((a[0] + 2 * b[0] + c[0]) / 4.0,
                           (a[1] + 2 * b[1] + c[1]) / 4.0))
    return salida


def simplificar(puntos, eps):
    """Douglas-Peucker: saca los puntos que no cambian la forma."""
    if len(puntos) < 3:
        return puntos

    def recorrer(ini, fin):
        ax, ay = puntos[ini]
        bx, by = puntos[fin]
        dx, dy = bx - ax, by - ay
        largo = math.hypot(dx, dy)
        peor, donde = 0.0, ini
        for i in range(ini + 1, fin):
            px, py = puntos[i]
            d = (abs(dy * px - dx * py + bx * ay - by * ax) / largo) if largo else math.hypot(px - ax, py - ay)
            if d > peor:
                peor, donde = d, i
        if peor > eps:
            return recorrer(ini, donde)[:-1] + recorrer(donde, fin)
        return [puntos[ini], puntos[fin]]

    medio = len(puntos) // 2
    return recorrer(0, medio)[:-1] + recorrer(medio, len(puntos) - 1)


def a_path(p):
    """
    Pasa la poligonal a curvas, menos en las esquinas.

    Catmull-Rom convertido a Bézier cúbica donde el contorno gira suave, y
    línea recta donde gira fuerte. Así las panzas de la S salen curvas de
    verdad y los cuatro remates rectos siguen siendo rectos.
    """
    n = len(p)
    d = ['M %.3f %.3f' % p[0]]
    for i in range(n):
        p0, p1, p2, p3 = p[(i - 1) % n], p[i], p[(i + 1) % n], p[(i + 2) % n]
        if angulo(p0, p1, p2) > ANGULO_ESQUINA or angulo(p1, p2, p3) > ANGULO_ESQUINA:
            d.append('L %.3f %.3f' % p2)
        else:
            c1 = (p1[0] + (p2[0] - p0[0]) / 6.0, p1[1] + (p2[1] - p0[1]) / 6.0)
            c2 = (p2[0] - (p3[0] - p1[0]) / 6.0, p2[1] - (p3[1] - p1[1]) / 6.0)
            d.append('C %.3f %.3f %.3f %.3f %.3f %.3f' % (c1 + c2 + p2))
    d.append('Z')
    return ' '.join(d)


def main():
    ancho, alto, canales, filas = leer_png(ORIGEN)
    an, al, c = campo(ancho, alto, canales, filas)
    caminos = contorno(an, al, c)
    if not caminos:
        raise SystemExit('No encontré el contorno de la letra.')

    puntos = simplificar(suavizar(suavizar(caminos[0])), EPSILON)

    xs = [q[0] for q in puntos]
    ys = [q[1] for q in puntos]
    x0, y0 = min(xs), min(ys)
    w, h = max(xs) - x0, max(ys) - y0
    puntos = [(q[0] - x0, q[1] - y0) for q in puntos]

    svg = (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %.3f %.3f">\n'
        '  <!-- La S del logo de SARUBIA, trazada del PNG original.\n'
        '       Generada por herramientas/vectorizar-ese.py — no se edita a mano. -->\n'
        '  <path fill="currentColor" d="%s"/>\n'
        '</svg>\n'
    ) % (w, h, a_path(puntos))

    open(DESTINO, 'w', encoding='utf8').write(svg)
    print('  contorno: %d puntos -> %d' % (len(caminos[0]), len(puntos)))
    print('  caja: %.2f x %.2f (proporción %.3f)' % (w, h, w / h))
    print('  ✓ %s' % os.path.relpath(DESTINO, RAIZ))


if __name__ == '__main__':
    main()
