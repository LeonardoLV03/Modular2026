% ============================================================
%   BACKEND HTTP - SISTEMA DE PRIMEROS AUXILIOS
%   Puerto: 5000
%
%   Módulos implementados: hemorragia, desmayo
%   Estructura lista para: asfixia, quemadura
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
pregunta(hemorragia, 5, 'Sintomas generales del paciente').

total_preguntas(hemorragia, 5).

% --- DESMAYO (4 preguntas) ---
pregunta(desmayo, 1, 'Estado de consciencia de la persona').
pregunta(desmayo, 2, 'Respiracion y pulso de la persona').
pregunta(desmayo, 3, 'Tiempo que lleva sin recuperar la conciencia').
pregunta(desmayo, 4, 'Senales de alarma adicionales').

total_preguntas(desmayo, 4).

% --- ASFIXIA (5 preguntas) ---
pregunta(asfixia, 1, 'Puede hablar o toser con fuerza').
pregunta(asfixia, 2, 'Como es la respiracion').
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
% BASE DE CONOCIMIENTOS - DIAGNOSTICO HEMORRAGIA
% ============================================================

caso(hemorragia_leve,    [sangrado_poco, herida_superficial]).
caso(hemorragia_media,   [sangrado_constante, dolor_moderado, inflamacion, herida_visible]).
caso(hemorragia_grave,   [sangrado_abundante, mareo, debilidad, piel_palida, herida_visible]).
caso(hemorragia_interna, [dolor_intenso, moretones, mareo, debilidad, herida_nosivisble]).

accion(hemorragia_leve,
    'Limpiar la herida, Mantener limpia la herida, Aplicar presion directa, Cubrir con gasa esteril').
accion(hemorragia_media,
    'Colocar vendaje firme, Elevar la zona afectada, presion directa continua.').
accion(hemorragia_grave,
    'Llamar al 911 de inmediato, Si un objeto esta incrustado NO retirarlo, Presion fuerte y constante, Vendar o reforzar el vendaje, Mantener la persona acostada, Monitorear la respiracion y el pulso').
accion(hemorragia_interna,
    'Llamar al 911, Mantener la persona acostada, Mantener la calma, NO darle alimentos ni bebidas, NO medicar, Elevar piernas (Si no hay lesiones)').

sintoma_emergencia(sangrado_abundante).
sintoma_emergencia(sangre_a_chorros).
sintoma_emergencia(desmayo_hemorragia).
sintoma_emergencia(piel_fria).

opcion_sintomas(1, 'Poco  (manchas o goteo leve)', [sangrado_poco]).
opcion_sintomas(1, 'Constante  (flujo moderado continuo)', [sangrado_constante]).
opcion_sintomas(1, 'Abundante  (flujo fuerte)', [sangrado_abundante]).
opcion_sintomas(1, 'A chorros / extremadamente intenso', [sangrado_abundante, sangre_a_chorros]).
opcion_sintomas(1, 'Sin sangrado visible', []).

opcion_sintomas(2, 'Herida superficial visible', [herida_superficial]).
opcion_sintomas(2, 'Herida No superficial visible', [herida_visible]).
opcion_sintomas(2, 'Sin herida superficial visible', [herida_novisible]).
opcion_sintomas(2, 'No estoy seguro', []).

opcion_sintomas(3, 'Dolor moderado', [dolor_moderado]).
opcion_sintomas(3, 'Dolor intenso', [dolor_intenso]).
opcion_sintomas(3, 'Sin dolor', []).

opcion_sintomas(4, 'Palida solamente', [piel_palida]).
opcion_sintomas(4, 'Fria y palida', [piel_palida, piel_fria]).
opcion_sintomas(4, 'Moretones visibles', [moretones]).
opcion_sintomas(4, 'Normal, sin cambios', []).

opcion_sintomas(5, 'Mareo unicamente', [mareo]).
opcion_sintomas(5, 'Debilidad unicamente', [debilidad]).
opcion_sintomas(5, 'Mareo y debilidad juntos', [mareo, debilidad]).
opcion_sintomas(5, 'Inflamacion en la zona afectada', [inflamacion]).
opcion_sintomas(5, 'Perdida del conocimiento', [desmayo_hemorragia]).
opcion_sintomas(5, 'Ninguno de los anteriores', []).

respuestas_a_sintomas(Respuestas, SintomasUnicos) :-
    findall(S,
        ( nth1(Idx, Respuestas, Respuesta),
          ( string(Respuesta) -> atom_string(RespAtom, Respuesta) ; RespAtom = Respuesta ),
          opcion_sintomas(Idx, RespAtom, Sintomas),
          member(S, Sintomas)
        ),
        SintomasDuplicados),
    sort(SintomasDuplicados, SintomasUnicos).

contar_presentes([], _, 0).
contar_presentes([S | Resto], Sintomas, N) :-
    ( member(S, Sintomas) ->
        contar_presentes(Resto, Sintomas, Sub),
        N is Sub + 1
    ;
        contar_presentes(Resto, Sintomas, N)
    ).

pct_caso(Caso, Sintomas, Pct) :-
    caso(Caso, Lista),
    length(Lista, Total),
    contar_presentes(Lista, Sintomas, Coinciden),
    ( Total =:= 0 -> Pct = 0 ; Pct is (Coinciden * 100) // Total ).

mejor_caso(Sintomas, MejorCaso, MejorPct) :-
    findall(Pct-Caso,
        ( caso(Caso, _), pct_caso(Caso, Sintomas, Pct) ),
        Lista),
    msort(Lista, Ordenados),
    reverse(Ordenados, [MejorPct-MejorCaso | _]).

hay_emergencia(Sintomas) :-
    member(S, Sintomas),
    sintoma_emergencia(S),
    !.

hay_caso_sobre_umbral(Sintomas, Umbral) :-
    caso(Caso, _),
    pct_caso(Caso, Sintomas, Pct),
    Pct > Umbral,
    !.

nivel_por_pct(Pct, Nivel) :-
    ( Pct =:= 100 -> Nivel = 'EXACTO'
    ; Pct > 70    -> Nivel = 'ALTO'
    ;                Nivel = 'ACEPTABLE'
    ).

resultados_hemorragia(Respuestas, Umbral, Resultados, ExactOnly) :-
    respuestas_a_sintomas(Respuestas, Sintomas),
    findall(Pct-Caso,
        ( caso(Caso, _),
          pct_caso(Caso, Sintomas, Pct),
          Pct >= Umbral
        ),
        Pares),
    ( member(100-_, Pares) ->
        findall(res{caseType:Caso, confidence:100, action:Accion, level:'EXACTO'},
            ( member(100-Caso, Pares), accion(Caso, Accion) ),
            Resultados),
        ExactOnly = true
    ;
        msort(Pares, Temp),
        reverse(Temp, Ordenados),
        findall(res{caseType:Caso, confidence:Pct, action:Accion, level:Nivel},
            ( member(Pct-Caso, Ordenados), accion(Caso, Accion), nivel_por_pct(Pct, Nivel) ),
            Resultados),
        ExactOnly = false
    ).

severidad_por_pct(true, _, high).
severidad_por_pct(false, Pct, medium) :- Pct > 70, !.
severidad_por_pct(false, _, low).

diagnostico_hemorragia(Respuestas, EsEmergencia, Severidad, Recomendaciones, Caso, Pct, Accion, Resultados, ExactOnly) :-
    respuestas_a_sintomas(Respuestas, Sintomas),
    resultados_hemorragia(Respuestas, 50, Resultados, ExactOnly),
    ( Resultados = [Primero | _] ->
        get_dict(caseType, Primero, Caso),
        get_dict(confidence, Primero, Pct),
        get_dict(action, Primero, Accion)
    ;
        Caso = desconocido, Pct = 0, Accion = ''
    ),
    ( hay_emergencia(Sintomas) -> EsEmergencia = true ; EsEmergencia = false ),
    severidad_por_pct(EsEmergencia, Pct, Severidad),
    findall(A, member(res{action:A}, Resultados), Recomendaciones).

diagnostico(hemorragia, Respuestas, EsEmergencia, Severidad, Recomendaciones) :-
    diagnostico_hemorragia(Respuestas, EsEmergencia, Severidad, Recomendaciones, _Caso, _Pct, _Accion, _Resultados, _ExactOnly).

% ============================================================
% BASE DE CONOCIMIENTOS - DIAGNOSTICO DESMAYO
% Clasificacion: Leve (pre-sincope), Mediano (perdida breve),
%                Grave (sin recuperacion / con complicaciones)
% ============================================================

opcion_desmayo(1, 'Consciente, responde y puede hablar',                    consciente).
opcion_desmayo(1, 'Confundida o desorientada, responde poco',               semi_consciente).
opcion_desmayo(1, 'No responde a nada, inconsciente',                       inconsciente).

opcion_desmayo(2, 'Si, respira y tiene pulso normal',                       respira_bien).
opcion_desmayo(2, 'Respira con dificultad o pulso debil',                   respira_mal).
opcion_desmayo(2, 'No respira o no se detecta pulso',                       sin_respiracion).

opcion_desmayo(3, 'No perdio la conciencia (solo mareo/debilidad)',         no_perdio_conciencia).
opcion_desmayo(3, 'Menos de 2 minutos inconsciente',                        menos_2min).
opcion_desmayo(3, 'Mas de 2 minutos inconsciente',                          mas_2min).

opcion_desmayo(4, 'Ninguna senal adicional',                                sin_alarma).
opcion_desmayo(4, 'Presenta convulsiones',                                  convulsiones).
opcion_desmayo(4, 'Piel azulada (cianosis) o dificultad respiratoria',     cianosis).
opcion_desmayo(4, 'Dolor en el pecho o antecedentes cardiacos',             cardiaco).
opcion_desmayo(4, 'Golpe fuerte en la cabeza al caer',                      traumatismo).

% Sintomas que indican emergencia en desmayo
sintoma_emergencia_desmayo(inconsciente).
sintoma_emergencia_desmayo(sin_respiracion).
sintoma_emergencia_desmayo(mas_2min).
sintoma_emergencia_desmayo(convulsiones).
sintoma_emergencia_desmayo(cianosis).
sintoma_emergencia_desmayo(cardiaco).
sintoma_emergencia_desmayo(traumatismo).
sintoma_emergencia_desmayo(respira_mal).

% lista de respuestas a lista de atomos de sintomas
respuestas_desmayo_a_sintomas(Respuestas, Sintomas) :-
    findall(Sint,
        ( nth1(Idx, Respuestas, R),
          ( string(R) -> atom_string(RAtom, R) ; RAtom = R ),
          opcion_desmayo(Idx, RAtom, Sint)
        ),
        Sintomas).

% Nivel LEVE: consciente o semi, no perdio conciencia, sin alarmas graves
nivel_desmayo(leve, Sintomas) :-
    ( member(consciente, Sintomas) ; member(semi_consciente, Sintomas) ),
    member(no_perdio_conciencia, Sintomas),
    \+ member(inconsciente, Sintomas),
    \+ member(sin_respiracion, Sintomas),
    \+ member(mas_2min, Sintomas),
    \+ member(convulsiones, Sintomas),
    \+ member(cianosis, Sintomas),
    \+ member(cardiaco, Sintomas),
    \+ member(traumatismo, Sintomas).

% Nivel MEDIANO: perdio conciencia brevemente (menos de 2 min), sin complicaciones graves
nivel_desmayo(mediano, Sintomas) :-
    member(menos_2min, Sintomas),
    \+ member(sin_respiracion, Sintomas),
    \+ member(mas_2min, Sintomas),
    \+ member(convulsiones, Sintomas),
    \+ member(cianosis, Sintomas).

% Nivel GRAVE: cualquier sintoma de emergencia presente
nivel_desmayo(grave, Sintomas) :-
    member(S, Sintomas),
    sintoma_emergencia_desmayo(S), !.

diagnostico(desmayo, Respuestas, EsEmergencia, Severidad, Recomendaciones) :-
    respuestas_desmayo_a_sintomas(Respuestas, Sintomas),
    % Determinar nivel: grave > mediano > leve
    ( nivel_desmayo(grave, Sintomas)   -> Nivel = grave
    ; nivel_desmayo(mediano, Sintomas) -> Nivel = mediano
    ;                                     Nivel = leve
    ),
    ( Nivel = grave ->
        EsEmergencia = true,
        Severidad = high,
        Recomendaciones = [
            'Llama al 911 de inmediato',
            'Mantén la via aerea despejada: inclina la cabeza hacia atras y levanta el menton',
            'Verifica respiracion y pulso (maximo 10 segundos)',
            'Si no hay pulso ni respiracion: inicia RCP (30 compresiones + 2 ventilaciones)',
            'Si respira pero esta inconsciente: coloca en posicion lateral de seguridad',
            'NO muevas a la persona si sospechas traumatismo en cuello o columna',
            'NO administres medicamentos de ningun tipo',
            'Controla hemorragias si hubo golpe durante la caida',
            'Permanece junto a la persona hasta que llegue ayuda profesional'
        ]
    ; Nivel = mediano ->
        EsEmergencia = false,
        Severidad = medium,
        Recomendaciones = [
            'Pide ayuda a alguien cercano de inmediato',
            'Acuesta a la persona boca arriba en una superficie plana y segura',
            'Eleva las piernas 30 a 45 cm (usa mochila, silla u objeto disponible)',
            'Verifica respiracion y pulso',
            'Afloja toda la ropa apretada (cinturon, cuello de camisa)',
            'Si presenta vomito, girala a posicion lateral de seguridad (de costado)',
            'NO administres medicamentos ni des nada por la boca',
            'Si no despierta en 1 a 2 minutos o hay sintomas de alarma, llama al 911',
            'Una vez consciente, no permitas que se levante rapidamente'
        ]
    ;
        EsEmergencia = false,
        Severidad = low,
        Recomendaciones = [
            'Manten la calma y tranquiliza a la persona',
            'Sientala con la cabeza inclinada entre las rodillas O recuestala con piernas elevadas',
            'Afloja toda ropa ajustada (cinturon, corbata, cuello de camisa)',
            'Ventila el area: abre ventanas o lleva a un lugar fresco',
            'NO permitas que se levante bruscamente',
            'NO ofrezcas medicamentos de ningun tipo',
            'Monitorea durante 15 a 20 minutos antes de permitir que se incorpore lentamente',
            'Ofrece agua fria en pequenos sorbos solo cuando este completamente alerta',
            'No dejes sola a la persona hasta que se recupere completamente'
        ]
    ).

% ============================================================
% BASE DE CONOCIMIENTOS - DIAGNOSTICO ASFIXIA
% ============================================================

caso_asfixia(asfixia_leve, [obstruccion_parcial, tos_fuerte, puede_hablar, consciente]).
caso_asfixia(asfixia_moderada, [obstruccion_total, no_habla, tos_ineficaz, consciente]).
caso_asfixia(asfixia_grave, [inconsciente, sin_respiracion]).

accion_asfixia(asfixia_leve,
    'Anima a toser con fuerza; permanece junto a la persona; si empeora, llama al 911').
accion_asfixia(asfixia_moderada,
    'Aplica maniobra de Heimlich; si no mejora en pocos intentos, llama al 911; continua hasta expulsar el objeto o pierda la conciencia').
accion_asfixia(asfixia_grave,
    'Llama al 911 de inmediato; inicia RCP con compresiones toracicas; revisa la boca antes de cada ventilacion').

recomendaciones_asfixia(asfixia_leve, [
    'Anima a toser fuerte y vigila la respiracion', 'Inclina a la persona ligeramente hacia adelante',
    'No des liquidos ni alimentos', 'Si la tos se vuelve ineficaz o empeora, llama al 911'
]).
recomendaciones_asfixia(asfixia_moderada, [
    'Pregunta si se esta asfixiando y confirma que no puede hablar','Aplica maniobra de Heimlich con compresiones hacia adentro y arriba',
    'Alterna con 5 golpes en la espalda si es seguro hacerlo','Si no mejora en pocos intentos, llama al 911',
    'Si pierde la conciencia, inicia RCP'
]).
recomendaciones_asfixia(asfixia_grave, [
    'Llama al 911 de inmediato','Coloca a la persona boca arriba en superficie plana','Inicia RCP con compresiones toracicas',
    'Revisa la boca antes de cada ventilacion de rescate','Si vuelve a respirar, coloca en posicion lateral de seguridad'
]).

opcion_asfixia(1, 'Puede hablar y toser con fuerza', [puede_hablar, tos_fuerte, obstruccion_parcial]).
opcion_asfixia(1, 'Puede hablar pero la tos es debil', [puede_hablar, tos_debil, obstruccion_parcial]).
opcion_asfixia(1, 'No puede hablar, tos debil o ineficaz', [no_habla, tos_ineficaz, obstruccion_total]).
opcion_asfixia(1, 'No emite sonidos ni puede toser', [no_habla, sin_tos, obstruccion_total]).

opcion_asfixia(2, 'Respira con dificultad o ruidos', [respiracion_dificultosa]).
opcion_asfixia(2, 'Respiracion ausente', [sin_respiracion]).
opcion_asfixia(2, 'Respiracion normal', [respiracion_normal]).
opcion_asfixia(2, 'No estoy seguro', []).

opcion_asfixia(3, 'Color normal', []).
opcion_asfixia(3, 'Enrojecimiento en rostro', [enrojecimiento]).
opcion_asfixia(3, 'Color azulado (cianosis)', [cianosis]).

opcion_asfixia(4, 'Consciente y alerta', [consciente]).
opcion_asfixia(4, 'Agitado o confundido', [consciente, agitado]).
opcion_asfixia(4, 'Inconsciente', [inconsciente]).

opcion_asfixia(5, 'Atragantamiento con comida u objeto', [causa_obstructiva]).
opcion_asfixia(5, 'Compresion del cuello o torax', [causa_mecanica]).
opcion_asfixia(5, 'Ahogamiento por agua', [causa_sumersion]).
opcion_asfixia(5, 'Inhalacion de humo o gases', [causa_toxica]).
opcion_asfixia(5, 'Posicion que dificulta respirar', [causa_posicional]).
opcion_asfixia(5, 'No estoy seguro', []).

sintoma_emergencia_asfixia(sin_respiracion).
sintoma_emergencia_asfixia(inconsciente).
sintoma_emergencia_asfixia(cianosis).

respuestas_asfixia_a_sintomas(Respuestas, SintomasUnicos) :-
    findall(S,
        ( nth1(Idx, Respuestas, R),
          ( string(R) -> atom_string(RAtom, R) ; RAtom = R ),
          opcion_asfixia(Idx, RAtom, Sintomas),
          member(S, Sintomas)
        ),
        SintomasDuplicados),
    sort(SintomasDuplicados, SintomasUnicos).

pct_caso_asfixia(Caso, Sintomas, Pct) :-
    caso_asfixia(Caso, Lista),
    length(Lista, Total),
    contar_presentes(Lista, Sintomas, Coinciden),
    ( Total =:= 0 -> Pct = 0 ; Pct is (Coinciden * 100) // Total ).

resultados_asfixia(Respuestas, Umbral, Resultados, ExactOnly) :-
    respuestas_asfixia_a_sintomas(Respuestas, Sintomas),
    findall(Pct-Caso,
        ( caso_asfixia(Caso, _),
          pct_caso_asfixia(Caso, Sintomas, Pct),
          Pct >= Umbral
        ),
        Pares),
    ( member(100-_, Pares) ->
        findall(res{caseType:Caso, confidence:100, action:Accion, level:'EXACTO'},
            ( member(100-Caso, Pares), accion_asfixia(Caso, Accion) ),
            Resultados),
        ExactOnly = true
    ;
        msort(Pares, Temp),
        reverse(Temp, Ordenados),
        findall(res{caseType:Caso, confidence:Pct, action:Accion, level:Nivel},
            ( member(Pct-Caso, Ordenados), accion_asfixia(Caso, Accion), nivel_por_pct(Pct, Nivel) ),
            Resultados),
        ExactOnly = false
    ).

hay_emergencia_asfixia(Sintomas) :-
    member(S, Sintomas),
    sintoma_emergencia_asfixia(S),
    !.

hay_caso_exacto_asfixia(Sintomas) :-
    caso_asfixia(Caso, _),
    pct_caso_asfixia(Caso, Sintomas, 100),
    !.

severidad_asfixia(true, _, high).
severidad_asfixia(false, asfixia_moderada, medium) :- !.
severidad_asfixia(false, _, low).

diagnostico_asfixia(Respuestas, EsEmergencia, Severidad, Recomendaciones, Caso, Pct, Accion, Resultados, ExactOnly) :-
    respuestas_asfixia_a_sintomas(Respuestas, Sintomas),
    resultados_asfixia(Respuestas, 50, Resultados, ExactOnly),
    ( Resultados = [Primero | _] ->
        get_dict(caseType, Primero, Caso),
        get_dict(confidence, Primero, Pct),
        get_dict(action, Primero, Accion)
    ;
        Caso = desconocido, Pct = 0, Accion = ''
    ),
    ( hay_emergencia_asfixia(Sintomas) -> EsEmergencia = true ; EsEmergencia = false ),
    severidad_asfixia(EsEmergencia, Caso, Severidad),
    ( recomendaciones_asfixia(Caso, Recomendaciones) -> true ; Recomendaciones = [] ).

diagnostico(asfixia, Respuestas, EsEmergencia, Severidad, Recomendaciones) :-
    diagnostico_asfixia(Respuestas, EsEmergencia, Severidad, Recomendaciones, _Caso, _Pct, _Accion, _Resultados, _ExactOnly).

% ============================================================
% BASE DE CONOCIMIENTOS - DIAGNOSTICO QUEMADURA
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
opcion_quemadura(1, 'Lesión química o eléctrica', [dolor_quimico, necrosis, lesion_pequena_externa, arritmia, daño_profundo]).
opcion_quemadura(1, 'No estoy seguro', []).

opcion_quemadura(2, 'Brazo o pierna', []).
opcion_quemadura(2, 'Cara, cuello o manos', []).
opcion_quemadura(2, 'Torso o espalda', []).
opcion_quemadura(2, 'Zona extensa', []).
opcion_quemadura(2, 'No estoy seguro', []).

opcion_quemadura(3, 'Solo enrojecimiento', [enrojecimiento, dolor_leve, piel_seca]).
opcion_quemadura(3, 'Ampollas visibles', [dolor_intenso, ampollas, piel_humeda]).
opcion_quemadura(3, 'Piel carbonizada/blanca', [piel_carbonizada, piel_blanca, necrosis]).
opcion_quemadura(3, 'No estoy seguro', []).

opcion_quemadura(4, 'Hace pocos minutos y no traté', []).
opcion_quemadura(4, 'Lo enfrié con agua', []).
opcion_quemadura(4, 'Apliqué hielo o crema', []).
opcion_quemadura(4, 'No estoy seguro', []).

opcion_quemadura(5, 'Dolor intenso', [dolor_intenso]).
opcion_quemadura(5, 'Dificultad para respirar', [dificultad_respirar]).
opcion_quemadura(5, 'Signos de infección/necrosis', [necrosis]).
opcion_quemadura(5, 'Ninguno de los anteriores', []).

% --- Conversión de respuestas a síntomas ---
respuestas_quemadura_a_sintomas(Respuestas, SintomasUnicos) :-
    findall(S,
        ( nth1(Idx, Respuestas, R),
          ( string(R) -> atom_string(RAtom, R) ; RAtom = R ),
          opcion_quemadura(Idx, RAtom, Sintomas),
          member(S, Sintomas)
        ),
        SintomasDuplicados),
    sort(SintomasDuplicados, SintomasUnicos).

pct_caso_quemadura(Caso, Sintomas, Pct) :-
    caso_quemadura(Caso, Lista),
    length(Lista, Total),
    contar_presentes(Lista, Sintomas, Coinciden),
    ( Total =:= 0 -> Pct = 0 ; Pct is (Coinciden * 100) // Total ).

resultados_quemadura(Respuestas, Umbral, Resultados, ExactOnly) :-
    respuestas_quemadura_a_sintomas(Respuestas, Sintomas),
    findall(Pct-Caso,
        ( caso_quemadura(Caso, _),
          pct_caso_quemadura(Caso, Sintomas, Pct),
          Pct >= Umbral
        ),
        Pares),
    ( member(100-_, Pares) ->
        findall(res{caseType:Caso, confidence:100, action:Accion, level:'EXACTO'},
            ( member(100-Caso, Pares), accion_quemadura(Caso, Accion) ),
            Resultados),
        ExactOnly = true
    ;
        msort(Pares, Temp),
        reverse(Temp, Ordenados),
        findall(res{caseType:Caso, confidence:Pct, action:Accion, level:Nivel},
            ( member(Pct-Caso, Ordenados), accion_quemadura(Caso, Accion), nivel_por_pct(Pct, Nivel) ),
            Resultados),
        ExactOnly = false
    ).

hay_emergencia_quemadura(Sintomas) :-
    member(S, Sintomas),
    sintoma_emergencia_quemadura(S),
    !.

hay_caso_exacto_quemadura(Sintomas) :-
    caso_quemadura(Caso, _),
    pct_caso_quemadura(Caso, Sintomas, 100),
    !.

severidad_quemadura(true, _, high).
severidad_quemadura(false, quemadura_grave, high) :- !.
severidad_quemadura(false, quemadura_moderada, medium) :- !.
severidad_quemadura(false, _, low).

% --- Sintomas de emergencia ---
sintoma_emergencia_quemadura(piel_carbonizada).
sintoma_emergencia_quemadura(necrosis).
sintoma_emergencia_quemadura(arritmia).
sintoma_emergencia_quemadura(dificultad_respirar).

% --- Diagnóstico final ---
diagnostico_quemadura(Respuestas, EsEmergencia, Severidad, Recomendaciones, Caso, Pct, Accion, Resultados, ExactOnly) :-
    respuestas_quemadura_a_sintomas(Respuestas, Sintomas),
    resultados_quemadura(Respuestas, 50, Resultados, ExactOnly),
    ( Resultados = [Primero | _] ->
        get_dict(caseType, Primero, Caso),
        get_dict(confidence, Primero, Pct),
        get_dict(action, Primero, Accion)
    ;
        Caso = desconocido, Pct = 0, Accion = ''
    ),
    ( hay_emergencia_quemadura(Sintomas) -> EsEmergencia = true ; EsEmergencia = false ),
    severidad_quemadura(EsEmergencia, Caso, Severidad),
    ( recomendaciones_quemadura(Caso, Recomendaciones) -> true ; Recomendaciones = [] ).

diagnostico(quemadura, Respuestas, EsEmergencia, Severidad, Recomendaciones) :-
    diagnostico_quemadura(Respuestas, EsEmergencia, Severidad, Recomendaciones, _Caso, _Pct, _Accion, _Resultados, _ExactOnly).
    
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
        sesion(SesionId, Modulo, _),
        ( Modulo = hemorragia ->
            respuestas_a_sintomas(Respuestas, Sintomas),
            ( hay_caso_sobre_umbral(Sintomas, 70) ->
                reply_json_dict(_{shouldFinish: true})
            ;
                siguiente_pregunta_sesion(SesionId, Respuestas, Pregunta, NumPregunta),
                reply_json_dict(_{question: Pregunta, questionNumber: NumPregunta, shouldFinish: false})
            )
        ; Modulo = asfixia ->
            respuestas_asfixia_a_sintomas(Respuestas, Sintomas),
            ( hay_caso_exacto_asfixia(Sintomas) ->
                reply_json_dict(_{shouldFinish: true})
            ;
                siguiente_pregunta_sesion(SesionId, Respuestas, Pregunta, NumPregunta),
                reply_json_dict(_{question: Pregunta, questionNumber: NumPregunta, shouldFinish: false})
            )
        ; Modulo = quemadura ->
            respuestas_quemadura_a_sintomas(Respuestas, Sintomas),
            ( hay_caso_exacto_quemadura(Sintomas) ->
                reply_json_dict(_{shouldFinish: true})
            ;
                siguiente_pregunta_sesion(SesionId, Respuestas, Pregunta, NumPregunta),
                reply_json_dict(_{question: Pregunta, questionNumber: NumPregunta, shouldFinish: false})
            )
        ;
            siguiente_pregunta_sesion(SesionId, Respuestas, Pregunta, NumPregunta),
            reply_json_dict(_{question: Pregunta, questionNumber: NumPregunta, shouldFinish: false})
        )
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

:- initialization(main, main).
main :-
    set_prolog_flag(encoding, utf8),
    server(5000),
    format("Servidor iniciado en http://localhost:5000~n"),
    thread_get_message(_).
