% ============================================================
%   BACKEND HTTP - SISTEMA DE PRIMEROS AUXILIOS
%   Puerto: 5000
% ============================================================

:- encoding(utf8).

:- use_module(library(http/thread_httpd)).
:- use_module(library(http/http_dispatch)).
:- use_module(library(http/http_json)).
:- use_module(library(http/http_cors)).
:- use_module(library(uuid)).

:- discontiguous pregunta/3.
:- discontiguous total_preguntas/2.
:- discontiguous diagnostico/5.

% ── CORS ────────────────────────────────────────────────────
:- set_setting(http:cors, [*]).

% ── RUTAS ───────────────────────────────────────────────────
:- http_handler('/api/start-consultation',  h_start,   [method(post), methods([options,post])]).
:- http_handler('/api/next-question',       h_next,    [method(post), methods([options,post])]).
:- http_handler('/api/diagnosis',           h_diag,    [method(post), methods([options,post])]).
:- http_handler('/api/end-consultation',    h_end,     [method(post), methods([options,post])]).

% ── ESTADO DINÁMICO ─────────────────────────────────────────
:- dynamic sesion/3.   % sesion(SesionId, Modulo, Respuestas)

% ============================================================
% BASE DE CONOCIMIENTOS - PREGUNTAS
% ============================================================

% --- HEMORRAGIA (5 preguntas) ---
pregunta(hemorragia, 1, 'Tipo de sangrado que presenta el paciente').
pregunta(hemorragia, 2, 'Herida visible en el cuerpo').
pregunta(hemorragia, 3, 'Tipo de dolor que reporta el paciente').
pregunta(hemorragia, 4, 'Estado y aspecto de la piel').
pregunta(hemorragia, 5, 'Síntomas generales del paciente').

total_preguntas(hemorragia, 5).

% --- DESMAYO (4 preguntas) ---
pregunta(desmayo, 1, 'Estado de consciencia de la persona').
pregunta(desmayo, 2, 'Respiración y pulso de la persona').
pregunta(desmayo, 3, 'Tiempo que lleva sin recuperar la conciencia').
pregunta(desmayo, 4, 'Señales de alarma adicionales').

total_preguntas(desmayo, 4).

% --- ASFIXIA (5 preguntas) ---
pregunta(asfixia, 1, 'Puede hablar o toser con fuerza').
pregunta(asfixia, 2, 'Cómo es la respiración').
pregunta(asfixia, 3, 'Color de piel o labios').
pregunta(asfixia, 4, 'Estado de conciencia de la persona').
pregunta(asfixia, 5, 'Causa probable del episodio').

total_preguntas(asfixia, 5).

% --- QUEMADURA ---
pregunta(quemadura, 1, '¿Cómo se ve la quemadura?').
pregunta(quemadura, 2, '¿En qué zona del cuerpo está la quemadura?').
pregunta(quemadura, 3, '¿Qué apariencia tiene la piel quemada?').
pregunta(quemadura, 4, '¿Qué primeros auxilios aplicaste o has hecho?').
pregunta(quemadura, 5, '¿Hay dolor intenso, dificultad para respirar o signos de infección?').

total_preguntas(quemadura, 5).

% ============================================================
% PREDICADOS GLOBALES DEL MOTOR (usados por todos los módulos)
% ============================================================

contar_presentes([], _, 0).
contar_presentes([S | Resto], Sintomas, N) :-
    ( member(S, Sintomas) ->
        contar_presentes(Resto, Sintomas, Sub),
        N is Sub + 1
    ;
        contar_presentes(Resto, Sintomas, N)
    ).

nivel_por_pct(Pct, Nivel) :-
    ( Pct =:= 100 -> Nivel = 'EXACTO'
    ; Pct > 70    -> Nivel = 'ALTO'
    ;                Nivel = 'ACEPTABLE'
    ).

% ============================================================
% MÓDULO: HEMORRAGIA  (esquema de porcentaje de coincidencia)
% ============================================================

% --- Casos ---
% REVISAR POR PERSONAL DE SALUD: hemorragia_leve se amplió de 2 a 4 síntomas
% (piel normal y sin síntomas generales) para que no sea EXACTO solo con las
% preguntas 1 y 2. sin_signos_de_hemorragia es un caso nuevo.
% hemorragia_interna: corregido el error de escritura herida_nosivisble -> herida_novisible.
caso_hemorragia(hemorragia_leve,          [sangrado_poco, herida_superficial, piel_normal_hem, sin_sintomas_hem]).
caso_hemorragia(hemorragia_media,         [sangrado_constante, dolor_moderado, inflamacion, herida_visible]).
caso_hemorragia(hemorragia_grave,         [sangrado_abundante, mareo, debilidad, piel_palida, herida_visible]).
caso_hemorragia(hemorragia_interna,       [dolor_intenso, moretones, mareo, debilidad, herida_novisible]).
caso_hemorragia(sin_signos_de_hemorragia, [sin_sangrado_visible, herida_novisible, sin_dolor_hem, piel_normal_hem, sin_sintomas_hem]).

% --- Gravedad de cada caso (low < medium < high) ---
gravedad_caso_hemorragia(hemorragia_leve, low).
gravedad_caso_hemorragia(hemorragia_media, medium).
gravedad_caso_hemorragia(hemorragia_grave, high).
gravedad_caso_hemorragia(hemorragia_interna, high).
gravedad_caso_hemorragia(sin_signos_de_hemorragia, low).

% --- Acciones (texto original sin cambios) ---
accion_hemorragia(hemorragia_leve,
    'Limpiar la herida, Mantener limpia la herida, Aplicar presión directa, Cubrir con gasa estéril').
accion_hemorragia(hemorragia_media,
    'Colocar vendaje firme, Elevar la zona afectada, presión directa continua.').
accion_hemorragia(hemorragia_grave,
    'Llamar al 911 de inmediato, Si un objeto está incrustado NO retirarlo, Presión fuerte y constante, Vendar o reforzar el vendaje, Mantener la persona acostada, Monitorear la respiración y el pulso').
accion_hemorragia(hemorragia_interna,
    'Llamar al 911, Mantener la persona acostada, Mantener la calma, NO darle alimentos ni bebidas, NO medicar, Elevar piernas (Si no hay lesiones)').
% REVISAR POR PERSONAL DE SALUD: texto nuevo.
accion_hemorragia(sin_signos_de_hemorragia,
    'No se observan signos de hemorragia: vigila a la persona y, si aparece sangrado, mareo, palidez o desmayo, llama al 911').

% --- Recomendaciones ---
% Antes este módulo usaba la acción completa como recomendación; ahora la
% misma acción se separa por comas en pasos (mismo texto, sin reescribir).
recomendaciones_hemorragia(hemorragia_leve, [
    'Limpiar la herida',
    'Mantener limpia la herida',
    'Aplicar presión directa',
    'Cubrir con gasa estéril'
]).
recomendaciones_hemorragia(hemorragia_media, [
    'Colocar vendaje firme',
    'Elevar la zona afectada',
    'presión directa continua.'
]).
recomendaciones_hemorragia(hemorragia_grave, [
    'Llamar al 911 de inmediato',
    'Si un objeto está incrustado NO retirarlo',
    'Presión fuerte y constante',
    'Vendar o reforzar el vendaje',
    'Mantener la persona acostada',
    'Monitorear la respiración y el pulso'
]).
recomendaciones_hemorragia(hemorragia_interna, [
    'Llamar al 911',
    'Mantener la persona acostada',
    'Mantener la calma',
    'NO darle alimentos ni bebidas',
    'NO medicar',
    'Elevar piernas (Si no hay lesiones)'
]).
% REVISAR POR PERSONAL DE SALUD: texto nuevo.
recomendaciones_hemorragia(sin_signos_de_hemorragia, [
    'Vigila a la persona durante las próximas horas',
    'Revisa si aparece sangrado, moretones nuevos o dolor que aumente',
    'Si aparece mareo, debilidad, palidez o desmayo, llama al 911 de inmediato',
    'Si tienes dudas o hubo un golpe fuerte, acude a urgencias para una valoración'
]).

% --- Opciones (texto idéntico al frontend) ---
% Las respuestas "negativas" ahora aportan un síntoma propio para poder
% reconocer el caso sin_signos_de_hemorragia (antes aportaban []).
opcion_hemorragia(1, 'Poco  (manchas o goteo leve)',        [sangrado_poco]).
opcion_hemorragia(1, 'Constante  (flujo moderado continuo)', [sangrado_constante]).
opcion_hemorragia(1, 'Abundante  (flujo fuerte)',            [sangrado_abundante]).
opcion_hemorragia(1, 'A chorros / extremadamente intenso',   [sangrado_abundante, sangre_a_chorros]).
opcion_hemorragia(1, 'Sin sangrado visible',                 [sin_sangrado_visible]).

opcion_hemorragia(2, 'La herida es superficial',             [herida_superficial]).
opcion_hemorragia(2, 'La herida no es superficial',          [herida_visible]).
opcion_hemorragia(2, 'Sin herida visible',                   [herida_novisible]).
opcion_hemorragia(2, 'No estoy seguro',                      []).

opcion_hemorragia(3, 'Dolor moderado',                       [dolor_moderado]).
opcion_hemorragia(3, 'Dolor intenso',                        [dolor_intenso]).
opcion_hemorragia(3, 'Sin dolor',                            [sin_dolor_hem]).

opcion_hemorragia(4, 'Pálida solamente',                     [piel_palida]).
opcion_hemorragia(4, 'Fría y pálida',                        [piel_palida, piel_fria]).
opcion_hemorragia(4, 'Moretones visibles',                   [moretones]).
opcion_hemorragia(4, 'Normal, sin cambios',                  [piel_normal_hem]).

opcion_hemorragia(5, 'Mareo únicamente',                     [mareo]).
opcion_hemorragia(5, 'Debilidad únicamente',                 [debilidad]).
opcion_hemorragia(5, 'Mareo y debilidad juntos',             [mareo, debilidad]).
opcion_hemorragia(5, 'Inflamación en la zona afectada',      [inflamacion]).
opcion_hemorragia(5, 'Pérdida del conocimiento',             [desmayo_hemorragia]).
opcion_hemorragia(5, 'Ninguno de los anteriores',            [sin_sintomas_hem]).

% --- Síntomas que disparan la alerta 911 (sin cambios) ---
sintoma_emergencia_hemorragia(sangrado_abundante).
sintoma_emergencia_hemorragia(sangre_a_chorros).
sintoma_emergencia_hemorragia(desmayo_hemorragia).
sintoma_emergencia_hemorragia(piel_fria).

% --- Disparadores de severidad media (piso de seguridad) ---
% REVISAR POR PERSONAL DE SALUD: antes la severidad media dependía solo del
% porcentaje (>70 %). Ahora la dan los signos de pérdida de sangre relevante.
sintoma_moderado_hemorragia(sangrado_constante).
sintoma_moderado_hemorragia(herida_visible).
sintoma_moderado_hemorragia(dolor_intenso).
sintoma_moderado_hemorragia(piel_palida).
sintoma_moderado_hemorragia(moretones).
sintoma_moderado_hemorragia(mareo).
sintoma_moderado_hemorragia(debilidad).

% --- Predicados públicos del módulo (delegan en el motor común) ---
respuestas_hemorragia_a_sintomas(Respuestas, Sintomas) :-
    pm_respuestas_a_sintomas(hemorragia, Respuestas, Sintomas).

pct_caso_hemorragia(Caso, Sintomas, Pct) :-
    pm_pct_caso(hemorragia, Caso, Sintomas, Pct).

resultados_hemorragia(Respuestas, Umbral, Resultados, ExactOnly) :-
    respuestas_hemorragia_a_sintomas(Respuestas, Sintomas),
    pm_resultados(hemorragia, Sintomas, Umbral, Resultados, ExactOnly).

hay_emergencia_hemorragia(Sintomas) :-
    pm_hay_emergencia(hemorragia, Sintomas).

severidad_hemorragia(EsEmergencia, Caso, Severidad) :-
    pm_severidad_caso(hemorragia, EsEmergencia, Caso, Severidad).

diagnostico_hemorragia(Respuestas, EsEmergencia, Severidad, Recomendaciones, Caso, Pct, Accion, Resultados, ExactOnly) :-
    pm_diagnostico(hemorragia, Respuestas, EsEmergencia, Severidad, Recomendaciones, Caso, Pct, Accion, Resultados, ExactOnly).

diagnostico(hemorragia, Respuestas, EsEmergencia, Severidad, Recomendaciones) :-
    diagnostico_hemorragia(Respuestas, EsEmergencia, Severidad, Recomendaciones, _Caso, _Pct, _Accion, _Resultados, _ExactOnly).

% ============================================================
% MÓDULO: DESMAYO  (esquema de porcentaje de coincidencia)
% Casos = listas de síntomas; el motor común (sección MOTOR DE
% PORCENTAJE) calcula Pct = coincidencias*100 // total.
% ============================================================

% --- Casos (un síntoma por pregunta como máximo) ---
% REVISAR POR PERSONAL DE SALUD: la composición de cada caso es criterio
% clínico derivado de las reglas nivel_desmayo y de las opciones existentes.
% REVISAR POR PERSONAL DE SALUD: desmayo_mediano usa "Confundida o desorientada" como estado tras una pérdida breve de conciencia.
caso_desmayo(desmayo_leve,    [consciente, respira_bien, no_perdio_conciencia, sin_alarma]).
caso_desmayo(desmayo_mediano, [semi_consciente, respira_bien, menos_2min, sin_alarma]).
caso_desmayo(desmayo_grave,   [inconsciente, sin_respiracion, mas_2min]).

% --- Gravedad de cada caso (low < medium < high) ---
gravedad_caso_desmayo(desmayo_leve, low).
gravedad_caso_desmayo(desmayo_mediano, medium).
gravedad_caso_desmayo(desmayo_grave, high).

% --- Acciones principales (texto original sin cambios) ---
accion_desmayo(desmayo_leve,
    'Siéntala con la cabeza entre las rodillas o recuéstala con piernas elevadas, afloja la ropa, ventila el área, no la levantes bruscamente').
accion_desmayo(desmayo_mediano,
    'Acuéstala y eleva las piernas 30-45 cm, afloja la ropa, verifica respiración y pulso, llama al 911 si no despierta en 1-2 minutos').
accion_desmayo(desmayo_grave,
    'Llama al 911 de inmediato, verifica respiración y pulso, inicia RCP si no respira, coloca en posición lateral de seguridad si respira').

% --- Recomendaciones (texto original de diagnostico/5, sin cambios) ---
recomendaciones_desmayo(desmayo_leve, [
    'Manten la calma y tranquiliza a la persona',
    'Siéntala con la cabeza inclinada entre las rodillas O recuéstala con piernas elevadas',
    'Afloja toda ropa ajustada (cinturón, corbata, cuello de camisa)',
    'Ventila el área: abre ventanas o lleva a un lugar fresco',
    'NO permitas que se levante bruscamente',
    'NO ofrezcas medicamentos de ningún tipo',
    'Monitorea durante 15 a 20 minutos antes de permitir que se incorpore lentamente',
    'Ofrece agua fría en pequeños sorbos solo cuando esté completamente alerta',
    'No dejes sola a la persona hasta que se recupere completamente'
]).
recomendaciones_desmayo(desmayo_mediano, [
    'Pide ayuda a alguien cercano de inmediato',
    'Acuesta a la persona boca arriba en una superficie plana y segura',
    'Eleva las piernas 30 a 45 cm (usa mochila, silla u objeto disponible)',
    'Verifica respiración y pulso',
    'Afloja toda la ropa apretada (cinturón, cuello de camisa)',
    'Si presenta vómito, gírala a posición lateral de seguridad (de costado)',
    'NO administres medicamentos ni des nada por la boca',
    'Si no despierta en 1 a 2 minutos o hay síntomas de alarma, llama al 911',
    'Una vez consciente, no permitas que se levante rápidamente'
]).
recomendaciones_desmayo(desmayo_grave, [
    'Llama al 911 de inmediato',
    'Mantén la vía aérea despejada: inclina la cabeza hacia atrás y levanta el mentón',
    'Verifica respiración y pulso (máximo 10 segundos)',
    'Si no hay pulso ni respiración: inicia RCP (30 compresiones + 2 ventilaciones)',
    'Si respira pero está inconsciente: coloca en posición lateral de seguridad',
    'NO muevas a la persona si sospechas traumatismo en cuello o columna',
    'NO administres medicamentos de ningún tipo',
    'Controla hemorragias si hubo golpe durante la caída',
    'Permanece junto a la persona hasta que llegue ayuda profesional'
]).

% --- Opciones de cada pregunta -> lista de síntomas ---
opcion_desmayo(1, 'Consciente, responde y puede hablar',              [consciente]).
opcion_desmayo(1, 'Confundida o desorientada, responde poco',         [semi_consciente]).
opcion_desmayo(1, 'No responde a nada, inconsciente',                 [inconsciente]).
opcion_desmayo(2, 'Sí, respira y tiene pulso normal',                 [respira_bien]).
opcion_desmayo(2, 'Respira con dificultad o pulso débil',             [respira_mal]).
opcion_desmayo(2, 'No respira o no se detecta pulso',                 [sin_respiracion]).
opcion_desmayo(3, 'No perdió la conciencia (solo mareo/debilidad)',   [no_perdio_conciencia]).
opcion_desmayo(3, 'Menos de 2 minutos inconsciente',                  [menos_2min]).
opcion_desmayo(3, 'Más de 2 minutos inconsciente',                    [mas_2min]).
opcion_desmayo(4, 'Ninguna señal adicional',                          [sin_alarma]).
opcion_desmayo(4, 'Presenta convulsiones',                            [convulsiones]).
opcion_desmayo(4, 'Piel azulada (cianosis) o dificultad respiratoria', [cianosis]).
opcion_desmayo(4, 'Dolor en el pecho o antecedentes cardíacos',       [cardiaco]).
opcion_desmayo(4, 'Golpe fuerte en la cabeza al caer',                [traumatismo]).

% --- Síntomas que disparan la alerta 911 (sin cambios) ---
sintoma_emergencia_desmayo(inconsciente).
sintoma_emergencia_desmayo(sin_respiracion).
sintoma_emergencia_desmayo(mas_2min).
sintoma_emergencia_desmayo(convulsiones).
sintoma_emergencia_desmayo(cianosis).
sintoma_emergencia_desmayo(cardiaco).
sintoma_emergencia_desmayo(traumatismo).
sintoma_emergencia_desmayo(respira_mal).

% --- Disparadores de severidad media (piso de seguridad) ---
% Copiados de la antigua regla nivel_desmayo(mediano): garantizan que ninguna
% combinación que antes daba "medium" baje a "low" por el porcentaje.
sintoma_moderado_desmayo(menos_2min).

% --- Predicados públicos del módulo (delegan en el motor común) ---
respuestas_desmayo_a_sintomas(Respuestas, Sintomas) :-
    pm_respuestas_a_sintomas(desmayo, Respuestas, Sintomas).

pct_caso_desmayo(Caso, Sintomas, Pct) :-
    pm_pct_caso(desmayo, Caso, Sintomas, Pct).

resultados_desmayo(Respuestas, Umbral, Resultados, ExactOnly) :-
    respuestas_desmayo_a_sintomas(Respuestas, Sintomas),
    pm_resultados(desmayo, Sintomas, Umbral, Resultados, ExactOnly).

hay_emergencia_desmayo(Sintomas) :-
    pm_hay_emergencia(desmayo, Sintomas).

severidad_desmayo(EsEmergencia, Caso, Severidad) :-
    pm_severidad_caso(desmayo, EsEmergencia, Caso, Severidad).

diagnostico_desmayo(Respuestas, EsEmergencia, Severidad, Recomendaciones, Caso, Pct, Accion, Resultados, ExactOnly) :-
    pm_diagnostico(desmayo, Respuestas, EsEmergencia, Severidad, Recomendaciones, Caso, Pct, Accion, Resultados, ExactOnly).

diagnostico(desmayo, Respuestas, EsEmergencia, Severidad, Recomendaciones) :-
    diagnostico_desmayo(Respuestas, EsEmergencia, Severidad, Recomendaciones, _Caso, _Pct, _Accion, _Resultados, _ExactOnly).

% ============================================================
% MÓDULO: ASFIXIA  (esquema de porcentaje de coincidencia)
% ============================================================

caso_asfixia(asfixia_leve, [obstruccion_parcial, tos_fuerte, puede_hablar, consciente]).
caso_asfixia(asfixia_moderada, [obstruccion_total, no_habla, tos_ineficaz, consciente]).
caso_asfixia(asfixia_grave, [inconsciente, sin_respiracion]).

accion_asfixia(asfixia_leve,
    'Anima a toser con fuerza; permanece junto a la persona; si empeora, llama al 911').
accion_asfixia(asfixia_moderada,
    'Aplica maniobra de Heimlich; si no mejora en pocos intentos, llama al 911; continúa hasta expulsar el objeto o pierda la conciencia').
accion_asfixia(asfixia_grave,
    'Llama al 911 de inmediato; inicia RCP con compresiones torácicas; revisa la boca antes de cada ventilación').

recomendaciones_asfixia(asfixia_leve, [
    'Anima a toser fuerte y vigila la respiración', 'Inclina a la persona ligeramente hacia adelante',
    'No des liquidos ni alimentos', 'Si la tos se vuelve ineficaz o empeora, llama al 911'
]).
recomendaciones_asfixia(asfixia_moderada, [
    'Pregunta si se está asfixiando y confirma que no puede hablar','Aplica maniobra de Heimlich con compresiones hacia adentro y arriba',
    'Alterna con 5 golpes en la espalda si es seguro hacerlo','Si no mejora en pocos intentos, llama al 911',
    'Si pierde la conciencia, inicia RCP'
]).
recomendaciones_asfixia(asfixia_grave, [
    'Llama al 911 de inmediato','Coloca a la persona boca arriba en superficie plana','Inicia RCP con compresiones torácicas',
    'Revisa la boca antes de cada ventilación de rescate','Si vuelve a respirar, coloca en posición lateral de seguridad'
]).

opcion_asfixia(1, 'Puede hablar y toser con fuerza', [puede_hablar, tos_fuerte, obstruccion_parcial]).
opcion_asfixia(1, 'Puede hablar pero la tos es débil', [puede_hablar, tos_debil, obstruccion_parcial]).
opcion_asfixia(1, 'No puede hablar, tos débil o ineficaz', [no_habla, tos_ineficaz, obstruccion_total]).
opcion_asfixia(1, 'No emite sonidos ni puede toser', [no_habla, sin_tos, obstruccion_total]).

opcion_asfixia(2, 'Respira con dificultad o ruidos', [respiracion_dificultosa]).
opcion_asfixia(2, 'Respiración ausente', [sin_respiracion]).
opcion_asfixia(2, 'Respiración normal', [respiracion_normal]).
opcion_asfixia(2, 'No estoy seguro', []).

opcion_asfixia(3, 'Color normal', []).
opcion_asfixia(3, 'Enrojecimiento en rostro', [enrojecimiento]).
opcion_asfixia(3, 'Color azulado (cianosis)', [cianosis]).

opcion_asfixia(4, 'Consciente y alerta', [consciente]).
opcion_asfixia(4, 'Agitado o confundido', [consciente, agitado]).
opcion_asfixia(4, 'Inconsciente', [inconsciente]).

opcion_asfixia(5, 'Atragantamiento con comida u objeto', [causa_obstructiva]).
opcion_asfixia(5, 'Compresión del cuello o tórax', [causa_mecanica]).
opcion_asfixia(5, 'Ahogamiento por agua', [causa_sumersion]).
opcion_asfixia(5, 'Inhalación de humo o gases', [causa_toxica]).
opcion_asfixia(5, 'Posición que dificulta respirar', [causa_posicional]).
opcion_asfixia(5, 'No estoy seguro', []).

sintoma_emergencia_asfixia(sin_respiracion).
sintoma_emergencia_asfixia(inconsciente).
sintoma_emergencia_asfixia(cianosis).

% --- Gravedad de cada caso (igual que la antigua severidad_asfixia) ---
gravedad_caso_asfixia(asfixia_leve, low).
gravedad_caso_asfixia(asfixia_moderada, medium).
gravedad_caso_asfixia(asfixia_grave, high).

% --- Disparadores de severidad media (piso de seguridad) ---
% REVISAR POR PERSONAL DE SALUD: la obstrucción total (no puede hablar ni
% toser con eficacia) se trata al menos como severidad media.
sintoma_moderado_asfixia(obstruccion_total).

% --- Predicados públicos del módulo (delegan en el motor común) ---
respuestas_asfixia_a_sintomas(Respuestas, Sintomas) :-
    pm_respuestas_a_sintomas(asfixia, Respuestas, Sintomas).

pct_caso_asfixia(Caso, Sintomas, Pct) :-
    pm_pct_caso(asfixia, Caso, Sintomas, Pct).

resultados_asfixia(Respuestas, Umbral, Resultados, ExactOnly) :-
    respuestas_asfixia_a_sintomas(Respuestas, Sintomas),
    pm_resultados(asfixia, Sintomas, Umbral, Resultados, ExactOnly).

hay_emergencia_asfixia(Sintomas) :-
    pm_hay_emergencia(asfixia, Sintomas).

severidad_asfixia(EsEmergencia, Caso, Severidad) :-
    pm_severidad_caso(asfixia, EsEmergencia, Caso, Severidad).

diagnostico_asfixia(Respuestas, EsEmergencia, Severidad, Recomendaciones, Caso, Pct, Accion, Resultados, ExactOnly) :-
    pm_diagnostico(asfixia, Respuestas, EsEmergencia, Severidad, Recomendaciones, Caso, Pct, Accion, Resultados, ExactOnly).

diagnostico(asfixia, Respuestas, EsEmergencia, Severidad, Recomendaciones) :-
    diagnostico_asfixia(Respuestas, EsEmergencia, Severidad, Recomendaciones, _Caso, _Pct, _Accion, _Resultados, _ExactOnly).

% ============================================================
% MÓDULO: QUEMADURA  (esquema de porcentaje de coincidencia)
% ============================================================

% --- Casos ---
caso_quemadura(quemadura_leve,      [enrojecimiento, dolor_leve, piel_seca]).
caso_quemadura(quemadura_moderada,  [dolor_intenso, ampollas, piel_humeda]).
caso_quemadura(quemadura_grave,     [piel_carbonizada, piel_blanca, necrosis]).
caso_quemadura(quemadura_quimica,   [dolor_quimico, necrosis, cambio_color]).
caso_quemadura(quemadura_electrica, [lesion_pequena_externa, arritmia, daño_profundo]).
caso_quemadura(quemadura_radiacion, [eritema, descamacion, dolor_moderado]).

% --- Acciones ---
accion_quemadura(quemadura_leve,
    'Enfriar con agua fresca 10-20 min, cubrir con gasa limpia, evitar remedios caseros').
accion_quemadura(quemadura_moderada,
    'Enfriar con agua corriente, NO romper ampollas, cubrir con apósito estéril, consultar médico si >5 cm').
accion_quemadura(quemadura_grave,
    'Llamar al 911 de inmediato, cubrir con paño limpio y seco, NO aplicar sustancias, mantener calmado y abrigado').
accion_quemadura(quemadura_quimica,
    'Lavar con abundante agua, retirar ropa contaminada, atención médica inmediata').
accion_quemadura(quemadura_electrica,
    'Atención médica urgente, monitorización cardíaca, NO subestimar lesión externa').
accion_quemadura(quemadura_radiacion,
    'Enfriar piel, aplicar cremas hidratantes, evitar nueva exposición solar o radiación').


% --- Recomendaciones ---
recomendaciones_quemadura(quemadura_leve, [
    'Enfría la zona con agua fría corriente por 10-20 minutos',
    'Cubre con gasa estéril o tela limpia',
    'No apliques remedios caseros',
    'Consulta médico si la quemadura es extensa'
]).
recomendaciones_quemadura(quemadura_moderada, [
    'Enfría con agua corriente',
    'No revientes las ampollas',
    'Cubre con apósito estéril',
    'Consulta médico si la quemadura es mayor a 5 cm'
]).
recomendaciones_quemadura(quemadura_grave, [
    'Llama al 911 inmediatamente',
    'NO apliques hielo, mantequilla ni pasta de dientes',
    'Cubre con tela limpia y seca sin presionar',
    'No retires ropa adherida a la piel',
    'Mantén a la persona calmada y abrigada'
]).
recomendaciones_quemadura(quemadura_quimica, [
    'Lavar con abundante agua',
    'Retirar ropa contaminada',
    'Atención médica inmediata'
]).
recomendaciones_quemadura(quemadura_electrica, [
    'Atención médica urgente',
    'Monitorización cardíaca',
    'NO subestimar lesión externa'
]).
recomendaciones_quemadura(quemadura_radiacion, [
    'Enfriar piel',
    'Aplicar cremas hidratantes',
    'Evitar nueva exposición solar o radiación'
]).


% --- Opciones de síntomas para quemadura ---
opcion_quemadura(1, 'Enrojecimiento leve', [enrojecimiento, dolor_leve, piel_seca]).
opcion_quemadura(1, 'Ampollas y dolor', [dolor_intenso, ampollas, piel_humeda]).
opcion_quemadura(1, 'Piel blanca o carbonizada', [piel_carbonizada, piel_blanca, necrosis]).
% REVISAR POR PERSONAL DE SALUD: química y eléctrica separadas (antes una sola
% opción con ambos grupos de síntomas) y opción nueva de sol o radiación.
% Química conserva necrosis y eléctrica conserva arritmia (alerta 911).
opcion_quemadura(1, 'Lesión química', [dolor_quimico, necrosis]).
opcion_quemadura(1, 'Lesión eléctrica', [lesion_pequena_externa, arritmia, daño_profundo]).
opcion_quemadura(1, 'Quemadura por sol o radiación', [eritema]).
opcion_quemadura(1, 'No estoy seguro', []).

opcion_quemadura(2, 'Brazo o pierna', []).
opcion_quemadura(2, 'Cara, cuello o manos', []).
opcion_quemadura(2, 'Torso o espalda', []).
opcion_quemadura(2, 'Zona extensa', []).
opcion_quemadura(2, 'No estoy seguro', []).

opcion_quemadura(3, 'Solo enrojecimiento', [enrojecimiento, dolor_leve, piel_seca]).
opcion_quemadura(3, 'Ampollas visibles', [dolor_intenso, ampollas, piel_humeda]).
opcion_quemadura(3, 'Piel carbonizada/blanca', [piel_carbonizada, piel_blanca, necrosis]).
% REVISAR POR PERSONAL DE SALUD: opciones nuevas (radiación y química).
opcion_quemadura(3, 'Piel pelada o descamada', [descamacion]).
opcion_quemadura(3, 'Cambio de color de la piel (manchas oscuras o amarillentas)', [cambio_color]).
opcion_quemadura(3, 'No estoy seguro', []).

opcion_quemadura(4, 'Hace pocos minutos y no traté', []).
opcion_quemadura(4, 'Lo enfrié con agua', []).
opcion_quemadura(4, 'Apliqué hielo o crema', []).
opcion_quemadura(4, 'No estoy seguro', []).

opcion_quemadura(5, 'Dolor intenso', [dolor_intenso]).
% REVISAR POR PERSONAL DE SALUD: opción nueva (radiación).
opcion_quemadura(5, 'Dolor moderado', [dolor_moderado]).
opcion_quemadura(5, 'Dificultad para respirar', [dificultad_respirar]).
opcion_quemadura(5, 'Signos de infección/necrosis', [necrosis]).
opcion_quemadura(5, 'Ninguno de los anteriores', []).

% --- Síntomas que disparan la alerta 911 (sin cambios) ---
sintoma_emergencia_quemadura(piel_carbonizada).
sintoma_emergencia_quemadura(necrosis).
sintoma_emergencia_quemadura(arritmia).
sintoma_emergencia_quemadura(dificultad_respirar).

% --- Gravedad de cada caso ---
% grave/moderada/leve igual que la antigua severidad_quemadura.
% REVISAR POR PERSONAL DE SALUD: química y eléctrica se consideran graves;
% radiación se considera leve.
gravedad_caso_quemadura(quemadura_leve, low).
gravedad_caso_quemadura(quemadura_moderada, medium).
gravedad_caso_quemadura(quemadura_grave, high).
gravedad_caso_quemadura(quemadura_quimica, high).
gravedad_caso_quemadura(quemadura_electrica, high).
gravedad_caso_quemadura(quemadura_radiacion, low).

% --- Disparadores de severidad media (piso de seguridad) ---
sintoma_moderado_quemadura(ampollas).
sintoma_moderado_quemadura(dolor_intenso).

% --- Predicados públicos del módulo (delegan en el motor común) ---
respuestas_quemadura_a_sintomas(Respuestas, Sintomas) :-
    pm_respuestas_a_sintomas(quemadura, Respuestas, Sintomas).

pct_caso_quemadura(Caso, Sintomas, Pct) :-
    pm_pct_caso(quemadura, Caso, Sintomas, Pct).

resultados_quemadura(Respuestas, Umbral, Resultados, ExactOnly) :-
    respuestas_quemadura_a_sintomas(Respuestas, Sintomas),
    pm_resultados(quemadura, Sintomas, Umbral, Resultados, ExactOnly).

hay_emergencia_quemadura(Sintomas) :-
    pm_hay_emergencia(quemadura, Sintomas).

severidad_quemadura(EsEmergencia, Caso, Severidad) :-
    pm_severidad_caso(quemadura, EsEmergencia, Caso, Severidad).

diagnostico_quemadura(Respuestas, EsEmergencia, Severidad, Recomendaciones, Caso, Pct, Accion, Resultados, ExactOnly) :-
    pm_diagnostico(quemadura, Respuestas, EsEmergencia, Severidad, Recomendaciones, Caso, Pct, Accion, Resultados, ExactOnly).

diagnostico(quemadura, Respuestas, EsEmergencia, Severidad, Recomendaciones) :-
    diagnostico_quemadura(Respuestas, EsEmergencia, Severidad, Recomendaciones, _Caso, _Pct, _Accion, _Resultados, _ExactOnly).

% ============================================================
% MÓDULO: FRACTURA  (esquema de porcentaje de coincidencia)
% Casos = listas de síntomas; el motor común (sección MOTOR DE
% PORCENTAJE) calcula Pct = coincidencias*100 // total.
% ============================================================

pregunta(fractura, 1, 'Zona del cuerpo lesionada').
pregunta(fractura, 2, 'Apariencia visual de la lesión').
pregunta(fractura, 3, 'Capacidad de movimiento en la zona').
pregunta(fractura, 4, 'Intensidad del dolor').
pregunta(fractura, 5, 'Síntomas adicionales o señales de alarma').

total_preguntas(fractura, 5).

% --- Casos (un síntoma por pregunta como máximo) ---
% REVISAR POR PERSONAL DE SALUD: la composición de cada caso es criterio
% clínico derivado de las reglas nivel_fractura y de las opciones existentes.
% REVISAR POR PERSONAL DE SALUD: No caben todos los síntomas de emergencia en un solo caso (p. ej. columna, hormigueo, shock); la alerta 911 y la severidad high no dependen del caso ganador.
caso_fractura(fractura_leve,     [inflamacion_frac, movimiento_doloroso_frac, dolor_leve_frac, sin_alarma_frac]).
caso_fractura(fractura_moderada, [deformidad_frac, no_puede_mover_frac, dolor_intenso_frac, sin_alarma_frac]).
caso_fractura(fractura_grave,    [hueso_expuesto, no_puede_mover_frac, dolor_intenso_frac, sangrado_frac]).

% --- Gravedad de cada caso (low < medium < high) ---
gravedad_caso_fractura(fractura_leve, low).
gravedad_caso_fractura(fractura_moderada, medium).
gravedad_caso_fractura(fractura_grave, high).

% --- Acciones principales (texto original sin cambios) ---
accion_fractura(fractura_leve,
    'Inmoviliza la zona sin apoyar peso, aplica hielo envuelto en tela 15-20 min, eleva la extremidad, consulta a urgencias para radiografía').
accion_fractura(fractura_moderada,
    'Inmoviliza con férula improvisada, no intentes realinear el hueso, aplica hielo 20 min, traslada a urgencias para radiografía').
accion_fractura(fractura_grave,
    'Llama al 911, no muevas a la persona si sospechas lesión en columna, cubre hueso expuesto con gasa limpia sin presionar, mantén calmada y abrigada').

% --- Recomendaciones (texto original de diagnostico/5, sin cambios) ---
recomendaciones_fractura(fractura_leve, [
    'Inmoviliza la zona y evita apoyar o cargar peso sobre ella',
    'Aplica hielo envuelto en tela 15-20 minutos para la inflamación',
    'Eleva la extremidad afectada',
    'Consulta a urgencias para descartar fractura con radiografía',
    'No fuerces movimiento aunque el dolor sea tolerable',
    'Evita masajear la zona afectada'
]).
recomendaciones_fractura(fractura_moderada, [
    'Inmoviliza la zona usando férulas improvisadas (tabla, revista, cartón) con vendas',
    'NO intentes realinear el hueso ni forzar una posición',
    'Aplica hielo envuelto en tela durante 20 minutos para reducir la inflamación',
    'Eleva la extremidad si es posible y no aumenta el dolor',
    'Traslada a urgencias lo antes posible para radiografía',
    'Monitorea circulación distal: color, temperatura y pulso en dedos'
]).
recomendaciones_fractura(fractura_grave, [
    'Llama al 911 de inmediato',
    'NO muevas a la persona si sospechas lesión en columna o cuello',
    'Si hay hueso expuesto, cubre con gasa limpia sin presionar ni intentar recolocar el hueso',
    'Controla el sangrado aplicando presión suave alrededor de la herida, no sobre ella',
    'Si hay hormigueo o pérdida de sensibilidad, inmoviliza sin forzar ninguna posición',
    'Mantén a la persona calmada y abrigada hasta que llegue la ayuda',
    'NO administres alimentos ni medicamentos por la boca'
]).

% --- Opciones de cada pregunta -> lista de síntomas ---
opcion_fractura(1, 'Brazo, antebrazo o muñeca',            [extremidad_superior]).
opcion_fractura(1, 'Pierna, muslo o tobillo',              [extremidad_inferior]).
opcion_fractura(1, 'Costilla o tórax',                     [zona_torax]).
opcion_fractura(1, 'Columna vertebral o cuello',           [zona_columna]).
opcion_fractura(1, 'Mano, pie o dedo',                     [extremidad_periferica]).
opcion_fractura(1, 'No estoy seguro',                      [zona_desconocida]).
opcion_fractura(2, 'Hueso visiblemente expuesto',          [hueso_expuesto]).
opcion_fractura(2, 'Deformidad visible sin hueso expuesto', [deformidad_frac]).
opcion_fractura(2, 'Solo inflamación o moretón',           [inflamacion_frac]).
opcion_fractura(2, 'Sin cambios visibles',                 [sin_deformidad_frac]).
opcion_fractura(3, 'No puede moverla en absoluto',         [no_puede_mover_frac]).
opcion_fractura(3, 'Puede moverla con mucho dolor',        [movimiento_muy_doloroso]).
opcion_fractura(3, 'Puede moverla con algo de dolor',      [movimiento_doloroso_frac]).
opcion_fractura(3, 'Movimiento normal con dolor leve',     [movimiento_normal_frac]).
opcion_fractura(4, 'Dolor muy intenso y constante',        [dolor_intenso_frac]).
opcion_fractura(4, 'Dolor moderado al presionar',          [dolor_moderado_frac]).
opcion_fractura(4, 'Dolor leve o puntual',                 [dolor_leve_frac]).
opcion_fractura(4, 'Sin dolor significativo',              [sin_dolor_frac]).
opcion_fractura(5, 'Hormigueo o pérdida de sensibilidad',  [hormigueo_frac]).
opcion_fractura(5, 'Piel pálida, fría o sudoración fría',  [shock_frac]).
opcion_fractura(5, 'Hemorragia visible en la zona',        [sangrado_frac]).
opcion_fractura(5, 'Ninguno de los anteriores',            [sin_alarma_frac]).

% --- Síntomas que disparan la alerta 911 (sin cambios) ---
sintoma_emergencia_fractura(hueso_expuesto).
sintoma_emergencia_fractura(zona_columna).
sintoma_emergencia_fractura(hormigueo_frac).
sintoma_emergencia_fractura(shock_frac).
sintoma_emergencia_fractura(sangrado_frac).

% --- Disparadores de severidad media (piso de seguridad) ---
% Copiados de la antigua regla nivel_fractura(moderada): garantizan que ninguna
% combinación que antes daba "medium" baje a "low" por el porcentaje.
sintoma_moderado_fractura(deformidad_frac).
sintoma_moderado_fractura(no_puede_mover_frac).
sintoma_moderado_fractura(dolor_intenso_frac).

% --- Predicados públicos del módulo (delegan en el motor común) ---
respuestas_fractura_a_sintomas(Respuestas, Sintomas) :-
    pm_respuestas_a_sintomas(fractura, Respuestas, Sintomas).

pct_caso_fractura(Caso, Sintomas, Pct) :-
    pm_pct_caso(fractura, Caso, Sintomas, Pct).

resultados_fractura(Respuestas, Umbral, Resultados, ExactOnly) :-
    respuestas_fractura_a_sintomas(Respuestas, Sintomas),
    pm_resultados(fractura, Sintomas, Umbral, Resultados, ExactOnly).

hay_emergencia_fractura(Sintomas) :-
    pm_hay_emergencia(fractura, Sintomas).

severidad_fractura(EsEmergencia, Caso, Severidad) :-
    pm_severidad_caso(fractura, EsEmergencia, Caso, Severidad).

diagnostico_fractura(Respuestas, EsEmergencia, Severidad, Recomendaciones, Caso, Pct, Accion, Resultados, ExactOnly) :-
    pm_diagnostico(fractura, Respuestas, EsEmergencia, Severidad, Recomendaciones, Caso, Pct, Accion, Resultados, ExactOnly).

diagnostico(fractura, Respuestas, EsEmergencia, Severidad, Recomendaciones) :-
    diagnostico_fractura(Respuestas, EsEmergencia, Severidad, Recomendaciones, _Caso, _Pct, _Accion, _Resultados, _ExactOnly).

% ============================================================
% MÓDULO: INTOXICACION  (esquema de porcentaje de coincidencia)
% Casos = listas de síntomas; el motor común (sección MOTOR DE
% PORCENTAJE) calcula Pct = coincidencias*100 // total.
% ============================================================

pregunta(intoxicacion, 1, 'Cómo ocurrió la intoxicación').
pregunta(intoxicacion, 2, 'Estado de consciencia de la persona').
pregunta(intoxicacion, 3, 'Tiempo transcurrido desde la exposición').
pregunta(intoxicacion, 4, 'Síntomas que presenta actualmente').
pregunta(intoxicacion, 5, 'Conocimiento sobre la sustancia involucrada').

total_preguntas(intoxicacion, 5).

% --- Casos (un síntoma por pregunta como máximo) ---
% REVISAR POR PERSONAL DE SALUD: la composición de cada caso es criterio
% clínico derivado de las reglas nivel_intoxicacion y de las opciones existentes.
% REVISAR POR PERSONAL DE SALUD: intoxicacion_grave modela ingestión química con inconsciencia y dificultad respiratoria.
caso_intoxicacion(intoxicacion_leve,     [ingestion_alimentos, consciente_tox, nauseas_tox]).
caso_intoxicacion(intoxicacion_moderada, [ingestion_medicamentos, somnolenta_tox, nauseas_tox]).
caso_intoxicacion(intoxicacion_grave,    [ingestion_quimica, inconsciente_tox, dificultad_respirar_tox]).

% --- Gravedad de cada caso (low < medium < high) ---
gravedad_caso_intoxicacion(intoxicacion_leve, low).
gravedad_caso_intoxicacion(intoxicacion_moderada, medium).
gravedad_caso_intoxicacion(intoxicacion_grave, high).

% --- Acciones principales (texto original sin cambios) ---
accion_intoxicacion(intoxicacion_leve,
    'Llama a Centro de Toxicología o urgencias, identifica la sustancia y el tiempo transcurrido, mantén en reposo y observación').
accion_intoxicacion(intoxicacion_moderada,
    'Llama al Centro de Toxicología de inmediato, identifica sustancia y cantidad, no induzcas el vómito, mantén despierta y vigilada').
accion_intoxicacion(intoxicacion_grave,
    'Llama al 911 de inmediato, si está inconsciente y respira colócala de lado, si no respira inicia RCP, no induzcas el vómito').

% --- Recomendaciones (texto original de diagnostico/5, sin cambios) ---
recomendaciones_intoxicacion(intoxicacion_leve, [
    'Llama a urgencias o al Centro de Toxicología para orientación',
    'Identifica la sustancia y el tiempo transcurrido',
    'Mantén a la persona en reposo y bajo observación',
    'Si hay náuseas, ofrece pequeños sorbos de agua (solo si no fue sustancia química)',
    'NO des leche ni carbón activado sin indicación médica',
    'Traslada a urgencias si aparece cualquier síntoma nuevo'
]).
recomendaciones_intoxicacion(intoxicacion_moderada, [
    'Llama al Centro de Toxicología o a urgencias de inmediato',
    'Identifica la sustancia y la cantidad aproximada ingerida',
    'NO induzcas el vómito sin indicación médica',
    'Mantén a la persona despierta y bajo vigilancia constante',
    'Si ingirió medicamentos, guarda el frasco para mostrarlo al médico',
    'Si hay vómito espontáneo, protege la vía aérea colocando de lado',
    'Traslada a urgencias aunque los síntomas parezcan leves por ahora'
]).
recomendaciones_intoxicacion(intoxicacion_grave, [
    'Llama al 911 de inmediato',
    'Si está inconsciente y respira, coloca en posición lateral de seguridad',
    'Si no respira, inicia RCP de inmediato',
    'NO induzcas el vómito salvo indicación médica expresa',
    'NO des nada por la boca mientras esté inconsciente',
    'Lleva el envase o identifica la sustancia para informar a los médicos',
    'Si fue inhalación, traslada a aire fresco de inmediato',
    'Si fue contacto con piel, lava con agua abundante sin frotar'
]).

% --- Opciones de cada pregunta -> lista de síntomas ---
opcion_intoxicacion(1, 'Ingirió medicamentos en exceso',   [ingestion_medicamentos]).
opcion_intoxicacion(1, 'Ingirió una sustancia química',    [ingestion_quimica]).
opcion_intoxicacion(1, 'Ingirió alimentos en mal estado',  [ingestion_alimentos]).
opcion_intoxicacion(1, 'Inhaló gases, vapores o humo',     [inhalacion_tox]).
opcion_intoxicacion(1, 'Contacto con piel o mucosas',      [contacto_piel_tox]).
opcion_intoxicacion(1, 'No sé cómo ocurrió',               [causa_desconocida_tox]).
opcion_intoxicacion(2, 'Consciente y alerta',              [consciente_tox]).
opcion_intoxicacion(2, 'Confundida o desorientada',        [semi_consciente_tox]).
opcion_intoxicacion(2, 'Somnolenta o difícil de despertar', [somnolenta_tox]).
opcion_intoxicacion(2, 'Inconsciente o no responde',       [inconsciente_tox]).
opcion_intoxicacion(3, 'Hace menos de 1 hora',             [tiempo_reciente_tox]).
opcion_intoxicacion(3, 'Entre 1 y 3 horas',                [tiempo_moderado_tox]).
opcion_intoxicacion(3, 'Más de 3 horas',                   [tiempo_tardio_tox]).
opcion_intoxicacion(3, 'No sé cuándo ocurrió',             [tiempo_desconocido_tox]).
opcion_intoxicacion(4, 'Náuseas o vómito',                 [nauseas_tox]).
opcion_intoxicacion(4, 'Dificultad para respirar',         [dificultad_respirar_tox]).
opcion_intoxicacion(4, 'Convulsiones',                     [convulsiones_tox]).
opcion_intoxicacion(4, 'Quemaduras en boca o garganta',    [quemaduras_internas_tox]).
opcion_intoxicacion(4, 'Dolor abdominal intenso',          [dolor_abdominal_tox]).
opcion_intoxicacion(4, 'Sin síntomas claros por ahora',    [sin_sintomas_tox]).
opcion_intoxicacion(5, 'Sí, sé exactamente qué fue',       [sustancia_conocida_tox]).
opcion_intoxicacion(5, 'Tengo una idea aproximada',        [sustancia_probable_tox]).
opcion_intoxicacion(5, 'No sé qué sustancia fue',          [sustancia_desconocida_tox]).

% --- Síntomas que disparan la alerta 911 (sin cambios) ---
sintoma_emergencia_intoxicacion(inconsciente_tox).
sintoma_emergencia_intoxicacion(convulsiones_tox).
sintoma_emergencia_intoxicacion(dificultad_respirar_tox).
sintoma_emergencia_intoxicacion(quemaduras_internas_tox).

% --- Disparadores de severidad media (piso de seguridad) ---
% Copiados de la antigua regla nivel_intoxicacion(moderada): garantizan que ninguna
% combinación que antes daba "medium" baje a "low" por el porcentaje.
sintoma_moderado_intoxicacion(semi_consciente_tox).
sintoma_moderado_intoxicacion(somnolenta_tox).
sintoma_moderado_intoxicacion(ingestion_quimica).
sintoma_moderado_intoxicacion(ingestion_medicamentos).

% --- Predicados públicos del módulo (delegan en el motor común) ---
respuestas_intoxicacion_a_sintomas(Respuestas, Sintomas) :-
    pm_respuestas_a_sintomas(intoxicacion, Respuestas, Sintomas).

pct_caso_intoxicacion(Caso, Sintomas, Pct) :-
    pm_pct_caso(intoxicacion, Caso, Sintomas, Pct).

resultados_intoxicacion(Respuestas, Umbral, Resultados, ExactOnly) :-
    respuestas_intoxicacion_a_sintomas(Respuestas, Sintomas),
    pm_resultados(intoxicacion, Sintomas, Umbral, Resultados, ExactOnly).

hay_emergencia_intoxicacion(Sintomas) :-
    pm_hay_emergencia(intoxicacion, Sintomas).

severidad_intoxicacion(EsEmergencia, Caso, Severidad) :-
    pm_severidad_caso(intoxicacion, EsEmergencia, Caso, Severidad).

diagnostico_intoxicacion(Respuestas, EsEmergencia, Severidad, Recomendaciones, Caso, Pct, Accion, Resultados, ExactOnly) :-
    pm_diagnostico(intoxicacion, Respuestas, EsEmergencia, Severidad, Recomendaciones, Caso, Pct, Accion, Resultados, ExactOnly).

diagnostico(intoxicacion, Respuestas, EsEmergencia, Severidad, Recomendaciones) :-
    diagnostico_intoxicacion(Respuestas, EsEmergencia, Severidad, Recomendaciones, _Caso, _Pct, _Accion, _Resultados, _ExactOnly).

% ============================================================
% MÓDULO: PICADURA  (esquema de porcentaje de coincidencia)
% Casos = listas de síntomas; el motor común (sección MOTOR DE
% PORCENTAJE) calcula Pct = coincidencias*100 // total.
% ============================================================

pregunta(picadura, 1, 'Tipo de animal que causó la picadura o mordedura').
pregunta(picadura, 2, 'Zona del cuerpo afectada').
pregunta(picadura, 3, 'Síntomas que aparecieron').
pregunta(picadura, 4, 'Antecedentes de alergia a picaduras o venenos').
pregunta(picadura, 5, 'Tiempo transcurrido desde la picadura').

total_preguntas(picadura, 5).

% --- Casos (un síntoma por pregunta como máximo) ---
% REVISAR POR PERSONAL DE SALUD: la composición de cada caso es criterio
% clínico derivado de las reglas nivel_picadura y de las opciones existentes.
% REVISAR POR PERSONAL DE SALUD: picadura_grave modela anafilaxia por insecto; serpiente o escorpión disparan la alerta 911 pero no alcanzan este caso.
caso_picadura(picadura_leve,     [insecto_comun, zona_extremidad_pic, dolor_local_pic, sin_alergia_pic]).
caso_picadura(picadura_moderada, [mamifero, zona_extremidad_pic, herida_profunda_pic, sin_alergia_pic]).
caso_picadura(picadura_grave,    [insecto_comun, dificultad_respirar_pic, alergia_conocida_pic]).

% --- Gravedad de cada caso (low < medium < high) ---
gravedad_caso_picadura(picadura_leve, low).
gravedad_caso_picadura(picadura_moderada, medium).
gravedad_caso_picadura(picadura_grave, high).

% --- Acciones principales (texto original sin cambios) ---
accion_picadura(picadura_leve,
    'Retira el aguijón raspando con una tarjeta, lava con agua y jabón, aplica hielo 10-15 min, observa señales de reacción alérgica').
accion_picadura(picadura_moderada,
    'Lava la herida con agua y jabón 5 minutos, traslada a urgencias para evaluación, aplica hielo, vigila reacción alérgica').
accion_picadura(picadura_grave,
    'Llama al 911 de inmediato, usa adrenalina (EpiPen) si hay disponible y dificultad para respirar, inmoviliza la extremidad, no hagas torniquete ni succiones el veneno').

% --- Recomendaciones (texto original de diagnostico/5, sin cambios) ---
recomendaciones_picadura(picadura_leve, [
    'Retira el aguijón si está presente raspando suavemente con una tarjeta',
    'Lava la zona con agua y jabón',
    'Aplica hielo envuelto en tela durante 10-15 minutos',
    'Puedes aplicar crema con hidrocortisona o tomar un antihistamínico oral',
    'Observa la zona durante las próximas horas por si aparece reacción alérgica',
    'Consulta médico si la inflamación o el dolor aumentan significativamente'
]).
recomendaciones_picadura(picadura_moderada, [
    'Lava la herida con agua y jabón abundante durante al menos 5 minutos',
    'Traslada a urgencias para evaluación médica',
    'Si fue mordedura de mamífero: es necesaria la evaluación para profilaxis antirrábica',
    'Retira el aguijón si está presente raspando con una tarjeta, no con pinzas',
    'Aplica hielo envuelto en tela durante 10-15 minutos',
    'Observa síntomas de reacción alérgica durante las próximas horas'
]).
recomendaciones_picadura(picadura_grave, [
    'Llama al 911 de inmediato',
    'Si hay dificultad para respirar o anafilaxia: aplica adrenalina (EpiPen) si está disponible',
    'Acuesta a la persona y eleva las piernas (excepto si hay dificultad respiratoria)',
    'Si fue mordedura de serpiente: inmoviliza la extremidad por debajo del corazón',
    'NO hagas torniquete, NO cortes la herida, NO intentes succionar el veneno',
    'Si fue escorpión: traslada a urgencias aunque los síntomas sean leves',
    'Retira anillos y pulseras en la zona antes de que aparezca la inflamación',
    'Mantén a la persona calmada y quieta para reducir la circulación del veneno'
]).

% --- Opciones de cada pregunta -> lista de síntomas ---
opcion_picadura(1, 'Abeja, avispa o hormiga',                  [insecto_comun]).
opcion_picadura(1, 'Araña',                                    [arana]).
opcion_picadura(1, 'Serpiente',                                [serpiente]).
opcion_picadura(1, 'Escorpión o alacrán',                      [escorpion]).
opcion_picadura(1, 'Perro u otro mamífero',                    [mamifero]).
opcion_picadura(1, 'No lo identifiqué',                        [animal_desconocido]).
opcion_picadura(2, 'Cara o cuello',                            [zona_cara_cuello_pic]).
opcion_picadura(2, 'Brazo o pierna',                           [zona_extremidad_pic]).
opcion_picadura(2, 'Mano o pie',                               [zona_mano_pie_pic]).
opcion_picadura(2, 'Torso o espalda',                          [zona_torso_pic]).
opcion_picadura(3, 'Solo dolor e inflamación local',           [dolor_local_pic]).
opcion_picadura(3, 'Reacción alérgica: urticaria generalizada', [reaccion_alergica_pic]).
opcion_picadura(3, 'Dificultad para respirar o tragar',        [dificultad_respirar_pic]).
opcion_picadura(3, 'Náuseas, mareo o debilidad general',       [sintomas_sistemicos_pic]).
opcion_picadura(3, 'Entumecimiento que se extiende',           [entumecimiento_pic]).
opcion_picadura(3, 'Herida profunda con sangrado',             [herida_profunda_pic]).
opcion_picadura(4, 'Sí, tiene alergia conocida',               [alergia_conocida_pic]).
opcion_picadura(4, 'No tiene alergias',                        [sin_alergia_pic]).
opcion_picadura(4, 'No lo sé',                                 [alergia_desconocida_pic]).
opcion_picadura(5, 'Hace menos de 30 minutos',                 [pic_reciente]).
opcion_picadura(5, 'Entre 30 min y 2 horas',                   [pic_moderada]).
opcion_picadura(5, 'Más de 2 horas',                           [pic_tardio]).

% --- Síntomas que disparan la alerta 911 (sin cambios) ---
sintoma_emergencia_picadura(reaccion_alergica_pic).
sintoma_emergencia_picadura(dificultad_respirar_pic).
sintoma_emergencia_picadura(serpiente).
sintoma_emergencia_picadura(escorpion).
sintoma_emergencia_picadura(alergia_conocida_pic).

% --- Disparadores de severidad media (piso de seguridad) ---
% Copiados de la antigua regla nivel_picadura(moderada): garantizan que ninguna
% combinación que antes daba "medium" baje a "low" por el porcentaje.
sintoma_moderado_picadura(mamifero).
sintoma_moderado_picadura(sintomas_sistemicos_pic).
sintoma_moderado_picadura(entumecimiento_pic).
sintoma_moderado_picadura(herida_profunda_pic).
sintoma_moderado_picadura(zona_cara_cuello_pic).

% --- Predicados públicos del módulo (delegan en el motor común) ---
respuestas_picadura_a_sintomas(Respuestas, Sintomas) :-
    pm_respuestas_a_sintomas(picadura, Respuestas, Sintomas).

pct_caso_picadura(Caso, Sintomas, Pct) :-
    pm_pct_caso(picadura, Caso, Sintomas, Pct).

resultados_picadura(Respuestas, Umbral, Resultados, ExactOnly) :-
    respuestas_picadura_a_sintomas(Respuestas, Sintomas),
    pm_resultados(picadura, Sintomas, Umbral, Resultados, ExactOnly).

hay_emergencia_picadura(Sintomas) :-
    pm_hay_emergencia(picadura, Sintomas).

severidad_picadura(EsEmergencia, Caso, Severidad) :-
    pm_severidad_caso(picadura, EsEmergencia, Caso, Severidad).

diagnostico_picadura(Respuestas, EsEmergencia, Severidad, Recomendaciones, Caso, Pct, Accion, Resultados, ExactOnly) :-
    pm_diagnostico(picadura, Respuestas, EsEmergencia, Severidad, Recomendaciones, Caso, Pct, Accion, Resultados, ExactOnly).

diagnostico(picadura, Respuestas, EsEmergencia, Severidad, Recomendaciones) :-
    diagnostico_picadura(Respuestas, EsEmergencia, Severidad, Recomendaciones, _Caso, _Pct, _Accion, _Resultados, _ExactOnly).

% ============================================================
% MÓDULO: DESCARGA  (esquema de porcentaje de coincidencia)
% Casos = listas de síntomas; el motor común (sección MOTOR DE
% PORCENTAJE) calcula Pct = coincidencias*100 // total.
% ============================================================

pregunta(descarga, 1, 'Estado de contacto con la fuente eléctrica').
pregunta(descarga, 2, 'Estado de consciencia y respiración').
pregunta(descarga, 3, 'Tipo de corriente o fuente eléctrica').
pregunta(descarga, 4, 'Quemaduras o marcas visibles').
pregunta(descarga, 5, 'Síntomas adicionales').

total_preguntas(descarga, 5).

% --- Casos (un síntoma por pregunta como máximo) ---
% REVISAR POR PERSONAL DE SALUD: la composición de cada caso es criterio
% clínico derivado de las reglas nivel_descarga y de las opciones existentes.
% REVISAR POR PERSONAL DE SALUD: descarga_grave modela alta tensión con inconsciencia, quemaduras y dolor de pecho.
caso_descarga(descarga_leve,     [sin_contacto_desc, consciente_desc, corriente_baja_desc, marcas_leves_desc]).
caso_descarga(descarga_moderada, [sin_contacto_desc, confundido_desc, corriente_baja_desc, quemaduras_desc]).
caso_descarga(descarga_grave,    [inconsciente_desc, corriente_alta_desc, quemaduras_desc, dolor_pecho_desc]).

% --- Gravedad de cada caso (low < medium < high) ---
gravedad_caso_descarga(descarga_leve, low).
gravedad_caso_descarga(descarga_moderada, medium).
gravedad_caso_descarga(descarga_grave, high).

% --- Acciones principales (texto original sin cambios) ---
accion_descarga(descarga_leve,
    'Acude a urgencias para evaluación aunque te sientas bien, informa el tipo de corriente y tiempo de contacto, observa palpitaciones o dolor de pecho').
accion_descarga(descarga_moderada,
    'Traslada a urgencias para evaluación cardíaca, cubre quemaduras con gasa limpia y seca, monitorea respiración y pulso').
accion_descarga(descarga_grave,
    'Llama al 911, nunca toques a la persona si sigue en contacto con la corriente, corta la electricidad antes de acercarte, inicia RCP si no respira').

% --- Recomendaciones (texto original de diagnostico/5, sin cambios) ---
recomendaciones_descarga(descarga_leve, [
    'Acude a urgencias para evaluación médica aunque te sientas bien',
    'Las descargas pueden causar arritmias que aparecen horas después',
    'Informa al médico del tipo de corriente y el tiempo de contacto',
    'Observa palpitaciones, mareo, dolor de pecho o confusión',
    'No conduzcas ni realices actividades físicas hasta recibir alta médica'
]).
recomendaciones_descarga(descarga_moderada, [
    'Traslada a urgencias de inmediato para evaluación cardíaca',
    'Toda descarga requiere monitoreo cardíaco aunque parezca leve',
    'Cubre las quemaduras con gasa limpia y seca',
    'NO apliques agua fría, hielo ni pomadas en quemaduras eléctricas',
    'Mantén a la persona acostada y en reposo',
    'Monitorea respiración y pulso constantemente',
    'Los daños internos pueden ser mayores que los externos visibles'
]).
recomendaciones_descarga(descarga_grave, [
    'Llama al 911 de inmediato',
    'NUNCA toques a la persona si aún está en contacto con la corriente',
    'Corta la electricidad desde el interruptor general antes de acercarte',
    'Si no puedes cortar la corriente, usa un objeto no conductor (madera seca) para alejar a la persona',
    'Si no respira ni tiene pulso: inicia RCP de inmediato',
    'Toda descarga eléctrica requiere evaluación médica urgente aunque la persona parezca estable',
    'Las lesiones internas pueden ser graves aunque la piel no muestre marcas',
    'NO muevas a la persona si sospechas lesión en columna'
]).

% --- Opciones de cada pregunta -> lista de síntomas ---
opcion_descarga(1, 'Sigue en contacto con la fuente eléctrica', [sigue_en_contacto_desc]).
opcion_descarga(1, 'Ya no está en contacto',                   [sin_contacto_desc]).
opcion_descarga(1, 'No estoy seguro',                          [contacto_desconocido_desc]).
opcion_descarga(2, 'Consciente y alerta',                      [consciente_desc]).
opcion_descarga(2, 'Consciente pero confundida',               [confundido_desc]).
opcion_descarga(2, 'Inconsciente pero respira',                [inconsciente_desc]).
opcion_descarga(2, 'No respira o no tiene pulso',              [sin_respiracion_desc]).
opcion_descarga(3, 'Corriente doméstica (110-220V)',           [corriente_baja_desc]).
opcion_descarga(3, 'Alta tensión o línea eléctrica',           [corriente_alta_desc]).
opcion_descarga(3, 'Rayo o relámpago',                         [rayo_desc]).
opcion_descarga(3, 'No lo sé',                                 [fuente_desconocida_desc]).
opcion_descarga(4, 'Quemaduras evidentes de entrada/salida',   [quemaduras_desc]).
opcion_descarga(4, 'Enrojecimiento o marcas leves',            [marcas_leves_desc]).
opcion_descarga(4, 'Sin marcas visibles',                      [sin_marcas_desc]).
opcion_descarga(5, 'Dolor en el pecho o palpitaciones',        [dolor_pecho_desc]).
opcion_descarga(5, 'Convulsiones',                             [convulsiones_desc]).
opcion_descarga(5, 'Parálisis o pérdida de sensibilidad',      [paralisis_desc]).
opcion_descarga(5, 'Solo dolor local en la zona',              [dolor_local_desc]).
opcion_descarga(5, 'Sin síntomas adicionales',                 [sin_sintomas_desc]).

% --- Síntomas que disparan la alerta 911 (sin cambios) ---
sintoma_emergencia_descarga(sigue_en_contacto_desc).
sintoma_emergencia_descarga(inconsciente_desc).
sintoma_emergencia_descarga(sin_respiracion_desc).
sintoma_emergencia_descarga(corriente_alta_desc).
sintoma_emergencia_descarga(rayo_desc).
sintoma_emergencia_descarga(dolor_pecho_desc).
sintoma_emergencia_descarga(convulsiones_desc).

% --- Disparadores de severidad media (piso de seguridad) ---
% Copiados de la antigua regla nivel_descarga(moderada): garantizan que ninguna
% combinación que antes daba "medium" baje a "low" por el porcentaje.
sintoma_moderado_descarga(confundido_desc).
sintoma_moderado_descarga(quemaduras_desc).
sintoma_moderado_descarga(paralisis_desc).

% --- Predicados públicos del módulo (delegan en el motor común) ---
respuestas_descarga_a_sintomas(Respuestas, Sintomas) :-
    pm_respuestas_a_sintomas(descarga, Respuestas, Sintomas).

pct_caso_descarga(Caso, Sintomas, Pct) :-
    pm_pct_caso(descarga, Caso, Sintomas, Pct).

resultados_descarga(Respuestas, Umbral, Resultados, ExactOnly) :-
    respuestas_descarga_a_sintomas(Respuestas, Sintomas),
    pm_resultados(descarga, Sintomas, Umbral, Resultados, ExactOnly).

hay_emergencia_descarga(Sintomas) :-
    pm_hay_emergencia(descarga, Sintomas).

severidad_descarga(EsEmergencia, Caso, Severidad) :-
    pm_severidad_caso(descarga, EsEmergencia, Caso, Severidad).

diagnostico_descarga(Respuestas, EsEmergencia, Severidad, Recomendaciones, Caso, Pct, Accion, Resultados, ExactOnly) :-
    pm_diagnostico(descarga, Respuestas, EsEmergencia, Severidad, Recomendaciones, Caso, Pct, Accion, Resultados, ExactOnly).

diagnostico(descarga, Respuestas, EsEmergencia, Severidad, Recomendaciones) :-
    diagnostico_descarga(Respuestas, EsEmergencia, Severidad, Recomendaciones, _Caso, _Pct, _Accion, _Resultados, _ExactOnly).

% ============================================================
% MÓDULO: INSOLACION  (esquema de porcentaje de coincidencia)
% Casos = listas de síntomas; el motor común (sección MOTOR DE
% PORCENTAJE) calcula Pct = coincidencias*100 // total.
% ============================================================

pregunta(insolacion, 1, 'Tiempo de exposición al calor o al sol').
pregunta(insolacion, 2, 'Síntomas que presenta actualmente').
pregunta(insolacion, 3, 'Estado de la piel').
pregunta(insolacion, 4, 'Estado de consciencia').
pregunta(insolacion, 5, 'Hidratación reciente').

total_preguntas(insolacion, 5).

% --- Casos (un síntoma por pregunta como máximo) ---
% REVISAR POR PERSONAL DE SALUD: la composición de cada caso es criterio
% clínico derivado de las reglas nivel_insolacion y de las opciones existentes.
% REVISAR POR PERSONAL DE SALUD: insolacion_moderada = agotamiento por calor (piel húmeda y fría); insolacion_grave = golpe de calor.
caso_insolacion(insolacion_leve,     [exposicion_corta_insol, mareo_insol, piel_enrojecida_insol, consciente_insol, hidratada_insol]).
caso_insolacion(insolacion_moderada, [exposicion_prolongada_insol, nauseas_insol, piel_humeda_fria_insol, consciente_insol, deshidratada_insol]).
caso_insolacion(insolacion_grave,    [exposicion_prolongada_insol, confusion_insol, piel_seca_caliente_insol, confundida_insol]).

% --- Gravedad de cada caso (low < medium < high) ---
gravedad_caso_insolacion(insolacion_leve, low).
gravedad_caso_insolacion(insolacion_moderada, medium).
gravedad_caso_insolacion(insolacion_grave, high).

% --- Acciones principales (texto original sin cambios) ---
accion_insolacion(insolacion_leve,
    'Lleva a un lugar fresco y con sombra, bebe agua a sorbos moderados, aplica un paño húmedo frío en frente y cuello, descansa evitando el sol').
accion_insolacion(insolacion_moderada,
    'Retira del calor a un lugar fresco y ventilado, afloja la ropa, ofrece agua a sorbos frecuentes, aplica paños húmedos fríos en cuello y muñecas').
accion_insolacion(insolacion_grave,
    'Llama al 911 de inmediato, enfría el cuerpo con agua fría en cuello, axilas e ingles, si está inconsciente colócala de lado y no le des líquidos por la boca').

% --- Recomendaciones (texto original de diagnostico/5, sin cambios) ---
recomendaciones_insolacion(insolacion_leve, [
    'Busca un lugar fresco y con sombra de inmediato',
    'Bebe agua fresca a sorbos moderados, no de golpe',
    'Descansa y evita la exposición solar al menos 2 horas',
    'Aplica un paño húmedo frío en la frente y cuello',
    'Evita bebidas con cafeína o alcohol',
    'Si los síntomas no mejoran en 1 hora, busca atención médica'
]).
recomendaciones_insolacion(insolacion_moderada, [
    'Retira a la persona del sol o calor de inmediato',
    'Lleva a un lugar fresco, con sombra y ventilación',
    'Afloja o retira ropa innecesaria',
    'Ofrece agua fresca a sorbos pequeños y frecuentes',
    'Aplica paños húmedos fríos en frente, cuello y muñecas',
    'Recuéstala con las piernas ligeramente elevadas',
    'Traslada a urgencias si no mejora en 30 minutos o los síntomas empeoran'
]).
recomendaciones_insolacion(insolacion_grave, [
    'Llama al 911 de inmediato: el golpe de calor es una emergencia vital',
    'Lleva a la persona a un lugar fresco y con sombra de inmediato',
    'Enfría el cuerpo con todo lo disponible: agua fría, paños húmedos, abanico',
    'Si está inconsciente, coloca en posición lateral de seguridad',
    'Aplica agua fría en cuello, axilas e ingles para bajar la temperatura rápido',
    'NO des líquidos por la boca si está inconsciente o muy confundida',
    'Si está consciente y puede tragar, ofrece agua fría a pequeños sorbos',
    'Continúa enfriando hasta que llegue la ayuda médica'
]).

% --- Opciones de cada pregunta -> lista de síntomas ---
opcion_insolacion(1, 'Menos de 1 hora',                        [exposicion_corta_insol]).
opcion_insolacion(1, 'Entre 1 y 3 horas',                      [exposicion_moderada_insol]).
opcion_insolacion(1, 'Más de 3 horas',                         [exposicion_prolongada_insol]).
opcion_insolacion(1, 'No estoy seguro',                        [exposicion_desconocida_insol]).
opcion_insolacion(2, 'Mareo y debilidad',                      [mareo_insol]).
opcion_insolacion(2, 'Dolor de cabeza intenso',                [cefalea_insol]).
opcion_insolacion(2, 'Náuseas o vómito',                       [nauseas_insol]).
opcion_insolacion(2, 'Calambres musculares',                   [calambres_insol]).
opcion_insolacion(2, 'Confusión o comportamiento extraño',     [confusion_insol]).
opcion_insolacion(2, 'Pérdida de consciencia',                 [desmayo_insol]).
opcion_insolacion(3, 'Piel muy caliente, seca, sin sudoración', [piel_seca_caliente_insol]).
opcion_insolacion(3, 'Piel húmeda, pálida y fría al tacto',    [piel_humeda_fria_insol]).
opcion_insolacion(3, 'Piel enrojecida con algo de sudoración', [piel_enrojecida_insol]).
opcion_insolacion(3, 'Sin cambios evidentes en la piel',       [sin_cambios_piel_insol]).
opcion_insolacion(4, 'Consciente y orientada',                 [consciente_insol]).
opcion_insolacion(4, 'Confundida o desorientada',              [confundida_insol]).
opcion_insolacion(4, 'Somnolenta, difícil de despertar',       [somnolenta_insol]).
opcion_insolacion(4, 'Inconsciente',                           [inconsciente_insol]).
opcion_insolacion(5, 'Sí, ha bebido agua recientemente',       [hidratada_insol]).
opcion_insolacion(5, 'No ha bebido agua en horas',             [deshidratada_insol]).
opcion_insolacion(5, 'No estoy seguro',                        [hidratacion_desconocida_insol]).

% --- Síntomas que disparan la alerta 911 (sin cambios) ---
sintoma_emergencia_insolacion(piel_seca_caliente_insol).
sintoma_emergencia_insolacion(confusion_insol).
sintoma_emergencia_insolacion(desmayo_insol).
sintoma_emergencia_insolacion(inconsciente_insol).
sintoma_emergencia_insolacion(confundida_insol).
sintoma_emergencia_insolacion(somnolenta_insol).

% --- Disparadores de severidad media (piso de seguridad) ---
% Copiados de la antigua regla nivel_insolacion(moderada): garantizan que ninguna
% combinación que antes daba "medium" baje a "low" por el porcentaje.
sintoma_moderado_insolacion(exposicion_prolongada_insol).
sintoma_moderado_insolacion(deshidratada_insol).
sintoma_moderado_insolacion(nauseas_insol).
sintoma_moderado_insolacion(cefalea_insol).

% --- Predicados públicos del módulo (delegan en el motor común) ---
respuestas_insolacion_a_sintomas(Respuestas, Sintomas) :-
    pm_respuestas_a_sintomas(insolacion, Respuestas, Sintomas).

pct_caso_insolacion(Caso, Sintomas, Pct) :-
    pm_pct_caso(insolacion, Caso, Sintomas, Pct).

resultados_insolacion(Respuestas, Umbral, Resultados, ExactOnly) :-
    respuestas_insolacion_a_sintomas(Respuestas, Sintomas),
    pm_resultados(insolacion, Sintomas, Umbral, Resultados, ExactOnly).

hay_emergencia_insolacion(Sintomas) :-
    pm_hay_emergencia(insolacion, Sintomas).

severidad_insolacion(EsEmergencia, Caso, Severidad) :-
    pm_severidad_caso(insolacion, EsEmergencia, Caso, Severidad).

diagnostico_insolacion(Respuestas, EsEmergencia, Severidad, Recomendaciones, Caso, Pct, Accion, Resultados, ExactOnly) :-
    pm_diagnostico(insolacion, Respuestas, EsEmergencia, Severidad, Recomendaciones, Caso, Pct, Accion, Resultados, ExactOnly).

diagnostico(insolacion, Respuestas, EsEmergencia, Severidad, Recomendaciones) :-
    diagnostico_insolacion(Respuestas, EsEmergencia, Severidad, Recomendaciones, _Caso, _Pct, _Accion, _Resultados, _ExactOnly).

% ============================================================
% MÓDULO: CONVULSION  (esquema de porcentaje de coincidencia)
% Casos = listas de síntomas; el motor común (sección MOTOR DE
% PORCENTAJE) calcula Pct = coincidencias*100 // total.
% ============================================================

pregunta(convulsion, 1, 'Estado actual de la convulsión').
pregunta(convulsion, 2, 'Duración de la convulsión').
pregunta(convulsion, 3, 'Antecedentes de epilepsia o convulsiones previas').
pregunta(convulsion, 4, 'Estado posterior a la convulsión').
pregunta(convulsion, 5, 'Causa aparente de la convulsión').

total_preguntas(convulsion, 5).

% --- Casos (un síntoma por pregunta como máximo) ---
% REVISAR POR PERSONAL DE SALUD: la composición de cada caso es criterio
% clínico derivado de las reglas nivel_convulsion y de las opciones existentes.
% REVISAR POR PERSONAL DE SALUD: convulsion_moderada modela convulsión febril breve con periodo post-ictal.
caso_convulsion(convulsion_leve,     [convulsion_terminada, conv_menos_2min, epileptico_conv, recuperado_conv, sin_causa_conv]).
caso_convulsion(convulsion_moderada, [convulsion_terminada, conv_menos_2min, post_ictal_conv, conv_fiebre]).
caso_convulsion(convulsion_grave,    [convulsionando_ahora, conv_mas_5min, convulsiones_repetidas_conv]).

% --- Gravedad de cada caso (low < medium < high) ---
gravedad_caso_convulsion(convulsion_leve, low).
gravedad_caso_convulsion(convulsion_moderada, medium).
gravedad_caso_convulsion(convulsion_grave, high).

% --- Acciones principales (texto original sin cambios) ---
accion_convulsion(convulsion_leve,
    'Coloca en posición lateral de seguridad al terminar, deja que descanse en lugar tranquilo, no la dejes sola, comunica el episodio al médico').
accion_convulsion(convulsion_moderada,
    'Protege la cabeza y despeja el área, cronometra la duración, coloca en posición lateral de seguridad al terminar, traslada a urgencias').
accion_convulsion(convulsion_grave,
    'Llama al 911 de inmediato, protege la cabeza, no introduzcas nada en la boca ni la sujetes con fuerza, posición lateral de seguridad al terminar').

% --- Recomendaciones (texto original de diagnostico/5, sin cambios) ---
recomendaciones_convulsion(convulsion_leve, [
    'Si es epiléptico conocido y la convulsión fue breve, observa la recuperación',
    'Coloca en posición lateral de seguridad tras la convulsión',
    'Deja que descanse en un lugar tranquilo y seguro',
    'No dejes sola a la persona durante al menos 30 minutos',
    'Ofrece agua y tranquilidad cuando esté completamente alerta',
    'Comunica el episodio al médico tratante en las próximas horas',
    'Llama al 911 si hay segunda convulsión, dificultad respiratoria o no recupera la consciencia'
]).
recomendaciones_convulsion(convulsion_moderada, [
    'Protege a la persona de golpearse durante la convulsión',
    'Coloca algo suave bajo la cabeza y despeja el área',
    'Cronometra la duración: si supera 5 minutos, llama al 911',
    'Al terminar, coloca en posición lateral de seguridad',
    'Habla con calma cuando recupere la consciencia: puede estar confundida',
    'Traslada a urgencias para evaluación, especialmente si fue por fiebre alta',
    'NO ofrezcas agua ni alimentos hasta que esté completamente alerta'
]).
recomendaciones_convulsion(convulsion_grave, [
    'Llama al 911 de inmediato',
    'Protege la cabeza: coloca algo suave debajo (ropa doblada)',
    'Despeja el área: aleja objetos duros o cortantes',
    'NO introduzcas nada en la boca, NO sostengas a la persona con fuerza',
    'NO intentes sujetar las extremidades ni detener los movimientos convulsivos',
    'Si la convulsión dura más de 5 minutos, es una emergencia neurológica crítica',
    'Al terminar, coloca en posición lateral de seguridad para evitar aspiración',
    'Anota la duración y las características para informar al médico'
]).

% --- Opciones de cada pregunta -> lista de síntomas ---
opcion_convulsion(1, 'Sigue convulsionando ahora mismo', [convulsionando_ahora]).
opcion_convulsion(1, 'La convulsión ya terminó',         [convulsion_terminada]).
opcion_convulsion(1, 'No estoy seguro si fue convulsión', [convulsion_dudosa]).
opcion_convulsion(2, 'Menos de 2 minutos',               [conv_menos_2min]).
opcion_convulsion(2, 'Entre 2 y 5 minutos',              [conv_entre_2y5min]).
opcion_convulsion(2, 'Más de 5 minutos',                 [conv_mas_5min]).
opcion_convulsion(2, 'No sé cuánto duró',                [conv_tiempo_desconocido]).
opcion_convulsion(3, 'Sí, tiene epilepsia diagnosticada', [epileptico_conv]).
opcion_convulsion(3, 'Sí, ha tenido convulsiones antes', [antecedentes_conv]).
opcion_convulsion(3, 'No, es la primera vez',            [primera_vez_conv]).
opcion_convulsion(3, 'No lo sé',                         [antecedentes_desconocidos_conv]).
opcion_convulsion(4, 'Se recuperó y está consciente',    [recuperado_conv]).
opcion_convulsion(4, 'Está somnolenta y confundida',     [post_ictal_conv]).
opcion_convulsion(4, 'Inconsciente, no responde',        [inconsciente_conv]).
opcion_convulsion(4, 'Tuvo otra convulsión seguida',     [convulsiones_repetidas_conv]).
opcion_convulsion(5, 'Fiebre muy alta',                  [conv_fiebre]).
opcion_convulsion(5, 'Golpe o trauma en la cabeza',      [conv_trauma]).
opcion_convulsion(5, 'Intoxicación o sustancia conocida', [conv_intoxicacion]).
opcion_convulsion(5, 'Embarazo',                         [conv_embarazo]).
opcion_convulsion(5, 'Sin causa aparente',               [sin_causa_conv]).

% --- Síntomas que disparan la alerta 911 (sin cambios) ---
sintoma_emergencia_convulsion(conv_mas_5min).
sintoma_emergencia_convulsion(inconsciente_conv).
sintoma_emergencia_convulsion(convulsiones_repetidas_conv).
sintoma_emergencia_convulsion(conv_trauma).
sintoma_emergencia_convulsion(conv_embarazo).
sintoma_emergencia_convulsion(primera_vez_conv).
sintoma_emergencia_convulsion(conv_intoxicacion).

% --- Disparadores de severidad media (piso de seguridad) ---
% Copiados de la antigua regla nivel_convulsion(moderada): garantizan que ninguna
% combinación que antes daba "medium" baje a "low" por el porcentaje.
sintoma_moderado_convulsion(convulsionando_ahora).
sintoma_moderado_convulsion(post_ictal_conv).
sintoma_moderado_convulsion(conv_fiebre).

% --- Predicados públicos del módulo (delegan en el motor común) ---
respuestas_convulsion_a_sintomas(Respuestas, Sintomas) :-
    pm_respuestas_a_sintomas(convulsion, Respuestas, Sintomas).

pct_caso_convulsion(Caso, Sintomas, Pct) :-
    pm_pct_caso(convulsion, Caso, Sintomas, Pct).

resultados_convulsion(Respuestas, Umbral, Resultados, ExactOnly) :-
    respuestas_convulsion_a_sintomas(Respuestas, Sintomas),
    pm_resultados(convulsion, Sintomas, Umbral, Resultados, ExactOnly).

hay_emergencia_convulsion(Sintomas) :-
    pm_hay_emergencia(convulsion, Sintomas).

severidad_convulsion(EsEmergencia, Caso, Severidad) :-
    pm_severidad_caso(convulsion, EsEmergencia, Caso, Severidad).

diagnostico_convulsion(Respuestas, EsEmergencia, Severidad, Recomendaciones, Caso, Pct, Accion, Resultados, ExactOnly) :-
    pm_diagnostico(convulsion, Respuestas, EsEmergencia, Severidad, Recomendaciones, Caso, Pct, Accion, Resultados, ExactOnly).

diagnostico(convulsion, Respuestas, EsEmergencia, Severidad, Recomendaciones) :-
    diagnostico_convulsion(Respuestas, EsEmergencia, Severidad, Recomendaciones, _Caso, _Pct, _Accion, _Resultados, _ExactOnly).

% ============================================================
% MOTOR DE PORCENTAJE (común a los 10 módulos)
%
% Mecanismo de porcentaje (contar_presentes/3,
% nivel_por_pct/2, umbral 50, EXACTO/ALTO/ACEPTABLE) con cuatro
% salvaguardas de seguridad:
%   1. EsEmergencia se calcula con TODOS los síntomas, sin importar
%      el porcentaje ni el caso ganador (idéntico al sistema anterior).
%   2. Piso de severidad: high si hay emergencia; medium si aparece
%      algún sintoma_moderado_X (antiguas reglas nivel_X). La severidad
%      final es la mayor entre la del caso ganador (solo si llega al
%      umbral de 50 %) y este piso.
%   3. Si la severidad supera la gravedad del caso ganador, o si es high y
%      las recomendaciones del ganador no mencionan el 911, se anteponen
%      las del caso que corresponde a esa severidad (p. ej. las del caso
%      grave, que incluyen "Llama al 911").
%   4. Fallback seguro: si ningún caso llega al 50 %, results = [] y se
%      usa el caso de mayor porcentaje (> 0) con sus recomendaciones; si
%      todos están en 0 % se usan las recomendaciones del piso o, si el
%      piso es low, recomendaciones_genericas/1. Nunca hay listas vacías.
% Empates de porcentaje: gana el caso más grave.
% ============================================================

rango_severidad(low,    0).
rango_severidad(medium, 1).
rango_severidad(high,   2).

% REVISAR POR PERSONAL DE SALUD: texto conservador usado solo cuando
% ninguna respuesta coincide con ningún caso y no hay disparadores.
recomendaciones_genericas([
    'Mantén la calma y observa a la persona de forma continua',
    'Si los síntomas empeoran o tienes dudas, llama al 911 o acude a urgencias'
]).

% pm_llamar(+Prefijo, +Modulo, +Args): llama a Prefijo<Modulo>(Args...)
% p. ej. pm_llamar(caso_, fractura, [C, L]) -> caso_fractura(C, L)
pm_llamar(Prefijo, Modulo, Args) :-
    atom_concat(Prefijo, Modulo, Nombre),
    Meta =.. [Nombre | Args],
    call(Meta).

pm_respuestas_a_sintomas(Modulo, Respuestas, SintomasUnicos) :-
    findall(S,
        ( nth1(Idx, Respuestas, R),
          ( string(R) -> atom_string(RAtom, R) ; RAtom = R ),
          pm_llamar(opcion_, Modulo, [Idx, RAtom, Sintomas]),
          member(S, Sintomas)
        ),
        SintomasDuplicados),
    sort(SintomasDuplicados, SintomasUnicos).

pm_pct_caso(Modulo, Caso, Sintomas, Pct) :-
    pm_llamar(caso_, Modulo, [Caso, Lista]),
    length(Lista, Total),
    contar_presentes(Lista, Sintomas, Coinciden),
    ( Total =:= 0 -> Pct = 0 ; Pct is (Coinciden * 100) // Total ).

pm_rango_caso(Modulo, Caso, Rango) :-
    pm_llamar(gravedad_caso_, Modulo, [Caso, Sev]),
    rango_severidad(Sev, Rango).

% Todos los casos como Pct-Caso, de mayor a menor porcentaje;
% en empate de porcentaje, primero el caso más grave.
pm_ranking(Modulo, Sintomas, Ordenados) :-
    findall(k(Pct, Rango, Caso),
        ( pm_llamar(caso_, Modulo, [Caso, _]),
          pm_pct_caso(Modulo, Caso, Sintomas, Pct),
          pm_rango_caso(Modulo, Caso, Rango)
        ),
        Claves),
    msort(Claves, Ascendente),
    reverse(Ascendente, Descendente),
    findall(Pct-Caso, member(k(Pct, _, Caso), Descendente), Ordenados).

pm_sobre_umbral(Umbral, Pct-_) :- Pct >= Umbral.

pm_resultados(Modulo, Sintomas, Umbral, Resultados, ExactOnly) :-
    pm_ranking(Modulo, Sintomas, Ordenados),
    include(pm_sobre_umbral(Umbral), Ordenados, Pares),
    ( member(100-_, Pares) ->
        findall(res{caseType:Caso, confidence:100, action:Accion, level:'EXACTO'},
            ( member(100-Caso, Pares), pm_llamar(accion_, Modulo, [Caso, Accion]) ),
            Resultados),
        ExactOnly = true
    ;
        findall(res{caseType:Caso, confidence:Pct, action:Accion, level:Nivel},
            ( member(Pct-Caso, Pares),
              pm_llamar(accion_, Modulo, [Caso, Accion]),
              nivel_por_pct(Pct, Nivel)
            ),
            Resultados),
        ExactOnly = false
    ).

pm_hay_emergencia(Modulo, Sintomas) :-
    member(S, Sintomas),
    pm_llamar(sintoma_emergencia_, Modulo, [S]),
    !.

pm_hay_moderado(Modulo, Sintomas) :-
    member(S, Sintomas),
    pm_llamar(sintoma_moderado_, Modulo, [S]),
    !.

% Severidad según el caso ganador. Sin emergencia nunca es high
% (igual que antes: high <=> alerta 911); un caso grave sin síntomas
% de emergencia se reporta como medium.
pm_severidad_caso(_Modulo, true, _Caso, high) :- !.
pm_severidad_caso(Modulo, false, Caso, Severidad) :-
    ( Caso \== desconocido,
      pm_llamar(gravedad_caso_, Modulo, [Caso, SevCaso]) ->
        ( SevCaso == high -> Severidad = medium ; Severidad = SevCaso )
    ;
        Severidad = low
    ).

% Piso de seguridad calculado con las reglas anteriores.
pm_piso_severidad(Modulo, Sintomas, Piso) :-
    ( pm_hay_emergencia(Modulo, Sintomas) -> Piso = high
    ; pm_hay_moderado(Modulo, Sintomas)   -> Piso = medium
    ;                                        Piso = low
    ).

pm_max_severidad(A, B, Max) :-
    rango_severidad(A, RA),
    rango_severidad(B, RB),
    ( RA >= RB -> Max = A ; Max = B ).

% Recomendaciones del caso ganador; si la severidad final es mayor que
% la gravedad de ese caso (o es high y el ganador no menciona el 911),
% primero van las del caso de esa severidad (sin duplicados).
% Nunca devuelve una lista vacía.
pm_recomendaciones(Modulo, Caso, Severidad, Recomendaciones) :-
    rango_severidad(Severidad, RS),
    ( Caso \== desconocido ->
        pm_llamar(recomendaciones_, Modulo, [Caso, RecsCaso]),
        pm_rango_caso(Modulo, Caso, RC)
    ;
        RecsCaso = [], RC = -1
    ),
    ( RC >= RS, ( Severidad \== high ; pm_menciona_911(RecsCaso) ) ->
        Recomendaciones = RecsCaso
    ; Severidad == low ->
        recomendaciones_genericas(Recomendaciones)
    ;
        once(pm_llamar(gravedad_caso_, Modulo, [CasoSeguridad, Severidad])),
        pm_llamar(recomendaciones_, Modulo, [CasoSeguridad, RecsSeguridad]),
        subtract(RecsCaso, RecsSeguridad, Extra),
        append(RecsSeguridad, Extra, Recomendaciones)
    ).

pm_menciona_911(Recs) :-
    member(R, Recs),
    sub_atom(R, _, _, _, '911'),
    !.

pm_diagnostico(Modulo, Respuestas, EsEmergencia, Severidad, Recomendaciones, Caso, Pct, Accion, Resultados, ExactOnly) :-
    pm_respuestas_a_sintomas(Modulo, Respuestas, Sintomas),
    pm_resultados(Modulo, Sintomas, 50, Resultados, ExactOnly),
    ( Resultados = [Primero | _] ->
        get_dict(caseType, Primero, Caso),
        get_dict(confidence, Primero, Pct),
        get_dict(action, Primero, Accion)
    ; pm_ranking(Modulo, Sintomas, [MejorPct-MejorCaso | _]), MejorPct > 0 ->
        % Fallback seguro: ningún caso llega al 50 %, se usa el de mayor
        % porcentaje (results queda vacío; la UI muestra caseType y %).
        Caso = MejorCaso, Pct = MejorPct,
        pm_llamar(accion_, Modulo, [Caso, Accion])
    ;
        Caso = desconocido, Pct = 0
    ),
    ( pm_hay_emergencia(Modulo, Sintomas) -> EsEmergencia = true ; EsEmergencia = false ),
    % Un caso por debajo del umbral (fallback) no es evidencia suficiente
    % para subir la severidad: en ese caso decide solo el piso de seguridad.
    ( Pct >= 50 ->
        pm_severidad_caso(Modulo, EsEmergencia, Caso, SevCaso)
    ;
        SevCaso = low
    ),
    pm_piso_severidad(Modulo, Sintomas, Piso),
    pm_max_severidad(SevCaso, Piso, Severidad),
    pm_recomendaciones(Modulo, Caso, Severidad, Recomendaciones),
    % Caso desconocido: la acción principal es la primera recomendación.
    ( var(Accion) -> Recomendaciones = [Accion | _] ; true ).

% ============================================================
% LÓGICA DE SESIONES
% ============================================================

iniciar_sesion(Modulo, SesionId, Total, PrimeraPregunta) :-
    uuid(SesionId),
    total_preguntas(Modulo, Total),
    pregunta(Modulo, 1, PrimeraPregunta),
    assertz(sesion(SesionId, Modulo, [])).

siguiente_pregunta_sesion(SesionId, Respuestas, Pregunta, NumPregunta) :-
    sesion(SesionId, Modulo, _),
    length(Respuestas, NumRespondidas),
    NumPregunta is NumRespondidas + 1,
    pregunta(Modulo, NumPregunta, Pregunta).

finalizar_sesion(SesionId) :-
    ( retract(sesion(SesionId, _, _)) -> true ; true ).

% ============================================================
% HANDLERS HTTP
% ============================================================

h_start(Request) :-
    cors_enable(Request, [methods([post, options])]),
    ( memberchk(method(options), Request) ->
        reply_json_dict(_{})
    ;
        http_read_json_dict(Request, Data),
        atom_string(Modulo, Data.module),
        iniciar_sesion(Modulo, SesionId, Total, PrimeraPregunta),
        reply_json_dict(_{
            sessionId: SesionId,
            totalQuestions: Total,
            firstQuestion: PrimeraPregunta
        })
    ).

h_next(Request) :-
    cors_enable(Request, [methods([post, options])]),
    ( memberchk(method(options), Request) ->
        reply_json_dict(_{})
    ;
        http_read_json_dict(Request, Data),
        atom_string(SesionId, Data.sessionId),
        Respuestas = Data.answers,
        % Ningún módulo termina antes de tiempo: siempre se hacen todas las
        % preguntas para no omitir síntomas de alarma de las últimas.
        siguiente_pregunta_sesion(SesionId, Respuestas, Pregunta, NumPregunta),
        reply_json_dict(_{question: Pregunta, questionNumber: NumPregunta, shouldFinish: false})
    ).

h_diag(Request) :-
    cors_enable(Request, [methods([post, options])]),
    ( memberchk(method(options), Request) ->
        reply_json_dict(_{})
    ;
        http_read_json_dict(Request, Data),
        atom_string(Modulo, Data.module),
        Respuestas = Data.answers,
        ( Modulo = hemorragia ->
            diagnostico_hemorragia(Respuestas, EsEmergencia, Severidad, Recs, Caso, Pct, Accion, Resultados, ExactOnly),
            reply_json_dict(_{isEmergency:EsEmergencia,severity:Severidad,recommendations:Recs,
                              caseType:Caso,confidence:Pct,action:Accion,results:Resultados,exactOnly:ExactOnly})
        ; Modulo = asfixia ->
            diagnostico_asfixia(Respuestas, EsEmergencia, Severidad, Recs, Caso, Pct, Accion, Resultados, ExactOnly),
            reply_json_dict(_{isEmergency:EsEmergencia,severity:Severidad,recommendations:Recs,
                              caseType:Caso,confidence:Pct,action:Accion,results:Resultados,exactOnly:ExactOnly})
        ; Modulo = quemadura ->
            diagnostico_quemadura(Respuestas, EsEmergencia, Severidad, Recs, Caso, Pct, Accion, Resultados, ExactOnly),
            reply_json_dict(_{isEmergency:EsEmergencia,severity:Severidad,recommendations:Recs,
                              caseType:Caso,confidence:Pct,action:Accion,results:Resultados,exactOnly:ExactOnly})
        ; Modulo = desmayo ->
            diagnostico_desmayo(Respuestas, EsEmergencia, Severidad, Recs, Caso, Pct, Accion, Resultados, ExactOnly),
            reply_json_dict(_{isEmergency:EsEmergencia,severity:Severidad,recommendations:Recs,
                              caseType:Caso,confidence:Pct,action:Accion,results:Resultados,exactOnly:ExactOnly})
        ; Modulo = fractura ->
            diagnostico_fractura(Respuestas, EsEmergencia, Severidad, Recs, Caso, Pct, Accion, Resultados, ExactOnly),
            reply_json_dict(_{isEmergency:EsEmergencia,severity:Severidad,recommendations:Recs,
                              caseType:Caso,confidence:Pct,action:Accion,results:Resultados,exactOnly:ExactOnly})
        ; Modulo = intoxicacion ->
            diagnostico_intoxicacion(Respuestas, EsEmergencia, Severidad, Recs, Caso, Pct, Accion, Resultados, ExactOnly),
            reply_json_dict(_{isEmergency:EsEmergencia,severity:Severidad,recommendations:Recs,
                              caseType:Caso,confidence:Pct,action:Accion,results:Resultados,exactOnly:ExactOnly})
        ; Modulo = picadura ->
            diagnostico_picadura(Respuestas, EsEmergencia, Severidad, Recs, Caso, Pct, Accion, Resultados, ExactOnly),
            reply_json_dict(_{isEmergency:EsEmergencia,severity:Severidad,recommendations:Recs,
                              caseType:Caso,confidence:Pct,action:Accion,results:Resultados,exactOnly:ExactOnly})
        ; Modulo = descarga ->
            diagnostico_descarga(Respuestas, EsEmergencia, Severidad, Recs, Caso, Pct, Accion, Resultados, ExactOnly),
            reply_json_dict(_{isEmergency:EsEmergencia,severity:Severidad,recommendations:Recs,
                              caseType:Caso,confidence:Pct,action:Accion,results:Resultados,exactOnly:ExactOnly})
        ; Modulo = insolacion ->
            diagnostico_insolacion(Respuestas, EsEmergencia, Severidad, Recs, Caso, Pct, Accion, Resultados, ExactOnly),
            reply_json_dict(_{isEmergency:EsEmergencia,severity:Severidad,recommendations:Recs,
                              caseType:Caso,confidence:Pct,action:Accion,results:Resultados,exactOnly:ExactOnly})
        ; Modulo = convulsion ->
            diagnostico_convulsion(Respuestas, EsEmergencia, Severidad, Recs, Caso, Pct, Accion, Resultados, ExactOnly),
            reply_json_dict(_{isEmergency:EsEmergencia,severity:Severidad,recommendations:Recs,
                              caseType:Caso,confidence:Pct,action:Accion,results:Resultados,exactOnly:ExactOnly})
        ;
            diagnostico(Modulo, Respuestas, EsEmergencia, Severidad, Recs),
            reply_json_dict(_{isEmergency:EsEmergencia,severity:Severidad,recommendations:Recs})
        )
    ).

h_end(Request) :-
    cors_enable(Request, [methods([post, options])]),
    ( memberchk(method(options), Request) ->
        reply_json_dict(_{})
    ;
        http_read_json_dict(Request, Data),
        atom_string(SesionId, Data.sessionId),
        finalizar_sesion(SesionId),
        reply_json_dict(_{success: true})
    ).

% ============================================================
% INICIO DEL SERVIDOR
% ============================================================

server(Port) :-
    http_server(http_dispatch, [port(Port)]).

% Las pruebas (backend/tests) definen HCA_SIN_SERVIDOR antes de cargar este
% archivo para no levantar el servidor. En producción no existe la variable.
:- if(\+ getenv('HCA_SIN_SERVIDOR', _)).
:- initialization(main, main).
:- endif.

main :-
    set_prolog_flag(encoding, utf8),
    ( getenv('PORT', PortStr) ->
        atom_number(PortStr, Port)
    ;
        Port = 5000
    ),
    server(Port),
    format("Servidor iniciado en puerto ~w~n", [Port]),
    thread_get_message(_).