# Reporte de validación de la hipótesis

- Fecha: 2026-10-06 16:40
- Backend evaluado: `http://127.0.0.1:5000`
- Banco de casos: `casos_validacion.csv` (100 casos)
- Criterio principal: tipo de caso
- Meta de la hipótesis: 80 %

## Resultado

**Coincidencia global (tipo de caso): 93 de 100 = 93.0 % → hipótesis ACEPTADA.**

| Métrica | Coinciden | Total | % |
|---|---|---|---|
| Tipo de caso | 93 | 100 | 93.0 |
| Severidad | 97 | 100 | 97.0 |
| Alerta 911 | 100 | 100 | 100.0 |
| Completa (las tres) | 93 | 100 | 93.0 |

## Por módulo

| Módulo | Casos | Tipo de caso % | Severidad % | Alerta 911 % | Completa % |
|---|---|---|---|---|---|
| hemorragia | 10 | 90.0 | 100.0 | 100.0 | 90.0 |
| desmayo | 10 | 90.0 | 90.0 | 100.0 | 90.0 |
| asfixia | 10 | 90.0 | 90.0 | 100.0 | 90.0 |
| quemadura | 10 | 100.0 | 100.0 | 100.0 | 100.0 |
| fractura | 10 | 100.0 | 100.0 | 100.0 | 100.0 |
| intoxicacion | 10 | 100.0 | 100.0 | 100.0 | 100.0 |
| picadura | 10 | 80.0 | 100.0 | 100.0 | 80.0 |
| descarga | 10 | 100.0 | 100.0 | 100.0 | 100.0 |
| insolacion | 10 | 100.0 | 100.0 | 100.0 | 100.0 |
| convulsion | 10 | 80.0 | 90.0 | 100.0 | 80.0 |

## Seguridad: alertas 911 omitidas

Ninguna: en todos los casos que lo requerían se activó la alerta 911.

## Casos que no coinciden

| ID | Módulo | Esperado | Obtenido | Sev. esperada → obtenida | 911 esperada → obtenida |
|---|---|---|---|---|---|
| VH05 | hemorragia | hemorragia_leve | sin_signos_de_hemorragia (80 %) | low → low | no → no |
| VD09 | desmayo | desmayo_leve | desmayo_mediano (75 %) | low → medium | no → no |
| VA07 | asfixia | asfixia_moderada | asfixia_leve (75 %) | medium → low | no → no |
| VP08 | picadura | picadura_moderada | desconocido (0 %) | medium → medium | no → no |
| VP09 | picadura | picadura_moderada | picadura_leve (75 %) | medium → medium | no → no |
| VC06 | convulsion | convulsion_moderada | convulsion_leve (60 %) | medium → medium | no → no |
| VC09 | convulsion | convulsion_leve | convulsion_moderada (75 %) | low → medium | no → no |

## Metodología

Cada caso de prueba describe una situación de emergencia y las respuestas que daría el usuario. El resultado esperado (tipo de caso, severidad y alerta 911) se definió antes de ejecutar el sistema, a partir de criterios de primeros auxilios. Los casos se enviaron al motor de inferencia real (`POST /api/diagnosis`). Coincidencia = casos en que el resultado del sistema es igual al esperado ÷ total de casos × 100.
