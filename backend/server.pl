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
% MÓDULO: FRACTURA
% ============================================================

pregunta(fractura, 1, 'Zona del cuerpo lesionada').
pregunta(fractura, 2, 'Apariencia visual de la lesión').
pregunta(fractura, 3, 'Capacidad de movimiento en la zona').
pregunta(fractura, 4, 'Intensidad del dolor').
pregunta(fractura, 5, 'Síntomas adicionales o señales de alarma').

total_preguntas(fractura, 5).

opcion_fractura(1, 'Brazo, antebrazo o muñeca',   extremidad_superior).
opcion_fractura(1, 'Pierna, muslo o tobillo',     extremidad_inferior).
opcion_fractura(1, 'Costilla o tórax',            zona_torax).
opcion_fractura(1, 'Columna vertebral o cuello',  zona_columna).
opcion_fractura(1, 'Mano, pie o dedo',            extremidad_periferica).
opcion_fractura(1, 'No estoy seguro',             zona_desconocida).

opcion_fractura(2, 'Hueso visiblemente expuesto',           hueso_expuesto).
opcion_fractura(2, 'Deformidad visible sin hueso expuesto', deformidad_frac).
opcion_fractura(2, 'Solo inflamación o moretón',            inflamacion_frac).
opcion_fractura(2, 'Sin cambios visibles',                  sin_deformidad_frac).

opcion_fractura(3, 'No puede moverla en absoluto',      no_puede_mover_frac).
opcion_fractura(3, 'Puede moverla con mucho dolor',     movimiento_muy_doloroso).
opcion_fractura(3, 'Puede moverla con algo de dolor',   movimiento_doloroso_frac).
opcion_fractura(3, 'Movimiento normal con dolor leve',  movimiento_normal_frac).

opcion_fractura(4, 'Dolor muy intenso y constante', dolor_intenso_frac).
opcion_fractura(4, 'Dolor moderado al presionar',   dolor_moderado_frac).
opcion_fractura(4, 'Dolor leve o puntual',          dolor_leve_frac).
opcion_fractura(4, 'Sin dolor significativo',       sin_dolor_frac).

opcion_fractura(5, 'Hormigueo o pérdida de sensibilidad', hormigueo_frac).
opcion_fractura(5, 'Piel pálida, fría o sudoración fría', shock_frac).
opcion_fractura(5, 'Hemorragia visible en la zona',       sangrado_frac).
opcion_fractura(5, 'Ninguno de los anteriores',           sin_alarma_frac).

sintoma_emergencia_fractura(hueso_expuesto).
sintoma_emergencia_fractura(zona_columna).
sintoma_emergencia_fractura(hormigueo_frac).
sintoma_emergencia_fractura(shock_frac).
sintoma_emergencia_fractura(sangrado_frac).

respuestas_fractura_a_sintomas(Respuestas, Sintomas) :-
    findall(Sint,
        ( nth1(Idx, Respuestas, R),
          ( string(R) -> atom_string(RAtom, R) ; RAtom = R ),
          opcion_fractura(Idx, RAtom, Sint)
        ),
        Sintomas).

hay_emergencia_fractura(Sintomas) :-
    member(S, Sintomas), sintoma_emergencia_fractura(S), !.

nivel_fractura(grave, Sintomas) :-
    member(S, Sintomas), sintoma_emergencia_fractura(S), !.
nivel_fractura(moderada, Sintomas) :-
    ( member(deformidad_frac, Sintomas)
    ; member(no_puede_mover_frac, Sintomas)
    ; member(dolor_intenso_frac, Sintomas)
    ), !.
nivel_fractura(leve, _).

diagnostico(fractura, Respuestas, EsEmergencia, Severidad, Recomendaciones) :-
    respuestas_fractura_a_sintomas(Respuestas, Sintomas),
    ( nivel_fractura(grave, Sintomas)    -> Nivel = grave
    ; nivel_fractura(moderada, Sintomas) -> Nivel = moderada
    ;                                       Nivel = leve ),
    ( hay_emergencia_fractura(Sintomas) -> EsEmergencia = true ; EsEmergencia = false ),
    ( Nivel = grave ->
        Severidad = high,
        Recomendaciones = [
            'Llama al 911 de inmediato',
            'NO muevas a la persona si sospechas lesión en columna o cuello',
            'Si hay hueso expuesto, cubre con gasa limpia sin presionar ni intentar recolocar el hueso',
            'Controla el sangrado aplicando presión suave alrededor de la herida, no sobre ella',
            'Si hay hormigueo o pérdida de sensibilidad, inmoviliza sin forzar ninguna posición',
            'Mantén a la persona calmada y abrigada hasta que llegue la ayuda',
            'NO administres alimentos ni medicamentos por la boca'
        ]
    ; Nivel = moderada ->
        Severidad = medium,
        Recomendaciones = [
            'Inmoviliza la zona usando férulas improvisadas (tabla, revista, cartón) con vendas',
            'NO intentes realinear el hueso ni forzar una posición',
            'Aplica hielo envuelto en tela durante 20 minutos para reducir la inflamación',
            'Eleva la extremidad si es posible y no aumenta el dolor',
            'Traslada a urgencias lo antes posible para radiografía',
            'Monitorea circulación distal: color, temperatura y pulso en dedos'
        ]
    ;
        Severidad = low,
        Recomendaciones = [
            'Inmoviliza la zona y evita apoyar o cargar peso sobre ella',
            'Aplica hielo envuelto en tela 15-20 minutos para la inflamación',
            'Eleva la extremidad afectada',
            'Consulta a urgencias para descartar fractura con radiografía',
            'No fuerces movimiento aunque el dolor sea tolerable',
            'Evita masajear la zona afectada'
        ]
    ).

% ============================================================
% MÓDULO: INTOXICACIÓN
% ============================================================

pregunta(intoxicacion, 1, 'Cómo ocurrió la intoxicación').
pregunta(intoxicacion, 2, 'Estado de consciencia de la persona').
pregunta(intoxicacion, 3, 'Tiempo transcurrido desde la exposición').
pregunta(intoxicacion, 4, 'Síntomas que presenta actualmente').
pregunta(intoxicacion, 5, 'Conocimiento sobre la sustancia involucrada').

total_preguntas(intoxicacion, 5).

opcion_intoxicacion(1, 'Ingirió medicamentos en exceso',   ingestion_medicamentos).
opcion_intoxicacion(1, 'Ingirió una sustancia química',    ingestion_quimica).
opcion_intoxicacion(1, 'Ingirió alimentos en mal estado',  ingestion_alimentos).
opcion_intoxicacion(1, 'Inhaló gases, vapores o humo',    inhalacion_tox).
opcion_intoxicacion(1, 'Contacto con piel o mucosas',     contacto_piel_tox).
opcion_intoxicacion(1, 'No sé cómo ocurrió',              causa_desconocida_tox).

opcion_intoxicacion(2, 'Consciente y alerta',             consciente_tox).
opcion_intoxicacion(2, 'Confundida o desorientada',       semi_consciente_tox).
opcion_intoxicacion(2, 'Somnolenta o difícil de despertar', somnolenta_tox).
opcion_intoxicacion(2, 'Inconsciente o no responde',      inconsciente_tox).

opcion_intoxicacion(3, 'Hace menos de 1 hora',   tiempo_reciente_tox).
opcion_intoxicacion(3, 'Entre 1 y 3 horas',      tiempo_moderado_tox).
opcion_intoxicacion(3, 'Más de 3 horas',         tiempo_tardio_tox).
opcion_intoxicacion(3, 'No sé cuándo ocurrió',   tiempo_desconocido_tox).

opcion_intoxicacion(4, 'Náuseas o vómito',                    nauseas_tox).
opcion_intoxicacion(4, 'Dificultad para respirar',            dificultad_respirar_tox).
opcion_intoxicacion(4, 'Convulsiones',                        convulsiones_tox).
opcion_intoxicacion(4, 'Quemaduras en boca o garganta',       quemaduras_internas_tox).
opcion_intoxicacion(4, 'Dolor abdominal intenso',             dolor_abdominal_tox).
opcion_intoxicacion(4, 'Sin síntomas claros por ahora',       sin_sintomas_tox).

opcion_intoxicacion(5, 'Sí, sé exactamente qué fue',    sustancia_conocida_tox).
opcion_intoxicacion(5, 'Tengo una idea aproximada',      sustancia_probable_tox).
opcion_intoxicacion(5, 'No sé qué sustancia fue',       sustancia_desconocida_tox).

sintoma_emergencia_intoxicacion(inconsciente_tox).
sintoma_emergencia_intoxicacion(convulsiones_tox).
sintoma_emergencia_intoxicacion(dificultad_respirar_tox).
sintoma_emergencia_intoxicacion(quemaduras_internas_tox).

respuestas_intoxicacion_a_sintomas(Respuestas, Sintomas) :-
    findall(Sint,
        ( nth1(Idx, Respuestas, R),
          ( string(R) -> atom_string(RAtom, R) ; RAtom = R ),
          opcion_intoxicacion(Idx, RAtom, Sint)
        ),
        Sintomas).

hay_emergencia_intoxicacion(Sintomas) :-
    member(S, Sintomas), sintoma_emergencia_intoxicacion(S), !.

nivel_intoxicacion(grave, Sintomas) :-
    member(S, Sintomas), sintoma_emergencia_intoxicacion(S), !.
nivel_intoxicacion(moderada, Sintomas) :-
    ( member(semi_consciente_tox, Sintomas)
    ; member(somnolenta_tox, Sintomas)
    ; member(ingestion_quimica, Sintomas)
    ; member(ingestion_medicamentos, Sintomas)
    ), !.
nivel_intoxicacion(leve, _).

diagnostico(intoxicacion, Respuestas, EsEmergencia, Severidad, Recomendaciones) :-
    respuestas_intoxicacion_a_sintomas(Respuestas, Sintomas),
    ( nivel_intoxicacion(grave, Sintomas)    -> Nivel = grave
    ; nivel_intoxicacion(moderada, Sintomas) -> Nivel = moderada
    ;                                           Nivel = leve ),
    ( hay_emergencia_intoxicacion(Sintomas) -> EsEmergencia = true ; EsEmergencia = false ),
    ( Nivel = grave ->
        Severidad = high,
        Recomendaciones = [
            'Llama al 911 de inmediato',
            'Si está inconsciente y respira, coloca en posición lateral de seguridad',
            'Si no respira, inicia RCP de inmediato',
            'NO induzcas el vómito salvo indicación médica expresa',
            'NO des nada por la boca mientras esté inconsciente',
            'Lleva el envase o identifica la sustancia para informar a los médicos',
            'Si fue inhalación, traslada a aire fresco de inmediato',
            'Si fue contacto con piel, lava con agua abundante sin frotar'
        ]
    ; Nivel = moderada ->
        Severidad = medium,
        Recomendaciones = [
            'Llama al Centro de Toxicología o a urgencias de inmediato',
            'Identifica la sustancia y la cantidad aproximada ingerida',
            'NO induzcas el vómito sin indicación médica',
            'Mantén a la persona despierta y bajo vigilancia constante',
            'Si ingirió medicamentos, guarda el frasco para mostrarlo al médico',
            'Si hay vómito espontáneo, protege la vía aérea colocando de lado',
            'Traslada a urgencias aunque los síntomas parezcan leves por ahora'
        ]
    ;
        Severidad = low,
        Recomendaciones = [
            'Llama a urgencias o al Centro de Toxicología para orientación',
            'Identifica la sustancia y el tiempo transcurrido',
            'Mantén a la persona en reposo y bajo observación',
            'Si hay náuseas, ofrece pequeños sorbos de agua (solo si no fue sustancia química)',
            'NO des leche ni carbón activado sin indicación médica',
            'Traslada a urgencias si aparece cualquier síntoma nuevo'
        ]
    ).

% ============================================================
% MÓDULO: PICADURA / MORDEDURA
% ============================================================

pregunta(picadura, 1, 'Tipo de animal que causó la picadura o mordedura').
pregunta(picadura, 2, 'Zona del cuerpo afectada').
pregunta(picadura, 3, 'Síntomas que aparecieron').
pregunta(picadura, 4, 'Antecedentes de alergia a picaduras o venenos').
pregunta(picadura, 5, 'Tiempo transcurrido desde la picadura').

total_preguntas(picadura, 5).

opcion_picadura(1, 'Abeja, avispa o hormiga',  insecto_comun).
opcion_picadura(1, 'Araña',                    arana).
opcion_picadura(1, 'Serpiente',                serpiente).
opcion_picadura(1, 'Escorpión o alacrán',      escorpion).
opcion_picadura(1, 'Perro u otro mamífero',    mamifero).
opcion_picadura(1, 'No lo identifiqué',        animal_desconocido).

opcion_picadura(2, 'Cara o cuello',   zona_cara_cuello_pic).
opcion_picadura(2, 'Brazo o pierna',  zona_extremidad_pic).
opcion_picadura(2, 'Mano o pie',      zona_mano_pie_pic).
opcion_picadura(2, 'Torso o espalda', zona_torso_pic).

opcion_picadura(3, 'Solo dolor e inflamación local',             dolor_local_pic).
opcion_picadura(3, 'Reacción alérgica: urticaria generalizada',  reaccion_alergica_pic).
opcion_picadura(3, 'Dificultad para respirar o tragar',         dificultad_respirar_pic).
opcion_picadura(3, 'Náuseas, mareo o debilidad general',        sintomas_sistemicos_pic).
opcion_picadura(3, 'Entumecimiento que se extiende',            entumecimiento_pic).
opcion_picadura(3, 'Herida profunda con sangrado',              herida_profunda_pic).

opcion_picadura(4, 'Sí, tiene alergia conocida', alergia_conocida_pic).
opcion_picadura(4, 'No tiene alergias',          sin_alergia_pic).
opcion_picadura(4, 'No lo sé',                   alergia_desconocida_pic).

opcion_picadura(5, 'Hace menos de 30 minutos', pic_reciente).
opcion_picadura(5, 'Entre 30 min y 2 horas',   pic_moderada).
opcion_picadura(5, 'Más de 2 horas',           pic_tardio).

sintoma_emergencia_picadura(reaccion_alergica_pic).
sintoma_emergencia_picadura(dificultad_respirar_pic).
sintoma_emergencia_picadura(serpiente).
sintoma_emergencia_picadura(escorpion).
sintoma_emergencia_picadura(alergia_conocida_pic).

respuestas_picadura_a_sintomas(Respuestas, Sintomas) :-
    findall(Sint,
        ( nth1(Idx, Respuestas, R),
          ( string(R) -> atom_string(RAtom, R) ; RAtom = R ),
          opcion_picadura(Idx, RAtom, Sint)
        ),
        Sintomas).

hay_emergencia_picadura(Sintomas) :-
    member(S, Sintomas), sintoma_emergencia_picadura(S), !.

nivel_picadura(grave, Sintomas) :-
    member(S, Sintomas), sintoma_emergencia_picadura(S), !.
nivel_picadura(moderada, Sintomas) :-
    ( member(mamifero, Sintomas)
    ; member(sintomas_sistemicos_pic, Sintomas)
    ; member(entumecimiento_pic, Sintomas)
    ; member(herida_profunda_pic, Sintomas)
    ; member(zona_cara_cuello_pic, Sintomas)
    ), !.
nivel_picadura(leve, _).

diagnostico(picadura, Respuestas, EsEmergencia, Severidad, Recomendaciones) :-
    respuestas_picadura_a_sintomas(Respuestas, Sintomas),
    ( nivel_picadura(grave, Sintomas)    -> Nivel = grave
    ; nivel_picadura(moderada, Sintomas) -> Nivel = moderada
    ;                                       Nivel = leve ),
    ( hay_emergencia_picadura(Sintomas) -> EsEmergencia = true ; EsEmergencia = false ),
    ( Nivel = grave ->
        Severidad = high,
        Recomendaciones = [
            'Llama al 911 de inmediato',
            'Si hay dificultad para respirar o anafilaxia: aplica adrenalina (EpiPen) si está disponible',
            'Acuesta a la persona y eleva las piernas (excepto si hay dificultad respiratoria)',
            'Si fue mordedura de serpiente: inmoviliza la extremidad por debajo del corazón',
            'NO hagas torniquete, NO cortes la herida, NO intentes succionar el veneno',
            'Si fue escorpión: traslada a urgencias aunque los síntomas sean leves',
            'Retira anillos y pulseras en la zona antes de que aparezca la inflamación',
            'Mantén a la persona calmada y quieta para reducir la circulación del veneno'
        ]
    ; Nivel = moderada ->
        Severidad = medium,
        Recomendaciones = [
            'Lava la herida con agua y jabón abundante durante al menos 5 minutos',
            'Traslada a urgencias para evaluación médica',
            'Si fue mordedura de mamífero: es necesaria la evaluación para profilaxis antirrábica',
            'Retira el aguijón si está presente raspando con una tarjeta, no con pinzas',
            'Aplica hielo envuelto en tela durante 10-15 minutos',
            'Observa síntomas de reacción alérgica durante las próximas horas'
        ]
    ;
        Severidad = low,
        Recomendaciones = [
            'Retira el aguijón si está presente raspando suavemente con una tarjeta',
            'Lava la zona con agua y jabón',
            'Aplica hielo envuelto en tela durante 10-15 minutos',
            'Puedes aplicar crema con hidrocortisona o tomar un antihistamínico oral',
            'Observa la zona durante las próximas horas por si aparece reacción alérgica',
            'Consulta médico si la inflamación o el dolor aumentan significativamente'
        ]
    ).

% ============================================================
% MÓDULO: DESCARGA ELÉCTRICA
% ============================================================

pregunta(descarga, 1, 'Estado de contacto con la fuente eléctrica').
pregunta(descarga, 2, 'Estado de consciencia y respiración').
pregunta(descarga, 3, 'Tipo de corriente o fuente eléctrica').
pregunta(descarga, 4, 'Quemaduras o marcas visibles').
pregunta(descarga, 5, 'Síntomas adicionales').

total_preguntas(descarga, 5).

opcion_descarga(1, 'Sigue en contacto con la fuente eléctrica', sigue_en_contacto_desc).
opcion_descarga(1, 'Ya no está en contacto',                    sin_contacto_desc).
opcion_descarga(1, 'No estoy seguro',                           contacto_desconocido_desc).

opcion_descarga(2, 'Consciente y alerta',           consciente_desc).
opcion_descarga(2, 'Consciente pero confundida',    confundido_desc).
opcion_descarga(2, 'Inconsciente pero respira',     inconsciente_desc).
opcion_descarga(2, 'No respira o no tiene pulso',   sin_respiracion_desc).

opcion_descarga(3, 'Corriente doméstica (110-220V)', corriente_baja_desc).
opcion_descarga(3, 'Alta tensión o línea eléctrica', corriente_alta_desc).
opcion_descarga(3, 'Rayo o relámpago',               rayo_desc).
opcion_descarga(3, 'No lo sé',                       fuente_desconocida_desc).

opcion_descarga(4, 'Quemaduras evidentes de entrada/salida', quemaduras_desc).
opcion_descarga(4, 'Enrojecimiento o marcas leves',          marcas_leves_desc).
opcion_descarga(4, 'Sin marcas visibles',                    sin_marcas_desc).

opcion_descarga(5, 'Dolor en el pecho o palpitaciones',   dolor_pecho_desc).
opcion_descarga(5, 'Convulsiones',                        convulsiones_desc).
opcion_descarga(5, 'Parálisis o pérdida de sensibilidad', paralisis_desc).
opcion_descarga(5, 'Solo dolor local en la zona',         dolor_local_desc).
opcion_descarga(5, 'Sin síntomas adicionales',            sin_sintomas_desc).

sintoma_emergencia_descarga(sigue_en_contacto_desc).
sintoma_emergencia_descarga(inconsciente_desc).
sintoma_emergencia_descarga(sin_respiracion_desc).
sintoma_emergencia_descarga(corriente_alta_desc).
sintoma_emergencia_descarga(rayo_desc).
sintoma_emergencia_descarga(dolor_pecho_desc).
sintoma_emergencia_descarga(convulsiones_desc).

respuestas_descarga_a_sintomas(Respuestas, Sintomas) :-
    findall(Sint,
        ( nth1(Idx, Respuestas, R),
          ( string(R) -> atom_string(RAtom, R) ; RAtom = R ),
          opcion_descarga(Idx, RAtom, Sint)
        ),
        Sintomas).

hay_emergencia_descarga(Sintomas) :-
    member(S, Sintomas), sintoma_emergencia_descarga(S), !.

nivel_descarga(grave, Sintomas) :-
    member(S, Sintomas), sintoma_emergencia_descarga(S), !.
nivel_descarga(moderada, Sintomas) :-
    ( member(confundido_desc, Sintomas)
    ; member(quemaduras_desc, Sintomas)
    ; member(paralisis_desc, Sintomas)
    ), !.
nivel_descarga(leve, _).

diagnostico(descarga, Respuestas, EsEmergencia, Severidad, Recomendaciones) :-
    respuestas_descarga_a_sintomas(Respuestas, Sintomas),
    ( nivel_descarga(grave, Sintomas)    -> Nivel = grave
    ; nivel_descarga(moderada, Sintomas) -> Nivel = moderada
    ;                                       Nivel = leve ),
    ( hay_emergencia_descarga(Sintomas) -> EsEmergencia = true ; EsEmergencia = false ),
    ( Nivel = grave ->
        Severidad = high,
        Recomendaciones = [
            'Llama al 911 de inmediato',
            'NUNCA toques a la persona si aún está en contacto con la corriente',
            'Corta la electricidad desde el interruptor general antes de acercarte',
            'Si no puedes cortar la corriente, usa un objeto no conductor (madera seca) para alejar a la persona',
            'Si no respira ni tiene pulso: inicia RCP de inmediato',
            'Toda descarga eléctrica requiere evaluación médica urgente aunque la persona parezca estable',
            'Las lesiones internas pueden ser graves aunque la piel no muestre marcas',
            'NO muevas a la persona si sospechas lesión en columna'
        ]
    ; Nivel = moderada ->
        Severidad = medium,
        Recomendaciones = [
            'Traslada a urgencias de inmediato para evaluación cardíaca',
            'Toda descarga requiere monitoreo cardíaco aunque parezca leve',
            'Cubre las quemaduras con gasa limpia y seca',
            'NO apliques agua fría, hielo ni pomadas en quemaduras eléctricas',
            'Mantén a la persona acostada y en reposo',
            'Monitorea respiración y pulso constantemente',
            'Los daños internos pueden ser mayores que los externos visibles'
        ]
    ;
        Severidad = low,
        Recomendaciones = [
            'Acude a urgencias para evaluación médica aunque te sientas bien',
            'Las descargas pueden causar arritmias que aparecen horas después',
            'Informa al médico del tipo de corriente y el tiempo de contacto',
            'Observa palpitaciones, mareo, dolor de pecho o confusión',
            'No conduzcas ni realices actividades físicas hasta recibir alta médica'
        ]
    ).

% ============================================================
% MÓDULO: INSOLACIÓN
% ============================================================

pregunta(insolacion, 1, 'Tiempo de exposición al calor o al sol').
pregunta(insolacion, 2, 'Síntomas que presenta actualmente').
pregunta(insolacion, 3, 'Estado de la piel').
pregunta(insolacion, 4, 'Estado de consciencia').
pregunta(insolacion, 5, 'Hidratación reciente').

total_preguntas(insolacion, 5).

opcion_insolacion(1, 'Menos de 1 hora',     exposicion_corta_insol).
opcion_insolacion(1, 'Entre 1 y 3 horas',   exposicion_moderada_insol).
opcion_insolacion(1, 'Más de 3 horas',      exposicion_prolongada_insol).
opcion_insolacion(1, 'No estoy seguro',     exposicion_desconocida_insol).

opcion_insolacion(2, 'Mareo y debilidad',                      mareo_insol).
opcion_insolacion(2, 'Dolor de cabeza intenso',                cefalea_insol).
opcion_insolacion(2, 'Náuseas o vómito',                       nauseas_insol).
opcion_insolacion(2, 'Calambres musculares',                   calambres_insol).
opcion_insolacion(2, 'Confusión o comportamiento extraño',     confusion_insol).
opcion_insolacion(2, 'Pérdida de consciencia',                 desmayo_insol).

opcion_insolacion(3, 'Piel muy caliente, seca, sin sudoración', piel_seca_caliente_insol).
opcion_insolacion(3, 'Piel húmeda, pálida y fría al tacto',     piel_humeda_fria_insol).
opcion_insolacion(3, 'Piel enrojecida con algo de sudoración',  piel_enrojecida_insol).
opcion_insolacion(3, 'Sin cambios evidentes en la piel',        sin_cambios_piel_insol).

opcion_insolacion(4, 'Consciente y orientada',           consciente_insol).
opcion_insolacion(4, 'Confundida o desorientada',        confundida_insol).
opcion_insolacion(4, 'Somnolenta, difícil de despertar', somnolenta_insol).
opcion_insolacion(4, 'Inconsciente',                     inconsciente_insol).

opcion_insolacion(5, 'Sí, ha bebido agua recientemente', hidratada_insol).
opcion_insolacion(5, 'No ha bebido agua en horas',       deshidratada_insol).
opcion_insolacion(5, 'No estoy seguro',                  hidratacion_desconocida_insol).

sintoma_emergencia_insolacion(piel_seca_caliente_insol).
sintoma_emergencia_insolacion(confusion_insol).
sintoma_emergencia_insolacion(desmayo_insol).
sintoma_emergencia_insolacion(inconsciente_insol).
sintoma_emergencia_insolacion(confundida_insol).
sintoma_emergencia_insolacion(somnolenta_insol).

respuestas_insolacion_a_sintomas(Respuestas, Sintomas) :-
    findall(Sint,
        ( nth1(Idx, Respuestas, R),
          ( string(R) -> atom_string(RAtom, R) ; RAtom = R ),
          opcion_insolacion(Idx, RAtom, Sint)
        ),
        Sintomas).

hay_emergencia_insolacion(Sintomas) :-
    member(S, Sintomas), sintoma_emergencia_insolacion(S), !.

nivel_insolacion(grave, Sintomas) :-
    member(S, Sintomas), sintoma_emergencia_insolacion(S), !.
nivel_insolacion(moderada, Sintomas) :-
    ( member(exposicion_prolongada_insol, Sintomas)
    ; member(deshidratada_insol, Sintomas)
    ; member(nauseas_insol, Sintomas)
    ; member(cefalea_insol, Sintomas)
    ), !.
nivel_insolacion(leve, _).

diagnostico(insolacion, Respuestas, EsEmergencia, Severidad, Recomendaciones) :-
    respuestas_insolacion_a_sintomas(Respuestas, Sintomas),
    ( nivel_insolacion(grave, Sintomas)    -> Nivel = grave
    ; nivel_insolacion(moderada, Sintomas) -> Nivel = moderada
    ;                                         Nivel = leve ),
    ( hay_emergencia_insolacion(Sintomas) -> EsEmergencia = true ; EsEmergencia = false ),
    ( Nivel = grave ->
        Severidad = high,
        Recomendaciones = [
            'Llama al 911 de inmediato: el golpe de calor es una emergencia vital',
            'Lleva a la persona a un lugar fresco y con sombra de inmediato',
            'Enfría el cuerpo con todo lo disponible: agua fría, paños húmedos, abanico',
            'Si está inconsciente, coloca en posición lateral de seguridad',
            'Aplica agua fría en cuello, axilas e ingles para bajar la temperatura rápido',
            'NO des líquidos por la boca si está inconsciente o muy confundida',
            'Si está consciente y puede tragar, ofrece agua fría a pequeños sorbos',
            'Continúa enfriando hasta que llegue la ayuda médica'
        ]
    ; Nivel = moderada ->
        Severidad = medium,
        Recomendaciones = [
            'Retira a la persona del sol o calor de inmediato',
            'Lleva a un lugar fresco, con sombra y ventilación',
            'Afloja o retira ropa innecesaria',
            'Ofrece agua fresca a sorbos pequeños y frecuentes',
            'Aplica paños húmedos fríos en frente, cuello y muñecas',
            'Recuéstala con las piernas ligeramente elevadas',
            'Traslada a urgencias si no mejora en 30 minutos o los síntomas empeoran'
        ]
    ;
        Severidad = low,
        Recomendaciones = [
            'Busca un lugar fresco y con sombra de inmediato',
            'Bebe agua fresca a sorbos moderados, no de golpe',
            'Descansa y evita la exposición solar al menos 2 horas',
            'Aplica un paño húmedo frío en la frente y cuello',
            'Evita bebidas con cafeína o alcohol',
            'Si los síntomas no mejoran en 1 hora, busca atención médica'
        ]
    ).

% ============================================================
% MÓDULO: CONVULSIONES
% ============================================================

pregunta(convulsion, 1, 'Estado actual de la convulsión').
pregunta(convulsion, 2, 'Duración de la convulsión').
pregunta(convulsion, 3, 'Antecedentes de epilepsia o convulsiones previas').
pregunta(convulsion, 4, 'Estado posterior a la convulsión').
pregunta(convulsion, 5, 'Causa aparente de la convulsión').

total_preguntas(convulsion, 5).

opcion_convulsion(1, 'Sigue convulsionando ahora mismo',       convulsionando_ahora).
opcion_convulsion(1, 'La convulsión ya terminó',               convulsion_terminada).
opcion_convulsion(1, 'No estoy seguro si fue convulsión',      convulsion_dudosa).

opcion_convulsion(2, 'Menos de 2 minutos',   conv_menos_2min).
opcion_convulsion(2, 'Entre 2 y 5 minutos',  conv_entre_2y5min).
opcion_convulsion(2, 'Más de 5 minutos',     conv_mas_5min).
opcion_convulsion(2, 'No sé cuánto duró',    conv_tiempo_desconocido).

opcion_convulsion(3, 'Sí, tiene epilepsia diagnosticada', epileptico_conv).
opcion_convulsion(3, 'Sí, ha tenido convulsiones antes',  antecedentes_conv).
opcion_convulsion(3, 'No, es la primera vez',             primera_vez_conv).
opcion_convulsion(3, 'No lo sé',                          antecedentes_desconocidos_conv).

opcion_convulsion(4, 'Se recuperó y está consciente',   recuperado_conv).
opcion_convulsion(4, 'Está somnolenta y confundida',    post_ictal_conv).
opcion_convulsion(4, 'Inconsciente, no responde',       inconsciente_conv).
opcion_convulsion(4, 'Tuvo otra convulsión seguida',    convulsiones_repetidas_conv).

opcion_convulsion(5, 'Fiebre muy alta',                  conv_fiebre).
opcion_convulsion(5, 'Golpe o trauma en la cabeza',      conv_trauma).
opcion_convulsion(5, 'Intoxicación o sustancia conocida', conv_intoxicacion).
opcion_convulsion(5, 'Embarazo',                         conv_embarazo).
opcion_convulsion(5, 'Sin causa aparente',               sin_causa_conv).

sintoma_emergencia_convulsion(conv_mas_5min).
sintoma_emergencia_convulsion(inconsciente_conv).
sintoma_emergencia_convulsion(convulsiones_repetidas_conv).
sintoma_emergencia_convulsion(conv_trauma).
sintoma_emergencia_convulsion(conv_embarazo).
sintoma_emergencia_convulsion(primera_vez_conv).
sintoma_emergencia_convulsion(conv_intoxicacion).

respuestas_convulsion_a_sintomas(Respuestas, Sintomas) :-
    findall(Sint,
        ( nth1(Idx, Respuestas, R),
          ( string(R) -> atom_string(RAtom, R) ; RAtom = R ),
          opcion_convulsion(Idx, RAtom, Sint)
        ),
        Sintomas).

hay_emergencia_convulsion(Sintomas) :-
    member(S, Sintomas), sintoma_emergencia_convulsion(S), !.

nivel_convulsion(grave, Sintomas) :-
    member(S, Sintomas), sintoma_emergencia_convulsion(S), !.
nivel_convulsion(moderada, Sintomas) :-
    ( member(convulsionando_ahora, Sintomas)
    ; member(post_ictal_conv, Sintomas)
    ; member(conv_fiebre, Sintomas)
    ), !.
nivel_convulsion(leve, _).

diagnostico(convulsion, Respuestas, EsEmergencia, Severidad, Recomendaciones) :-
    respuestas_convulsion_a_sintomas(Respuestas, Sintomas),
    ( nivel_convulsion(grave, Sintomas)    -> Nivel = grave
    ; nivel_convulsion(moderada, Sintomas) -> Nivel = moderada
    ;                                         Nivel = leve ),
    ( hay_emergencia_convulsion(Sintomas) -> EsEmergencia = true ; EsEmergencia = false ),
    ( Nivel = grave ->
        Severidad = high,
        Recomendaciones = [
            'Llama al 911 de inmediato',
            'Protege la cabeza: coloca algo suave debajo (ropa doblada)',
            'Despeja el área: aleja objetos duros o cortantes',
            'NO introduzcas nada en la boca, NO sostengas a la persona con fuerza',
            'NO intentes sujetar las extremidades ni detener los movimientos convulsivos',
            'Si la convulsión dura más de 5 minutos, es una emergencia neurológica crítica',
            'Al terminar, coloca en posición lateral de seguridad para evitar aspiración',
            'Anota la duración y las características para informar al médico'
        ]
    ; Nivel = moderada ->
        Severidad = medium,
        Recomendaciones = [
            'Protege a la persona de golpearse durante la convulsión',
            'Coloca algo suave bajo la cabeza y despeja el área',
            'Cronometra la duración: si supera 5 minutos, llama al 911',
            'Al terminar, coloca en posición lateral de seguridad',
            'Habla con calma cuando recupere la consciencia: puede estar confundida',
            'Traslada a urgencias para evaluación, especialmente si fue por fiebre alta',
            'NO ofrezcas agua ni alimentos hasta que esté completamente alerta'
        ]
    ;
        Severidad = low,
        Recomendaciones = [
            'Si es epiléptico conocido y la convulsión fue breve, observa la recuperación',
            'Coloca en posición lateral de seguridad tras la convulsión',
            'Deja que descanse en un lugar tranquilo y seguro',
            'No dejes sola a la persona durante al menos 30 minutos',
            'Ofrece agua y tranquilidad cuando esté completamente alerta',
            'Comunica el episodio al médico tratante en las próximas horas',
            'Llama al 911 si hay segunda convulsión, dificultad respiratoria o no recupera la consciencia'
        ]
    ).
    
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

:- initialization(start, start).
start :-
    % 1. Leer el puerto asignado por Railway o usar 8000 en local
    (   getenv('PORT', PortAtom)
    ->  atom_number(PortAtom, Port)
    ;   Port = 8000 
    ),
    
    % 2. Iniciar el servidor
    http_server(http_dispatch, [port(Port)]),
    
    % 3. CRÍTICO: Evitar que el hilo principal termine. 
    % Si esto no está, Railway apagará tu servidor instantáneamente.
    thread_get_message(_).
