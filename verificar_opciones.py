#!/usr/bin/env python3
"""
Compara los textos de las opciones que muestra el frontend (ChatInterface.tsx)
con los textos que espera el motor Prolog (backend/server.pl).

Una opción del frontend que no coincida EXACTAMENTE con un opcion_*(N, 'texto', ...)
de Prolog aporta 0 síntomas al diagnóstico.

Uso (desde la raíz del repositorio):
    python3 verificar_opciones.py
Termina con código 1 si hay desajustes.
"""
import re
import sys
from pathlib import Path

PL_PATH = Path("backend/server.pl")
TS_PATH = Path("src/app/components/ChatInterface.tsx")

pl = PL_PATH.read_text(encoding="utf8")
ts = TS_PATH.read_text(encoding="utf8")

# Prolog: opcion_X(N, 'texto', ...)   (hemorragia usa opcion_sintomas)
prolog = {}
for m in re.finditer(r"opcion_(\w+)\((\d+),\s*'((?:[^']|'')*)'", pl):
    modulo, n, texto = m.group(1), int(m.group(2)), m.group(3).replace("''", "'")
    if modulo == "sintomas":
        modulo = "hemorragia"
    prolog.setdefault(modulo, {}).setdefault(n, set()).add(texto)

# TypeScript: const X_OPTIONS: Record<number, string[]> = { 1: [...], ... };
frontend = {}
for m in re.finditer(r"const (\w+)_OPTIONS: Record<number, string\[\]> = \{(.*?)\n\};", ts, re.S):
    modulo = m.group(1).lower()
    for q in re.finditer(r"(\d+):\s*\[(.*?)\],?\n", m.group(2) + "\n", re.S):
        opciones = re.findall(r"'((?:[^'\\]|\\.)*)'", q.group(2))
        frontend.setdefault(modulo, {})[int(q.group(1))] = opciones

total_desajustes = 0
for modulo in sorted(frontend):
    desajustes = []
    for n, opciones in frontend[modulo].items():
        esperadas = prolog.get(modulo, {}).get(n, set())
        for o in opciones:
            if o not in esperadas:
                desajustes.append((n, o))
    # Opciones de Prolog que el frontend nunca muestra
    huerfanas = []
    for n, esperadas in prolog.get(modulo, {}).items():
        mostradas = set(frontend[modulo].get(n, []))
        for e in esperadas:
            if e not in mostradas:
                huerfanas.append((n, e))

    estado = "OK" if not desajustes and not huerfanas else "REVISAR"
    print(f"[{estado}] {modulo}")
    for n, o in desajustes:
        print(f"    pregunta {n}: el frontend muestra '{o}' y Prolog no lo reconoce")
    for n, e in huerfanas:
        print(f"    pregunta {n}: Prolog define '{e}' pero el frontend no lo muestra")
    total_desajustes += len(desajustes) + len(huerfanas)

print(f"\n{total_desajustes} desajustes")
sys.exit(1 if total_desajustes else 0)
