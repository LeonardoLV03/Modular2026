# Migración de 7 módulos al esquema de porcentaje de coincidencia

Primera etapa: `desmayo`, `fractura`, `descarga`, `picadura`, `intoxicacion`, `insolacion` y `convulsion`.
Segunda etapa: `hemorragia`, `asfixia` y `quemadura` (ver su sección al final).
No cambian: el contrato JSON, `stats-api/`, `android/`, `Dockerfile`, `vercel.json` ni `ProyectoFinalH.pl`.

## Archivos

| Archivo | Cambio |
|---|---|
| `backend/server.pl` | Archivo completo. Los 10 módulos usan el motor común; `h_next` ya no termina antes de tiempo; incluye `h_diag` actualizado y la guarda `HCA_SIN_SERVIDOR`. |
| `backend/tests/test_modulos.pl` | Nuevo. Contiene la prueba diferencial de los 10 módulos, 52 escenarios, la regresión de hemorragia y el contrato JSON. |
| `backend/tests/prueba_http.sh` | Nuevo (opcional). Prueba los 4 endpoints con `curl` y que hemorragia ya no se corte en la pregunta 2. |
| `src/app/components/ChatInterface.tsx` | Archivo completo. Solo cambia `QUEMADURA_OPTIONS`: se agrega `'No estoy seguro'` en la pregunta 2 y las opciones nuevas de las preguntas 1, 3 y 5 (ver tercera etapa). |
| `verificar_opciones.py` | El script que adjuntaste, sin cambios, para la raíz del repo. |

## Cómo probar en localhost

```bash
python3 verificar_opciones.py                         # desde la raíz → "0 desajustes"
cd backend
swipl -g run_tests -t halt tests/test_modulos.pl      # imprime la tabla diferencial y corre plunit
swipl server.pl                                       # levanta el servidor en :5000
bash tests/prueba_http.sh                             # (otra terminal) prueba los 4 endpoints
```

## Diseño aprobado

- **Casos.** Cada caso es una lista de 3 a 5 síntomas, como máximo uno por pregunta. El porcentaje es `coincidencias*100 // total`, con umbral de 50 y niveles EXACTO, ALTO y ACEPTABLE. Se reutilizan `contar_presentes/3` y `nivel_por_pct/2`.
- **Motor común.** Los predicados `pm_*` evitan copiar la misma lógica 7 veces. Cada módulo conserva sus predicados públicos (`caso_X`, `accion_X`, `recomendaciones_X`, `opcion_X`, `sintoma_emergencia_X`, `respuestas_X_a_sintomas`, `pct_caso_X`, `resultados_X`, `hay_emergencia_X`, `severidad_X`, `diagnostico_X/9` y `diagnostico(X, ...)/5`). Además se agregan dos hechos nuevos por módulo: `gravedad_caso_X/2` y `sintoma_moderado_X/1`.
- **Alerta 911.** Se calcula con `sintoma_emergencia_X` sobre todos los síntomas y no depende del caso ganador. Los síntomas son los mismos de antes.
- **Piso de severidad.** Da `high` si hay emergencia y `medium` si aparece algún `sintoma_moderado_X`, que son los disparadores de las antiguas reglas `nivel_X(moderada)`. La severidad final es la mayor entre el piso y la del caso ganador. La del caso ganador solo cuenta si ese caso llega al 50 %.
- **Recomendaciones de seguridad.** Si la severidad final supera la gravedad del caso ganador, primero van las recomendaciones del caso de esa severidad (por ejemplo, las del caso grave con "Llama al 911") y después las del ganador, sin duplicados.
- **Fallback seguro.** Si ningún caso llega al 50 %, `results = []` y `exactOnly = false`. `caseType` y `confidence` toman el caso de mayor porcentaje, y `DiagnosisCard` ya muestra ambos cuando `results` viene vacío. Si todo da 0 %, `caseType = desconocido` y las recomendaciones salen del piso de severidad o, si el piso es `low`, de `recomendaciones_genericas/1`.
- **Empates.** Gana el caso más grave. Antes se desempataba por orden alfabético inverso.
- **Sin terminación anticipada.** `h_next` no cambia y siempre pregunta hasta `total_preguntas`.
- **Textos clínicos.** Las 165 recomendaciones y acciones originales se copiaron automáticamente desde el archivo anterior y se verificó que todas estén presentes sin cambios.

## Tabla final de casos

| Módulo | Caso | Síntomas | Gravedad |
|---|---|---|---|
| fractura | fractura_leve | inflamacion_frac, movimiento_doloroso_frac, dolor_leve_frac, sin_alarma_frac | low |
| | fractura_moderada | deformidad_frac, no_puede_mover_frac, dolor_intenso_frac, sin_alarma_frac | medium |
| | fractura_grave | hueso_expuesto, no_puede_mover_frac, dolor_intenso_frac, sangrado_frac | high |
| desmayo | desmayo_leve | consciente, respira_bien, no_perdio_conciencia, sin_alarma | low |
| | desmayo_mediano | semi_consciente, respira_bien, menos_2min, sin_alarma | medium |
| | desmayo_grave | inconsciente, sin_respiracion, mas_2min | high |
| descarga | descarga_leve | sin_contacto_desc, consciente_desc, corriente_baja_desc, marcas_leves_desc | low |
| | descarga_moderada | sin_contacto_desc, confundido_desc, corriente_baja_desc, quemaduras_desc | medium |
| | descarga_grave | inconsciente_desc, corriente_alta_desc, quemaduras_desc, dolor_pecho_desc | high |
| picadura | picadura_leve | insecto_comun, zona_extremidad_pic, dolor_local_pic, sin_alergia_pic | low |
| | picadura_moderada | mamifero, zona_extremidad_pic, herida_profunda_pic, sin_alergia_pic | medium |
| | picadura_grave | insecto_comun, dificultad_respirar_pic, alergia_conocida_pic | high |
| intoxicacion | intoxicacion_leve | ingestion_alimentos, consciente_tox, nauseas_tox | low |
| | intoxicacion_moderada | ingestion_medicamentos, somnolenta_tox, nauseas_tox | medium |
| | intoxicacion_grave | ingestion_quimica, inconsciente_tox, dificultad_respirar_tox | high |
| insolacion | insolacion_leve | exposicion_corta_insol, mareo_insol, piel_enrojecida_insol, consciente_insol, hidratada_insol | low |
| | insolacion_moderada | exposicion_prolongada_insol, nauseas_insol, piel_humeda_fria_insol, consciente_insol, deshidratada_insol | medium |
| | insolacion_grave | exposicion_prolongada_insol, confusion_insol, piel_seca_caliente_insol, confundida_insol | high |
| convulsion | convulsion_leve | convulsion_terminada, conv_menos_2min, epileptico_conv, recuperado_conv, sin_causa_conv | low |
| | convulsion_moderada | convulsion_terminada, conv_menos_2min, post_ictal_conv, conv_fiebre | medium |
| | convulsion_grave | convulsionando_ahora, conv_mas_5min, convulsiones_repetidas_conv | high |

## Resultados de la prueba diferencial

Se enumeraron todas las combinaciones de opciones de cada módulo. Los números vienen de una réplica en Python del motor, que lee los hechos del `server.pl` generado y los compara con las reglas del `server.pl` original. El archivo `tests/test_modulos.pl` hace la misma comparación en Prolog e imprime esta tabla al correrlo.

| módulo | combinaciones | divergencias de emergencia | severidades degradadas | recs vacías | emergencia sin 911 | casos inalcanzables | fallback < 50 % |
|---|---|---|---|---|---|---|---|
| fractura | 1536 | 0 | 0 | 0 | 0 | 0 | 624 |
| desmayo | 135 | 0 | 0 | 0 | 0 | 0 | 32 |
| descarga | 720 | 0 | 0 | 0 | 0 | 0 | 244 |
| picadura | 1296 | 0 | 0 | 0 | 0 | 0 | 741 |
| intoxicacion | 1728 | 0 | 0 | 0 | 0 | 0 | 1248 |
| insolacion | 1152 | 0 | 0 | 0 | 0 | 0 | 697 |
| convulsion | 960 | 0 | 0 | 0 | 0 | 0 | 480 |

> En el entorno donde se generó el código no fue posible instalar SWI-Prolog, así que **la batería en Prolog todavía no se ha ejecutado**. Hay que correrla en localhost antes de subir a producción.

## Divergencias respecto al comportamiento anterior

1. **Una sola combinación sube de severidad** (de `low` a `medium`): desmayo con "Confundida o desorientada", "Sí, respira y tiene pulso normal", "No perdió la conciencia" y "Ninguna señal adicional". Gana `desmayo_mediano` con 75 %. Antes daba `low`. Las reglas permiten subir la severidad; nunca bajarla.
2. `caseType`, `confidence`, `results` y `exactOnly` ahora reflejan el porcentaje real. Antes siempre eran 100 y EXACTO.
3. Cuando ningún caso llega al 50 %, `results` viene vacío (fallback). Esto pasa con frecuencia: entre el 24 % y el 72 % de las combinaciones, según el módulo.
4. Cuando la alerta o el piso suben la severidad, las recomendaciones combinan las del caso de esa severidad con las del caso ganador.

## Decisiones marcadas `REVISAR POR PERSONAL DE SALUD`

- La composición de los 21 casos, sobre todo:
  - "Confundida" en `desmayo_mediano`
  - la ingestión química en `intoxicacion_grave`
  - la fiebre en `convulsion_moderada`
  - la piel húmeda y fría en `insolacion_moderada`
- Un solo caso grave no cubre todos los escenarios de emergencia: columna, hormigueo y shock en fractura, o serpiente y escorpión en picadura. Esos escenarios disparan la alerta 911 y la severidad `high`, pero se muestran como fallback o con otro caso.
- El texto de `recomendaciones_genericas/1`, que es nuevo y solo se usa cuando todo da 0 % y no hay disparadores.

## Otros cambios

- **Hemorragia, pregunta 2:** el texto de Prolog ahora es igual al del frontend: `La herida es superficial`, `La herida no es superficial` y `Sin herida visible`.
- **Desmayo, pregunta 2:** cambia `Si, ...` por `Sí, respira y tiene pulso normal`.
- **Quemadura, pregunta 2:** se agregó `No estoy seguro` al frontend. No afecta el diagnóstico porque esa opción no aporta síntomas.
- **`server.pl`:** `:- initialization(main, main).` ahora está dentro de `:- if(\+ getenv('HCA_SIN_SERVIDOR', _)).`. Las pruebas definen esa variable antes de cargar el archivo; en producción no existe, así que el servidor arranca igual que antes.

## Segunda etapa: hemorragia, asfixia y quemadura (aprobada)

Estos tres módulos también pasaron al motor común, así que ahora los 10 módulos funcionan igual.

**Qué cambió:**
- **Sin terminación anticipada.** `h_next` ya no devuelve `shouldFinish: true` en ningún módulo. Antes, hemorragia cortaba en la pregunta 2 con "Poco" + "La herida es superficial", y quemadura podía cortar desde la pregunta 1.
- **Motor común.** Los tres módulos tienen el mismo fallback, piso de severidad y desempate, y nunca devuelven recomendaciones vacías. Los hechos (`caso_`, `opcion_`, `accion_`, `recomendaciones_`, `sintoma_emergencia_`) de hemorragia ahora usan el sufijo `_hemorragia`, como el resto.
- **Hemorragia:**
  - Se corrigió el error de escritura `herida_nosivisble` → `herida_novisible`. `hemorragia_interna` ya puede llegar al 100 %.
  - `hemorragia_leve` pasó de 2 a 4 síntomas: `sangrado_poco`, `herida_superficial`, `piel_normal_hem` y `sin_sintomas_hem`. Ya no es EXACTO con solo dos respuestas.
  - **Caso nuevo `sin_signos_de_hemorragia`**, formado por las cinco respuestas "negativas": sin sangrado, sin herida, sin dolor, piel normal y ninguno. Reemplaza al antiguo "desconocido 0 %" y trae recomendaciones de vigilancia.
  - Las respuestas "negativas", que antes aportaban `[]`, ahora aportan un síntoma propio para reconocer ese caso. Los textos de las opciones no cambian.
  - Las recomendaciones de los 4 casos originales son la misma acción de antes, separada por comas en pasos. No se reescribió ningún texto.
- **Regla de seguridad nueva en el motor:** si la severidad es `high` y las recomendaciones del caso ganador no mencionan el 911, se anteponen las del caso grave. Esto corrige quemadura eléctrica, que tenía alerta pero sus recomendaciones originales no decían 911.
- **Pisos de severidad media nuevos:**
  - hemorragia: sangrado constante, herida no superficial, dolor intenso, piel pálida, moretones, mareo y debilidad;
  - asfixia: obstrucción total;
  - quemadura: ampollas y dolor intenso.

**Prueba diferencial** (todas las combinaciones, contra la lógica original):

| módulo | combinaciones | divergencias de emergencia | severidades degradadas | recs vacías | emergencia sin 911 | "desconocido" |
|---|---|---|---|---|---|---|
| hemorragia | 1440 | 0 | 4 (excepción aprobada, ver abajo) | 0 | 0 | 0 |
| asfixia | 864 | 0 | 0 | 0 | 0 | 0 |
| quemadura | 4200* | 0 | 0 | 0 | 0 | 40 |

**Divergencias de esta etapa:**
- **Hemorragia, 4 combinaciones bajan de `medium` a `low`.** Son las de "Poco" + "La herida es superficial" + piel normal, con dolor moderado o sin dolor y con "Ninguno" o "Inflamación" en la pregunta 5. Antes daban `medium` solo porque `hemorragia_leve` llegaba al 100 % (la regla vieja era "más de 70 % = medium"). Ahora dan Leve, que es lo que muestra la tarjeta. Si en esas respuestas aparece cualquier signo de alarma, la severidad sube por el piso o por la emergencia.
- **Hay severidades que suben** por los pisos nuevos: 424 combinaciones en hemorragia y 160 en quemadura. Por ejemplo, "Pálida solamente" ahora da al menos `medium`.
- **Hemorragia ya no suma las acciones de todos los resultados.** Antes devolvía como recomendaciones las acciones de todos los casos encima de 50 %. Ahora devuelve las del caso ganador más las de seguridad.

**Decisiones marcadas `REVISAR POR PERSONAL DE SALUD`:**
- `hemorragia_leve` ampliado;
- el caso, la acción y las recomendaciones de `sin_signos_de_hemorragia`;
- los pisos de severidad media de los tres módulos;
- la gravedad asignada a quemadura química, eléctrica y por radiación.

## Tercera etapa: quemadura química y por radiación (aprobada)

Antes, `quemadura_quimica` y `quemadura_radiacion` nunca podían salir: la opción "Lesión química o eléctrica" mezclaba las dos causas, y ninguna respuesta producía `cambio_color`, `eritema`, `descamacion` ni `dolor_moderado`. Ahora los 6 casos de quemadura pueden llegar al 100 %.

| Pregunta | Antes | Ahora |
|---|---|---|
| 1 | `Lesión química o eléctrica` → química + eléctrica | `Lesión química` → `[dolor_quimico, necrosis]`<br>`Lesión eléctrica` → `[lesion_pequena_externa, arritmia, daño_profundo]`<br>`Quemadura por sol o radiación` → `[eritema]` (nueva) |
| 3 | — | `Piel pelada o descamada` → `[descamacion]` (nueva)<br>`Cambio de color de la piel (manchas oscuras o amarillentas)` → `[cambio_color]` (nueva) |
| 5 | — | `Dolor moderado` → `[dolor_moderado]` (nueva) |

- **Alerta 911:** química conserva `necrosis` y eléctrica conserva `arritmia`, así que las dos siguen disparando la alerta 911 igual que la opción combinada anterior.
- **Revisión clínica:** los textos nuevos de las opciones están marcados `REVISAR POR PERSONAL DE SALUD`.
- **\* Prueba diferencial de quemadura:** como hay más opciones, ahora son 4200 combinaciones. "Lesión química" y "Lesión eléctrica" se comparan contra la opción combinada vieja, y las opciones nuevas se comparan como si no aportaran síntomas. Resultado: 0 divergencias de emergencia, 0 severidades degradadas, 0 recomendaciones vacías, 0 emergencias sin 911 y 0 casos inalcanzables.

## Cuarta etapa: correcciones por la validación de la hipótesis (aprobada)

El primer banco de casos (`validacion/casos_desarrollo.csv`) dio 75 % de coincidencia en el tipo de caso, por debajo del 80 % de la hipótesis, y encontró 3 casos donde debía activarse la alerta 911 y no se activó. Se hicieron tres cambios:

1. **Tipo coherente con la alerta.** Aplica a los 7 módulos organizados por niveles: desmayo, fractura, intoxicación, picadura, descarga, insolación y convulsión. Si hay alerta 911 y el caso ganador no es grave, se reporta el caso grave del módulo con su porcentaje real y nivel `ALERTA 911`. Así se recupera el significado original de `nivel_X(grave)`, donde cualquier emergencia era grave. `ALERTA 911` es un valor nuevo de `level`, y la tarjeta lo muestra en "Precisión".
2. **Alerta por patrón grave.** También es emergencia cuando las respuestas coinciden al menos 75 % con un caso de gravedad alta. En la práctica solo afecta a hemorragia: sospecha de hemorragia interna, o choque sin sangrado abundante.
3. **Asfixia:** la obstrucción total (no puede hablar ni toser con eficacia) ahora activa la alerta 911. Las recomendaciones siguen siendo las de Heimlich, no las de RCP, porque la persona está consciente.

**Prueba diferencial:**
- Ninguna alerta 911 se retiró y ninguna severidad bajó, salvo las 4 de hemorragia leve ya aprobadas.
- Alertas nuevas: 144 combinaciones de asfixia y 39 de hemorragia.

**Validación de la hipótesis:**
- **Banco final** `validacion/casos_validacion.csv`: 100 casos nuevos, escritos después de las correcciones. Resultado preliminar con la réplica del motor: **93 % en tipo de caso**, 97 % en severidad, **100 % en alerta 911** y 93 % con las tres a la vez. Ese número debe confirmarse con el backend real.
- **Banco de desarrollo, después de corregir:** 91 %. No se usa como evidencia porque influyó en las correcciones.

**Marcadas `REVISAR POR PERSONAL DE SALUD`:** la regla de alerta por patrón (≥ 75 %) y la obstrucción total como emergencia.

## Observaciones pendientes (sin aplicar)

1. **Quemadura:** si se responde "No estoy seguro" en todo, el resultado es `desconocido` con recomendaciones genéricas (40 combinaciones). Ya no queda vacío, pero el tipo sigue siendo "desconocido".
2. **Frontend:** `ChatInterface.tsx` todavía maneja `shouldFinish`. No hace daño porque el backend ya siempre manda `false`.
