#!/usr/bin/env python3
# coding: utf-8
"""
Convierte el GeoJSON oficial de barrios de la Ciudad de Buenos Aires en algo
que se pueda animar: trazados SVG.

Fuente: Gobierno de la Ciudad de Buenos Aires, datos abiertos, capa "barrios".
Es geometria real, no una silueta dibujada a ojo. Importa: una silueta
aproximada de CABA se nota enseguida para cualquiera que viva aca, y la pieza
deja de ser profesional en el segundo en que alguien dice "esa no es la forma".

Saca tres cosas:
  - el contorno de la ciudad como UN trazado solo, para que se dibuje a si mismo
  - los 48 barrios por separado, para teñirlos e iluminarlos de a uno
  - el centro de cada barrio, para clavar los pines

El contorno sale por union topologica: los barrios teselan la ciudad sin huecos,
asi que cada borde interno aparece dos veces (una por cada barrio que lo
comparte) y cada borde externo una sola vez. Quedandose con los que aparecen una
vez y encadenandolos sale el perimetro. No hace falta una libreria de geometria.
"""

import json, math, sys, os
from collections import defaultdict

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(AQUI)

ANCHO = 1000.0          # ancho del viewBox de salida
EPSILON = 0.9           # simplificacion, en unidades del viewBox
REJILLA = 7             # decimales a los que se redondea para parear bordes


def proyectar(fs):
    """Equirectangular con el ancho corregido por la latitud.

    A la escala de una ciudad la diferencia contra una Mercator de verdad es de
    fracciones de pixel, y asi el norte queda arriba y las proporciones reales.
    """
    xs, ys = [], []
    for f in fs:
        for anillo in anillos(f['geometry']):
            for lon, lat in anillo:
                xs.append(lon); ys.append(lat)
    lon0, lon1 = min(xs), max(xs)
    lat0, lat1 = min(ys), max(ys)
    k = math.cos(math.radians((lat0 + lat1) / 2.0))
    esc = ANCHO / ((lon1 - lon0) * k)
    alto = (lat1 - lat0) * esc

    def p(lon, lat):
        return ((lon - lon0) * k * esc, (lat1 - lat) * esc)   # y invertida: norte arriba
    return p, alto


def anillos(g):
    if g['type'] == 'Polygon':
        return g['coordinates']
    if g['type'] == 'MultiPolygon':
        return [a for poly in g['coordinates'] for a in poly]
    raise ValueError(g['type'])


def douglas_peucker(pts, eps):
    if len(pts) < 3:
        return pts[:]
    ax, ay = pts[0]; bx, by = pts[-1]
    dx, dy = bx - ax, by - ay
    largo = math.hypot(dx, dy)
    peor, idx = -1.0, 0
    for i in range(1, len(pts) - 1):
        px, py = pts[i]
        if largo == 0:
            d = math.hypot(px - ax, py - ay)
        else:
            d = abs(dy * px - dx * py + bx * ay - by * ax) / largo
        if d > peor:
            peor, idx = d, i
    if peor > eps:
        izq = douglas_peucker(pts[:idx + 1], eps)
        der = douglas_peucker(pts[idx:], eps)
        return izq[:-1] + der
    return [pts[0], pts[-1]]


def a_trazado(pts, dec=1):
    f = lambda v: ('%.' + str(dec) + 'f') % v
    d = 'M ' + f(pts[0][0]) + ' ' + f(pts[0][1])
    for x, y in pts[1:]:
        d += ' L ' + f(x) + ' ' + f(y)
    return d + ' Z'


def centroide(pts):
    """Centroide de area. El promedio de los vertices se corre hacia donde el
    borde tiene mas puntos, y el pin termina pegado a un costado del barrio."""
    a = cx = cy = 0.0
    for i in range(len(pts) - 1):
        x0, y0 = pts[i]; x1, y1 = pts[i + 1]
        cruz = x0 * y1 - x1 * y0
        a += cruz; cx += (x0 + x1) * cruz; cy += (y0 + y1) * cruz
    if abs(a) < 1e-9:
        return pts[0]
    a *= 0.5
    return (cx / (6 * a), cy / (6 * a))


def contorno(aristas):
    """Encadena los bordes que aparecen una sola vez."""
    sueltos = [k for k, n in aristas.items() if n == 1]
    vecinos = defaultdict(list)
    for a, b in sueltos:
        vecinos[a].append(b); vecinos[b].append(a)

    vistos = set()
    cadenas = []
    for arranque in vecinos:
        if arranque in vistos:
            continue
        cadena = [arranque]; vistos.add(arranque); actual = arranque
        while True:
            sigue = [v for v in vecinos[actual] if v not in vistos]
            if not sigue:
                break
            actual = sigue[0]; vistos.add(actual); cadena.append(actual)
        if len(cadena) > 20:
            cadenas.append(cadena)
    cadenas.sort(key=len, reverse=True)
    return cadenas


def main():
    origen = sys.argv[1]
    fs = json.load(open(origen))['features']
    p, alto = proyectar(fs)

    aristas = defaultdict(int)
    barrios = []
    for f in fs:
        nombre = f['properties']['nombre']
        comuna = f['properties'].get('comuna')
        mayor, area_mayor = None, -1
        for anillo in anillos(f['geometry']):
            pts = [p(lon, lat) for lon, lat in anillo]
            # bordes, redondeados para que dos barrios vecinos pareen
            for i in range(len(pts) - 1):
                a = (round(pts[i][0], REJILLA), round(pts[i][1], REJILLA))
                b = (round(pts[i + 1][0], REJILLA), round(pts[i + 1][1], REJILLA))
                aristas[(a, b) if a <= b else (b, a)] += 1
            area = abs(sum(pts[i][0] * pts[i + 1][1] - pts[i + 1][0] * pts[i][1]
                           for i in range(len(pts) - 1)) / 2.0)
            if area > area_mayor:
                area_mayor, mayor = area, pts
        simple = douglas_peucker(mayor, EPSILON)
        cx, cy = centroide(mayor)
        barrios.append({
            'nombre': nombre, 'comuna': comuna,
            'd': a_trazado(simple),
            'centro': [round(cx, 1), round(cy, 1)],
            'area': round(area_mayor)
        })

    cadenas = contorno(aristas)
    print('  bordes unicos encadenados en %d anillo(s): %s'
          % (len(cadenas), ', '.join(str(len(c)) for c in cadenas[:4])))
    borde = douglas_peucker(cadenas[0] + [cadenas[0][0]], EPSILON * 0.30)

    salida = {
        '_fuente': 'Gobierno de la Ciudad de Buenos Aires - datos abiertos, capa "barrios". '
                   'Proyectado y simplificado por herramientas/mapa-caba.py. No editar a mano.',
        'viewBox': '0 0 %d %d' % (round(ANCHO), round(alto)),
        'ancho': round(ANCHO), 'alto': round(alto, 1),
        'contorno': a_trazado(borde),
        'barrios': sorted(barrios, key=lambda b: b['nombre'])
    }
    destino = os.path.join(RAIZ, 'lib', 'caba.json')
    json.dump(salida, open(destino, 'w'), ensure_ascii=False, separators=(',', ':'))
    print('  %d barrios, contorno de %d puntos -> lib/caba.json (%d KB)'
          % (len(barrios), len(borde), os.path.getsize(destino) // 1024))


main()
