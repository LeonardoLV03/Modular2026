% ============================================================
%   SISTEMA DE DIAGNÓSTICO DE HEMORRAGIAS  v3
%
%   Cambios respecto a v2:
%   - Salida anticipada si algún caso supera el 70%
%   - Cada categoría de pregunta se hace UNA sola vez
%   - Las respuestas de emergencia y de casos comparten el
%     mismo almacén sintoma_presente/1, sin repeticiones
%
%   Conceptos: dynamic, assertz, retractall, member, length,
%              append, read, write, format, !, findall, msort
% ============================================================

:- dynamic sintoma_presente/1.   % síntomas confirmados
:- dynamic pregunta_hecha/1.     % IDs de preguntas ya respondidas

% ============================================================
% 1. BASE DE CASOS Y ACCIONES
% ============================================================

caso(hemorragia_leve,    [sangrado_poco, herida_superficial]).
caso(hemorragia_media,   [sangrado_constante, dolor_moderado, inflamacion]).
caso(hemorragia_grave,   [sangrado_abundante, mareo, debilidad, piel_palida]).
caso(hemorragia_interna, [dolor_intenso, moretones, mareo, debilidad]).

accion(hemorragia_leve,
    'Limpiar la herida, aplicar presion directa y cubrir con gasa esteril').
accion(hemorragia_media,
    'Presion directa continua, vendar firmemente y elevar la zona').
accion(hemorragia_grave,
    'Presion inmediata, NO retirar el vendaje, llamar al 911').
accion(hemorragia_interna,
    'Reposo absoluto, NO dar alimentos ni liquidos, llamar al 911').

% Síntomas que activan alerta de emergencia
sintoma_emergencia(sangrado_abundante).
sintoma_emergencia(sangre_a_chorros).
sintoma_emergencia(desmayo).
sintoma_emergencia(piel_fria).

% ============================================================
% 2. PREGUNTAS CON OPCIONES PREDEFINIDAS
%
%    Cada pregunta cubre UNA categoría completa.
%    Al elegir una opción, sus síntomas se registran
%    y la categoría queda cerrada (pregunta_hecha).
%
%    Formato: pregunta(ID, Titulo, [Num-Texto-[Sintomas]])
% ============================================================

pregunta(1, 'Tipo de sangrado que presenta el paciente', [
    1 - 'Poco  (manchas o goteo leve)'         - [sangrado_poco],
    2 - 'Constante  (flujo moderado continuo)' - [sangrado_constante],
    3 - 'Abundante  (flujo fuerte)'            - [sangrado_abundante],
    4 - 'A chorros / extremadamente intenso'   - [sangrado_abundante, sangre_a_chorros],
    5 - 'Sin sangrado visible'                 - []
]).

pregunta(2, 'Herida visible en el cuerpo', [
    1 - 'Herida superficial visible' - [herida_superficial],
    2 - 'Sin herida visible'         - []
]).

pregunta(3, 'Tipo de dolor que reporta el paciente', [
    1 - 'Dolor moderado' - [dolor_moderado],
    2 - 'Dolor intenso'  - [dolor_intenso],
    3 - 'Sin dolor'      - []
]).

pregunta(4, 'Estado y aspecto de la piel', [
    1 - 'Palida solamente'    - [piel_palida],
    2 - 'Fria y palida'       - [piel_palida, piel_fria],
    3 - 'Moretones visibles'  - [moretones],
    4 - 'Normal, sin cambios' - []
]).

pregunta(5, 'Sintomas generales del paciente', [
    1 - 'Mareo unicamente'                - [mareo],
    2 - 'Debilidad unicamente'            - [debilidad],
    3 - 'Mareo y debilidad juntos'        - [mareo, debilidad],
    4 - 'Inflamacion en la zona afectada' - [inflamacion],
    5 - 'Perdida del conocimiento'        - [desmayo],
    6 - 'Ninguno de los anteriores'       - []
]).

% ============================================================
% 3. AUXILIARES DE LISTAS
% ============================================================

% Aplana los síntomas de todas las opciones en una lista
todos_los_sintomas([], []).
todos_los_sintomas([_-_-Ss | Resto], Todos) :-
    todos_los_sintomas(Resto, STail),
    append(Ss, STail, Todos).

% ============================================================
% 4. REGISTRAR SÍNTOMAS (assertz, sin duplicados)
% ============================================================

registrar_sintomas([]).
registrar_sintomas([S | Resto]) :-
    ( sintoma_presente(S) -> true ; assertz(sintoma_presente(S)) ),
    registrar_sintomas(Resto).

% ============================================================
% 5. MOSTRAR OPCIONES
% ============================================================

mostrar_opciones([]).
mostrar_opciones([Num-Texto-_ | Resto]) :-
    format('    ~w. ~w~n', [Num, Texto]),
    mostrar_opciones(Resto).

% ============================================================
% 6. LEER OPCIÓN CON VALIDACIÓN (usa !)
% ============================================================

leer_opcion(Opciones, SintomasElegidos) :-
    write('  Su eleccion (numero + punto): '),
    read(Num),
    ( member(Num-_-SintomasElegidos, Opciones) ->
        true
    ;
        write('  Opcion invalida. Intente de nuevo.'), nl,
        leer_opcion(Opciones, SintomasElegidos)
    ).

% ============================================================
% 7. PORCENTAJE (entero 0-100, evita division entera incorrecta)
% ============================================================

contar_presentes([], 0).
contar_presentes([S | Resto], N) :-
    ( sintoma_presente(S) ->
        contar_presentes(Resto, Sub),
        N is Sub + 1
    ;
        contar_presentes(Resto, N)
    ).

pct_caso(Caso, Pct) :-
    caso(Caso, Lista),
    length(Lista, Total),
    contar_presentes(Lista, Coinciden),
    Pct is (Coinciden * 100) // Total.

% ============================================================
% 8. CONDICIÓN DE SALIDA ANTICIPADA
%
%    Se activa si ALGÚN caso ya superó el 70%.
%    Esto cubre tanto el 75% (3 de 4 síntomas) como el 100%.
%    Usa ! para detener la búsqueda al primer caso encontrado.
% ============================================================

hay_caso_sobre_umbral_salida :-
    caso(Caso, _),
    pct_caso(Caso, Pct),
    Pct > 70,          % >70%: cubre 75%, 100%
    !.

% ============================================================
% 9. FILTRADO DE PREGUNTAS
%
%    Una pregunta se HACE si:
%      (a) NO fue hecha antes (pregunta_hecha/1)
%      (b) Alguno de sus síntomas posibles está en algún caso
%          Y ese síntoma aún no está confirmado
%
%    Esto garantiza que cada categoría se pregunte una vez
%    y que no se pregunte sobre síntomas ya descartados.
% ============================================================

pregunta_aplica(ID, Opciones) :-
    \+ pregunta_hecha(ID),                    % (a) no hecha aún
    todos_los_sintomas(Opciones, Posibles),
    caso(_, ListaCaso),
    member(S, Posibles),
    member(S, ListaCaso),
    \+ sintoma_presente(S),                   % (b) síntoma útil y nuevo
    !.

% ============================================================
% 10. CICLO DE PREGUNTAS CON SALIDA ANTICIPADA
% ============================================================

hacer_preguntas([]) :- !.
hacer_preguntas([ID | Resto]) :-
    % ── Condición de salida anticipada (>70%) ──────────────
    ( hay_caso_sobre_umbral_salida ->
        nl,
        write('  [!] Umbral superado: presentando resultado...'), nl,
        !                          % detener el ciclo completamente
    ;
        % ── Verificar si la pregunta aplica ─────────────────
        pregunta(ID, Titulo, Opciones),
        ( pregunta_aplica(ID, Opciones) ->
            nl,
            format('  ► ~w:~n', [Titulo]),
            mostrar_opciones(Opciones),
            leer_opcion(Opciones, SintomasElegidos),
            registrar_sintomas(SintomasElegidos),
            assertz(pregunta_hecha(ID))      % marcar como respondida
        ;
            true                             % saltar esta pregunta
        ),
        hacer_preguntas(Resto)
    ).

% ============================================================
% 11. EMERGENCIA
% ============================================================

hay_emergencia :-
    sintoma_presente(S),
    sintoma_emergencia(S),
    !.

% ============================================================
% 12. MOSTRAR RESULTADO Y LISTA
% ============================================================

mostrar_resultado(Pct-Caso) :-
    accion(Caso, Accion),
    ( Pct =:= 100 -> Nivel = 'EXACTO'
    ; Pct  >   70 -> Nivel = 'ALTO'
    ;                Nivel = 'MODERADO'
    ),
    nl,
    write('  ┌─────────────────────────────────────────────'), nl,
    format('  │ Diagnostico : ~w~n',        [Caso]),
    format('  │ Confianza   : ~w%  [~w]~n', [Pct, Nivel]),
    format('  │ Accion      : ~w~n',        [Accion]),
    write('  └─────────────────────────────────────────────'), nl.

mostrar_lista([]).
mostrar_lista([Item | Resto]) :-
    mostrar_resultado(Item),
    mostrar_lista(Resto).

% Filtra solo los pares con Pct = 100
solo_exactos([], []).
solo_exactos([100-C | Resto], [100-C | Tail]) :- !, solo_exactos(Resto, Tail).
solo_exactos([_    | Resto], Tail)            :-    solo_exactos(Resto, Tail).

% ============================================================
% 13. PRESENTAR RESULTADOS (lógica compartida)
%     Recibe el umbral mínimo para filtrar diagnósticos.
% ============================================================

presentar_resultados(Umbral) :-
    nl,
    write('  ══════════════════════════════════════════════'), nl,
    write('                   RESULTADOS                  '), nl,
    write('  ══════════════════════════════════════════════'), nl,
    ( hay_emergencia ->
        nl,
        write('  ╔══════════════════════════════════════════╗'), nl,
        write('  ║  *** EMERGENCIA - LLAME AL 911 AHORA *** ║'), nl,
        write('  ╚══════════════════════════════════════════╝'), nl
    ; true ),
    findall(Pct-Caso,
        ( caso(Caso, _),
          pct_caso(Caso, Pct),
          Pct >= Umbral
        ),
        Resultados),
    ( Resultados = [] ->
        nl,
        write('  Sin diagnostico con los sintomas indicados.'), nl,
        write('  Recomendacion: consulte a un medico.'), nl
    ;
        % Si hay 100% → mostrar solo exactos
        ( member(100-_, Resultados) ->
            solo_exactos(Resultados, Exactos),
            nl,
            write('  Coincidencia exacta:'), nl,
            mostrar_lista(Exactos)
        ;
            % Parciales: ordenar de mayor a menor
            msort(Resultados, Temp),
            reverse(Temp, Ordenados),
            nl,
            write('  Coincidencias parciales (mayor a menor):'), nl,
            mostrar_lista(Ordenados)
        )
    ),
    nl,
    write('  ══════════════════════════════════════════════'), nl,
    write('  Consulte siempre a un profesional de la salud.'), nl.

% ============================================================
% 14. PUNTO DE ENTRADA PRINCIPAL
%     Llamar con:  iniciar.
% ============================================================

iniciar :-
    retractall(sintoma_presente(_)),
    retractall(pregunta_hecha(_)),
    Umbral = 50,
    nl,
    write('  ══════════════════════════════════════════════'), nl,
    write('     SISTEMA DE DIAGNOSTICO DE HEMORRAGIAS     '), nl,
    write('  ══════════════════════════════════════════════'), nl,
    write('  Escriba el numero de su opcion seguido de (.)'), nl,
    write('  Ejemplo:  2.'), nl,
    hacer_preguntas([1, 2, 3, 4, 5]),
    presentar_resultados(Umbral).

% ============================================================
% 15. PRUEBA AUTOMÁTICA (sin interacción del usuario)
%
%     Uso:
%       probar([dolor_intenso, moretones]).
%       probar([sangrado_abundante, mareo, debilidad, piel_palida]).
%       probar([sangrado_poco, herida_superficial]).
%       probar([mareo, debilidad]).
% ============================================================

probar(SintomasPresentes) :-
    retractall(sintoma_presente(_)),
    retractall(pregunta_hecha(_)),
    registrar_sintomas(SintomasPresentes),
    Umbral = 50,
    nl,
    write('  ── PRUEBA AUTOMATICA ──────────────────────────'), nl,
    format('  Sintomas dados: ~w~n', [SintomasPresentes]),
    ( hay_caso_sobre_umbral_salida ->
        write('  [!] Umbral >70% alcanzado con estos sintomas.'), nl
    ; true ),
    presentar_resultados(Umbral),
    write('  ───────────────────────────────────────────────'), nl.