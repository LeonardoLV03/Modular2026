require('dotenv').config();
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;

const lessons = [
  {
    "module": "desmayo",
    "order": 1,
    "title": "Desmayo — Básico",
    "xpReward": 20,
    "questions": [
      {
        "question": "¿Cuál es la primera acción ante una persona que se desmaya?",
        "options": [
          "Recostarla y elevar sus piernas",
          "Sentarla con la cabeza hacia adelante",
          "Sacudirla para despertarla",
          "Darle agua de inmediato"
        ],
        "correctIndex": 0,
        "explanation": "Recostar a la persona y elevar sus piernas ayuda a que la sangre regrese al cerebro más rápido."
      },
      {
        "question": "¿Por qué ocurre comúnmente un desmayo (síncope)?",
        "options": [
          "Por hacer ejercicio",
          "Por comer demasiado",
          "Por dormir mal",
          "Por una caída temporal del flujo sanguíneo al cerebro"
        ],
        "correctIndex": 3,
        "explanation": "El desmayo suele deberse a una reducción momentánea del flujo de sangre y oxígeno al cerebro."
      },
      {
        "question": "¿Qué debes hacer con la ropa de la persona desmayada?",
        "options": [
          "No tocarla",
          "Quitarle los zapatos únicamente",
          "Aflojar cuellos, cinturones o prendas ajustadas",
          "Cubrirla con varias capas"
        ],
        "correctIndex": 2,
        "explanation": "Aflojar la ropa ajustada facilita la respiración y la circulación."
      },
      {
        "question": "Si la persona no recupera la consciencia en 1-2 minutos, ¿qué debes hacer?",
        "options": [
          "Darle café",
          "Llamar a emergencias de inmediato",
          "Dejarla sola para que descanse",
          "Esperar más tiempo"
        ],
        "correctIndex": 1,
        "explanation": "Si no despierta rápido, podría ser algo más grave que un desmayo simple — se necesita atención médica."
      },
      {
        "question": "¿Es recomendable dar de comer o beber a alguien que acaba de desmayarse?",
        "options": [
          "Solo agua",
          "Sí, inmediatamente",
          "No, hasta que esté completamente consciente y alerta",
          "Solo si lo pide"
        ],
        "correctIndex": 2,
        "explanation": "Dar líquidos o comida antes de que la persona esté totalmente consciente puede causar broncoaspiración."
      }
    ]
  },
  {
    "module": "hemorragia",
    "order": 1,
    "title": "Hemorragia — Básico",
    "xpReward": 20,
    "questions": [
      {
        "question": "¿Cuál es el primer paso ante una hemorragia externa?",
        "options": [
          "Elevar la extremidad únicamente",
          "Llamar a emergencias antes que nada",
          "Aplicar torniquete",
          "Presión directa sobre la herida"
        ],
        "correctIndex": 3,
        "explanation": "La presión directa controla la mayoría de las hemorragias sin necesitar torniquete."
      },
      {
        "question": "¿Con qué debes aplicar presión sobre una herida sangrante?",
        "options": [
          "Con alcohol",
          "Con la mano directa sin nada más",
          "Con hielo directo",
          "Con una tela limpia o gasa"
        ],
        "correctIndex": 3,
        "explanation": "Usar una tela limpia o gasa ayuda a controlar el sangrado y reduce el riesgo de infección."
      },
      {
        "question": "¿Cuándo se considera usar un torniquete?",
        "options": [
          "Antes de intentar la presión directa",
          "Solo si la hemorragia es severa y no se controla con presión directa",
          "Nunca es recomendable",
          "En cualquier corte pequeño"
        ],
        "correctIndex": 1,
        "explanation": "El torniquete es el último recurso, para hemorragias masivas que no ceden con presión directa."
      },
      {
        "question": "Si la sangre empapa la tela que usaste para presionar, ¿qué debes hacer?",
        "options": [
          "Quitar la tela y poner una nueva",
          "Dejar de presionar",
          "Agregar más tela encima sin quitar la anterior",
          "Lavar la herida con agua"
        ],
        "correctIndex": 2,
        "explanation": "Quitar la tela puede remover coágulos que ya se están formando — se agrega más encima sin retirar la primera."
      },
      {
        "question": "¿Qué señal indica que una hemorragia es una emergencia grave?",
        "options": [
          "Comezón en la piel",
          "Un moretón",
          "Un raspón leve",
          "Sangrado que no para después de varios minutos de presión, o mareo/palidez"
        ],
        "correctIndex": 3,
        "explanation": "Sangrado incontrolable junto con mareo o palidez son señales de shock y requieren atención médica urgente."
      }
    ]
  },
  {
    "module": "asfixia",
    "order": 1,
    "title": "Asfixia — Básico",
    "xpReward": 20,
    "questions": [
      {
        "question": "¿Qué señal indica que alguien se está asfixiando con comida?",
        "options": [
          "Solo estornuda",
          "Se lleva las manos al cuello y no puede hablar ni toser",
          "Tose fuerte y habla normal",
          "Se ríe nerviosamente"
        ],
        "correctIndex": 1,
        "explanation": "Llevarse las manos al cuello sin poder hablar ni toser es la señal clásica de obstrucción total de vía aérea."
      },
      {
        "question": "¿Qué maniobra se usa para ayudar a una persona adulta que se atraganta?",
        "options": [
          "Golpear la espalda suavemente una vez",
          "Darle agua",
          "Maniobra de Heimlich (compresiones abdominales)",
          "Hacerla vomitar con el dedo"
        ],
        "correctIndex": 2,
        "explanation": "La maniobra de Heimlich genera presión para expulsar el objeto que obstruye la vía aérea."
      },
      {
        "question": "Si la persona SÍ puede toser con fuerza, ¿qué debes hacer?",
        "options": [
          "Animarla a seguir tosiendo, sin intervenir todavía",
          "Darle palmadas fuertes en el pecho",
          "Acostarla boca abajo",
          "Aplicar Heimlich de inmediato"
        ],
        "correctIndex": 0,
        "explanation": "Si puede toser, su cuerpo todavía está moviendo aire — hay que dejar que la tos intente expulsar el objeto primero."
      },
      {
        "question": "¿Qué haces si la persona pierde el conocimiento mientras se asfixia?",
        "options": [
          "Dejarla en el suelo y esperar",
          "Sacudirla fuerte",
          "Recostarla con cuidado e iniciar RCP, llamando a emergencias",
          "Darle de beber agua"
        ],
        "correctIndex": 2,
        "explanation": "Si pierde el conocimiento, se debe iniciar RCP y pedir ayuda de emergencia de inmediato."
      },
      {
        "question": "¿En bebés menores de 1 año, qué se usa en vez de compresiones abdominales?",
        "options": [
          "Nada, solo esperar",
          "Sacudirlo boca abajo con fuerza",
          "Compresiones abdominales igual que en adultos",
          "Golpes en la espalda y compresiones en el pecho, alternadas"
        ],
        "correctIndex": 3,
        "explanation": "En bebés se alternan golpes firmes en la espalda con compresiones en el pecho, nunca compresiones abdominales tipo Heimlich."
      }
    ]
  },
  {
    "module": "quemadura",
    "order": 1,
    "title": "Quemadura — Básico",
    "xpReward": 20,
    "questions": [
      {
        "question": "¿Qué debes hacer primero ante una quemadura leve?",
        "options": [
          "Enfriar con agua corriente tibia/fría por varios minutos",
          "Reventar cualquier ampolla",
          "Poner mantequilla o aceite",
          "Aplicar hielo directo"
        ],
        "correctIndex": 0,
        "explanation": "El agua corriente (no helada) ayuda a bajar la temperatura de la piel y reduce el daño."
      },
      {
        "question": "¿Por qué NO se debe usar hielo directo sobre una quemadura?",
        "options": [
          "Porque mancha la piel",
          "Porque puede dañar más el tejido por el frío extremo",
          "Sí se debe usar hielo",
          "Porque no hace nada"
        ],
        "correctIndex": 1,
        "explanation": "El hielo directo puede causar más daño al tejido ya dañado por el calor."
      },
      {
        "question": "¿Qué se debe hacer con las ampollas causadas por una quemadura?",
        "options": [
          "Cubrirlas con algodón directo",
          "No reventarlas, protegen la piel de infecciones",
          "Rascarlas",
          "Reventarlas para liberar el líquido"
        ],
        "correctIndex": 1,
        "explanation": "Las ampollas actúan como barrera protectora natural contra infecciones — no deben reventarse."
      },
      {
        "question": "¿Cuándo una quemadura requiere atención médica urgente?",
        "options": [
          "Si es extensa, profunda, o está en cara/manos/genitales",
          "Nunca es urgente",
          "Solo si duele mucho",
          "Siempre, sin excepción"
        ],
        "correctIndex": 0,
        "explanation": "Quemaduras extensas, profundas o en zonas sensibles necesitan evaluación médica inmediata."
      },
      {
        "question": "¿Qué se recomienda usar para cubrir una quemadura ya enfriada?",
        "options": [
          "Papel higiénico",
          "Gasa limpia y no adherente",
          "Algodón suelto",
          "Nada, dejarla al aire libre siempre"
        ],
        "correctIndex": 1,
        "explanation": "Una gasa limpia y no adherente protege la herida sin pegarse a la piel dañada."
      }
    ]
  },
  {
    "module": "fractura",
    "order": 1,
    "title": "Fractura — Básico",
    "xpReward": 20,
    "questions": [
      {
        "question": "¿Qué debes hacer si sospechas que alguien tiene una fractura?",
        "options": [
          "Hacer que camine para ver si duele",
          "Aplicar calor directo",
          "Inmovilizar la zona y evitar que se mueva",
          "Intentar acomodar el hueso"
        ],
        "correctIndex": 2,
        "explanation": "Inmovilizar previene que el hueso se mueva más y cause daño adicional a tejidos y nervios."
      },
      {
        "question": "¿Qué señal es típica de una fractura?",
        "options": [
          "Dolor leve que desaparece rápido",
          "Enrojecimiento sin dolor",
          "Solo un poco de comezón",
          "Deformidad visible, hinchazón intensa o incapacidad para mover la zona"
        ],
        "correctIndex": 3,
        "explanation": "Deformidad, hinchazón fuerte y pérdida de movilidad son señales típicas de fractura."
      },
      {
        "question": "¿Se debe intentar enderezar un hueso que se ve torcido?",
        "options": [
          "No, nunca — solo inmovilizar en la posición encontrada",
          "Solo si no duele",
          "Sí, siempre",
          "Solo en brazos"
        ],
        "correctIndex": 0,
        "explanation": "Intentar enderezar un hueso puede causar más daño a nervios, vasos sanguíneos y tejido."
      },
      {
        "question": "Si hay una fractura expuesta (el hueso se ve por fuera de la piel), ¿qué se hace?",
        "options": [
          "Empujar el hueso de vuelta",
          "Cubrir con tela limpia sin presionar el hueso, y buscar ayuda urgente",
          "Lavar el hueso con agua",
          "Ignorarlo si no sangra"
        ],
        "correctIndex": 1,
        "explanation": "Se cubre para prevenir infección, sin intentar reacomodar el hueso, y se busca atención médica de inmediato."
      },
      {
        "question": "¿Con qué se puede improvisar una férula para inmovilizar?",
        "options": [
          "No es posible improvisar",
          "Con una toalla suelta",
          "Con objetos rígidos como tablas o revistas enrolladas, bien sujetos",
          "Solo con materiales médicos oficiales"
        ],
        "correctIndex": 2,
        "explanation": "Objetos rígidos bien sujetos alrededor de la zona pueden servir como férula temporal mientras llega ayuda."
      }
    ]
  },
  {
    "module": "intoxicacion",
    "order": 1,
    "title": "Intoxicación — Básico",
    "xpReward": 20,
    "questions": [
      {
        "question": "¿Qué debes hacer si sospechas que alguien se intoxicó con una sustancia?",
        "options": [
          "Darle leche de inmediato",
          "Esperar a ver si mejora solo",
          "Inducir el vómito siempre",
          "Llamar al centro de toxicología o emergencias antes de actuar"
        ],
        "correctIndex": 3,
        "explanation": "Cada sustancia requiere un manejo distinto — un experto en toxicología te guía sobre qué hacer."
      },
      {
        "question": "¿Por qué NO se debe inducir el vómito en todos los casos?",
        "options": [
          "No hay ninguna razón",
          "Algunas sustancias (como corrosivos) pueden dañar más al devolverse",
          "El vómito nunca ayuda",
          "Siempre es seguro hacerlo"
        ],
        "correctIndex": 1,
        "explanation": "Con sustancias corrosivas o derivados de petróleo, el vómito puede causar más daño al esófago y pulmones."
      },
      {
        "question": "Si la intoxicación fue por inhalar gas o humo, ¿qué es prioritario?",
        "options": [
          "Sacar a la persona al aire libre lo antes posible",
          "Darle agua primero",
          "Quedarse en el lugar",
          "Cerrar puertas y ventanas"
        ],
        "correctIndex": 0,
        "explanation": "Sacar a la persona del ambiente contaminado es la prioridad para que pueda respirar aire limpio."
      },
      {
        "question": "¿Qué información es útil tener lista al llamar por una intoxicación?",
        "options": [
          "Qué sustancia fue, cuánta cantidad, y a qué hora ocurrió",
          "El color de la sustancia únicamente",
          "Solo el nombre de la persona",
          "Nada en particular"
        ],
        "correctIndex": 0,
        "explanation": "Esta información ayuda a los servicios de emergencia a dar el tratamiento correcto más rápido."
      },
      {
        "question": "¿Qué hacer si la persona intoxicada pierde el conocimiento?",
        "options": [
          "Dejarla boca arriba sin más",
          "Sentarla derecha",
          "Colocarla de lado (posición de recuperación) y llamar a emergencias",
          "Darle de beber agua"
        ],
        "correctIndex": 2,
        "explanation": "La posición de lado evita que se ahogue con su propio vómito si pierde el conocimiento."
      }
    ]
  },
  {
    "module": "picadura",
    "order": 1,
    "title": "Picadura — Básico",
    "xpReward": 20,
    "questions": [
      {
        "question": "¿Qué debes hacer primero ante una picadura de insecto con aguijón visible?",
        "options": [
          "Apretar la zona con los dedos",
          "Ignorarlo",
          "Retirar el aguijón raspando con una tarjeta o uña, sin apretar",
          "Aplicar alcohol directo sobre el aguijón"
        ],
        "correctIndex": 2,
        "explanation": "Raspar en vez de apretar evita inyectar más veneno que pueda quedar en el saco del aguijón."
      },
      {
        "question": "¿Qué señales indican una reacción alérgica grave (anafilaxia) por una picadura?",
        "options": [
          "Dificultad para respirar, hinchazón de cara/garganta, o mareo intenso",
          "Un pequeño enrojecimiento",
          "Solo comezón leve",
          "Nada en especial"
        ],
        "correctIndex": 0,
        "explanation": "Estos síntomas indican una reacción alérgica severa que requiere atención médica inmediata."
      },
      {
        "question": "¿Qué se recomienda aplicar sobre una picadura para reducir la hinchazón?",
        "options": [
          "Nada, dejar como está",
          "Alcohol directo",
          "Compresa fría o hielo envuelto en tela",
          "Agua caliente"
        ],
        "correctIndex": 2,
        "explanation": "El frío ayuda a reducir la hinchazón y el dolor local."
      },
      {
        "question": "¿Qué se debe hacer si la persona tiene antecedentes de alergia grave y trae consigo un autoinyector (EpiPen)?",
        "options": [
          "Usarlo solo si lo pide tres veces",
          "Guardarlo para después",
          "Ayudarla a usarlo según las instrucciones y llamar a emergencias",
          "No usarlo, esperar ayuda"
        ],
        "correctIndex": 2,
        "explanation": "El autoinyector puede ser vital en minutos — se debe usar de inmediato y after llamar a emergencias."
      },
      {
        "question": "¿Es seguro rascar una picadura que da mucha comezón?",
        "options": [
          "No es recomendable, puede causar infección",
          "Solo con las uñas cortas",
          "Da igual",
          "Sí, todo lo que se pueda"
        ],
        "correctIndex": 0,
        "explanation": "Rascar puede romper la piel y facilitar una infección en la zona."
      }
    ]
  },
  {
    "module": "descarga",
    "order": 1,
    "title": "Descarga Eléctrica — Básico",
    "xpReward": 20,
    "questions": [
      {
        "question": "¿Qué es lo primero que debes hacer si alguien sufre una descarga eléctrica?",
        "options": [
          "Cortar la fuente de electricidad o alejarla con un objeto no conductor",
          "Echarle agua",
          "Tocarla para ver si reacciona",
          "Sacudirla"
        ],
        "correctIndex": 0,
        "explanation": "Nunca toques directamente a alguien electrocutado mientras siga en contacto con la corriente — podrías electrocutarte también."
      },
      {
        "question": "¿Con qué tipo de material es seguro alejar a alguien de una fuente eléctrica?",
        "options": [
          "Materiales secos y no conductores como madera o plástico",
          "Cualquier objeto sirve",
          "Metal",
          "Agua"
        ],
        "correctIndex": 0,
        "explanation": "Los materiales no conductores (madera, plástico seco) evitan que la corriente pase a través de ti."
      },
      {
        "question": "¿Por qué es importante revisar la respiración después de una descarga eléctrica?",
        "options": [
          "Solo por costumbre",
          "La corriente puede afectar el ritmo cardiaco y la respiración",
          "Solo si hay quemaduras visibles",
          "No es importante"
        ],
        "correctIndex": 1,
        "explanation": "La electricidad puede provocar paro cardiaco o respiratorio, incluso sin quemaduras visibles."
      },
      {
        "question": "¿Las quemaduras por electricidad son siempre visibles en la piel?",
        "options": [
          "Solo en electricidad de alto voltaje",
          "Sí, siempre se ven claramente",
          "Nunca hay quemaduras",
          "No, puede haber daño interno grave sin quemaduras externas grandes"
        ],
        "correctIndex": 3,
        "explanation": "El daño interno puede ser mucho mayor de lo que se ve en la superficie de la piel."
      },
      {
        "question": "¿Toda descarga eléctrica requiere evaluación médica, aunque la persona se sienta bien?",
        "options": [
          "Sí, siempre se recomienda evaluación médica",
          "No, solo si hay quemaduras",
          "Nunca es necesario",
          "Solo si pierde el conocimiento"
        ],
        "correctIndex": 0,
        "explanation": "Los efectos internos pueden no notarse de inmediato — es importante que un médico revise a la persona."
      }
    ]
  },
  {
    "module": "insolacion",
    "order": 1,
    "title": "Insolación — Básico",
    "xpReward": 20,
    "questions": [
      {
        "question": "¿Cuál es la acción principal para tratar una insolación?",
        "options": [
          "Llevarla a un lugar fresco y bajar su temperatura gradualmente",
          "Ponerla al sol para que sude",
          "Abrigar a la persona",
          "Darle café caliente"
        ],
        "correctIndex": 0,
        "explanation": "Sacarla del calor y enfriarla gradualmente ayuda a bajar la temperatura corporal peligrosamente alta."
      },
      {
        "question": "¿Qué señales indican un golpe de calor grave?",
        "options": [
          "Sudoración normal y sed leve",
          "Hambre",
          "Piel muy caliente y seca, confusión, o pérdida de consciencia",
          "Solo un poco de cansancio"
        ],
        "correctIndex": 2,
        "explanation": "Piel caliente y seca junto con confusión son señales de que el cuerpo ya no puede regular su temperatura — es una emergencia."
      },
      {
        "question": "¿Qué tipo de líquido se recomienda dar a alguien con insolación leve y consciente?",
        "options": [
          "Bebidas alcohólicas",
          "Bebidas muy azucaradas en grandes cantidades",
          "Nada de líquidos",
          "Agua fresca en sorbos pequeños"
        ],
        "correctIndex": 3,
        "explanation": "Agua fresca en sorbos pequeños ayuda a rehidratar sin sobrecargar el estómago."
      },
      {
        "question": "¿Qué se puede usar para ayudar a enfriar el cuerpo de alguien con insolación?",
        "options": [
          "Ropa extra",
          "Cobijas gruesas",
          "Compresas frías en cuello, axilas e ingles",
          "Ejercicio ligero"
        ],
        "correctIndex": 2,
        "explanation": "Esas zonas tienen vasos sanguíneos grandes cerca de la piel, lo que ayuda a enfriar el cuerpo más rápido."
      },
      {
        "question": "¿Cuándo se debe buscar atención médica urgente por insolación?",
        "options": [
          "Solo si hay quemaduras solares",
          "Si hay confusión, pérdida de consciencia, o la temperatura corporal es muy alta",
          "Solo si dura más de una semana",
          "Nunca es necesario"
        ],
        "correctIndex": 1,
        "explanation": "Confusión o pérdida de consciencia indican un golpe de calor severo que puede ser mortal sin tratamiento."
      }
    ]
  },
  {
    "module": "convulsion",
    "order": 1,
    "title": "Convulsión — Básico",
    "xpReward": 20,
    "questions": [
      {
        "question": "¿Qué debes hacer mientras alguien está teniendo una convulsión?",
        "options": [
          "Despejar el área a su alrededor de objetos peligrosos",
          "Sujetarla con fuerza para que no se mueva",
          "Darle agua",
          "Meterle algo en la boca"
        ],
        "correctIndex": 0,
        "explanation": "Despejar el área previene que la persona se golpee con objetos cercanos durante los movimientos."
      },
      {
        "question": "¿Es correcto meter algo en la boca de alguien que convulsiona?",
        "options": [
          "Sí, para evitar que se muerda la lengua",
          "Solo una cuchara",
          "No, nunca — puede causar más daño o asfixia",
          "Solo los dedos"
        ],
        "correctIndex": 2,
        "explanation": "Meter objetos en la boca puede romper dientes, lastimar las encías, o bloquear la vía respiratoria."
      },
      {
        "question": "¿Qué se debe hacer con la cabeza de la persona durante la convulsión?",
        "options": [
          "Colocar algo suave debajo y voltearla de lado si es posible",
          "Sujetarla firme para que no se mueva",
          "No tocarla en absoluto",
          "Levantarla"
        ],
        "correctIndex": 0,
        "explanation": "Algo suave protege la cabeza de golpes, y voltearla de lado ayuda a que no se ahogue con saliva."
      },
      {
        "question": "¿Cuándo una convulsión requiere llamar a emergencias de inmediato?",
        "options": [
          "Siempre, sin excepción, incluso si dura pocos segundos",
          "Nunca es necesario llamar",
          "Solo si la persona lo pide",
          "Si dura más de 5 minutos, se repite, o la persona no respira bien después"
        ],
        "correctIndex": 3,
        "explanation": "Convulsiones prolongadas o repetidas son una emergencia médica que requiere atención inmediata."
      },
      {
        "question": "Después de que termina la convulsión, ¿qué es normal que sienta la persona?",
        "options": [
          "Confusión, cansancio o desorientación temporal",
          "Hambre extrema únicamente",
          "Nada en absoluto",
          "Energía total inmediata"
        ],
        "correctIndex": 0,
        "explanation": "Es común que después de convulsionar la persona se sienta confundida o cansada por un rato — hay que acompañarla con calma."
      }
    ]
  },

  // ── NUEVO: segundas (y terceras) lecciones, para ver el carrusel ──
  // y los dos tipos de candado (secuencial + por nivel) en acción.

  {
    "module": "desmayo",
    "order": 2,
    "title": "Desmayo — Reconocer causas y prevenir",
    "xpReward": 25,
    "questions": [
      {
        "question": "¿Qué se debe hacer con las piernas de una persona desmayada que no respira con normalidad?",
        "options": ["Mantenerlas rectas", "Cruzarlas", "Elevarlas por encima del nivel del corazón", "Doblarlas hacia el pecho"],
        "correctIndex": 2,
        "explanation": "Elevar las piernas favorece que la sangre regrese más rápido al cerebro."
      },
      {
        "question": "¿Qué se debe evitar hacer con alguien que acaba de desmayarse?",
        "options": ["Aflojar su ropa", "Verificar que respire", "Darle de beber agua de inmediato", "Mantenerla en un lugar ventilado"],
        "correctIndex": 2,
        "explanation": "No debe dársele nada de beber hasta que esté completamente consciente y alerta, por riesgo de atragantamiento."
      },
      {
        "question": "¿Cómo debe incorporarse una persona después de recuperar la consciencia?",
        "options": ["De golpe, cuanto antes", "Poco a poco, por etapas", "Solo si alguien la levanta con fuerza", "No debe moverse en varias horas"],
        "correctIndex": 1,
        "explanation": "Levantarse de golpe puede provocar un nuevo desmayo por la caída brusca de presión."
      },
      {
        "question": "¿Cuál de estas puede ser una causa común de un desmayo (síncope)?",
        "options": ["Estar de pie mucho tiempo sin moverse", "Dormir 8 horas", "Comer una fruta", "Escuchar música"],
        "correctIndex": 0,
        "explanation": "Permanecer de pie e inmóvil por mucho tiempo puede hacer que la sangre se acumule en las piernas y baje la presión al cerebro."
      },
      {
        "question": "Si una persona se desmaya repetidamente en poco tiempo, ¿qué se recomienda?",
        "options": ["Ignorarlo, es normal", "Buscar evaluación médica", "Darle café fuerte", "Hacerla caminar rápido"],
        "correctIndex": 1,
        "explanation": "Los desmayos repetidos pueden indicar una causa médica subyacente que debe evaluarse."
      }
    ]
  },
  {
    "module": "hemorragia",
    "order": 2,
    "title": "Hemorragia — Control avanzado",
    "xpReward": 25,
    "questions": [
      {
        "question": "¿Qué se debe hacer si la sangre empapa la tela que usaste para presionar?",
        "options": ["Quitar la tela y limpiar la herida", "Agregar más tela encima sin retirar la anterior", "Dejar de presionar", "Lavar la herida con agua"],
        "correctIndex": 1,
        "explanation": "Quitar la tela puede remover coágulos que ya se están formando; se agrega más encima."
      },
      {
        "question": "¿Cuándo se considera el uso de un torniquete?",
        "options": ["Antes de intentar presión directa", "Ante cualquier corte pequeño", "Solo si la hemorragia es masiva en una extremidad y no cede con presión directa", "Nunca debe usarse"],
        "correctIndex": 2,
        "explanation": "El torniquete es el último recurso, para hemorragias severas en extremidades que no ceden con presión directa."
      },
      {
        "question": "¿Qué señales indican que una persona podría estar entrando en shock por pérdida de sangre?",
        "options": ["Aumento del apetito", "Piel pálida, sudor frío y pulso acelerado", "Piel roja y fiebre", "Somnolencia leve sin otros síntomas"],
        "correctIndex": 1,
        "explanation": "Estos son signos clásicos de shock hipovolémico por pérdida de sangre."
      },
      {
        "question": "¿Qué se debe hacer con una extremidad que sangra, además de presionar la herida?",
        "options": ["Bajarla por debajo del corazón", "Elevarla por encima del nivel del corazón, si es posible", "Sacudirla", "No moverla en absoluto"],
        "correctIndex": 1,
        "explanation": "Elevar la extremidad afectada, junto con la presión directa, ayuda a reducir el flujo de sangre hacia la herida."
      },
      {
        "question": "¿Qué se debe hacer apenas se coloca un torniquete?",
        "options": ["Anotar o recordar la hora exacta en que se colocó", "Quitarlo cada pocos minutos para revisar", "Aflojarlo si la persona se queja", "Cubrirlo para que no se vea"],
        "correctIndex": 0,
        "explanation": "Registrar la hora es fundamental para el personal médico que atenderá después a la persona."
      }
    ]
  },
  {
    "module": "asfixia",
    "order": 2,
    "title": "Asfixia — Maniobra de Heimlich",
    "xpReward": 25,
    "questions": [
      {
        "question": "¿Cómo se colocan las manos para la maniobra de Heimlich en un adulto consciente?",
        "options": ["Sobre el pecho, empujando hacia abajo", "En la espalda, con golpes suaves", "Un puño arriba del ombligo, la otra mano encima, empujando hacia adentro y arriba", "Alrededor del cuello"],
        "correctIndex": 2,
        "explanation": "Se coloca el puño ligeramente por encima del ombligo y se realizan compresiones hacia adentro y arriba."
      },
      {
        "question": "¿Qué se debe hacer primero si la persona todavía puede toser con fuerza?",
        "options": ["Aplicar Heimlich de inmediato", "Darle golpes fuertes en la espalda", "Animarla a seguir tosiendo, sin intervenir aún", "Acostarla boca abajo"],
        "correctIndex": 2,
        "explanation": "Si puede toser, su cuerpo todavía mueve aire — se debe dejar que la tos intente expulsar el objeto primero."
      },
      {
        "question": "¿Qué se hace si la persona pierde el conocimiento mientras se atraganta?",
        "options": ["Dejarla de pie y esperar", "Recostarla con cuidado e iniciar RCP, revisando la boca entre ciclos", "Darle agua para que trague el objeto", "Sacudirla con fuerza"],
        "correctIndex": 1,
        "explanation": "Si pierde el conocimiento, se debe iniciar RCP y revisar la vía aérea entre ciclos."
      },
      {
        "question": "¿En una persona embarazada o con obesidad, dónde se recomienda colocar las manos en vez del abdomen?",
        "options": ["En la parte baja del abdomen", "En el centro del pecho (esternón)", "En la espalda", "En el cuello"],
        "correctIndex": 1,
        "explanation": "En estos casos se recomiendan compresiones torácicas en vez de abdominales."
      },
      {
        "question": "Después de resolver una obstrucción con Heimlich, ¿qué se recomienda?",
        "options": ["No es necesario hacer nada más", "Buscar evaluación médica, ya que las compresiones pueden causar lesiones internas", "Comer de inmediato", "Hacer ejercicio para confirmar que está bien"],
        "correctIndex": 1,
        "explanation": "Aunque el objeto haya salido, es buena práctica que un médico revise por posibles lesiones internas de las compresiones."
      }
    ]
  },
  {
    "module": "quemadura",
    "order": 2,
    "title": "Quemadura — Clasificación y cuidados",
    "xpReward": 25,
    "questions": [
      {
        "question": "¿Qué caracteriza a una quemadura de segundo grado?",
        "options": ["Solo enrojecimiento superficial sin ampollas", "Ampollas y enrojecimiento intenso", "Piel carbonizada y sin dolor", "Ningún síntoma visible"],
        "correctIndex": 1,
        "explanation": "Las quemaduras de segundo grado afectan la dermis y suelen presentar ampollas."
      },
      {
        "question": "¿Qué NO se debe aplicar sobre una quemadura?",
        "options": ["Agua corriente fresca", "Un paño limpio y húmedo", "Hielo directo, pasta dental o mantequilla", "Cubrirla sin apretar"],
        "correctIndex": 2,
        "explanation": "El hielo directo daña más el tejido, y remedios caseros como pasta dental o mantequilla pueden causar infecciones."
      },
      {
        "question": "¿Durante cuánto tiempo se recomienda enfriar una quemadura con agua corriente?",
        "options": ["Menos de 5 segundos", "Entre 10 y 20 minutos", "Más de 2 horas", "No se debe enfriar"],
        "correctIndex": 1,
        "explanation": "Enfriar la zona entre 10 y 20 minutos ayuda a detener el daño térmico."
      },
      {
        "question": "¿Cuál es más preocupante: una quemadura con ampollas que duele mucho, o una carbonizada que no duele?",
        "options": ["La que forma ampollas, siempre", "Duelen igual en ambos casos", "La carbonizada sin dolor, porque puede indicar daño a terminaciones nerviosas", "Ninguna es grave"],
        "correctIndex": 2,
        "explanation": "La ausencia de dolor en una quemadura profunda puede indicar que se dañaron las terminaciones nerviosas, lo cual es más grave."
      },
      {
        "question": "¿Qué se debe hacer con la ropa pegada a una quemadura?",
        "options": ["Arrancarla rápido", "No intentar quitarla, dejar que personal médico lo haga", "Mojarla y jalar con fuerza", "Cortarla toda de inmediato sin cuidado"],
        "correctIndex": 1,
        "explanation": "Intentar quitar ropa pegada a la piel quemada puede arrancar tejido y empeorar la lesión."
      }
    ]
  },
  {
    "module": "fractura",
    "order": 2,
    "title": "Fractura — Inmovilización",
    "xpReward": 25,
    "questions": [
      {
        "question": "¿Qué se debe hacer antes de inmovilizar una posible fractura?",
        "options": ["Intentar acomodar el hueso en su lugar", "Evitar mover la zona afectada y revisar si hay sangrado", "Hacer que la persona mueva la extremidad para confirmar el dolor", "Aplicar calor directo"],
        "correctIndex": 1,
        "explanation": "Nunca se debe intentar realinear el hueso; primero se evalúa la zona sin moverla."
      },
      {
        "question": "¿Con qué se puede improvisar una férula?",
        "options": ["Solo con las manos, sujetando firme", "Con hielo directamente sobre el hueso", "Un objeto rígido (tabla, revista enrollada) sujeto con vendas", "No es necesario inmovilizar"],
        "correctIndex": 2,
        "explanation": "Una férula improvisada rígida, bien sujeta, ayuda a evitar que la fractura empeore."
      },
      {
        "question": "¿Qué señal indica que la inmovilización quedó demasiado apretada?",
        "options": ["La persona deja de sentir dolor por completo", "Hormigueo, color azulado o frío en los dedos", "El área se pone más caliente de lo normal", "No hay forma de saberlo"],
        "correctIndex": 1,
        "explanation": "Esos signos indican que se está cortando la circulación y hay que aflojar el vendaje."
      },
      {
        "question": "¿Qué articulaciones se deben inmovilizar al entablillar un hueso largo (como el antebrazo)?",
        "options": ["Ninguna, solo el hueso", "Solo la articulación más cercana al cuerpo", "Las articulaciones por arriba y por abajo de la fractura", "Todas las articulaciones del cuerpo"],
        "correctIndex": 2,
        "explanation": "Inmovilizar ambas articulaciones adyacentes evita que la fractura se mueva desde cualquier extremo."
      },
      {
        "question": "¿Qué se debe hacer si la persona con una posible fractura también tiene mucho dolor y ansiedad?",
        "options": ["Ignorar sus emociones", "Hablarle con calma mientras se espera ayuda", "Dejarla sola para que se tranquilice", "Decirle que no es grave sin saberlo"],
        "correctIndex": 1,
        "explanation": "Mantener la calma y hablarle con tranquilidad ayuda a reducir el estrés mientras llega la atención médica."
      }
    ]
  },
  {
    "module": "intoxicacion",
    "order": 2,
    "title": "Intoxicación — Primeros pasos",
    "xpReward": 25,
    "questions": [
      {
        "question": "¿Qué se debe hacer primero ante una sospecha de intoxicación?",
        "options": ["Provocar el vómito de inmediato", "Dar leche para neutralizar cualquier veneno", "Identificar la sustancia y llamar a un centro de toxicología o emergencias", "Esperar a ver si aparecen síntomas"],
        "correctIndex": 2,
        "explanation": "Identificar la sustancia es clave para que los servicios de emergencia den las indicaciones correctas."
      },
      {
        "question": "¿Cuándo NO se debe provocar el vómito?",
        "options": ["Si la persona ingirió una fruta en mal estado", "Si la sustancia es un producto de limpieza, ácido o derivado del petróleo", "Nunca hay excepciones", "Solo si la persona lo pide"],
        "correctIndex": 1,
        "explanation": "Provocar el vómito con sustancias corrosivas puede causar daño adicional al esófago y vías respiratorias."
      },
      {
        "question": "¿Qué información es más útil dar a los servicios de emergencia?",
        "options": ["Solo la edad de la persona", "El color de los ojos de la persona", "Qué sustancia fue, cuánta cantidad y hace cuánto tiempo", "Nada, ellos preguntan todo al llegar"],
        "correctIndex": 2,
        "explanation": "Esa información permite decidir el tratamiento adecuado con rapidez."
      },
      {
        "question": "¿Qué se debe hacer con el envase de la sustancia involucrada, si se encuentra?",
        "options": ["Tirarlo de inmediato", "Guardarlo y llevarlo si se busca ayuda médica", "Esconderlo", "No tiene importancia"],
        "correctIndex": 1,
        "explanation": "El envase ayuda a identificar exactamente qué se ingirió y en qué concentración."
      },
      {
        "question": "Si la persona intoxicada está consciente pero confundida, ¿qué se recomienda?",
        "options": ["Dejarla sola para que descanse", "Quedarse con ella y vigilar su estado mientras llega ayuda", "Darle de comer algo fuerte", "Hacerla caminar rápido"],
        "correctIndex": 1,
        "explanation": "Vigilar de cerca permite reaccionar rápido si su estado empeora."
      }
    ]
  },
  {
    // Esta es la que queda bloqueada por NIVEL (además de por orden) —
    // úsala para probar el candado "Nivel 2+" del carrusel.
    "module": "intoxicacion",
    "order": 3,
    "title": "Intoxicación — Casos avanzados",
    "xpReward": 30,
    "requiredLevel": 2,
    "questions": [
      {
        "question": "¿Qué antídoto se usa comúnmente en hospitales para intoxicación por paracetamol?",
        "options": ["Vinagre", "Bicarbonato de sodio en casa", "N-acetilcisteína", "No existe antídoto"],
        "correctIndex": 2,
        "explanation": "La N-acetilcisteína es el antídoto usado en hospitales para sobredosis de paracetamol."
      },
      {
        "question": "¿Qué se debe hacer si una persona inhaló monóxido de carbono?",
        "options": ["Darle café para despertarla", "Sacarla al aire libre de inmediato y buscar atención médica", "Hacerla correr para oxigenarse", "Cerrar puertas y ventanas"],
        "correctIndex": 1,
        "explanation": "Sacarla del ambiente contaminado y ventilar es la prioridad inmediata."
      },
      {
        "question": "¿Por qué es importante conservar el envase o resto de la sustancia ingerida?",
        "options": ["Para tirarlo después con más cuidado", "No tiene ninguna utilidad médica", "Ayuda al personal médico a identificar el tratamiento exacto", "Solo sirve como evidencia legal"],
        "correctIndex": 2,
        "explanation": "El envase o etiqueta ayuda a confirmar la sustancia exacta y su concentración."
      },
      {
        "question": "¿Qué diferencia hay entre una intoxicación aguda y una crónica?",
        "options": ["No hay ninguna diferencia", "La aguda ocurre por exposición única y rápida; la crónica por exposición repetida en el tiempo", "La crónica es siempre menos grave", "La aguda solo ocurre en niños"],
        "correctIndex": 1,
        "explanation": "La intoxicación aguda es por una sola exposición significativa; la crónica se acumula con exposiciones repetidas, a veces con síntomas menos evidentes al inicio."
      },
      {
        "question": "¿Qué se debe evitar hacer si no se está seguro de qué sustancia causó la intoxicación?",
        "options": ["Aplicar remedios caseros sin confirmar qué fue", "Llamar a un centro de toxicología", "Conservar el posible envase", "Observar los síntomas de la persona"],
        "correctIndex": 0,
        "explanation": "Sin saber la sustancia exacta, aplicar remedios caseros puede empeorar la situación en vez de ayudar."
      }
    ]
  }
];

async function seed() {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db('modular');
    const collection = db.collection('lessons');

    for (const lesson of lessons) {
      const existing = await collection.findOne({ module: lesson.module, order: lesson.order });
      if (existing) {
        await collection.updateOne({ _id: existing._id }, { $set: lesson });
        console.log(`Actualizada: ${lesson.module} — ${lesson.title}`);
      } else {
        await collection.insertOne(lesson);
        console.log(`Insertada: ${lesson.module} — ${lesson.title}`);
      }
    }

    console.log(`\n✅ Listo. ${lessons.length} lecciones procesadas.`);
  } catch (error) {
    console.error('Error en seed:', error);
  } finally {
    await client.close();
  }
}

seed();