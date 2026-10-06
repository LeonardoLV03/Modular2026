#!/usr/bin/env python3
"""
Validación de la hipótesis del proyecto Health Care Aid.

Hipótesis: la recomendación entregada por el sistema experto (variable dependiente)
coincide con el diagnóstico esperado (según guías de primeros auxilios) en al menos
el 80 % de las consultas de prueba.

Qué hace:
  1. Lee el banco de casos de prueba (casos_validacion.csv). Cada caso trae la situación,
     las respuestas que daría el usuario y el resultado ESPERADO (tipo de caso, severidad
     y si debe activarse la alerta 911), definido antes y de forma independiente al sistema.
  2. Envía cada caso al backend real (POST /api/diagnosis).
  3. Compara lo obtenido con lo esperado y calcula el porcentaje de coincidencia
     por módulo y global.
  4. Genera:
       - resultados_validacion.csv  (detalle caso por caso)
       - reporte_validacion.md      (tablas y veredicto, listo para la tesis)

Uso (con el backend corriendo: cd backend && swipl server.pl):
    python3 validacion/validar_hipotesis.py
Opciones:
    --api URL          URL del backend (default http://localhost:5000)
    --casos ARCHIVO    banco de casos (default validacion/casos_validacion.csv)
    --server-pl RUTA   server.pl para revisar que las respuestas existan (default backend/server.pl)
    --meta N           porcentaje meta de la hipótesis (default 80)
    --criterio C       'tipo' (default): coincide el tipo de caso
                       'completo': coinciden tipo, severidad y alerta 911

Solo usa la biblioteca estándar de Python (no requiere instalar nada).
"""
import argparse
import csv
import json
import os
import re
import sys
import urllib.error
import urllib.request
from collections import OrderedDict
from datetime import datetime

MODULOS = ['hemorragia', 'desmayo', 'asfixia', 'quemadura', 'fractura',
           'intoxicacion', 'picadura', 'descarga', 'insolacion', 'convulsion']
SEV_ES = {'low': 'Leve', 'medium': 'Moderada', 'high': 'Grave'}


def leer_casos(ruta):
    with open(ruta, encoding='utf-8-sig', newline='') as f:
        filas = list(csv.DictReader(f))
    casos = []
    for i, r in enumerate(filas, start=2):
        if not (r.get('id') or '').strip():
            continue
        resp = [r.get('respuesta_%d' % k, '') for k in range(1, 6)]
        while resp and not resp[-1]:
            resp.pop()
        casos.append({
            'fila': i,
            'id': r['id'].strip(),
            'modulo': r['modulo'].strip().lower(),
            'situacion': r.get('situacion', '').strip(),
            'respuestas': resp,
            'caso_esperado': r['caso_esperado'].strip(),
            'sev_esperada': r['severidad_esperada'].strip().lower(),
            'alerta_esperada': r['alerta_911_esperada'].strip().lower() in ('si', 'sí', 'true', '1', 'yes'),
        })
    return casos


def catalogo_desde_server(ruta):
    """Opciones y casos válidos por módulo, leídos de server.pl."""
    if not ruta or not os.path.exists(ruta):
        return None
    s = open(ruta, encoding='utf-8').read()
    cat = {}
    for m in MODULOS:
        opciones = {}
        for n, t in re.findall(r"^opcion_%s\((\d+),\s*'((?:[^']|'')*)'" % m, s, re.M):
            opciones.setdefault(int(n), set()).add(t.replace("''", "'"))
        casos = set(re.findall(r"^caso_%s\((\w+)," % m, s, re.M))
        cat[m] = {'opciones': opciones, 'casos': casos}
    return cat


def revisar_casos(casos, cat):
    errores = []
    ids = set()
    for c in casos:
        p = 'Caso %s (fila %d): ' % (c['id'], c['fila'])
        if c['id'] in ids:
            errores.append(p + 'id repetido')
        ids.add(c['id'])
        if c['modulo'] not in MODULOS:
            errores.append(p + 'módulo desconocido "%s"' % c['modulo'])
            continue
        if c['sev_esperada'] not in SEV_ES:
            errores.append(p + 'severidad_esperada debe ser low, medium o high')
        if cat:
            k = cat[c['modulo']]
            if c['caso_esperado'] not in k['casos']:
                errores.append(p + 'caso_esperado "%s" no existe en el módulo' % c['caso_esperado'])
            if len(c['respuestas']) != len(k['opciones']):
                errores.append(p + 'tiene %d respuestas y el módulo tiene %d preguntas'
                               % (len(c['respuestas']), len(k['opciones'])))
            for n, t in enumerate(c['respuestas'], 1):
                if t not in k['opciones'].get(n, set()):
                    errores.append(p + 'la respuesta %d "%s" no es una opción válida' % (n, t))
    return errores


def diagnosticar(api, caso):
    cuerpo = json.dumps({'sessionId': 'validacion-' + caso['id'], 'module': caso['modulo'],
                         'answers': caso['respuestas']}).encode('utf-8')
    req = urllib.request.Request(api.rstrip('/') + '/api/diagnosis', data=cuerpo,
                                 headers={'Content-Type': 'application/json'}, method='POST')
    with urllib.request.urlopen(req, timeout=15) as r:
        return json.loads(r.read().decode('utf-8'))


def pct(a, b):
    return round(100.0 * a / b, 1) if b else 0.0


def main():
    ap = argparse.ArgumentParser(description='Valida la hipótesis contra el backend real.')
    base = os.path.dirname(os.path.abspath(__file__))
    raiz = os.path.dirname(base)
    ap.add_argument('--api', default=os.environ.get('API_URL', 'http://localhost:5000'))
    ap.add_argument('--casos', default=os.path.join(base, 'casos_validacion.csv'))
    ap.add_argument('--server-pl', default=os.path.join(raiz, 'backend', 'server.pl'))
    ap.add_argument('--meta', type=float, default=80.0)
    ap.add_argument('--criterio', choices=['tipo', 'completo'], default='tipo')
    ap.add_argument('--salida', default=base)
    a = ap.parse_args()

    casos = leer_casos(a.casos)
    errores = revisar_casos(casos, catalogo_desde_server(a.server_pl))
    if errores:
        print('El banco de casos tiene errores; corrígelos antes de validar:')
        for e in errores:
            print('  -', e)
        sys.exit(2)

    resultados = []
    for c in casos:
        try:
            d = diagnosticar(a.api, c)
        except (urllib.error.URLError, OSError, ValueError) as e:
            print('No se pudo consultar el backend en %s (%s).' % (a.api, e))
            print('¿Está corriendo?  cd backend && swipl server.pl')
            sys.exit(3)
        tipo = d.get('caseType', '')
        sev = d.get('severity', '')
        alerta = bool(d.get('isEmergency'))
        ok_tipo = tipo == c['caso_esperado']
        ok_sev = sev == c['sev_esperada']
        ok_alerta = alerta == c['alerta_esperada']
        resultados.append(dict(c, tipo=tipo, confianza=d.get('confidence', ''), sev=sev, alerta=alerta,
                               ok_tipo=ok_tipo, ok_sev=ok_sev, ok_alerta=ok_alerta,
                               ok_completo=ok_tipo and ok_sev and ok_alerta))

    # ---- métricas ----
    clave = 'ok_tipo' if a.criterio == 'tipo' else 'ok_completo'
    por_mod = OrderedDict()
    for m in MODULOS:
        rs = [r for r in resultados if r['modulo'] == m]
        if rs:
            por_mod[m] = {k: sum(r[k] for r in rs) for k in ('ok_tipo', 'ok_sev', 'ok_alerta', 'ok_completo')}
            por_mod[m]['n'] = len(rs)
    n = len(resultados)
    glob = {k: sum(r[k] for r in resultados) for k in ('ok_tipo', 'ok_sev', 'ok_alerta', 'ok_completo')}
    principal = pct(glob[clave], n)
    acepta = principal >= a.meta
    # Errores de seguridad: debía sonar la alerta 911 y no sonó.
    alertas_omitidas = [r for r in resultados if r['alerta_esperada'] and not r['alerta']]

    # ---- CSV de detalle ----
    os.makedirs(a.salida, exist_ok=True)
    det = os.path.join(a.salida, 'resultados_validacion.csv')
    with open(det, 'w', encoding='utf-8-sig', newline='') as f:
        w = csv.writer(f)
        w.writerow(['id', 'modulo', 'situacion', 'caso_esperado', 'caso_obtenido', 'confianza_%',
                    'severidad_esperada', 'severidad_obtenida', 'alerta_911_esperada', 'alerta_911_obtenida',
                    'coincide_tipo', 'coincide_severidad', 'coincide_alerta', 'coincide_completo'])
        for r in resultados:
            si = lambda b: 'si' if b else 'no'
            w.writerow([r['id'], r['modulo'], r['situacion'], r['caso_esperado'], r['tipo'], r['confianza'],
                        r['sev_esperada'], r['sev'], si(r['alerta_esperada']), si(r['alerta']),
                        si(r['ok_tipo']), si(r['ok_sev']), si(r['ok_alerta']), si(r['ok_completo'])])

    # ---- reporte Markdown ----
    nombre_crit = ('tipo de caso' if a.criterio == 'tipo'
                   else 'coincidencia completa (tipo, severidad y alerta 911)')
    L = []
    L.append('# Reporte de validación de la hipótesis')
    L.append('')
    L.append('- Fecha: %s' % datetime.now().strftime('%Y-%m-%d %H:%M'))
    L.append('- Backend evaluado: `%s`' % a.api)
    L.append('- Banco de casos: `%s` (%d casos)' % (os.path.basename(a.casos), n))
    L.append('- Criterio principal: %s' % nombre_crit)
    L.append('- Meta de la hipótesis: %.0f %%' % a.meta)
    L.append('')
    L.append('## Resultado')
    L.append('')
    L.append('**Coincidencia global (%s): %d de %d = %.1f %% → hipótesis %s.**'
             % (nombre_crit, glob[clave], n, principal, 'ACEPTADA' if acepta else 'NO ACEPTADA'))
    L.append('')
    L.append('| Métrica | Coinciden | Total | % |')
    L.append('|---|---|---|---|')
    L.append('| Tipo de caso | %d | %d | %.1f |' % (glob['ok_tipo'], n, pct(glob['ok_tipo'], n)))
    L.append('| Severidad | %d | %d | %.1f |' % (glob['ok_sev'], n, pct(glob['ok_sev'], n)))
    L.append('| Alerta 911 | %d | %d | %.1f |' % (glob['ok_alerta'], n, pct(glob['ok_alerta'], n)))
    L.append('| Completa (las tres) | %d | %d | %.1f |' % (glob['ok_completo'], n, pct(glob['ok_completo'], n)))
    L.append('')
    L.append('## Por módulo')
    L.append('')
    L.append('| Módulo | Casos | Tipo de caso % | Severidad % | Alerta 911 % | Completa % |')
    L.append('|---|---|---|---|---|---|')
    for m, v in por_mod.items():
        L.append('| %s | %d | %.1f | %.1f | %.1f | %.1f |' % (
            m, v['n'], pct(v['ok_tipo'], v['n']), pct(v['ok_sev'], v['n']),
            pct(v['ok_alerta'], v['n']), pct(v['ok_completo'], v['n'])))
    L.append('')
    L.append('## Seguridad: alertas 911 omitidas')
    L.append('')
    if alertas_omitidas:
        L.append('Casos donde el resultado esperado pedía alerta 911 y el sistema no la activó:')
        L.append('')
        for r in alertas_omitidas:
            L.append('- **%s** (%s): %s → obtenido %s, severidad %s'
                     % (r['id'], r['modulo'], r['situacion'], r['tipo'], r['sev']))
    else:
        L.append('Ninguna: en todos los casos que lo requerían se activó la alerta 911.')
    L.append('')
    L.append('## Casos que no coinciden')
    L.append('')
    L.append('| ID | Módulo | Esperado | Obtenido | Sev. esperada → obtenida | 911 esperada → obtenida |')
    L.append('|---|---|---|---|---|---|')
    for r in resultados:
        if not r['ok_completo']:
            L.append('| %s | %s | %s | %s (%s %%) | %s → %s | %s → %s |' % (
                r['id'], r['modulo'], r['caso_esperado'], r['tipo'], r['confianza'],
                r['sev_esperada'], r['sev'], 'sí' if r['alerta_esperada'] else 'no', 'sí' if r['alerta'] else 'no'))
    L.append('')
    L.append('## Metodología')
    L.append('')
    L.append('Cada caso de prueba describe una situación de emergencia y las respuestas que daría el usuario. '
             'El resultado esperado (tipo de caso, severidad y alerta 911) se definió antes de ejecutar el sistema, '
             'a partir de criterios de primeros auxilios. Los casos se enviaron al motor de inferencia real '
             '(`POST /api/diagnosis`). Coincidencia = casos en que el resultado del sistema es igual al esperado '
             '÷ total de casos × 100.')
    rep = os.path.join(a.salida, 'reporte_validacion.md')
    open(rep, 'w', encoding='utf-8').write('\n'.join(L) + '\n')

    # ---- consola ----
    print('Casos evaluados: %d' % n)
    print('Tipo de caso:   %5.1f %%' % pct(glob['ok_tipo'], n))
    print('Severidad:      %5.1f %%' % pct(glob['ok_sev'], n))
    print('Alerta 911:     %5.1f %%' % pct(glob['ok_alerta'], n))
    print('Completa:       %5.1f %%' % pct(glob['ok_completo'], n))
    print('Hipótesis (%s >= %.0f %%): %s' % (nombre_crit, a.meta, 'ACEPTADA' if acepta else 'NO ACEPTADA'))
    if alertas_omitidas:
        print('ATENCIÓN: %d caso(s) debían activar la alerta 911 y no la activaron.' % len(alertas_omitidas))
    print('Reporte: %s' % rep)
    print('Detalle: %s' % det)


if __name__ == '__main__':
    main()
