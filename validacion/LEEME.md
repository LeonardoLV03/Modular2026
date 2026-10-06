# Validación de la hipótesis

Carpeta para comprobar la hipótesis del proyecto: *"la recomendación entregada coincide con el diagnóstico esperado en al menos el 80 % de las consultas de prueba"*.

## Archivos

| Archivo | Para qué sirve |
|---|---|
| `casos_desarrollo.csv` | Primer banco de 100 casos. Se usó para encontrar fallas y corregir el sistema, así que **no** sirve como evidencia final. |
| `casos_validacion.csv` | Banco **final**: 100 casos nuevos (10 por módulo), escritos después de las correcciones. Es el que el script usa por defecto y el que va en la tesis. Cada fila trae la situación, las respuestas del usuario y el resultado **esperado**: tipo de caso, severidad (`low`/`medium`/`high`) y alerta 911 (`si`/`no`). Se abre en Excel o Google Sheets. |
| `validar_hipotesis.py` | Manda cada caso al backend real, compara con lo esperado y genera el reporte. Solo usa Python estándar. |
| `reporte_validacion.md` | Se genera al correr el script: tablas global y por módulo, alertas 911 omitidas, casos que no coinciden y metodología. |
| `resultados_validacion.csv` | Se genera al correr el script: detalle caso por caso. |

## Cómo correrlo

```bash
cd backend && swipl server.pl                # terminal 1: levanta el backend
python3 validacion/validar_hipotesis.py      # terminal 2: desde la raíz del repo
```

Opciones útiles:
- `--criterio completo` exige que coincidan tipo, severidad y alerta 911.
- `--meta 80` cambia el porcentaje meta.
- `--api URL` evalúa otro backend, por ejemplo el de producción.

Antes de consultar, el script revisa que cada respuesta exista tal cual en `server.pl` y que el caso esperado exista en el módulo. Si encuentra un error, lo dice y no sigue.

## Importante sobre el banco de casos

- **Es un borrador.** Los resultados esperados se definieron con criterios generales de primeros auxilios, sin ejecutar el sistema. Antes de usarlos como evidencia, pídanle a una persona del área de salud que los revise y anote su nombre en la columna `revisado_por`.
- **No ajusten los esperados para que coincidan con el sistema.** Si un caso no coincide, eso es un hallazgo y va en el reporte; cambiarlo invalida la prueba.
- **Si vuelven a modificar el sistema por los resultados de `casos_validacion.csv`, ese banco deja de servir como evidencia** y hay que escribir otro nuevo, igual que se hizo con `casos_desarrollo.csv`.
