% ============================================================
%   PRUEBAS - Migración de 7 módulos al esquema de porcentaje
%   NO se despliega (el Dockerfile solo copia server.pl).
%
%   Ejecutar desde backend/:
%       swipl -g run_tests -t halt tests/test_modulos.pl
%
%   1. Prueba diferencial: enumera TODAS las combinaciones de opciones
%      de cada módulo y compara contra una copia literal de las reglas
%      anteriores (old_*), tomada del server.pl previo a la migración.
%   2. Escenarios clave por módulo + regresión de hemorragia.
%   3. Las respuestas del diagnóstico se pueden serializar a JSON.
% ============================================================

:- encoding(utf8).

% Evita que server.pl levante el servidor HTTP al cargarse.
:- setenv('HCA_SIN_SERVIDOR', '1').
:- prolog_load_context(directory, Dir),
   atom_concat(Dir, '/../server.pl', Server),
   consult(Server).

:- use_module(library(plunit)).
:- use_module(library(lists)).
:- use_module(library(apply)).

modulo_migrado(M) :-
    member(M, [fractura, desmayo, descarga, picadura, intoxicacion, insolacion, convulsion]).

modulo_motor(M) :- modulo_migrado(M).
modulo_motor(M) :- modulo_existente(M).

modulo_existente(M) :- member(M, [hemorragia, asfixia, quemadura]).

% ============================================================
% REFERENCIA: LÓGICA ANTERIOR (copia literal de opciones, síntomas de
% emergencia y reglas nivel_X del server.pl previo a la migración).
% Única diferencia: en desmayo, pregunta 2, se usa el texto con acento
% 'Sí, ...' (antes 'Si, ...') porque es la misma opción y el frontend
% siempre mandó la versión con acento.
% ============================================================

old_opcion(fractura, 1, 'Brazo, antebrazo o muñeca', extremidad_superior).
old_opcion(fractura, 1, 'Pierna, muslo o tobillo', extremidad_inferior).
old_opcion(fractura, 1, 'Costilla o tórax', zona_torax).
old_opcion(fractura, 1, 'Columna vertebral o cuello', zona_columna).
old_opcion(fractura, 1, 'Mano, pie o dedo', extremidad_periferica).
old_opcion(fractura, 1, 'No estoy seguro', zona_desconocida).
old_opcion(fractura, 2, 'Hueso visiblemente expuesto', hueso_expuesto).
old_opcion(fractura, 2, 'Deformidad visible sin hueso expuesto', deformidad_frac).
old_opcion(fractura, 2, 'Solo inflamación o moretón', inflamacion_frac).
old_opcion(fractura, 2, 'Sin cambios visibles', sin_deformidad_frac).
old_opcion(fractura, 3, 'No puede moverla en absoluto', no_puede_mover_frac).
old_opcion(fractura, 3, 'Puede moverla con mucho dolor', movimiento_muy_doloroso).
old_opcion(fractura, 3, 'Puede moverla con algo de dolor', movimiento_doloroso_frac).
old_opcion(fractura, 3, 'Movimiento normal con dolor leve', movimiento_normal_frac).
old_opcion(fractura, 4, 'Dolor muy intenso y constante', dolor_intenso_frac).
old_opcion(fractura, 4, 'Dolor moderado al presionar', dolor_moderado_frac).
old_opcion(fractura, 4, 'Dolor leve o puntual', dolor_leve_frac).
old_opcion(fractura, 4, 'Sin dolor significativo', sin_dolor_frac).
old_opcion(fractura, 5, 'Hormigueo o pérdida de sensibilidad', hormigueo_frac).
old_opcion(fractura, 5, 'Piel pálida, fría o sudoración fría', shock_frac).
old_opcion(fractura, 5, 'Hemorragia visible en la zona', sangrado_frac).
old_opcion(fractura, 5, 'Ninguno de los anteriores', sin_alarma_frac).

old_opcion(desmayo, 1, 'Consciente, responde y puede hablar', consciente).
old_opcion(desmayo, 1, 'Confundida o desorientada, responde poco', semi_consciente).
old_opcion(desmayo, 1, 'No responde a nada, inconsciente', inconsciente).
old_opcion(desmayo, 2, 'Sí, respira y tiene pulso normal', respira_bien).
old_opcion(desmayo, 2, 'Respira con dificultad o pulso débil', respira_mal).
old_opcion(desmayo, 2, 'No respira o no se detecta pulso', sin_respiracion).
old_opcion(desmayo, 3, 'No perdió la conciencia (solo mareo/debilidad)', no_perdio_conciencia).
old_opcion(desmayo, 3, 'Menos de 2 minutos inconsciente', menos_2min).
old_opcion(desmayo, 3, 'Más de 2 minutos inconsciente', mas_2min).
old_opcion(desmayo, 4, 'Ninguna señal adicional', sin_alarma).
old_opcion(desmayo, 4, 'Presenta convulsiones', convulsiones).
old_opcion(desmayo, 4, 'Piel azulada (cianosis) o dificultad respiratoria', cianosis).
old_opcion(desmayo, 4, 'Dolor en el pecho o antecedentes cardíacos', cardiaco).
old_opcion(desmayo, 4, 'Golpe fuerte en la cabeza al caer', traumatismo).

old_opcion(descarga, 1, 'Sigue en contacto con la fuente eléctrica', sigue_en_contacto_desc).
old_opcion(descarga, 1, 'Ya no está en contacto', sin_contacto_desc).
old_opcion(descarga, 1, 'No estoy seguro', contacto_desconocido_desc).
old_opcion(descarga, 2, 'Consciente y alerta', consciente_desc).
old_opcion(descarga, 2, 'Consciente pero confundida', confundido_desc).
old_opcion(descarga, 2, 'Inconsciente pero respira', inconsciente_desc).
old_opcion(descarga, 2, 'No respira o no tiene pulso', sin_respiracion_desc).
old_opcion(descarga, 3, 'Corriente doméstica (110-220V)', corriente_baja_desc).
old_opcion(descarga, 3, 'Alta tensión o línea eléctrica', corriente_alta_desc).
old_opcion(descarga, 3, 'Rayo o relámpago', rayo_desc).
old_opcion(descarga, 3, 'No lo sé', fuente_desconocida_desc).
old_opcion(descarga, 4, 'Quemaduras evidentes de entrada/salida', quemaduras_desc).
old_opcion(descarga, 4, 'Enrojecimiento o marcas leves', marcas_leves_desc).
old_opcion(descarga, 4, 'Sin marcas visibles', sin_marcas_desc).
old_opcion(descarga, 5, 'Dolor en el pecho o palpitaciones', dolor_pecho_desc).
old_opcion(descarga, 5, 'Convulsiones', convulsiones_desc).
old_opcion(descarga, 5, 'Parálisis o pérdida de sensibilidad', paralisis_desc).
old_opcion(descarga, 5, 'Solo dolor local en la zona', dolor_local_desc).
old_opcion(descarga, 5, 'Sin síntomas adicionales', sin_sintomas_desc).

old_opcion(picadura, 1, 'Abeja, avispa o hormiga', insecto_comun).
old_opcion(picadura, 1, 'Araña', arana).
old_opcion(picadura, 1, 'Serpiente', serpiente).
old_opcion(picadura, 1, 'Escorpión o alacrán', escorpion).
old_opcion(picadura, 1, 'Perro u otro mamífero', mamifero).
old_opcion(picadura, 1, 'No lo identifiqué', animal_desconocido).
old_opcion(picadura, 2, 'Cara o cuello', zona_cara_cuello_pic).
old_opcion(picadura, 2, 'Brazo o pierna', zona_extremidad_pic).
old_opcion(picadura, 2, 'Mano o pie', zona_mano_pie_pic).
old_opcion(picadura, 2, 'Torso o espalda', zona_torso_pic).
old_opcion(picadura, 3, 'Solo dolor e inflamación local', dolor_local_pic).
old_opcion(picadura, 3, 'Reacción alérgica: urticaria generalizada', reaccion_alergica_pic).
old_opcion(picadura, 3, 'Dificultad para respirar o tragar', dificultad_respirar_pic).
old_opcion(picadura, 3, 'Náuseas, mareo o debilidad general', sintomas_sistemicos_pic).
old_opcion(picadura, 3, 'Entumecimiento que se extiende', entumecimiento_pic).
old_opcion(picadura, 3, 'Herida profunda con sangrado', herida_profunda_pic).
old_opcion(picadura, 4, 'Sí, tiene alergia conocida', alergia_conocida_pic).
old_opcion(picadura, 4, 'No tiene alergias', sin_alergia_pic).
old_opcion(picadura, 4, 'No lo sé', alergia_desconocida_pic).
old_opcion(picadura, 5, 'Hace menos de 30 minutos', pic_reciente).
old_opcion(picadura, 5, 'Entre 30 min y 2 horas', pic_moderada).
old_opcion(picadura, 5, 'Más de 2 horas', pic_tardio).

old_opcion(intoxicacion, 1, 'Ingirió medicamentos en exceso', ingestion_medicamentos).
old_opcion(intoxicacion, 1, 'Ingirió una sustancia química', ingestion_quimica).
old_opcion(intoxicacion, 1, 'Ingirió alimentos en mal estado', ingestion_alimentos).
old_opcion(intoxicacion, 1, 'Inhaló gases, vapores o humo', inhalacion_tox).
old_opcion(intoxicacion, 1, 'Contacto con piel o mucosas', contacto_piel_tox).
old_opcion(intoxicacion, 1, 'No sé cómo ocurrió', causa_desconocida_tox).
old_opcion(intoxicacion, 2, 'Consciente y alerta', consciente_tox).
old_opcion(intoxicacion, 2, 'Confundida o desorientada', semi_consciente_tox).
old_opcion(intoxicacion, 2, 'Somnolenta o difícil de despertar', somnolenta_tox).
old_opcion(intoxicacion, 2, 'Inconsciente o no responde', inconsciente_tox).
old_opcion(intoxicacion, 3, 'Hace menos de 1 hora', tiempo_reciente_tox).
old_opcion(intoxicacion, 3, 'Entre 1 y 3 horas', tiempo_moderado_tox).
old_opcion(intoxicacion, 3, 'Más de 3 horas', tiempo_tardio_tox).
old_opcion(intoxicacion, 3, 'No sé cuándo ocurrió', tiempo_desconocido_tox).
old_opcion(intoxicacion, 4, 'Náuseas o vómito', nauseas_tox).
old_opcion(intoxicacion, 4, 'Dificultad para respirar', dificultad_respirar_tox).
old_opcion(intoxicacion, 4, 'Convulsiones', convulsiones_tox).
old_opcion(intoxicacion, 4, 'Quemaduras en boca o garganta', quemaduras_internas_tox).
old_opcion(intoxicacion, 4, 'Dolor abdominal intenso', dolor_abdominal_tox).
old_opcion(intoxicacion, 4, 'Sin síntomas claros por ahora', sin_sintomas_tox).
old_opcion(intoxicacion, 5, 'Sí, sé exactamente qué fue', sustancia_conocida_tox).
old_opcion(intoxicacion, 5, 'Tengo una idea aproximada', sustancia_probable_tox).
old_opcion(intoxicacion, 5, 'No sé qué sustancia fue', sustancia_desconocida_tox).

old_opcion(insolacion, 1, 'Menos de 1 hora', exposicion_corta_insol).
old_opcion(insolacion, 1, 'Entre 1 y 3 horas', exposicion_moderada_insol).
old_opcion(insolacion, 1, 'Más de 3 horas', exposicion_prolongada_insol).
old_opcion(insolacion, 1, 'No estoy seguro', exposicion_desconocida_insol).
old_opcion(insolacion, 2, 'Mareo y debilidad', mareo_insol).
old_opcion(insolacion, 2, 'Dolor de cabeza intenso', cefalea_insol).
old_opcion(insolacion, 2, 'Náuseas o vómito', nauseas_insol).
old_opcion(insolacion, 2, 'Calambres musculares', calambres_insol).
old_opcion(insolacion, 2, 'Confusión o comportamiento extraño', confusion_insol).
old_opcion(insolacion, 2, 'Pérdida de consciencia', desmayo_insol).
old_opcion(insolacion, 3, 'Piel muy caliente, seca, sin sudoración', piel_seca_caliente_insol).
old_opcion(insolacion, 3, 'Piel húmeda, pálida y fría al tacto', piel_humeda_fria_insol).
old_opcion(insolacion, 3, 'Piel enrojecida con algo de sudoración', piel_enrojecida_insol).
old_opcion(insolacion, 3, 'Sin cambios evidentes en la piel', sin_cambios_piel_insol).
old_opcion(insolacion, 4, 'Consciente y orientada', consciente_insol).
old_opcion(insolacion, 4, 'Confundida o desorientada', confundida_insol).
old_opcion(insolacion, 4, 'Somnolenta, difícil de despertar', somnolenta_insol).
old_opcion(insolacion, 4, 'Inconsciente', inconsciente_insol).
old_opcion(insolacion, 5, 'Sí, ha bebido agua recientemente', hidratada_insol).
old_opcion(insolacion, 5, 'No ha bebido agua en horas', deshidratada_insol).
old_opcion(insolacion, 5, 'No estoy seguro', hidratacion_desconocida_insol).

old_opcion(convulsion, 1, 'Sigue convulsionando ahora mismo', convulsionando_ahora).
old_opcion(convulsion, 1, 'La convulsión ya terminó', convulsion_terminada).
old_opcion(convulsion, 1, 'No estoy seguro si fue convulsión', convulsion_dudosa).
old_opcion(convulsion, 2, 'Menos de 2 minutos', conv_menos_2min).
old_opcion(convulsion, 2, 'Entre 2 y 5 minutos', conv_entre_2y5min).
old_opcion(convulsion, 2, 'Más de 5 minutos', conv_mas_5min).
old_opcion(convulsion, 2, 'No sé cuánto duró', conv_tiempo_desconocido).
old_opcion(convulsion, 3, 'Sí, tiene epilepsia diagnosticada', epileptico_conv).
old_opcion(convulsion, 3, 'Sí, ha tenido convulsiones antes', antecedentes_conv).
old_opcion(convulsion, 3, 'No, es la primera vez', primera_vez_conv).
old_opcion(convulsion, 3, 'No lo sé', antecedentes_desconocidos_conv).
old_opcion(convulsion, 4, 'Se recuperó y está consciente', recuperado_conv).
old_opcion(convulsion, 4, 'Está somnolenta y confundida', post_ictal_conv).
old_opcion(convulsion, 4, 'Inconsciente, no responde', inconsciente_conv).
old_opcion(convulsion, 4, 'Tuvo otra convulsión seguida', convulsiones_repetidas_conv).
old_opcion(convulsion, 5, 'Fiebre muy alta', conv_fiebre).
old_opcion(convulsion, 5, 'Golpe o trauma en la cabeza', conv_trauma).
old_opcion(convulsion, 5, 'Intoxicación o sustancia conocida', conv_intoxicacion).
old_opcion(convulsion, 5, 'Embarazo', conv_embarazo).
old_opcion(convulsion, 5, 'Sin causa aparente', sin_causa_conv).

old_emergencia(fractura, hueso_expuesto).
old_emergencia(fractura, zona_columna).
old_emergencia(fractura, hormigueo_frac).
old_emergencia(fractura, shock_frac).
old_emergencia(fractura, sangrado_frac).
old_emergencia(desmayo, inconsciente).
old_emergencia(desmayo, sin_respiracion).
old_emergencia(desmayo, mas_2min).
old_emergencia(desmayo, convulsiones).
old_emergencia(desmayo, cianosis).
old_emergencia(desmayo, cardiaco).
old_emergencia(desmayo, traumatismo).
old_emergencia(desmayo, respira_mal).
old_emergencia(descarga, sigue_en_contacto_desc).
old_emergencia(descarga, inconsciente_desc).
old_emergencia(descarga, sin_respiracion_desc).
old_emergencia(descarga, corriente_alta_desc).
old_emergencia(descarga, rayo_desc).
old_emergencia(descarga, dolor_pecho_desc).
old_emergencia(descarga, convulsiones_desc).
old_emergencia(picadura, reaccion_alergica_pic).
old_emergencia(picadura, dificultad_respirar_pic).
old_emergencia(picadura, serpiente).
old_emergencia(picadura, escorpion).
old_emergencia(picadura, alergia_conocida_pic).
old_emergencia(intoxicacion, inconsciente_tox).
old_emergencia(intoxicacion, convulsiones_tox).
old_emergencia(intoxicacion, dificultad_respirar_tox).
old_emergencia(intoxicacion, quemaduras_internas_tox).
old_emergencia(insolacion, piel_seca_caliente_insol).
old_emergencia(insolacion, confusion_insol).
old_emergencia(insolacion, desmayo_insol).
old_emergencia(insolacion, inconsciente_insol).
old_emergencia(insolacion, confundida_insol).
old_emergencia(insolacion, somnolenta_insol).
old_emergencia(convulsion, conv_mas_5min).
old_emergencia(convulsion, inconsciente_conv).
old_emergencia(convulsion, convulsiones_repetidas_conv).
old_emergencia(convulsion, conv_trauma).
old_emergencia(convulsion, conv_embarazo).
old_emergencia(convulsion, primera_vez_conv).
old_emergencia(convulsion, conv_intoxicacion).

old_moderado(fractura, deformidad_frac).
old_moderado(fractura, no_puede_mover_frac).
old_moderado(fractura, dolor_intenso_frac).
old_moderado(intoxicacion, semi_consciente_tox).
old_moderado(intoxicacion, somnolenta_tox).
old_moderado(intoxicacion, ingestion_quimica).
old_moderado(intoxicacion, ingestion_medicamentos).
old_moderado(picadura, mamifero).
old_moderado(picadura, sintomas_sistemicos_pic).
old_moderado(picadura, entumecimiento_pic).
old_moderado(picadura, herida_profunda_pic).
old_moderado(picadura, zona_cara_cuello_pic).
old_moderado(descarga, confundido_desc).
old_moderado(descarga, quemaduras_desc).
old_moderado(descarga, paralisis_desc).
old_moderado(insolacion, exposicion_prolongada_insol).
old_moderado(insolacion, deshidratada_insol).
old_moderado(insolacion, nauseas_insol).
old_moderado(insolacion, cefalea_insol).
old_moderado(convulsion, convulsionando_ahora).
old_moderado(convulsion, post_ictal_conv).
old_moderado(convulsion, conv_fiebre).

% ============================================================
% REFERENCIA ANTERIOR: HEMORRAGIA, ASFIXIA Y QUEMADURA
% (casos, opciones y síntomas de emergencia copiados del server.pl previo;
%  en hemorragia, pregunta 2, con el texto ya corregido del frontend)
% ============================================================

old3_caso(hemorragia, hemorragia_leve, [sangrado_poco, herida_superficial]).
old3_caso(hemorragia, hemorragia_media, [sangrado_constante, dolor_moderado, inflamacion, herida_visible]).
old3_caso(hemorragia, hemorragia_grave, [sangrado_abundante, mareo, debilidad, piel_palida, herida_visible]).
old3_caso(hemorragia, hemorragia_interna, [dolor_intenso, moretones, mareo, debilidad, herida_nosivisble]).
old3_caso(asfixia, asfixia_leve, [obstruccion_parcial, tos_fuerte, puede_hablar, consciente]).
old3_caso(asfixia, asfixia_moderada, [obstruccion_total, no_habla, tos_ineficaz, consciente]).
old3_caso(asfixia, asfixia_grave, [inconsciente, sin_respiracion]).
old3_caso(quemadura, quemadura_leve, [enrojecimiento, dolor_leve, piel_seca]).
old3_caso(quemadura, quemadura_moderada, [dolor_intenso, ampollas, piel_humeda]).
old3_caso(quemadura, quemadura_grave, [piel_carbonizada, piel_blanca, necrosis]).
old3_caso(quemadura, quemadura_quimica, [dolor_quimico, necrosis, cambio_color]).
old3_caso(quemadura, quemadura_electrica, [lesion_pequena_externa, arritmia, daño_profundo]).
old3_caso(quemadura, quemadura_radiacion, [eritema, descamacion, dolor_moderado]).

old3_opcion(hemorragia, 1, 'Poco  (manchas o goteo leve)', [sangrado_poco]).
old3_opcion(hemorragia, 1, 'Constante  (flujo moderado continuo)', [sangrado_constante]).
old3_opcion(hemorragia, 1, 'Abundante  (flujo fuerte)', [sangrado_abundante]).
old3_opcion(hemorragia, 1, 'A chorros / extremadamente intenso', [sangrado_abundante, sangre_a_chorros]).
old3_opcion(hemorragia, 1, 'Sin sangrado visible', []).
old3_opcion(hemorragia, 2, 'La herida es superficial', [herida_superficial]).
old3_opcion(hemorragia, 2, 'La herida no es superficial', [herida_visible]).
old3_opcion(hemorragia, 2, 'Sin herida visible', [herida_novisible]).
old3_opcion(hemorragia, 2, 'No estoy seguro', []).
old3_opcion(hemorragia, 3, 'Dolor moderado', [dolor_moderado]).
old3_opcion(hemorragia, 3, 'Dolor intenso', [dolor_intenso]).
old3_opcion(hemorragia, 3, 'Sin dolor', []).
old3_opcion(hemorragia, 4, 'Pálida solamente', [piel_palida]).
old3_opcion(hemorragia, 4, 'Fría y pálida', [piel_palida, piel_fria]).
old3_opcion(hemorragia, 4, 'Moretones visibles', [moretones]).
old3_opcion(hemorragia, 4, 'Normal, sin cambios', []).
old3_opcion(hemorragia, 5, 'Mareo únicamente', [mareo]).
old3_opcion(hemorragia, 5, 'Debilidad únicamente', [debilidad]).
old3_opcion(hemorragia, 5, 'Mareo y debilidad juntos', [mareo, debilidad]).
old3_opcion(hemorragia, 5, 'Inflamación en la zona afectada', [inflamacion]).
old3_opcion(hemorragia, 5, 'Pérdida del conocimiento', [desmayo_hemorragia]).
old3_opcion(hemorragia, 5, 'Ninguno de los anteriores', []).
old3_opcion(asfixia, 1, 'Puede hablar y toser con fuerza', [puede_hablar, tos_fuerte, obstruccion_parcial]).
old3_opcion(asfixia, 1, 'Puede hablar pero la tos es débil', [puede_hablar, tos_debil, obstruccion_parcial]).
old3_opcion(asfixia, 1, 'No puede hablar, tos débil o ineficaz', [no_habla, tos_ineficaz, obstruccion_total]).
old3_opcion(asfixia, 1, 'No emite sonidos ni puede toser', [no_habla, sin_tos, obstruccion_total]).
old3_opcion(asfixia, 2, 'Respira con dificultad o ruidos', [respiracion_dificultosa]).
old3_opcion(asfixia, 2, 'Respiración ausente', [sin_respiracion]).
old3_opcion(asfixia, 2, 'Respiración normal', [respiracion_normal]).
old3_opcion(asfixia, 2, 'No estoy seguro', []).
old3_opcion(asfixia, 3, 'Color normal', []).
old3_opcion(asfixia, 3, 'Enrojecimiento en rostro', [enrojecimiento]).
old3_opcion(asfixia, 3, 'Color azulado (cianosis)', [cianosis]).
old3_opcion(asfixia, 4, 'Consciente y alerta', [consciente]).
old3_opcion(asfixia, 4, 'Agitado o confundido', [consciente, agitado]).
old3_opcion(asfixia, 4, 'Inconsciente', [inconsciente]).
old3_opcion(asfixia, 5, 'Atragantamiento con comida u objeto', [causa_obstructiva]).
old3_opcion(asfixia, 5, 'Compresión del cuello o tórax', [causa_mecanica]).
old3_opcion(asfixia, 5, 'Ahogamiento por agua', [causa_sumersion]).
old3_opcion(asfixia, 5, 'Inhalación de humo o gases', [causa_toxica]).
old3_opcion(asfixia, 5, 'Posición que dificulta respirar', [causa_posicional]).
old3_opcion(asfixia, 5, 'No estoy seguro', []).
old3_opcion(quemadura, 1, 'Enrojecimiento leve', [enrojecimiento, dolor_leve, piel_seca]).
old3_opcion(quemadura, 1, 'Ampollas y dolor', [dolor_intenso, ampollas, piel_humeda]).
old3_opcion(quemadura, 1, 'Piel blanca o carbonizada', [piel_carbonizada, piel_blanca, necrosis]).
old3_opcion(quemadura, 1, 'Lesión química', [dolor_quimico, necrosis, lesion_pequena_externa, arritmia, daño_profundo]).
old3_opcion(quemadura, 1, 'Lesión eléctrica', [dolor_quimico, necrosis, lesion_pequena_externa, arritmia, daño_profundo]).
old3_opcion(quemadura, 1, 'No estoy seguro', []).
old3_opcion(quemadura, 2, 'Brazo o pierna', []).
old3_opcion(quemadura, 2, 'Cara, cuello o manos', []).
old3_opcion(quemadura, 2, 'Torso o espalda', []).
old3_opcion(quemadura, 2, 'Zona extensa', []).
old3_opcion(quemadura, 2, 'No estoy seguro', []).
old3_opcion(quemadura, 3, 'Solo enrojecimiento', [enrojecimiento, dolor_leve, piel_seca]).
old3_opcion(quemadura, 3, 'Ampollas visibles', [dolor_intenso, ampollas, piel_humeda]).
old3_opcion(quemadura, 3, 'Piel carbonizada/blanca', [piel_carbonizada, piel_blanca, necrosis]).
old3_opcion(quemadura, 3, 'No estoy seguro', []).
old3_opcion(quemadura, 4, 'Hace pocos minutos y no traté', []).
old3_opcion(quemadura, 4, 'Lo enfrié con agua', []).
old3_opcion(quemadura, 4, 'Apliqué hielo o crema', []).
old3_opcion(quemadura, 4, 'No estoy seguro', []).
old3_opcion(quemadura, 5, 'Dolor intenso', [dolor_intenso]).
old3_opcion(quemadura, 5, 'Dificultad para respirar', [dificultad_respirar]).
old3_opcion(quemadura, 5, 'Signos de infección/necrosis', [necrosis]).
old3_opcion(quemadura, 5, 'Ninguno de los anteriores', []).

old3_emergencia(hemorragia, sangrado_abundante).
old3_emergencia(hemorragia, sangre_a_chorros).
old3_emergencia(hemorragia, desmayo_hemorragia).
old3_emergencia(hemorragia, piel_fria).
old3_emergencia(asfixia, sin_respiracion).
old3_emergencia(asfixia, inconsciente).
old3_emergencia(asfixia, cianosis).
old3_emergencia(quemadura, piel_carbonizada).
old3_emergencia(quemadura, necrosis).
old3_emergencia(quemadura, arritmia).
old3_emergencia(quemadura, dificultad_respirar).

old3_sintomas(M, Respuestas, Sintomas) :-
    findall(S,
        ( nth1(I, Respuestas, R),
          ( string(R) -> atom_string(RA, R) ; RA = R ),
          old3_opcion(M, I, RA, L),
          member(S, L)
        ),
        Dup),
    sort(Dup, Sintomas).

% Ganador con la lógica anterior (umbral 50, exacto en orden de hechos,
% si no msort + reverse sobre Pct-Caso).
old3_ganador(M, S, Caso, Pct) :-
    findall(P-C,
        ( old3_caso(M, C, L), length(L, T), contar_presentes(L, S, N),
          P is (N * 100) // T, P >= 50 ),
        Pares),
    ( member(100-C1, Pares) -> Caso = C1, Pct = 100
    ; Pares \== [] -> msort(Pares, A), reverse(A, [Pct-Caso | _])
    ; Caso = desconocido, Pct = 0
    ).

old3_diagnostico(M, Respuestas, EsEmergencia, Severidad) :-
    old3_sintomas(M, Respuestas, S),
    ( member(X, S), old3_emergencia(M, X) -> EsEmergencia = true ; EsEmergencia = false ),
    old3_ganador(M, S, Caso, Pct),
    old3_severidad(M, EsEmergencia, Caso, Pct, Severidad).

old3_severidad(_, true, _, _, high) :- !.
old3_severidad(hemorragia, false, _, Pct, Sev) :- !, ( Pct > 70 -> Sev = medium ; Sev = low ).
old3_severidad(asfixia, false, Caso, _, Sev) :- !, ( Caso == asfixia_moderada -> Sev = medium ; Sev = low ).
old3_severidad(quemadura, false, Caso, _, Sev) :-
    ( Caso == quemadura_grave -> Sev = high
    ; Caso == quemadura_moderada -> Sev = medium
    ; Sev = low ).


old_sintomas(M, Respuestas, Sintomas) :-
    findall(A,
        ( nth1(I, Respuestas, R),
          ( string(R) -> atom_string(RA, R) ; RA = R ),
          old_opcion(M, I, RA, A)
        ),
        L),
    sort(L, Sintomas).

% old_diagnostico(+Modulo, +Respuestas, -EsEmergencia, -Severidad)
% (equivale a nivel_X(grave) -> high, nivel_X(moderada/mediano) -> medium, si no low)
old_diagnostico(M, Respuestas, EsEmergencia, Severidad) :-
    old_sintomas(M, Respuestas, S),
    ( member(X, S), old_emergencia(M, X) ->
        EsEmergencia = true, Severidad = high
    ;
        EsEmergencia = false,
        ( old_medio(M, S) -> Severidad = medium ; Severidad = low )
    ).

old_medio(desmayo, S) :- !,
    memberchk(menos_2min, S),
    \+ ( member(X, S), memberchk(X, [sin_respiracion, mas_2min, convulsiones, cianosis]) ).
old_medio(M, S) :-
    member(X, S), old_moderado(M, X), !.

% ============================================================
% PRUEBA DIFERENCIAL EXHAUSTIVA
% ============================================================

texto_opcion(M, Q, Texto) :-
    pm_llamar(opcion_, M, [Q, Texto, _]).

combinacion(M, Respuestas) :-
    total_preguntas(M, N),
    numlist(1, N, Qs),
    maplist(texto_opcion(M), Qs, Respuestas).

contiene_911(Recs) :-
    member(R, Recs),
    sub_atom(R, _, _, _, '911'), !.

acumular(M, Respuestas, c(E0, D0, V0, S0, F0, X0), c(E, D, V, S, F, X)) :-
    pm_diagnostico(M, Respuestas, Em, Sev, Recs, _Caso, _Pct, _Accion, Res, _Exact),
    old_diagnostico(M, Respuestas, EmViejo, SevVieja),
    ( Em == EmViejo -> E = E0 ; E is E0 + 1 ),
    rango_severidad(Sev, RN), rango_severidad(SevVieja, RV),
    ( RN >= RV -> D = D0 ; D is D0 + 1 ),
    ( Recs == [] -> V is V0 + 1 ; V = V0 ),
    ( Em == true, \+ contiene_911(Recs) -> S is S0 + 1 ; S = S0 ),
    ( Res == [] -> F is F0 + 1 ; F = F0 ),
    findall(C, ( member(Dic, Res), get_dict(confidence, Dic, 100), get_dict(caseType, Dic, C) ), Cs),
    append(X0, Cs, X1), sort(X1, X).

% resumen(M, r(Combinaciones, DivEmergencia, SevDegradadas, RecsVacias, EmergSin911, Inalcanzables, Fallback))
resumen(M, r(N, E, D, V, S, I, F)) :-
    findall(R, combinacion(M, R), Todas),
    length(Todas, N),
    foldl(acumular(M), Todas, c(0, 0, 0, 0, 0, []), c(E, D, V, S, F, Exactos)),
    findall(C, ( pm_llamar(caso_, M, [C, _]), \+ memberchk(C, Exactos) ), Inal),
    length(Inal, I).

imprimir_resumen :-
    format("~nPRUEBA DIFERENCIAL (todas deben ser 0 salvo combinaciones y fallback)~n"),
    format("modulo | combinaciones | divergencias de emergencia | severidades degradadas | recs vacias | emergencia sin 911 | casos inalcanzables | fallback<50~n"),
    forall(modulo_migrado(M),
        ( resumen(M, r(N, E, D, V, S, I, F)),
          format("~w | ~d | ~d | ~d | ~d | ~d | ~d | ~d~n", [M, N, E, D, V, S, I, F]) )),
    nl.

:- initialization(imprimir_resumen).

:- begin_tests(diferencial).

test(sin_divergencias, [forall(modulo_migrado(M))]) :-
    resumen(M, r(N, E, D, V, S, I, _F)),
    assertion(N > 0),
    assertion(E == 0),
    assertion(D == 0),
    assertion(V == 0),
    assertion(S == 0),
    assertion(I == 0).

:- end_tests(diferencial).

% ============================================================
% ESCENARIOS CLAVE (valores esperados calculados con el diseño aprobado)
% ============================================================

comprobar(M, Respuestas, CasoE, PctE, SevE, EmE) :-
    pm_diagnostico(M, Respuestas, Em, Sev, Recs, Caso, Pct, Accion, Res, Exact),
    assertion(Caso == CasoE),
    assertion(Pct == PctE),
    assertion(Sev == SevE),
    assertion(Em == EmE),
    assertion(Recs \== []),
    assertion(atom(Accion)),
    assertion(is_list(Res)),
    assertion(memberchk(Exact, [true, false])),
    ( Em == true -> assertion(contiene_911(Recs)) ; true ),
    % compatibilidad con diagnostico/5
    diagnostico(M, Respuestas, Em5, Sev5, Recs5),
    assertion(Em5 == Em), assertion(Sev5 == Sev), assertion(Recs5 == Recs).

:- begin_tests(escenarios).

test('fractura: leve exacto') :-
    comprobar(fractura, ["Brazo, antebrazo o muñeca", "Solo inflamación o moretón", "Puede moverla con algo de dolor", "Dolor leve o puntual", "Ninguno de los anteriores"],
              fractura_leve, 100, low, false).

test('fractura: moderada exacto') :-
    comprobar(fractura, ["Pierna, muslo o tobillo", "Deformidad visible sin hueso expuesto", "No puede moverla en absoluto", "Dolor muy intenso y constante", "Ninguno de los anteriores"],
              fractura_moderada, 100, medium, false).

test('fractura: grave exacto') :-
    comprobar(fractura, ["Brazo, antebrazo o muñeca", "Hueso visiblemente expuesto", "No puede moverla en absoluto", "Dolor muy intenso y constante", "Hemorragia visible en la zona"],
              fractura_grave, 100, high, true).

test('fractura: emergencia columna con respuestas leves') :-
    comprobar(fractura, ["Columna vertebral o cuello", "Solo inflamación o moretón", "Puede moverla con algo de dolor", "Dolor leve o puntual", "Ninguno de los anteriores"],
              fractura_grave, 0, high, true).

test('fractura: ambiguo parcial') :-
    comprobar(fractura, ["Brazo, antebrazo o muñeca", "Solo inflamación o moretón", "Puede moverla con mucho dolor", "Dolor moderado al presionar", "Ninguno de los anteriores"],
              fractura_leve, 50, low, false).

test('fractura: respuestas inciertas') :-
    comprobar(fractura, ["No estoy seguro", "Sin cambios visibles", "Movimiento normal con dolor leve", "Sin dolor significativo", "Ninguno de los anteriores"],
              fractura_moderada, 25, low, false).

test('desmayo: leve exacto') :-
    comprobar(desmayo, ["Consciente, responde y puede hablar", "Sí, respira y tiene pulso normal", "No perdió la conciencia (solo mareo/debilidad)", "Ninguna señal adicional"],
              desmayo_leve, 100, low, false).

test('desmayo: mediano exacto') :-
    comprobar(desmayo, ["Confundida o desorientada, responde poco", "Sí, respira y tiene pulso normal", "Menos de 2 minutos inconsciente", "Ninguna señal adicional"],
              desmayo_mediano, 100, medium, false).

test('desmayo: grave exacto') :-
    comprobar(desmayo, ["No responde a nada, inconsciente", "No respira o no se detecta pulso", "Más de 2 minutos inconsciente", "Ninguna señal adicional"],
              desmayo_grave, 100, high, true).

test('desmayo: emergencia cardiaca con respuestas leves') :-
    comprobar(desmayo, ["Consciente, responde y puede hablar", "Sí, respira y tiene pulso normal", "No perdió la conciencia (solo mareo/debilidad)", "Dolor en el pecho o antecedentes cardíacos"],
              desmayo_grave, 0, high, true).

test('desmayo: ambiguo parcial') :-
    comprobar(desmayo, ["Consciente, responde y puede hablar", "Sí, respira y tiene pulso normal", "Menos de 2 minutos inconsciente", "Ninguna señal adicional"],
              desmayo_mediano, 75, medium, false).

test('desmayo: respira mal sin otra alarma') :-
    comprobar(desmayo, ["Confundida o desorientada, responde poco", "Respira con dificultad o pulso débil", "No perdió la conciencia (solo mareo/debilidad)", "Ninguna señal adicional"],
              desmayo_grave, 0, high, true).

test('descarga: leve exacto') :-
    comprobar(descarga, ["Ya no está en contacto", "Consciente y alerta", "Corriente doméstica (110-220V)", "Enrojecimiento o marcas leves", "Solo dolor local en la zona"],
              descarga_leve, 100, low, false).

test('descarga: moderada exacto') :-
    comprobar(descarga, ["Ya no está en contacto", "Consciente pero confundida", "Corriente doméstica (110-220V)", "Quemaduras evidentes de entrada/salida", "Solo dolor local en la zona"],
              descarga_moderada, 100, medium, false).

test('descarga: grave exacto') :-
    comprobar(descarga, ["Sigue en contacto con la fuente eléctrica", "Inconsciente pero respira", "Alta tensión o línea eléctrica", "Quemaduras evidentes de entrada/salida", "Dolor en el pecho o palpitaciones"],
              descarga_grave, 100, high, true).

test('descarga: emergencia: sigue en contacto') :-
    comprobar(descarga, ["Sigue en contacto con la fuente eléctrica", "Consciente y alerta", "Corriente doméstica (110-220V)", "Sin marcas visibles", "Sin síntomas adicionales"],
              descarga_grave, 0, high, true).

test('descarga: ambiguo parcial') :-
    comprobar(descarga, ["Ya no está en contacto", "Consciente y alerta", "Corriente doméstica (110-220V)", "Quemaduras evidentes de entrada/salida", "Sin síntomas adicionales"],
              descarga_moderada, 75, medium, false).

test('descarga: respuestas inciertas') :-
    comprobar(descarga, ["No estoy seguro", "Consciente y alerta", "No lo sé", "Sin marcas visibles", "Sin síntomas adicionales"],
              descarga_leve, 25, low, false).

test('picadura: leve exacto') :-
    comprobar(picadura, ["Abeja, avispa o hormiga", "Brazo o pierna", "Solo dolor e inflamación local", "No tiene alergias", "Hace menos de 30 minutos"],
              picadura_leve, 100, low, false).

test('picadura: moderada exacto') :-
    comprobar(picadura, ["Perro u otro mamífero", "Brazo o pierna", "Herida profunda con sangrado", "No tiene alergias", "Entre 30 min y 2 horas"],
              picadura_moderada, 100, medium, false).

test('picadura: grave exacto') :-
    comprobar(picadura, ["Abeja, avispa o hormiga", "Cara o cuello", "Dificultad para respirar o tragar", "Sí, tiene alergia conocida", "Hace menos de 30 minutos"],
              picadura_grave, 100, high, true).

test('picadura: emergencia serpiente') :-
    comprobar(picadura, ["Serpiente", "Brazo o pierna", "Entumecimiento que se extiende", "No tiene alergias", "Hace menos de 30 minutos"],
              picadura_grave, 0, high, true).

test('picadura: ambiguo parcial') :-
    comprobar(picadura, ["Abeja, avispa o hormiga", "Torso o espalda", "Solo dolor e inflamación local", "No lo sé", "Más de 2 horas"],
              picadura_leve, 50, low, false).

test('picadura: respuestas inciertas') :-
    comprobar(picadura, ["No lo identifiqué", "Torso o espalda", "Solo dolor e inflamación local", "No lo sé", "Más de 2 horas"],
              picadura_leve, 25, low, false).

test('intoxicacion: leve exacto') :-
    comprobar(intoxicacion, ["Ingirió alimentos en mal estado", "Consciente y alerta", "Hace menos de 1 hora", "Náuseas o vómito", "Sí, sé exactamente qué fue"],
              intoxicacion_leve, 100, low, false).

test('intoxicacion: moderada exacto') :-
    comprobar(intoxicacion, ["Ingirió medicamentos en exceso", "Somnolenta o difícil de despertar", "Entre 1 y 3 horas", "Náuseas o vómito", "Sí, sé exactamente qué fue"],
              intoxicacion_moderada, 100, medium, false).

test('intoxicacion: grave exacto') :-
    comprobar(intoxicacion, ["Ingirió una sustancia química", "Inconsciente o no responde", "Entre 1 y 3 horas", "Dificultad para respirar", "No sé qué sustancia fue"],
              intoxicacion_grave, 100, high, true).

test('intoxicacion: emergencia convulsiones') :-
    comprobar(intoxicacion, ["Ingirió alimentos en mal estado", "Consciente y alerta", "Hace menos de 1 hora", "Convulsiones", "Sí, sé exactamente qué fue"],
              intoxicacion_grave, 0, high, true).

test('intoxicacion: ambiguo parcial') :-
    comprobar(intoxicacion, ["Ingirió alimentos en mal estado", "Consciente y alerta", "Entre 1 y 3 horas", "Sin síntomas claros por ahora", "Tengo una idea aproximada"],
              intoxicacion_leve, 66, low, false).

test('intoxicacion: respuestas inciertas') :-
    comprobar(intoxicacion, ["No sé cómo ocurrió", "Consciente y alerta", "No sé cuándo ocurrió", "Sin síntomas claros por ahora", "No sé qué sustancia fue"],
              intoxicacion_leve, 33, low, false).

test('insolacion: leve exacto') :-
    comprobar(insolacion, ["Menos de 1 hora", "Mareo y debilidad", "Piel enrojecida con algo de sudoración", "Consciente y orientada", "Sí, ha bebido agua recientemente"],
              insolacion_leve, 100, low, false).

test('insolacion: moderada exacto') :-
    comprobar(insolacion, ["Más de 3 horas", "Náuseas o vómito", "Piel húmeda, pálida y fría al tacto", "Consciente y orientada", "No ha bebido agua en horas"],
              insolacion_moderada, 100, medium, false).

test('insolacion: grave exacto') :-
    comprobar(insolacion, ["Más de 3 horas", "Confusión o comportamiento extraño", "Piel muy caliente, seca, sin sudoración", "Confundida o desorientada", "No estoy seguro"],
              insolacion_grave, 100, high, true).

test('insolacion: emergencia somnolencia') :-
    comprobar(insolacion, ["Menos de 1 hora", "Mareo y debilidad", "Piel enrojecida con algo de sudoración", "Somnolenta, difícil de despertar", "Sí, ha bebido agua recientemente"],
              insolacion_grave, 0, high, true).

test('insolacion: ambiguo parcial') :-
    comprobar(insolacion, ["Entre 1 y 3 horas", "Calambres musculares", "Piel enrojecida con algo de sudoración", "Consciente y orientada", "Sí, ha bebido agua recientemente"],
              insolacion_leve, 60, low, false).

test('insolacion: respuestas inciertas') :-
    comprobar(insolacion, ["No estoy seguro", "Calambres musculares", "Sin cambios evidentes en la piel", "Consciente y orientada", "No estoy seguro"],
              insolacion_moderada, 20, low, false).

test('convulsion: leve exacto') :-
    comprobar(convulsion, ["La convulsión ya terminó", "Menos de 2 minutos", "Sí, tiene epilepsia diagnosticada", "Se recuperó y está consciente", "Sin causa aparente"],
              convulsion_leve, 100, low, false).

test('convulsion: moderada exacto') :-
    comprobar(convulsion, ["La convulsión ya terminó", "Menos de 2 minutos", "Sí, ha tenido convulsiones antes", "Está somnolenta y confundida", "Fiebre muy alta"],
              convulsion_moderada, 100, medium, false).

test('convulsion: grave exacto') :-
    comprobar(convulsion, ["Sigue convulsionando ahora mismo", "Más de 5 minutos", "Sí, tiene epilepsia diagnosticada", "Tuvo otra convulsión seguida", "Sin causa aparente"],
              convulsion_grave, 100, high, true).

test('convulsion: emergencia primera vez') :-
    comprobar(convulsion, ["La convulsión ya terminó", "Menos de 2 minutos", "No, es la primera vez", "Se recuperó y está consciente", "Sin causa aparente"],
              convulsion_grave, 0, high, true).

test('convulsion: ambiguo parcial') :-
    comprobar(convulsion, ["La convulsión ya terminó", "Menos de 2 minutos", "Sí, tiene epilepsia diagnosticada", "Está somnolenta y confundida", "Sin causa aparente"],
              convulsion_leve, 80, medium, false).

test('convulsion: respuestas inciertas') :-
    comprobar(convulsion, ["No estoy seguro si fue convulsión", "No sé cuánto duró", "No lo sé", "Se recuperó y está consciente", "Sin causa aparente"],
              convulsion_leve, 40, low, false).

% Regresión: demo de hemorragia (módulo no migrado) tras corregir el
% texto de la pregunta 2.
test('hemorragia: demo regresion 75% ALTO') :-
    diagnostico_hemorragia(["Constante  (flujo moderado continuo)", "La herida es superficial",
                            "Dolor moderado", "Normal, sin cambios", "Inflamación en la zona afectada"],
                           _Em, _Sev, _Recs, Caso, Pct, _Accion, [Primero | _], _Exact),
    assertion(Caso == hemorragia_media),
    assertion(Pct == 75),
    get_dict(level, Primero, Nivel),
    assertion(Nivel == 'ALTO').

% Desmayo: la opción con acento ahora sí aporta su síntoma.
test('desmayo: texto con acento reconocido') :-
    respuestas_desmayo_a_sintomas(["Consciente, responde y puede hablar", "Sí, respira y tiene pulso normal"], S),
    assertion(memberchk(respira_bien, S)).

:- end_tests(escenarios).

% ============================================================
% CONTRATO JSON (mismos campos que responde h_diag)
% ============================================================

:- begin_tests(contrato_json).

test(serializable, [forall(modulo_migrado(M))]) :-
    once(combinacion(M, Respuestas)),
    pm_llamar(diagnostico_, M, [Respuestas, Em, Sev, Recs, Caso, Pct, Accion, Res, Exact]),
    Dict = _{isEmergency:Em, severity:Sev, recommendations:Recs,
             caseType:Caso, confidence:Pct, action:Accion, results:Res, exactOnly:Exact},
    with_output_to(string(Json), json_write_dict(current_output, Dict)),
    atom_json_dict(Json, Leido, []),
    assertion(is_list(Leido.results)),
    assertion(number(Leido.confidence)),
    assertion(memberchk(Leido.exactOnly, [true, false])).

:- end_tests(contrato_json).


% ============================================================
% DIFERENCIAL: HEMORRAGIA, ASFIXIA Y QUEMADURA (pasaron al motor común)
% Excepciones aprobadas y documentadas en CAMBIOS_MIGRACION.md:
%  - hemorragia: 4 combinaciones con sangrado poco + herida superficial
%    que antes daban medium (solo por pasar de 70 %) ahora dan low con
%    hemorragia_leve.
%  - alertas 911 nuevas (aprobadas): asfixia con obstrucción total y
%    hemorragia que coincide >= 75 % con un caso grave/interno. Por eso aquí
%    solo se cuentan como falla las alertas RETIRADAS.
%  - quemadura: "Lesión química o eléctrica" se separó en dos opciones;
%    ambas se comparan contra la opción combinada anterior. Las opciones
%    nuevas (sol/radiación, piel descamada, cambio de color, dolor
%    moderado) no existían: se comparan como si no aportaran síntomas.
% ============================================================

acumular3(M, Respuestas, c(E0, D0, V0, S0, X0), c(E, D, V, S, X)) :-
    pm_diagnostico(M, Respuestas, Em, Sev, Recs, Caso, _Pct, _Accion, Res, _Exact),
    old3_diagnostico(M, Respuestas, EmViejo, SevVieja),
    % Solo cuenta como falla una alerta 911 RETIRADA (antes sí, ahora no).
    % Las alertas nuevas son correcciones aprobadas (ver más abajo).
    ( EmViejo == true, Em \== true -> E is E0 + 1 ; E = E0 ),
    rango_severidad(Sev, RN), rango_severidad(SevVieja, RV),
    ( RN >= RV -> D = D0
    ; M == hemorragia, Caso == hemorragia_leve -> D = D0      % excepción aprobada
    ; D is D0 + 1 ),
    ( Recs == [] -> V is V0 + 1 ; V = V0 ),
    ( Em == true, \+ contiene_911(Recs) -> S is S0 + 1 ; S = S0 ),
    findall(C, ( member(Dic, Res), get_dict(confidence, Dic, 100), get_dict(caseType, Dic, C) ), Cs),
    append(X0, Cs, X1), sort(X1, X).

resumen3(M, r(N, E, D, V, S, Inal)) :-
    findall(R, combinacion(M, R), Todas),
    length(Todas, N),
    foldl(acumular3(M), Todas, c(0, 0, 0, 0, []), c(E, D, V, S, Exactos)),
    findall(C, ( pm_llamar(caso_, M, [C, _]), \+ memberchk(C, Exactos) ), Inal).

% Ya no hay casos inalcanzables conocidos.
inalcanzable_conocido(_, _) :- fail.

imprimir_resumen3 :-
    format("DIFERENCIAL hemorragia / asfixia / quemadura~n"),
    format("modulo | combinaciones | alertas 911 retiradas | severidades degradadas | recs vacias | emergencia sin 911 | inalcanzables~n"),
    forall(modulo_existente(M),
        ( resumen3(M, r(N, E, D, V, S, I)),
          format("~w | ~d | ~d | ~d | ~d | ~d | ~w~n", [M, N, E, D, V, S, I]) )),
    nl.

:- initialization(imprimir_resumen3).

:- begin_tests(diferencial_existentes).

test(sin_divergencias, [forall(modulo_existente(M))]) :-
    resumen3(M, r(N, E, D, V, S, Inal)),
    assertion(N > 0),
    assertion(E == 0),
    assertion(D == 0),
    assertion(V == 0),
    assertion(S == 0),
    forall(member(C, Inal), assertion(inalcanzable_conocido(M, C))).

:- end_tests(diferencial_existentes).

:- begin_tests(escenarios_existentes).

% Queja 1: respuestas sin ningún signo -> caso nuevo, ya no "desconocido 0%".
test('hemorragia: sin signos de hemorragia') :-
    comprobar(hemorragia, ["Sin sangrado visible", "Sin herida visible", "Sin dolor",
                           "Normal, sin cambios", "Ninguno de los anteriores"],
              sin_signos_de_hemorragia, 100, low, false).

% Queja 2: poco + superficial ya no es EXACTO con solo dos respuestas.
test('hemorragia: poco + superficial con dos respuestas no es exacto') :-
    pm_respuestas_a_sintomas(hemorragia, ["Poco  (manchas o goteo leve)", "La herida es superficial"], S),
    pm_pct_caso(hemorragia, hemorragia_leve, S, Pct),
    assertion(Pct < 100).

test('hemorragia: leve exacto con las 5 respuestas') :-
    comprobar(hemorragia, ["Poco  (manchas o goteo leve)", "La herida es superficial", "Sin dolor",
                           "Normal, sin cambios", "Ninguno de los anteriores"],
              hemorragia_leve, 100, low, false).

test('hemorragia: leve pero con desmayo en la pregunta 5 -> emergencia') :-
    comprobar(hemorragia, ["Poco  (manchas o goteo leve)", "La herida es superficial", "Sin dolor",
                           "Normal, sin cambios", "Pérdida del conocimiento"],
              hemorragia_leve, 75, high, true).

test('hemorragia: interna exacta -> alerta 911 por patron grave') :-
    comprobar(hemorragia, ["Sin sangrado visible", "Sin herida visible", "Dolor intenso",
                           "Moretones visibles", "Mareo y debilidad juntos"],
              hemorragia_interna, 100, high, true).

test('asfixia: obstruccion total consciente -> 911 con Heimlich, sin RCP primero') :-
    comprobar(asfixia, ["No puede hablar, tos débil o ineficaz", "Respira con dificultad o ruidos",
                        "Enrojecimiento en rostro", "Consciente y alerta", "Atragantamiento con comida u objeto"],
              asfixia_moderada, 100, high, true),
    pm_diagnostico(asfixia, ["No puede hablar, tos débil o ineficaz", "Respira con dificultad o ruidos",
                             "Enrojecimiento en rostro", "Consciente y alerta", "Atragantamiento con comida u objeto"],
                   _, _, [Primera | _], _, _, _, _, _),
    assertion(sub_atom(Primera, _, _, _, 'Heimlich') ; sub_atom(Primera, _, _, _, 'asfixiando')).

test('convulsion: primera vez -> caso grave con nivel ALERTA 911') :-
    pm_diagnostico(convulsion, ["La convulsión ya terminó", "Menos de 2 minutos", "No, es la primera vez",
                                "Se recuperó y está consciente", "Sin causa aparente"],
                   Em, Sev, _, Caso, _, _, [R], _),
    assertion(Em == true), assertion(Sev == high), assertion(Caso == convulsion_grave),
    get_dict(level, R, Nivel), assertion(Nivel == 'ALERTA 911').

test('asfixia: todo incierto no queda vacio') :-
    once(combinacion(asfixia, R)),
    pm_diagnostico(asfixia, R, _, _, Recs, _, _, _, _, _),
    assertion(Recs \== []).

test('quemadura: todo incierto -> desconocido con recomendaciones') :-
    comprobar(quemadura, ["No estoy seguro", "No estoy seguro", "No estoy seguro",
                          "No estoy seguro", "Ninguno de los anteriores"],
              desconocido, 0, low, false).

test('quemadura: electrica con emergencia incluye 911') :-
    pm_diagnostico(quemadura, ["Lesión eléctrica", "Brazo o pierna", "No estoy seguro",
                               "Lo enfrié con agua", "Ninguno de los anteriores"],
                   Em, Sev, Recs, _, _, _, _, _),
    assertion(Em == true), assertion(Sev == high), assertion(contiene_911(Recs)).

test('quemadura: quimica exacta') :-
    comprobar(quemadura, ["Lesión química", "Cara, cuello o manos",
                          "Cambio de color de la piel (manchas oscuras o amarillentas)",
                          "Lo enfrié con agua", "Ninguno de los anteriores"],
              quemadura_quimica, 100, high, true).

test('quemadura: radiacion exacta') :-
    comprobar(quemadura, ["Quemadura por sol o radiación", "Torso o espalda", "Piel pelada o descamada",
                          "Lo enfrié con agua", "Dolor moderado"],
              quemadura_radiacion, 100, low, false).

test('quemadura: electrica exacta') :-
    comprobar(quemadura, ["Lesión eléctrica", "Brazo o pierna", "No estoy seguro",
                          "Lo enfrié con agua", "Ninguno de los anteriores"],
              quemadura_electrica, 100, high, true).

:- end_tests(escenarios_existentes).

:- begin_tests(contrato_json_existentes).

test(serializable, [forall(modulo_existente(M))]) :-
    once(combinacion(M, Respuestas)),
    pm_llamar(diagnostico_, M, [Respuestas, Em, Sev, Recs, Caso, Pct, Accion, Res, Exact]),
    Dict = _{isEmergency:Em, severity:Sev, recommendations:Recs,
             caseType:Caso, confidence:Pct, action:Accion, results:Res, exactOnly:Exact},
    with_output_to(string(Json), json_write_dict(current_output, Dict)),
    atom_json_dict(Json, Leido, []),
    assertion(is_list(Leido.results)),
    assertion(number(Leido.confidence)).

:- end_tests(contrato_json_existentes).
