"""Montserrat para el sitio: solo pesos 400 a 700 y caracteres latinos. Mismo aspecto, archivo más liviano.
Uso: vendor/.venv-fuentes/bin/python scripts/optimizar-fuentes.py"""
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools import subset

raiz = Path(__file__).resolve().parent.parent
origen = raiz / "assets-fuente/fonts/Montserrat[wght].ttf"
destino = raiz / "src/assets/fonts/Montserrat-wght-latin.woff2"

f = TTFont(origen)
instantiateVariableFont(f, {"wght": (400, 700)}, inplace=True)
op = subset.Options()
op.layout_features = ["kern", "liga", "calt", "ccmp", "locl", "mark", "mkmk", "tnum", "lnum"]
op.flavor = "woff2"
s = subset.Subsetter(op)
s.populate(unicodes=list(range(0x20, 0x7F)) + list(range(0xA0, 0x180)) + [0x2013, 0x2014, 0x2018, 0x2019, 0x201C, 0x201D, 0x2022, 0x2026, 0x20AC, 0x2192, 0x2197, 0x2198])
s.subset(f)
f.flavor = "woff2"
f.save(destino)
print(f"{destino.stat().st_size // 1024} KB")
