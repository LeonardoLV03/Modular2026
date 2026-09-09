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
  }  ,
  // ══════════════════════════════════════════════════════════
  // NUEVAS LECCIONES — hasta 5 por módulo, con candado secuencial
  // (order) y candado por nivel (requiredLevel) donde aplica.
  // ══════════════════════════════════════════════════════════

  // ── DESMAYO (3, 4, 5) ──
  {
    "module": "desmayo",
    "order": 3,
    "title": "Desmayo — Situaciones especiales",
    "xpReward": 30,
    "requiredLevel": 2,
    "questions": [
      {
        "question": "¿Qué se debe hacer con las piernas de una embarazada que se desmaya?",
        "options": ["Recostarla boca arriba con piernas elevadas", "Recostarla de lado, preferentemente izquierdo", "Sentarla con la cabeza entre las piernas", "Ponerla de pie apoyada en la pared"],
        "correctIndex": 1,
        "explanation": "Recostarla de lado izquierdo evita que el útero comprima la vena cava y mejora el flujo sanguíneo."
      },
      {
        "question": "¿Qué se debe hacer si el desmayo ocurre tras un golpe en la cabeza?",
        "options": ["Tratarlo como un desmayo común sin más", "No moverla y buscar atención médica por posible lesión craneal", "Darle de comer algo dulce", "Sentarla de inmediato"],
        "correctIndex": 1,
        "explanation": "Un desmayo tras un golpe en la cabeza puede indicar una lesión más grave; se recomienda no mover a la persona y buscar ayuda médica."
      },
      {
        "question": "¿Cómo se diferencia un desmayo de una convulsión?",
        "options": ["No hay ninguna diferencia", "En el desmayo la persona se recupera rápido y sin movimientos bruscos; en la convulsión suele haber sacudidas musculares", "La convulsión siempre dura menos que el desmayo", "El desmayo siempre implica pérdida de control de esfínteres"],
        "correctIndex": 1,
        "explanation": "El desmayo (síncope) suele ser breve y sin movimientos convulsivos, mientras que la convulsión implica contracciones musculares involuntarias."
      },
      {
        "question": "Si una persona diabética se desmaya, ¿qué podría estar ocurriendo?",
        "options": ["Un episodio de hipoglucemia", "Solo cansancio", "Nada relacionado con su condición", "Falta de sueño"],
        "correctIndex": 0,
        "explanation": "La baja de azúcar en sangre (hipoglucemia) es una causa frecuente de desmayo en personas diabéticas."
      },
      {
        "question": "¿Qué se debe evitar después de que la persona recupera el conocimiento tras un desmayo por calor?",
        "options": ["Llevarla a un lugar fresco", "Darle agua en sorbos", "Hacerla regresar de inmediato al sol o esfuerzo físico", "Aflojar su ropa"],
        "correctIndex": 2,
        "explanation": "Volver a exponerla al calor o esfuerzo puede provocar otro episodio de desmayo."
      }
    ]
  },
  {
    "module": "desmayo",
    "order": 4,
    "title": "Desmayo — RCP y signos vitales",
    "xpReward": 35,
    "questions": [
      {
        "question": "Si la persona no responde y no respira con normalidad tras un desmayo, ¿qué se debe hacer?",
        "options": ["Esperar unos minutos más", "Iniciar RCP y llamar a emergencias de inmediato", "Darle agua fría en la cara", "Sentarla de inmediato"],
        "correctIndex": 1,
        "explanation": "La ausencia de respiración normal es una emergencia que requiere RCP inmediata."
      },
      {
        "question": "¿Cómo se verifica si una persona desmayada respira?",
        "options": ["Solo mirando si tiene los ojos cerrados", "Observando el pecho, escuchando y sintiendo el aire durante unos segundos", "Preguntándole en voz alta", "Tocándole el pulso en el cuello únicamente"],
        "correctIndex": 1,
        "explanation": "Se debe observar el movimiento del pecho y sentir/escuchar la respiración durante unos 10 segundos."
      },
      {
        "question": "¿Qué posición se recomienda si la persona ya respira y está inconsciente?",
        "options": ["Boca arriba sin más", "Posición de recuperación (de lado)", "Sentada", "Boca abajo"],
        "correctIndex": 1,
        "explanation": "La posición de recuperación mantiene la vía aérea despejada y evita que se ahogue si vomita."
      },
      {
        "question": "¿Cada cuánto se debe revisar la respiración de una persona inconsciente mientras llega ayuda?",
        "options": ["Una sola vez basta", "Constantemente, de forma periódica", "Solo si se pone pálida", "No es necesario revisarla"],
        "correctIndex": 1,
        "explanation": "La respiración puede cambiar, así que se debe monitorear constantemente hasta que llegue ayuda profesional."
      },
      {
        "question": "¿Qué información es útil dar a emergencias sobre un desmayo?",
        "options": ["Solo el nombre de la persona", "Cuánto tiempo estuvo inconsciente, si respira y si tiene antecedentes médicos", "El color de su ropa", "Nada en particular"],
        "correctIndex": 1,
        "explanation": "Esta información ayuda al personal médico a evaluar la gravedad y actuar más rápido."
      }
    ]
  },
  {
    "module": "desmayo",
    "order": 5,
    "title": "Desmayo — Casos avanzados",
    "xpReward": 40,
    "requiredLevel": 3,
    "questions": [
      {
        "question": "¿Qué puede indicar un desmayo acompañado de dolor en el pecho?",
        "options": ["Es normal y no requiere atención", "Podría estar relacionado con un problema cardiaco y requiere evaluación urgente", "Solo es cansancio muscular", "Se debe simplemente hidratar a la persona"],
        "correctIndex": 1,
        "explanation": "El dolor de pecho junto con desmayo puede indicar una causa cardiaca grave."
      },
      {
        "question": "¿Qué se recomienda si los desmayos ocurren al levantarse rápido de estar sentado o acostado?",
        "options": ["Ignorarlo, es normal en todos los casos", "Podría tratarse de hipotensión ortostática; se recomienda levantarse más despacio y consultar a un médico", "Acostarse todo el día", "Tomar café antes de levantarse"],
        "correctIndex": 1,
        "explanation": "La hipotensión ortostática causa mareo o desmayo al cambiar de posición bruscamente."
      },
      {
        "question": "¿Qué se debe hacer si una persona mayor se desmaya y se golpea la cabeza al caer?",
        "options": ["No darle importancia si despierta rápido", "Buscar atención médica, ya que los golpes en la cabeza son más riesgosos en personas mayores", "Dejarla dormir varias horas", "Darle un analgésico y nada más"],
        "correctIndex": 1,
        "explanation": "En personas mayores el riesgo de sangrado interno tras un golpe en la cabeza es mayor y debe evaluarse."
      },
      {
        "question": "¿Qué papel juega la deshidratación en los desmayos?",
        "options": ["Ninguno", "Puede reducir el volumen sanguíneo y favorecer el desmayo", "Solo afecta la piel", "Previene los desmayos"],
        "correctIndex": 1,
        "explanation": "La deshidratación disminuye el volumen de sangre circulante, lo que puede facilitar un desmayo."
      },
      {
        "question": "¿Por qué es útil que alguien con desmayos frecuentes por una condición conocida use una identificación médica?",
        "options": ["Nunca es útil", "Ayuda a que quien la auxilie actúe rápido y con la información correcta", "Solo si es atleta", "No aplica para desmayos"],
        "correctIndex": 1,
        "explanation": "Una identificación médica ayuda a los rescatistas a actuar más rápido y con la información correcta."
      }
    ]
  },

  // ── HEMORRAGIA (3, 4, 5) ──
  {
    "module": "hemorragia",
    "order": 3,
    "title": "Hemorragia — Tipos de heridas",
    "xpReward": 30,
    "requiredLevel": 2,
    "questions": [
      {
        "question": "¿Qué diferencia a una hemorragia arterial de una venosa?",
        "options": ["No hay diferencia", "La arterial sale a chorros con cada latido y es de color rojo brillante; la venosa fluye continua y es más oscura", "La venosa es siempre más peligrosa", "La arterial no requiere atención"],
        "correctIndex": 1,
        "explanation": "La sangre arterial sale con la presión del pulso y es más oxigenada (rojo brillante); la venosa fluye de forma continua y es más oscura."
      },
      {
        "question": "¿Qué se debe hacer ante una hemorragia interna sospechada (sin sangre visible pero con signos de shock)?",
        "options": ["Darle de beber mucha agua", "Mantenerla acostada, elevar piernas si no hay fractura, y buscar ayuda urgente", "Hacerla caminar para reactivar la circulación", "Ignorarlo si no hay sangre visible"],
        "correctIndex": 1,
        "explanation": "La hemorragia interna es una emergencia grave aunque no se vea sangre; se debe buscar atención médica de inmediato."
      },
      {
        "question": "¿Qué se debe hacer si la hemorragia es en el cuero cabelludo?",
        "options": ["No presionar porque sangra mucho", "Aplicar presión directa igual que en cualquier otra herida", "Rasurar la zona primero", "Aplicar hielo directo sin protección"],
        "correctIndex": 1,
        "explanation": "Las heridas en el cuero cabelludo sangran mucho por la gran cantidad de vasos sanguíneos, pero responden bien a la presión directa."
      },
      {
        "question": "¿Qué se debe hacer si un objeto está clavado en la herida y sangra?",
        "options": ["Retirarlo de inmediato", "No retirarlo; estabilizarlo y presionar alrededor, buscando ayuda urgente", "Empujarlo más adentro", "Girarlo para sacarlo con cuidado"],
        "correctIndex": 1,
        "explanation": "Retirar un objeto empalado puede aumentar el sangrado; se debe estabilizar y buscar ayuda médica."
      },
      {
        "question": "¿Qué señal indica una posible hemorragia interna en el abdomen tras un golpe fuerte?",
        "options": ["Dolor abdominal, hinchazón y palidez", "Solo un poco de sed", "Aumento del apetito", "Ninguna señal visible"],
        "correctIndex": 0,
        "explanation": "Dolor, hinchazón abdominal y palidez pueden indicar sangrado interno tras un traumatismo."
      }
    ]
  },
  {
    "module": "hemorragia",
    "order": 4,
    "title": "Hemorragia — Vendajes y presión",
    "xpReward": 35,
    "questions": [
      {
        "question": "¿Cómo se realiza un vendaje compresivo correctamente?",
        "options": ["Muy apretado para detener toda circulación", "Firme pero permitiendo revisar el color y temperatura de los dedos", "Suelto para que no incomode", "Solo con cinta adhesiva"],
        "correctIndex": 1,
        "explanation": "El vendaje debe ser firme pero sin cortar la circulación por completo."
      },
      {
        "question": "¿Qué se debe revisar periódicamente en una extremidad vendada por hemorragia?",
        "options": ["El color de la ropa", "Color, temperatura y sensibilidad de los dedos", "El peso de la persona", "Nada en particular"],
        "correctIndex": 1,
        "explanation": "Estos signos indican si la circulación está siendo cortada por el vendaje."
      },
      {
        "question": "¿Qué se debe hacer si, después de vendar, la sangre sigue empapando rápidamente?",
        "options": ["Agregar más presión directa y buscar ayuda urgente", "Quitar todo el vendaje", "Esperar sin hacer nada más", "Aflojar el vendaje"],
        "correctIndex": 0,
        "explanation": "Si la sangre sigue saliendo con fuerza, se necesita más presión y atención médica urgente."
      },
      {
        "question": "¿Por qué es importante usar guantes o una barrera al atender una hemorragia ajena?",
        "options": ["Por estética", "Para protegerse de posibles enfermedades transmitidas por sangre", "No es necesario nunca", "Solo para no ensuciarse"],
        "correctIndex": 1,
        "explanation": "Usar una barrera protege tanto al auxiliador como a la persona herida de infecciones."
      },
      {
        "question": "Al aplicar presión directa, ¿qué se debe evitar hacer cada pocos segundos?",
        "options": ["Hablar con la persona", "Levantar la tela para ver si dejó de sangrar", "Llamar a emergencias", "Mantenerse tranquilo"],
        "correctIndex": 1,
        "explanation": "Levantar la tela interrumpe la formación del coágulo y puede reiniciar el sangrado."
      }
    ]
  },
  {
    "module": "hemorragia",
    "order": 5,
    "title": "Hemorragia — Torniquetes y shock",
    "xpReward": 40,
    "requiredLevel": 3,
    "questions": [
      {
        "question": "¿Dónde se coloca un torniquete respecto a la herida?",
        "options": ["Directamente sobre la herida", "Unos centímetros por encima de la herida, entre esta y el corazón", "Por debajo de la herida", "En cualquier parte del cuerpo"],
        "correctIndex": 1,
        "explanation": "El torniquete se coloca por encima de la herida (más cerca del corazón) para cortar el flujo de sangre hacia la zona afectada."
      },
      {
        "question": "¿Se debe aflojar un torniquete una vez colocado, antes de que llegue ayuda médica?",
        "options": ["Sí, cada 10 minutos", "No, una vez colocado no se debe aflojar hasta que personal médico lo indique", "Solo si la persona lo pide", "Sí, inmediatamente después de colocarlo"],
        "correctIndex": 1,
        "explanation": "Aflojar un torniquete puede liberar coágulos y causar un sangrado más peligroso; solo personal médico debe retirarlo."
      },
      {
        "question": "¿Qué combinación de síntomas es característica del shock por pérdida de sangre?",
        "options": ["Piel caliente y enrojecida, pulso lento", "Piel pálida y fría, pulso rápido y débil, respiración agitada", "Fiebre alta y sudoración", "Aumento del apetito"],
        "correctIndex": 1,
        "explanation": "El shock por pérdida de sangre reduce la perfusión, causando piel pálida y fría, pulso rápido y débil."
      },
      {
        "question": "¿Qué posición ayuda a una persona en shock por hemorragia, si no hay fractura de piernas?",
        "options": ["Sentada con la cabeza hacia adelante", "Acostada con las piernas elevadas", "De pie", "Boca abajo"],
        "correctIndex": 1,
        "explanation": "Elevar las piernas favorece que la sangre regrese hacia los órganos vitales."
      },
      {
        "question": "¿Qué se debe hacer con una persona en shock mientras se espera ayuda?",
        "options": ["Darle de comer para recuperar energía", "Mantenerla abrigada y en calma, sin darle líquidos ni comida", "Hacerla caminar para reactivarla", "Dejarla sola"],
        "correctIndex": 1,
        "explanation": "Mantenerla abrigada ayuda a prevenir la hipotermia asociada al shock, y no se debe dar comida ni bebida."
      }
    ]
  },

  // ── ASFIXIA (3, 4, 5) ──
  {
    "module": "asfixia",
    "order": 3,
    "title": "Asfixia — RCP en atragantamiento",
    "xpReward": 30,
    "requiredLevel": 2,
    "questions": [
      {
        "question": "¿Qué se hace si tras varios intentos de Heimlich el objeto no sale y la persona pierde el conocimiento?",
        "options": ["Detener toda maniobra", "Recostarla en el suelo e iniciar RCP, revisando la boca entre ciclos de compresiones", "Sacudirla fuerte", "Darle agua"],
        "correctIndex": 1,
        "explanation": "Al perder el conocimiento se debe iniciar RCP; las compresiones torácicas pueden ayudar a expulsar el objeto."
      },
      {
        "question": "¿Qué se revisa antes de dar ventilaciones de rescate durante la RCP por atragantamiento?",
        "options": ["Nada, se dan directamente", "Si el objeto es visible en la boca, para intentar retirarlo con cuidado", "El pulso en la muñeca", "La temperatura corporal"],
        "correctIndex": 1,
        "explanation": "Si el objeto es visible se puede intentar retirarlo con cuidado antes de ventilar, sin hacerlo a ciegas."
      },
      {
        "question": "¿Qué se debe evitar al buscar un objeto en la boca de alguien inconsciente?",
        "options": ["Usar los dedos con cuidado si el objeto es visible", "Meter los dedos a ciegas, empujando el objeto más profundo", "Inclinar la cabeza hacia un lado", "Llamar a emergencias"],
        "correctIndex": 1,
        "explanation": "Buscar a ciegas puede empujar el objeto más adentro y empeorar la obstrucción."
      },
      {
        "question": "En un niño pequeño que se atraganta, ¿qué maniobra se recomienda?",
        "options": ["Heimlich con menor fuerza, adaptado a su tamaño", "La misma fuerza que en un adulto", "Ninguna maniobra, solo esperar", "Darle agua para pasar el objeto"],
        "correctIndex": 0,
        "explanation": "Se aplica la maniobra de Heimlich adaptando la fuerza según el tamaño del niño."
      },
      {
        "question": "¿Qué se debe hacer inmediatamente después de que el objeto sale y la persona respira de nuevo?",
        "options": ["Nada más, ya está resuelto", "Evaluarla y considerar atención médica para revisar lesiones internas", "Darle de comer de inmediato", "Hacerla hacer ejercicio"],
        "correctIndex": 1,
        "explanation": "Aunque respire de nuevo, es recomendable una evaluación médica por posibles lesiones internas."
      }
    ]
  },
  {
    "module": "asfixia",
    "order": 4,
    "title": "Asfixia — Autoasistencia y casos especiales",
    "xpReward": 35,
    "questions": [
      {
        "question": "¿Cómo puede una persona sola atragantada ayudarse a sí misma?",
        "options": ["No hay forma de hacerlo sola", "Presionando su abdomen contra el respaldo de una silla o superficie firme, hacia adentro y arriba", "Sentándose y esperando", "Tomando agua rápido"],
        "correctIndex": 1,
        "explanation": "Presionar el abdomen contra un borde firme puede generar la presión necesaria para expulsar el objeto, similar al Heimlich."
      },
      {
        "question": "¿Qué se debe hacer con una persona en silla de ruedas que se atraganta?",
        "options": ["Bajarla al suelo obligatoriamente", "Realizar Heimlich desde atrás de la silla si es posible", "Dejarla sola", "Darle agua de inmediato"],
        "correctIndex": 1,
        "explanation": "Se puede realizar la maniobra adaptándose a la posición de la silla, priorizando la seguridad de la persona."
      },
      {
        "question": "¿Qué se recomienda antes de comer para prevenir el atragantamiento?",
        "options": ["Comer rápido para terminar antes", "Masticar bien y evitar hablar o reír con comida en la boca", "Comer acostado", "Tomar bebidas con gas mientras se come rápido"],
        "correctIndex": 1,
        "explanation": "Masticar bien y no hablar con comida en la boca reduce el riesgo de que un trozo bloquee la vía aérea."
      },
      {
        "question": "¿Qué alimentos representan mayor riesgo de atragantamiento en niños pequeños?",
        "options": ["Puré de verduras", "Uvas enteras, frutos secos y trozos duros y redondos", "Yogur", "Agua"],
        "correctIndex": 1,
        "explanation": "Alimentos redondos, duros o pequeños pueden obstruir fácilmente la vía aérea de un niño pequeño."
      },
      {
        "question": "¿Qué se debe hacer si una persona con atragantamiento parcial empieza a debilitarse?",
        "options": ["Esperar más tiempo sin actuar", "Prepararse para iniciar la maniobra de Heimlich, ya que podría pasar a obstrucción total", "Darle golpes en el pecho de inmediato", "Ignorarlo si sigue consciente"],
        "correctIndex": 1,
        "explanation": "Si la persona se debilita, la obstrucción podría estar empeorando y se debe estar listo para intervenir."
      }
    ]
  },
  {
    "module": "asfixia",
    "order": 5,
    "title": "Asfixia — Casos avanzados",
    "xpReward": 40,
    "requiredLevel": 3,
    "questions": [
      {
        "question": "¿Qué diferencia hay entre una obstrucción por objeto y una por hinchazón alérgica?",
        "options": ["No hay diferencia en el manejo", "La obstrucción por hinchazón no se resuelve con Heimlich y requiere atención médica urgente", "Ambas se resuelven igual con golpes en la espalda", "La hinchazón siempre se resuelve sola"],
        "correctIndex": 1,
        "explanation": "El Heimlich no ayuda si la obstrucción es por hinchazón alérgica; se requiere tratamiento médico urgente."
      },
      {
        "question": "¿Qué se debe hacer si una persona con atragantamiento tiene además dificultad respiratoria por asma?",
        "options": ["Tratar solo el atragantamiento e ignorar el asma", "Atender el atragantamiento como prioridad inmediata y buscar ayuda médica considerando ambas condiciones", "Darle su inhalador antes que nada, ignorando la obstrucción", "Esperar a que se calme sola"],
        "correctIndex": 1,
        "explanation": "La obstrucción de la vía aérea es la prioridad inmediata, pero se debe informar a emergencias sobre ambas condiciones."
      },
      {
        "question": "¿Qué secuela puede dejar una obstrucción prolongada de la vía aérea sin tratar a tiempo?",
        "options": ["Ninguna, si se resuelve tarde no importa", "Daño cerebral por falta de oxígeno o incluso la muerte", "Solo dolor de garganta temporal", "Mejora la respiración a largo plazo"],
        "correctIndex": 1,
        "explanation": "La falta prolongada de oxígeno puede causar daño cerebral irreversible o ser mortal."
      },
      {
        "question": "¿Qué se debe hacer si, tras liberar la obstrucción, la persona presenta tos persistente o dificultad para respirar?",
        "options": ["Ignorarlo, ya pasó lo peor", "Buscar atención médica, podría quedar parte del objeto o haber daño en la vía aérea", "Darle agua fría", "Hacerla acostarse boca abajo"],
        "correctIndex": 1,
        "explanation": "Síntomas persistentes pueden indicar que quedó parte del objeto o hay daño en la vía respiratoria."
      },
      {
        "question": "¿Por qué es importante recibir entrenamiento práctico, y no solo teórico, para atragantamiento?",
        "options": ["No es importante, la teoría basta", "Porque la técnica correcta y la rapidez de reacción se desarrollan mejor con práctica supervisada", "Solo por certificación, no aporta habilidad real", "La práctica no cambia el resultado"],
        "correctIndex": 1,
        "explanation": "La práctica supervisada ayuda a aplicar la técnica correctamente y con la rapidez necesaria en una emergencia real."
      }
    ]
  },

  // ── QUEMADURA (3, 4, 5) ──
  {
    "module": "quemadura",
    "order": 3,
    "title": "Quemadura — Químicas y eléctricas",
    "xpReward": 30,
    "requiredLevel": 2,
    "questions": [
      {
        "question": "¿Qué se debe hacer ante una quemadura química en la piel?",
        "options": ["Neutralizar con otro químico de inmediato", "Enjuagar con abundante agua corriente varios minutos, retirando ropa contaminada", "Cubrir sin lavar", "Aplicar hielo directo"],
        "correctIndex": 1,
        "explanation": "El agua abundante ayuda a diluir y retirar el químico de la piel, reduciendo el daño."
      },
      {
        "question": "¿Qué se debe hacer si el químico entró en contacto con los ojos?",
        "options": ["Frotar los ojos", "Enjuagar con agua limpia por al menos 15-20 minutos y buscar atención médica", "No hacer nada, esperar", "Aplicar gotas oculares sin lavar primero"],
        "correctIndex": 1,
        "explanation": "El enjuague prolongado ayuda a eliminar el químico y reducir el daño ocular; luego se requiere evaluación médica."
      },
      {
        "question": "¿Qué precaución especial se toma al atender una quemadura eléctrica?",
        "options": ["Ninguna diferencia con una quemadura normal", "Verificar que la fuente eléctrica esté cortada antes de tocar a la persona", "Tocarla de inmediato para ayudarla", "Aplicar agua mientras sigue conectada a la corriente"],
        "correctIndex": 1,
        "explanation": "Nunca se debe tocar a alguien en contacto con electricidad activa; primero se corta la fuente."
      },
      {
        "question": "¿Por qué una quemadura eléctrica puede ser más grave de lo que se ve en la piel?",
        "options": ["Nunca es más grave de lo visible", "Porque puede causar daño interno en el trayecto de la corriente a través del cuerpo", "Solo afecta la piel", "No tiene relación con el interior del cuerpo"],
        "correctIndex": 1,
        "explanation": "La corriente eléctrica puede dañar tejidos, nervios y órganos internos en su trayecto, no solo la piel visible."
      },
      {
        "question": "¿Qué se debe hacer con la ropa contaminada con un químico antes de lavar la piel?",
        "options": ["Dejarla puesta siempre", "Retirarla con cuidado, evitando el contacto directo, y luego lavar la piel", "Cortarla y guardarla sin retirarla", "Mojarla sin quitarla"],
        "correctIndex": 1,
        "explanation": "Retirar la ropa contaminada evita que el químico siga en contacto con la piel mientras se lava."
      }
    ]
  },
  {
    "module": "quemadura",
    "order": 4,
    "title": "Quemadura — Extensión y gravedad",
    "xpReward": 35,
    "questions": [
      {
        "question": "¿Qué método se usa comúnmente para estimar qué porcentaje del cuerpo está quemado?",
        "options": ["Contar los dedos de la mano", "La regla de los nueve, dividiendo el cuerpo en zonas de 9% cada una aproximadamente", "Medir solo el ancho de la quemadura", "No existe forma de estimarlo"],
        "correctIndex": 1,
        "explanation": "La regla de los nueve divide el cuerpo en regiones que representan aproximadamente 9% (o múltiplos) de la superficie corporal total."
      },
      {
        "question": "¿Por qué una quemadura pequeña en la cara puede ser más grave que una más grande en el brazo?",
        "options": ["Nunca es más grave", "Por el riesgo de afectar la vía aérea, los ojos o dejar secuelas estéticas importantes", "La cara no tiene terminaciones nerviosas", "No hay diferencia real"],
        "correctIndex": 1,
        "explanation": "Quemaduras en cara, manos, pies o genitales se consideran de mayor riesgo por su función y sensibilidad."
      },
      {
        "question": "¿Qué se debe vigilar en una persona con una quemadura extensa mientras llega ayuda?",
        "options": ["Solo el dolor", "Signos de shock, dificultad para respirar y temperatura corporal", "El color de su ropa", "Nada en particular"],
        "correctIndex": 1,
        "explanation": "Quemaduras extensas pueden causar pérdida de líquidos y shock, además de posibles problemas respiratorios."
      },
      {
        "question": "¿Qué se debe hacer si una quemadura por fuego estuvo acompañada de inhalación de humo?",
        "options": ["Ignorarlo si no tose", "Buscar atención médica urgente, ya que puede haber daño en las vías respiratorias", "Darle agua para toser menos", "Solo tratar la piel quemada"],
        "correctIndex": 1,
        "explanation": "La inhalación de humo puede dañar las vías respiratorias internas, lo cual no siempre es visible de inmediato."
      },
      {
        "question": "¿Qué se recomienda sobre la ropa suelta (no pegada) cerca de una quemadura?",
        "options": ["Retirarla con cuidado si no está pegada a la piel", "Dejarla puesta siempre", "Cortarla y dejarla sobre la herida", "Mojarla y dejarla puesta"],
        "correctIndex": 0,
        "explanation": "Retirar la ropa suelta permite evaluar mejor la quemadura, pero nunca se debe forzar si está pegada a la piel."
      }
    ]
  },
  {
    "module": "quemadura",
    "order": 5,
    "title": "Quemadura — Casos avanzados",
    "xpReward": 40,
    "requiredLevel": 3,
    "questions": [
      {
        "question": "¿Qué es una quemadura de tercer grado?",
        "options": ["Solo enrojecimiento leve", "Afecta todas las capas de la piel y puede verse blanca, carbonizada o correosa, a veces sin dolor", "Solo produce ampollas pequeñas", "Se cura sola en un día"],
        "correctIndex": 1,
        "explanation": "Las quemaduras de tercer grado destruyen todas las capas de la piel y pueden dañar terminaciones nerviosas, reduciendo el dolor percibido."
      },
      {
        "question": "¿Por qué se debe evitar sumergir una quemadura extensa en agua muy fría por mucho tiempo?",
        "options": ["No hay ningún riesgo", "Puede provocar hipotermia, especialmente en niños o quemaduras grandes", "El agua fría siempre es mejor sin límite de tiempo", "Empeora la quemadura de inmediato"],
        "correctIndex": 1,
        "explanation": "Enfriar en exceso una quemadura extensa puede bajar peligrosamente la temperatura corporal."
      },
      {
        "question": "¿Qué cuidado especial requiere una quemadura en una articulación (como la rodilla)?",
        "options": ["Ninguno especial", "Vigilar que no se forme una cicatriz que limite el movimiento, siguiendo indicaciones médicas", "Mantenerla inmóvil para siempre", "Ignorar el área una vez cicatrizada"],
        "correctIndex": 1,
        "explanation": "Las quemaduras en articulaciones pueden generar cicatrices que limiten el movimiento si no se tratan adecuadamente."
      },
      {
        "question": "¿Qué riesgo tienen las quemaduras en niños pequeños respecto a la superficie corporal?",
        "options": ["Ninguno adicional", "Su superficie corporal relativa es mayor, por lo que una quemadura del mismo tamaño es proporcionalmente más grave", "Los niños no sienten dolor", "Sanan siempre más rápido sin cuidados"],
        "correctIndex": 1,
        "explanation": "En niños, una quemadura de cierto tamaño representa un porcentaje mayor de su cuerpo total, aumentando el riesgo de shock."
      },
      {
        "question": "¿Cuándo se debe considerar el traslado a un centro especializado en quemaduras?",
        "options": ["Nunca es necesario", "En quemaduras extensas, profundas, en zonas sensibles, eléctricas, químicas o en niños/adultos mayores", "Solo si lo pide la persona", "Solo si no hay dolor"],
        "correctIndex": 1,
        "explanation": "Estos casos requieren atención especializada para reducir complicaciones y secuelas."
      }
    ]
  },

  // ── FRACTURA (3, 4, 5) ──
  {
    "module": "fractura",
    "order": 3,
    "title": "Fractura — Tipos y reconocimiento",
    "xpReward": 30,
    "requiredLevel": 2,
    "questions": [
      {
        "question": "¿Qué diferencia a una fractura cerrada de una expuesta?",
        "options": ["No hay diferencia", "En la expuesta el hueso rompe la piel y es visible; en la cerrada la piel permanece intacta", "La cerrada siempre es más grave", "La expuesta no sangra nunca"],
        "correctIndex": 1,
        "explanation": "En la fractura expuesta el hueso perfora la piel, aumentando el riesgo de infección; en la cerrada la piel no se rompe."
      },
      {
        "question": "¿Qué se debe sospechar si tras una caída una persona no puede apoyar el pie y hay hinchazón?",
        "options": ["Solo un golpe leve sin importancia", "Una posible fractura o esguince grave que requiere evaluación médica", "Cansancio muscular", "Nada, es normal después de caer"],
        "correctIndex": 1,
        "explanation": "La incapacidad para apoyar el peso junto con hinchazón sugiere una lesión que debe evaluarse médicamente."
      },
      {
        "question": "¿Qué se debe hacer si se sospecha una fractura de columna tras una caída de altura?",
        "options": ["Sentarla de inmediato", "No mover a la persona y esperar ayuda especializada, salvo peligro inminente", "Hacerla caminar despacio", "Voltearla boca abajo"],
        "correctIndex": 1,
        "explanation": "Mover a alguien con posible fractura de columna puede causar daño neurológico grave; se debe esperar ayuda especializada."
      },
      {
        "question": "¿Qué señal puede indicar una fractura de costilla?",
        "options": ["Dolor al respirar profundo o toser, en la zona del pecho tras un golpe", "Comezón en la espalda", "Dolor de cabeza", "Ninguna señal específica"],
        "correctIndex": 0,
        "explanation": "El dolor al respirar o toser tras un golpe en el pecho puede indicar una fractura costal."
      },
      {
        "question": "¿Qué se debe evitar hacer con una persona que podría tener fractura de cadera tras una caída?",
        "options": ["Mantenerla quieta y abrigada", "Hacerla intentar levantarse o caminar", "Llamar a emergencias", "Colocar algo cómodo bajo su cabeza"],
        "correctIndex": 1,
        "explanation": "Forzar el movimiento puede agravar la lesión; se debe mantener inmóvil hasta que llegue ayuda."
      }
    ]
  },
  {
    "module": "fractura",
    "order": 4,
    "title": "Fractura — Inmovilización avanzada",
    "xpReward": 35,
    "questions": [
      {
        "question": "¿Qué se debe hacer antes de entablillar si hay una herida abierta junto a la fractura?",
        "options": ["Ignorar la herida y entablillar directo", "Cubrir la herida con un apósito limpio antes de inmovilizar", "Lavar la herida con alcohol primero", "Entablillar sobre la herida sin cubrir"],
        "correctIndex": 1,
        "explanation": "Cubrir la herida reduce el riesgo de infección antes de proceder con la inmovilización."
      },
      {
        "question": "¿Qué material se debe evitar usar para atar una férula?",
        "options": ["Vendas anchas y suaves", "Cuerdas delgadas o alambres que puedan cortar la circulación", "Tela ancha", "Cinta médica"],
        "correctIndex": 1,
        "explanation": "Materiales delgados y rígidos pueden cortar la circulación si se atan muy apretados."
      },
      {
        "question": "¿Cómo se debe transportar a una persona con sospecha de fractura de pierna, si no hay ayuda profesional cerca?",
        "options": ["Hacerla caminar apoyada en alguien", "Sin mover si es posible; si debe moverse, inmovilizando bien la pierna primero", "Cargarla sin inmovilizar", "Arrastrarla por el suelo"],
        "correctIndex": 1,
        "explanation": "Mover una fractura sin inmovilizar puede agravar el daño; siempre se debe estabilizar primero si el traslado es inevitable."
      },
      {
        "question": "¿Qué se debe verificar después de colocar una férula improvisada?",
        "options": ["Que se vea estética", "Que los dedos mantengan buen color, temperatura y sensibilidad", "Que esté lo más apretada posible", "Nada más, ya está lista"],
        "correctIndex": 1,
        "explanation": "Estos signos confirman que la circulación no está siendo cortada por la férula."
      },
      {
        "question": "¿Qué se debe hacer si la persona con fractura empieza a mostrar signos de shock (palidez, sudor frío)?",
        "options": ["Ignorarlo, es normal por el dolor", "Tratar el shock: mantenerla abrigada, acostada, y buscar ayuda urgente", "Darle de comer algo dulce", "Hacerla sentarse derecha"],
        "correctIndex": 1,
        "explanation": "El dolor intenso y la pérdida de sangre en fracturas pueden provocar shock, que requiere atención inmediata."
      }
    ]
  },
  {
    "module": "fractura",
    "order": 5,
    "title": "Fractura — Casos avanzados",
    "xpReward": 40,
    "requiredLevel": 3,
    "questions": [
      {
        "question": "¿Qué es una fractura en tallo verde y en quién es más común?",
        "options": ["Una fractura completa en adultos mayores", "Una fractura incompleta donde el hueso se dobla y agrieta parcialmente, común en niños", "Una fractura que nunca sana", "Una fractura solo de cráneo"],
        "correctIndex": 1,
        "explanation": "En niños los huesos son más flexibles y pueden agrietarse sin romperse completamente, como una rama verde."
      },
      {
        "question": "¿Por qué las fracturas de cadera en personas mayores son especialmente delicadas?",
        "options": ["No representan mayor riesgo", "Por el riesgo de complicaciones como inmovilidad prolongada e infecciones asociadas a la recuperación", "Sanan más rápido que en jóvenes", "Nunca requieren cirugía"],
        "correctIndex": 1,
        "explanation": "La recuperación prolongada en personas mayores aumenta el riesgo de complicaciones graves."
      },
      {
        "question": "¿Qué se debe hacer si, además de la fractura, la persona presenta pérdida de sensibilidad en los dedos de esa extremidad?",
        "options": ["Ignorarlo si no hay dolor", "Es una señal de posible daño nervioso o vascular y requiere atención médica urgente", "Es normal y desaparece solo", "Solo indica cansancio"],
        "correctIndex": 1,
        "explanation": "La pérdida de sensibilidad o movimiento puede indicar compromiso de nervios o vasos sanguíneos, una emergencia."
      },
      {
        "question": "¿Qué relación existe entre una fractura expuesta y el riesgo de infección ósea?",
        "options": ["No existe relación", "El hueso expuesto al ambiente tiene mayor riesgo de contaminarse e infectarse si no se trata a tiempo", "Solo ocurre en fracturas cerradas", "Nunca se infecta un hueso"],
        "correctIndex": 1,
        "explanation": "La exposición del hueso al ambiente externo aumenta el riesgo de infección si no se limpia y trata adecuadamente."
      },
      {
        "question": "En un entorno con recursos limitados, ¿qué es prioritario antes de trasladar a alguien con fractura de fémur?",
        "options": ["Trasladarla de inmediato sin inmovilizar", "Inmovilizar bien la extremidad y controlar el dolor/sangrado antes de mover a la persona", "Hacerla caminar con ayuda", "Esperar sin hacer nada"],
        "correctIndex": 1,
        "explanation": "Una inmovilización adecuada previene mayor daño y dolor durante el traslado, especialmente en huesos largos como el fémur."
      }
    ]
  },

  // ── INTOXICACIÓN (4, 5) — ya existía la 1, 2 y 3 ──
  {
    "module": "intoxicacion",
    "order": 4,
    "title": "Intoxicación — Sustancias específicas",
    "xpReward": 35,
    "questions": [
      {
        "question": "¿Qué se debe hacer ante una posible intoxicación por medicamentos en niños?",
        "options": ["Esperar a ver si hay síntomas antes de actuar", "Llamar de inmediato a un centro de toxicología o emergencias, indicando el medicamento y la cantidad aproximada", "Darle leche para diluirlo", "Inducir el vómito de inmediato"],
        "correctIndex": 1,
        "explanation": "En niños, la intoxicación por medicamentos puede ser grave incluso con dosis pequeñas; se debe actuar rápido y con información precisa."
      },
      {
        "question": "¿Qué se debe hacer si alguien ingirió alcohol en exceso y está muy somnoliento o inconsciente?",
        "options": ["Dejarlo dormir solo, boca arriba", "Colocarlo en posición de recuperación y vigilar su respiración", "Darle café para despertarlo", "Hacerlo vomitar a la fuerza"],
        "correctIndex": 1,
        "explanation": "La posición de lado evita que se ahogue si vomita mientras está inconsciente, y se debe vigilar su respiración de cerca."
      },
      {
        "question": "¿Qué riesgo tiene mezclar alcohol con ciertos medicamentos (como sedantes)?",
        "options": ["Ninguno especial", "Puede potenciar la depresión del sistema nervioso y causar problemas respiratorios graves", "Solo produce mareo leve", "Mejora el efecto del medicamento de forma segura"],
        "correctIndex": 1,
        "explanation": "Combinar alcohol con sedantes puede deprimir peligrosamente la respiración y el sistema nervioso."
      },
      {
        "question": "¿Qué se debe hacer si una persona intoxicada con un producto de limpieza tiene quemaduras visibles en la boca?",
        "options": ["Darle de beber agua abundante de inmediato sin más", "No inducir el vómito, enjuagar la boca con cuidado si está consciente y buscar ayuda urgente", "Ignorarlo si no se queja", "Darle leche en grandes cantidades"],
        "correctIndex": 1,
        "explanation": "Los productos corrosivos pueden dañar más al ser vomitados; se busca ayuda médica urgente sin forzar el vómito."
      },
      {
        "question": "¿Por qué es importante conocer la hora aproximada en que ocurrió la intoxicación?",
        "options": ["No es relevante", "Ayuda a estimar cuánto tiempo lleva la sustancia en el cuerpo y guiar el tratamiento", "Solo por curiosidad", "Sirve únicamente para fines legales"],
        "correctIndex": 1,
        "explanation": "El tiempo transcurrido influye en las decisiones de tratamiento que tomará el personal médico."
      }
    ]
  },
  {
    "module": "intoxicacion",
    "order": 5,
    "title": "Intoxicación — Prevención y manejo",
    "xpReward": 40,
    "requiredLevel": 3,
    "questions": [
      {
        "question": "¿Qué medida de prevención reduce el riesgo de intoxicación accidental en el hogar con niños pequeños?",
        "options": ["Dejar los productos de limpieza al alcance", "Guardar medicamentos y productos tóxicos en lugares altos o con seguro, fuera del alcance de los niños", "No es necesario prevenir nada", "Guardar todo junto en la cocina"],
        "correctIndex": 1,
        "explanation": "Mantener sustancias peligrosas fuera del alcance de los niños es la medida preventiva más efectiva."
      },
      {
        "question": "¿Qué se debe hacer con los medicamentos vencidos o que ya no se usan?",
        "options": ["Guardarlos por si acaso", "Desecharlos de forma segura, siguiendo las indicaciones locales", "Dárselos a otra persona sin revisar", "Dejarlos donde cualquiera los alcance"],
        "correctIndex": 1,
        "explanation": "Desechar correctamente los medicamentos evita que alguien los tome por error o accidente."
      },
      {
        "question": "¿Qué se recomienda tener a la mano en casa ante una posible intoxicación?",
        "options": ["El número de un centro de toxicología o emergencias visible", "Nada en particular", "Solo medicamentos genéricos", "Remedios caseros sin verificar"],
        "correctIndex": 0,
        "explanation": "Tener el número de emergencia visible permite actuar rápido en caso de intoxicación."
      },
      {
        "question": "¿Qué se debe hacer si varias personas presentan síntomas similares después de comer lo mismo?",
        "options": ["Esperar a que se les pase solo", "Buscar atención médica y conservar una muestra del alimento si es posible", "Darles medicamento sin consultar", "Ignorarlo si los síntomas son leves"],
        "correctIndex": 1,
        "explanation": "Identificar la fuente ayuda al tratamiento y a prevenir que más personas se intoxiquen con el mismo alimento."
      },
      {
        "question": "¿Por qué es importante etiquetar correctamente los productos químicos en casa o el trabajo?",
        "options": ["No es importante", "Para evitar confusiones que puedan llevar a una intoxicación accidental por mal uso", "Solo por orden estético", "Para cumplir una norma sin propósito real"],
        "correctIndex": 1,
        "explanation": "Una etiqueta clara previene que alguien use o ingiera por error una sustancia peligrosa."
      }
    ]
  },

  // ── PICADURA (2, 3, 4, 5) ──
  {
    "module": "picadura",
    "order": 2,
    "title": "Picadura — Animales y prevención",
    "xpReward": 25,
    "questions": [
      {
        "question": "¿Qué se debe hacer ante la picadura de un alacrán/escorpión?",
        "options": ["Ignorarla si no duele mucho", "Lavar la zona, aplicar frío y buscar atención médica, especialmente en niños o adultos mayores", "Aplicar calor directo", "Cortar la piel para sacar el veneno"],
        "correctIndex": 1,
        "explanation": "Aunque muchas picaduras de alacrán son leves, en niños y adultos mayores pueden ser más peligrosas y requieren evaluación médica."
      },
      {
        "question": "¿Qué se debe hacer ante la mordedura de una araña venenosa (como viuda negra)?",
        "options": ["Aplicar hielo, mantener la zona en reposo y buscar atención médica de inmediato", "Ignorarla si no sangra", "Aplicar calor intenso", "Apretar la zona con fuerza"],
        "correctIndex": 0,
        "explanation": "El frío ayuda a reducir la absorción del veneno mientras se busca atención médica."
      },
      {
        "question": "¿Qué medidas ayudan a prevenir picaduras de insectos al aire libre?",
        "options": ["Usar repelente y ropa que cubra la piel", "Usar perfumes dulces intensos", "Caminar descalzo en pasto alto", "No es posible prevenirlas"],
        "correctIndex": 0,
        "explanation": "El repelente y la ropa adecuada reducen significativamente el riesgo de picaduras."
      },
      {
        "question": "¿Qué se debe hacer si se detecta una garrapata en la piel?",
        "options": ["Quemarla con un fósforo para que suelte", "Retirarla con pinzas finas, jalando recto hacia afuera sin girar", "Dejarla, se cae sola", "Aplastarla con los dedos"],
        "correctIndex": 1,
        "explanation": "Retirar la garrapata correctamente reduce el riesgo de dejar partes de ella en la piel o transmitir enfermedades."
      },
      {
        "question": "¿Por qué es importante observar la zona de una picadura de garrapata en los días posteriores?",
        "options": ["No es necesario observarla", "Para detectar signos de infección o una erupción que podría indicar una enfermedad transmitida", "Solo por estética", "Para saber si dejó marca"],
        "correctIndex": 1,
        "explanation": "Algunas garrapatas transmiten enfermedades que se manifiestan con erupciones o síntomas días después."
      }
    ]
  },
  {
    "module": "picadura",
    "order": 3,
    "title": "Picadura — Reacciones alérgicas",
    "xpReward": 30,
    "requiredLevel": 2,
    "questions": [
      {
        "question": "¿Qué es la anafilaxia?",
        "options": ["Una reacción alérgica leve y localizada", "Una reacción alérgica grave y potencialmente mortal que afecta todo el cuerpo", "Una infección de la piel", "Un tipo de picadura específica"],
        "correctIndex": 1,
        "explanation": "La anafilaxia es una reacción alérgica severa que puede comprometer la respiración y la circulación."
      },
      {
        "question": "¿Qué síntomas, además de la hinchazón local, deben alertar sobre una reacción alérgica grave?",
        "options": ["Hinchazón de labios/garganta, dificultad para respirar, mareo o desmayo", "Solo un poco de comezón en el brazo", "Hambre repentina", "Sudoración leve sin otros síntomas"],
        "correctIndex": 0,
        "explanation": "Estos síntomas indican que la reacción está afectando la vía aérea o la circulación, una emergencia."
      },
      {
        "question": "¿Qué se debe hacer mientras se espera ayuda en una reacción alérgica grave, si la persona no tiene autoinyector?",
        "options": ["Nada, solo esperar", "Mantenerla calmada, en posición cómoda y llamar a emergencias de inmediato", "Darle antihistamínico en dosis altas por su cuenta", "Hacerla caminar para distraerla"],
        "correctIndex": 1,
        "explanation": "Mantener la calma y buscar ayuda de emergencia es fundamental mientras se espera tratamiento especializado."
      },
      {
        "question": "¿Qué se debe hacer si una persona con alergia conocida a picaduras es picada de nuevo y aún no tiene síntomas?",
        "options": ["Ignorarlo, ya que no hay síntomas", "Vigilarla de cerca los siguientes minutos, ya que los síntomas graves pueden aparecer rápido", "Dejarla sola", "Aplicar únicamente hielo y despreocuparse"],
        "correctIndex": 1,
        "explanation": "En personas con alergia conocida, los síntomas graves pueden desarrollarse rápidamente tras la picadura."
      },
      {
        "question": "¿Por qué es importante que las personas con alergias graves a picaduras informen a las personas de su entorno?",
        "options": ["No es necesario informar a nadie", "Para que sepan actuar rápido y ayudar con el autoinyector si es necesario", "Solo por curiosidad de los demás", "No influye en la atención de emergencia"],
        "correctIndex": 1,
        "explanation": "Que otros conozcan la alergia permite una respuesta más rápida y efectiva en caso de emergencia."
      }
    ]
  },
  {
    "module": "picadura",
    "order": 4,
    "title": "Picadura — Animales marinos",
    "xpReward": 35,
    "questions": [
      {
        "question": "¿Qué se recomienda ante una picadura de medusa?",
        "options": ["Frotar la zona con arena", "Enjuagar con agua de mar (no dulce) y retirar los tentáculos con cuidado, sin frotar", "Aplicar agua dulce directamente", "Aplicar hielo directo sin enjuagar antes"],
        "correctIndex": 1,
        "explanation": "El agua dulce y el frotamiento pueden activar más células urticantes de la medusa; se recomienda agua de mar y retirar tentáculos con cuidado."
      },
      {
        "question": "¿Qué se debe hacer ante una picadura de raya en el pie?",
        "options": ["Ignorarla, no es grave", "Sumergir la zona en agua caliente (tolerable) y buscar atención médica", "Aplicar hielo únicamente", "Caminar normal sin revisar la herida"],
        "correctIndex": 1,
        "explanation": "El calor ayuda a aliviar el dolor del veneno, y se debe revisar que no queden restos de la espina en la herida."
      },
      {
        "question": "¿Qué medida general de seguridad ayuda a prevenir picaduras de animales marinos al nadar?",
        "options": ["Nadar en zonas señaladas y evitar tocar organismos desconocidos", "Tocar todo lo que se vea en el fondo marino", "Nadar de noche sin supervisión en zonas desconocidas", "No es posible prevenirlas"],
        "correctIndex": 0,
        "explanation": "Respetar las zonas de nado seguras y no tocar organismos desconocidos reduce el riesgo de picaduras."
      },
      {
        "question": "¿Qué señal indicaría que una picadura marina requiere atención médica urgente?",
        "options": ["Dolor intenso, dificultad para respirar o hinchazón que se extiende rápido", "Un poco de ardor leve que pasa rápido", "Enrojecimiento sin otros síntomas", "Ninguna, todas se tratan igual en casa"],
        "correctIndex": 0,
        "explanation": "Síntomas severos o que empeoran rápido pueden indicar una reacción grave que necesita atención profesional."
      },
      {
        "question": "¿Por qué no se recomienda orinar sobre una picadura de medusa (mito común)?",
        "options": ["Porque es lo correcto y ayuda siempre", "Porque no tiene un efecto comprobado y puede incluso empeorar la irritación", "Porque cura completamente la herida", "No hay ninguna razón, es un buen remedio"],
        "correctIndex": 1,
        "explanation": "Este remedio popular no tiene respaldo científico sólido y puede no ayudar o incluso irritar más la zona."
      }
    ]
  },
  {
    "module": "picadura",
    "order": 5,
    "title": "Picadura — Casos avanzados",
    "xpReward": 40,
    "requiredLevel": 3,
    "questions": [
      {
        "question": "¿Qué diferencia hay entre el veneno de una abeja y el de una avispa en cuanto al aguijón?",
        "options": ["Ambas dejan el aguijón clavado siempre", "La abeja generalmente pierde el aguijón al picar, mientras que la avispa puede picar varias veces sin perderlo", "Ninguna diferencia", "Las avispas nunca pican más de una vez"],
        "correctIndex": 1,
        "explanation": "Las abejas suelen dejar el aguijón clavado y mueren después de picar, mientras que las avispas pueden picar repetidamente."
      },
      {
        "question": "¿Qué precaución se debe tener con alguien picado muchas veces por un enjambre de abejas?",
        "options": ["No representa mayor riesgo si es una sola persona", "El veneno acumulado puede ser peligroso incluso sin alergia; requiere atención médica urgente", "Solo se trata con hielo en casa", "Es igual que una sola picadura"],
        "correctIndex": 1,
        "explanation": "Múltiples picaduras pueden acumular una cantidad de veneno peligrosa para cualquier persona, no solo alérgicos."
      },
      {
        "question": "¿Qué se debe hacer si una persona picada por un insecto desarrolla fiebre y malestar general días después?",
        "options": ["Ignorarlo, ya pasó el riesgo", "Buscar atención médica, podría indicar una infección o enfermedad transmitida por el insecto", "Es normal y no requiere revisión", "Solo aplicar más hielo"],
        "correctIndex": 1,
        "explanation": "Síntomas tardíos como fiebre pueden indicar una infección secundaria o una enfermedad transmitida por el insecto."
      },
      {
        "question": "¿Por qué las personas con alergias graves a picaduras deben portar siempre su autoinyector de epinefrina?",
        "options": ["No es necesario si ya tuvieron una reacción antes", "Porque una nueva picadura puede causar una reacción igual o más grave en cualquier momento", "Solo se necesita en la primera reacción", "El autoinyector no ayuda en picaduras"],
        "correctIndex": 1,
        "explanation": "El riesgo de una reacción anafiláctica persiste con cada exposición, por lo que siempre deben tenerlo a mano."
      },
      {
        "question": "¿Qué papel juega la identificación temprana de la especie del insecto o animal en el tratamiento?",
        "options": ["Ninguno, todos los tratamientos son iguales", "Puede ayudar a decidir el tratamiento específico, como el uso de antiveneno en algunos casos", "Solo sirve para fines de curiosidad", "No influye en la atención médica"],
        "correctIndex": 1,
        "explanation": "Conocer la especie puede ser clave para tratamientos específicos, como antivenenos en picaduras de ciertos animales."
      }
    ]
  },

  // ── DESCARGA ELÉCTRICA (2, 3, 4, 5) ──
  {
    "module": "descarga",
    "order": 2,
    "title": "Descarga Eléctrica — Cortando la corriente",
    "xpReward": 25,
    "questions": [
      {
        "question": "¿Qué se debe hacer primero si alguien está en contacto con un cable eléctrico caído?",
        "options": ["Tocarlo con las manos para separarlo", "Apagar el interruptor principal o cortar la electricidad antes de acercarse", "Acercarse rápido a ayudar sin precaución", "Echarle agua para 'apagar' la corriente"],
        "correctIndex": 1,
        "explanation": "Cortar la fuente de electricidad es el primer paso indispensable para evitar más víctimas."
      },
      {
        "question": "Si no se puede cortar la electricidad, ¿con qué se puede intentar alejar a la persona de la fuente?",
        "options": ["Con un objeto metálico", "Con las manos mojadas", "Con un objeto de madera o plástico seco y no conductor", "Con agua"],
        "correctIndex": 2,
        "explanation": "Los materiales secos y no conductores como madera o plástico evitan que la corriente pase al rescatista."
      },
      {
        "question": "¿Qué distancia de seguridad se debe mantener de un cable de alta tensión caído?",
        "options": ["No importa la distancia, se puede acercar", "Mantenerse alejado varios metros, ya que la corriente puede viajar por el suelo", "Tocarlo con cuidado", "Acercarse solo un poco"],
        "correctIndex": 1,
        "explanation": "En cables de alta tensión, la corriente puede propagarse por el suelo a cierta distancia, por lo que se debe mantener alejado."
      },
      {
        "question": "¿Qué se debe hacer con los aparatos eléctricos mojados antes de tocarlos?",
        "options": ["Tocarlos con las manos secas", "Desconectarlos de la corriente antes de manipularlos, si es seguro hacerlo", "Usarlos con cuidado mientras están mojados", "No hay riesgo si se secan un poco"],
        "correctIndex": 1,
        "explanation": "El agua es buena conductora de electricidad, por lo que se debe desconectar antes de manipular aparatos mojados."
      },
      {
        "question": "¿Por qué se recomienda llamar a la compañía eléctrica ante un cable caído en la vía pública?",
        "options": ["No es necesario avisar a nadie", "Para que corten la energía de forma segura y profesional en esa zona", "Solo por curiosidad", "Porque ellos vienen a limpiar la calle"],
        "correctIndex": 1,
        "explanation": "La compañía eléctrica puede cortar la energía de forma segura y evitar accidentes mientras se resuelve la situación."
      }
    ]
  },
  {
    "module": "descarga",
    "order": 3,
    "title": "Descarga Eléctrica — RCP y quemaduras",
    "xpReward": 30,
    "requiredLevel": 2,
    "questions": [
      {
        "question": "¿Qué se debe verificar de inmediato después de que la persona ya no está en contacto con la corriente?",
        "options": ["Su ropa", "Su respiración y si tiene pulso, iniciando RCP si es necesario", "El color de sus zapatos", "Nada, ya pasó el peligro"],
        "correctIndex": 1,
        "explanation": "La electricidad puede causar paro cardiaco o respiratorio, por lo que se debe evaluar de inmediato."
      },
      {
        "question": "¿Cómo se deben tratar las quemaduras causadas por electricidad en la piel?",
        "options": ["Igual que cualquier otra quemadura: enfriar, cubrir sin apretar, y buscar atención médica", "Con hielo directo intenso", "Con mantequilla", "No se deben tratar, se curan solas"],
        "correctIndex": 0,
        "explanation": "Las quemaduras eléctricas se tratan con los mismos principios básicos, pero requieren evaluación médica por el posible daño interno."
      },
      {
        "question": "¿Qué se debe buscar en la piel de alguien que sufrió una descarga eléctrica?",
        "options": ["Solo el color de la piel", "Puntos de entrada y salida de la corriente (quemaduras en dos zonas distintas)", "Solo si hay sangrado", "Nada en particular"],
        "correctIndex": 1,
        "explanation": "La corriente eléctrica suele dejar una marca de entrada y otra de salida, ayudando a estimar el trayecto del daño interno."
      },
      {
        "question": "¿Por qué se recomienda un electrocardiograma después de una descarga eléctrica, aunque la persona se sienta bien?",
        "options": ["No es necesario nunca", "Porque la corriente puede alterar el ritmo cardiaco de forma que no siempre se siente de inmediato", "Solo se hace por protocolo sin razón médica", "Es solo para personas mayores"],
        "correctIndex": 1,
        "explanation": "Las alteraciones del ritmo cardiaco causadas por electricidad pueden no sentirse pero ser peligrosas, por lo que se recomienda evaluación médica."
      },
      {
        "question": "¿Qué se debe hacer si la persona electrocutada tiene además una caída o golpe al ser lanzada por la corriente?",
        "options": ["Ignorar la caída y tratar solo la descarga", "Evaluar también posibles fracturas o lesiones por la caída, inmovilizando si es necesario", "Moverla libremente sin cuidado", "No es relevante revisar más"],
        "correctIndex": 1,
        "explanation": "Las descargas eléctricas fuertes pueden lanzar a la persona, causando lesiones adicionales por el impacto."
      }
    ]
  },
  {
    "module": "descarga",
    "order": 4,
    "title": "Descarga Eléctrica — Prevención en el hogar",
    "xpReward": 35,
    "questions": [
      {
        "question": "¿Qué medida ayuda a prevenir descargas eléctricas en el hogar con niños pequeños?",
        "options": ["Dejar los enchufes sin protección", "Usar protectores de enchufes y mantener cables fuera de su alcance", "No es necesario prevenir nada en casa", "Dejar cables sueltos por el piso"],
        "correctIndex": 1,
        "explanation": "Los protectores de enchufes y el orden de cables reducen significativamente el riesgo de descargas en niños."
      },
      {
        "question": "¿Por qué no se deben usar aparatos eléctricos cerca del agua (como en el baño)?",
        "options": ["No hay ningún riesgo", "El agua conduce electricidad y aumenta el riesgo de descarga grave", "Solo afecta el funcionamiento del aparato", "Es solo una recomendación estética"],
        "correctIndex": 1,
        "explanation": "El agua facilita el paso de la corriente eléctrica, aumentando el riesgo de una descarga peligrosa."
      },
      {
        "question": "¿Qué se debe hacer si se detecta un cable pelado o dañado en casa?",
        "options": ["Seguir usándolo con cuidado", "Dejar de usarlo y reemplazarlo o repararlo antes de utilizarlo de nuevo", "Cubrirlo con cinta y listo, sin más revisión", "Ignorarlo si 'funciona bien'"],
        "correctIndex": 1,
        "explanation": "Un cable dañado representa un riesgo real de descarga o incendio y debe atenderse antes de seguir usándolo."
      },
      {
        "question": "¿Qué dispositivo de seguridad eléctrica ayuda a prevenir descargas al detectar fugas de corriente?",
        "options": ["Un interruptor diferencial (o de falla a tierra)", "Un foco normal", "Una extensión sin protección", "Ninguno existe"],
        "correctIndex": 0,
        "explanation": "Estos interruptores cortan la corriente automáticamente al detectar una fuga, previniendo descargas graves."
      },
      {
        "question": "¿Qué se debe enseñar a los niños sobre la electricidad en casa?",
        "options": ["Que jueguen con los enchufes para aprender", "No tocar enchufes ni aparatos eléctricos con las manos mojadas, y avisar a un adulto si ven un cable dañado", "No es necesario enseñarles nada", "Que toquen los cables para saber si dan toques"],
        "correctIndex": 1,
        "explanation": "La educación temprana ayuda a que los niños eviten conductas de riesgo con la electricidad."
      }
    ]
  },
  {
    "module": "descarga",
    "order": 5,
    "title": "Descarga Eléctrica — Casos avanzados",
    "xpReward": 40,
    "requiredLevel": 3,
    "questions": [
      {
        "question": "¿Qué diferencia hay entre una descarga de bajo voltaje (doméstica) y una de alto voltaje (líneas de transmisión)?",
        "options": ["No hay diferencia en el riesgo", "El alto voltaje puede causar daño interno más extenso y a mayor distancia, incluso sin contacto directo", "El bajo voltaje siempre es más peligroso", "Ambas son igual de seguras"],
        "correctIndex": 1,
        "explanation": "Las líneas de alto voltaje pueden generar arcos eléctricos peligrosos incluso sin tocar el cable directamente."
      },
      {
        "question": "¿Por qué es importante llamar a emergencias incluso si la persona parece recuperarse bien tras una descarga?",
        "options": ["No es necesario si se ve bien", "Puede haber arritmias cardiacas o daño interno que se manifiesten después", "Solo se llama si hay quemaduras visibles", "Nunca es necesario llamar"],
        "correctIndex": 1,
        "explanation": "Los efectos de una descarga eléctrica pueden aparecer minutos u horas después, por lo que la evaluación médica es importante."
      },
      {
        "question": "¿Qué se debe hacer en un ambiente de trabajo si ocurre una descarga eléctrica industrial?",
        "options": ["Seguir el protocolo de seguridad del lugar y cortar la energía general antes de auxiliar", "Ignorar los protocolos y actuar de inmediato sin precaución", "Esperar sin avisar a nadie", "Tocar a la persona de inmediato"],
        "correctIndex": 0,
        "explanation": "Los entornos industriales suelen tener protocolos específicos de corte de energía que deben seguirse para la seguridad de todos."
      },
      {
        "question": "¿Qué relación existe entre la duración del contacto con la corriente y la gravedad del daño?",
        "options": ["No hay relación", "A mayor tiempo de contacto, generalmente mayor es el daño causado por la corriente", "Un contacto más largo siempre es menos grave", "Solo importa el voltaje, no el tiempo"],
        "correctIndex": 1,
        "explanation": "El tiempo de exposición a la corriente influye directamente en la cantidad de daño causado al cuerpo."
      },
      {
        "question": "¿Por qué el personal de rescate espera confirmación de que la energía fue cortada antes de acercarse en descargas de alto voltaje?",
        "options": ["Por protocolo sin razón real", "Porque acercarse antes de cortar la energía pone en riesgo la vida del rescatista también", "No es necesario esperar nunca", "Solo por precaución legal"],
        "correctIndex": 1,
        "explanation": "Acercarse a una fuente de alto voltaje activa puede electrocutar también al rescatista, por lo que se espera confirmación de corte de energía."
      }
    ]
  },

  // ── INSOLACIÓN (2, 3, 4, 5) ──
  {
    "module": "insolacion",
    "order": 2,
    "title": "Insolación — Reconocer la gravedad",
    "xpReward": 25,
    "questions": [
      {
        "question": "¿Qué diferencia hay entre agotamiento por calor y golpe de calor?",
        "options": ["No hay diferencia", "El agotamiento por calor tiene sudoración abundante y piel húmeda; el golpe de calor puede tener piel seca y caliente con confusión, siendo más grave", "El golpe de calor siempre es más leve", "El agotamiento por calor es más peligroso"],
        "correctIndex": 1,
        "explanation": "El golpe de calor es una emergencia más grave, donde el cuerpo deja de regular su temperatura correctamente."
      },
      {
        "question": "¿Qué se debe hacer si una persona con insolación empieza a vomitar?",
        "options": ["Darle de comer de inmediato", "Colocarla de lado para evitar que se ahogue y seguir enfriándola", "Ignorarlo y seguir dando agua", "Sentarla derecha de inmediato"],
        "correctIndex": 1,
        "explanation": "Colocarla de lado previene que se ahogue con el vómito mientras se continúa el proceso de enfriamiento."
      },
      {
        "question": "¿Qué grupos de personas tienen mayor riesgo de sufrir insolación?",
        "options": ["Solo los deportistas", "Niños pequeños, adultos mayores y personas con enfermedades crónicas", "Solo las personas jóvenes y sanas", "Nadie tiene mayor riesgo que otro"],
        "correctIndex": 1,
        "explanation": "Estos grupos tienen menor capacidad de regular su temperatura corporal, aumentando el riesgo."
      },
      {
        "question": "¿Qué se debe evitar dar a alguien con insolación que está confundido o con alteración de consciencia?",
        "options": ["Aire fresco", "Compresas frías", "Líquidos por vía oral, por riesgo de atragantamiento", "Ropa ligera"],
        "correctIndex": 2,
        "explanation": "Si la persona está confundida o inconsciente, dar líquidos por boca puede causar que se atragante."
      },
      {
        "question": "¿Por qué dejar a un niño o mascota dentro de un auto cerrado en un día caluroso es extremadamente peligroso?",
        "options": ["No representa ningún riesgo real", "La temperatura interior puede subir muy rápido, causando un golpe de calor mortal en minutos", "Solo incomoda un poco", "Es seguro por menos de una hora"],
        "correctIndex": 1,
        "explanation": "La temperatura dentro de un auto cerrado puede aumentar drásticamente en poco tiempo, poniendo en riesgo la vida."
      }
    ]
  },
  {
    "module": "insolacion",
    "order": 3,
    "title": "Insolación — Enfriamiento activo",
    "xpReward": 30,
    "requiredLevel": 2,
    "questions": [
      {
        "question": "¿Qué método de enfriamiento es más efectivo para un golpe de calor severo, si está disponible?",
        "options": ["Solo abanicar sin agua", "Inmersión en agua fría o rociar con agua fría junto con ventilación", "Cubrir con mantas", "Dar bebidas calientes"],
        "correctIndex": 1,
        "explanation": "La inmersión o el rociado con agua fría junto con ventilación acelera la pérdida de calor corporal."
      },
      {
        "question": "¿Qué zonas del cuerpo son más efectivas para colocar compresas frías y bajar la temperatura rápido?",
        "options": ["Solo la frente", "Cuello, axilas e ingles, donde hay grandes vasos sanguíneos cercanos a la piel", "Solo las manos", "Solo los pies"],
        "correctIndex": 1,
        "explanation": "Estas zonas permiten enfriar la sangre que circula cerca de la superficie, bajando la temperatura corporal más rápido."
      },
      {
        "question": "¿Qué se debe monitorear mientras se enfría a una persona con golpe de calor?",
        "options": ["Su nivel de consciencia y respiración", "Solo su ropa", "El clima exterior", "Nada en particular"],
        "correctIndex": 0,
        "explanation": "El nivel de consciencia y la respiración indican si la condición mejora o empeora durante el proceso."
      },
      {
        "question": "¿Por qué no se recomienda usar alcohol para enfriar la piel de alguien con insolación?",
        "options": ["Es muy efectivo y seguro", "Puede absorberse por la piel y ser tóxico, además de no ser más efectivo que el agua", "No tiene ningún riesgo", "Es la mejor opción disponible"],
        "correctIndex": 1,
        "explanation": "El alcohol puede absorberse por la piel y causar toxicidad, sin aportar beneficio adicional sobre el agua."
      },
      {
        "question": "¿Cuándo se debe detener el proceso de enfriamiento activo (como la inmersión en agua fría)?",
        "options": ["Nunca se detiene", "Cuando la temperatura corporal baja a un nivel seguro o llega ayuda médica que indique lo contrario", "Después de 5 segundos", "Solo si la persona lo pide"],
        "correctIndex": 1,
        "explanation": "El enfriamiento se mantiene hasta normalizar la temperatura o hasta recibir indicaciones médicas."
      }
    ]
  },
  {
    "module": "insolacion",
    "order": 4,
    "title": "Insolación — Hidratación y electrolitos",
    "xpReward": 35,
    "questions": [
      {
        "question": "¿Qué se recomienda para rehidratar a alguien con agotamiento por calor leve y consciente?",
        "options": ["Solo agua natural en sorbos pequeños o bebidas con electrolitos", "Bebidas con cafeína en exceso", "Bebidas alcohólicas", "No dar nada de beber"],
        "correctIndex": 0,
        "explanation": "El agua o bebidas con electrolitos ayudan a reponer líquidos y sales perdidas por el calor sin sobrecargar el cuerpo."
      },
      {
        "question": "¿Por qué las bebidas con cafeína o alcohol no son recomendables durante un episodio de calor?",
        "options": ["No tienen ningún efecto", "Pueden aumentar la deshidratación", "Ayudan a hidratar mejor que el agua", "Bajan la temperatura corporal de forma segura"],
        "correctIndex": 1,
        "explanation": "La cafeína y el alcohol tienen efecto diurético, lo que puede empeorar la deshidratación."
      },
      {
        "question": "¿Qué síntomas pueden indicar un desequilibrio de electrolitos por sudoración excesiva?",
        "options": ["Calambres musculares y debilidad", "Aumento de energía", "Mejora del estado de ánimo", "Ninguno en particular"],
        "correctIndex": 0,
        "explanation": "La pérdida de sales minerales por sudoración excesiva puede causar calambres y debilidad muscular."
      },
      {
        "question": "¿Qué se recomienda antes de realizar actividad física intensa en un día caluroso?",
        "options": ["Hidratarse bien antes, durante y después de la actividad", "Evitar tomar agua para no sentirse pesado", "Hacer ejercicio en las horas de más calor", "No es necesario prepararse de ninguna forma"],
        "correctIndex": 0,
        "explanation": "Una buena hidratación antes, durante y después ayuda a prevenir el agotamiento por calor."
      },
      {
        "question": "¿Qué se debe hacer si alguien con agotamiento por calor no mejora tras 30 minutos de reposo, sombra e hidratación?",
        "options": ["Seguir esperando sin actuar más", "Buscar atención médica, ya que podría progresar a un golpe de calor", "Darle más cafeína", "Hacerlo hacer ejercicio ligero"],
        "correctIndex": 1,
        "explanation": "La falta de mejora puede indicar que la condición está empeorando y requiere evaluación médica."
      }
    ]
  },
  {
    "module": "insolacion",
    "order": 5,
    "title": "Insolación — Casos avanzados",
    "xpReward": 40,
    "requiredLevel": 3,
    "questions": [
      {
        "question": "¿Qué complicaciones graves puede causar un golpe de calor no tratado a tiempo?",
        "options": ["Ninguna, se resuelve siempre solo", "Daño a órganos como riñones, hígado y cerebro, e incluso la muerte", "Solo deshidratación leve", "Mejora del rendimiento físico"],
        "correctIndex": 1,
        "explanation": "El golpe de calor severo puede dañar múltiples órganos si la temperatura corporal permanece elevada por mucho tiempo."
      },
      {
        "question": "¿Por qué las personas que toman ciertos medicamentos (como diuréticos) tienen mayor riesgo de insolación?",
        "options": ["No tienen mayor riesgo", "Estos medicamentos pueden aumentar la pérdida de líquidos, favoreciendo la deshidratación y el golpe de calor", "Los protegen del calor", "Solo afectan la presión arterial"],
        "correctIndex": 1,
        "explanation": "Algunos medicamentos alteran el equilibrio de líquidos del cuerpo, aumentando la vulnerabilidad al calor."
      },
      {
        "question": "¿Qué papel juega la humedad ambiental (además de la temperatura) en el riesgo de golpe de calor?",
        "options": ["Ninguno, solo importa la temperatura", "Una humedad alta dificulta que el sudor se evapore, reduciendo la capacidad del cuerpo para enfriarse", "La humedad siempre ayuda a enfriar más rápido", "Solo afecta el cabello y la piel"],
        "correctIndex": 1,
        "explanation": "Cuando el aire está muy húmedo, el sudor no se evapora eficientemente, dificultando la regulación de la temperatura corporal."
      },
      {
        "question": "¿Qué se debe hacer si una persona con golpe de calor severo empieza a convulsionar?",
        "options": ["Sujetarla con fuerza", "Proteger su cabeza, despejar el área, y continuar el enfriamiento mientras se espera ayuda urgente", "Darle agua de inmediato", "Meter algo en su boca"],
        "correctIndex": 1,
        "explanation": "Las convulsiones pueden ocurrir en golpes de calor severos; se debe proteger a la persona y seguir enfriándola mientras llega ayuda."
      },
      {
        "question": "¿Por qué la aclimatación gradual al calor ayuda a prevenir el golpe de calor?",
        "options": ["No tiene ningún efecto preventivo", "El cuerpo se adapta progresivamente a regular mejor su temperatura y sudoración con la exposición gradual", "Empeora la tolerancia al calor", "Solo funciona en climas fríos"],
        "correctIndex": 1,
        "explanation": "La exposición gradual al calor permite que el cuerpo mejore sus mecanismos de enfriamiento con el tiempo."
      }
    ]
  },

  // ── CONVULSIÓN (2, 3, 4, 5) ──
  {
    "module": "convulsion",
    "order": 2,
    "title": "Convulsión — Tipos y duración",
    "xpReward": 25,
    "questions": [
      {
        "question": "¿Qué se considera un 'estatus epiléptico' y por qué es una emergencia?",
        "options": ["Una convulsión de segundos que termina rápido", "Una convulsión que dura más de 5 minutos o varias seguidas sin recuperación completa entre ellas", "Un tipo de dolor de cabeza", "Una condición que no requiere atención"],
        "correctIndex": 1,
        "explanation": "Una convulsión prolongada o repetida sin recuperación es una emergencia médica que puede causar daño cerebral."
      },
      {
        "question": "¿Qué se debe hacer si es la primera convulsión que presenta una persona en su vida?",
        "options": ["No es necesario buscar ayuda médica", "Buscar atención médica siempre, aunque la convulsión termine rápido, para investigar la causa", "Ignorarlo si se recupera bien", "Darle un medicamento sin saber cuál"],
        "correctIndex": 1,
        "explanation": "Una primera convulsión debe evaluarse médicamente para identificar la causa subyacente."
      },
      {
        "question": "¿Qué diferencia hay entre una convulsión febril (en niños) y otros tipos de convulsión?",
        "options": ["No hay diferencia", "La convulsión febril está asociada a fiebre alta en niños pequeños y suele ser breve", "Las convulsiones febriles solo ocurren en adultos", "Las convulsiones febriles son siempre más peligrosas"],
        "correctIndex": 1,
        "explanation": "Las convulsiones febriles ocurren en niños pequeños con fiebre alta y generalmente son breves, aunque deben ser evaluadas."
      },
      {
        "question": "¿Qué se debe hacer con la temperatura de un niño después de una convulsión febril?",
        "options": ["Ignorarla por completo", "Intentar bajarla con medios adecuados y consultar al médico", "Abrigarlo más", "Darle un baño de agua muy fría de golpe"],
        "correctIndex": 1,
        "explanation": "Reducir la fiebre de forma gradual y adecuada, junto con evaluación médica, ayuda a manejar la situación."
      },
      {
        "question": "¿Cuánto tiempo suele durar la mayoría de las convulsiones comunes?",
        "options": ["Varias horas", "Generalmente menos de 2-3 minutos", "Todo un día", "Nunca terminan solas"],
        "correctIndex": 1,
        "explanation": "La mayoría de las convulsiones son breves y terminan por sí solas en pocos minutos."
      }
    ]
  },
  {
    "module": "convulsion",
    "order": 3,
    "title": "Convulsión — Durante el episodio",
    "xpReward": 30,
    "requiredLevel": 2,
    "questions": [
      {
        "question": "¿Qué se debe hacer con los objetos cercanos a una persona que convulsiona?",
        "options": ["Dejarlos donde están", "Retirarlos para evitar que la persona se golpee con ellos", "Acercarlos más para apoyar a la persona", "No es necesario moverlos"],
        "correctIndex": 1,
        "explanation": "Retirar objetos peligrosos previene lesiones durante los movimientos involuntarios."
      },
      {
        "question": "¿Se debe cronometrar la duración de una convulsión?",
        "options": ["No es necesario", "Sí, es útil para saber si supera el tiempo considerado una emergencia (más de 5 minutos)", "Solo si dura toda una hora", "Nunca aporta información útil"],
        "correctIndex": 1,
        "explanation": "Cronometrar ayuda a decidir cuándo se vuelve una emergencia que requiere atención inmediata."
      },
      {
        "question": "¿Qué se debe hacer si la persona convulsiona en un lugar peligroso (como cerca de una escalera)?",
        "options": ["Dejarla ahí sin más", "Si es posible con seguridad, guiarla suavemente lejos del peligro sin sujetarla con fuerza", "Sujetarla con fuerza para que no se mueva", "Ignorar el entorno"],
        "correctIndex": 1,
        "explanation": "Se busca reducir el riesgo del entorno sin restringir los movimientos de la convulsión, lo cual podría causar lesiones."
      },
      {
        "question": "¿Qué se debe observar durante la convulsión para informar después a los servicios médicos?",
        "options": ["Nada en particular", "Duración, tipo de movimientos y si hubo pérdida de control de esfínteres", "Solo la hora en que empezó", "El color de la ropa de la persona"],
        "correctIndex": 1,
        "explanation": "Estos detalles ayudan al personal médico a entender mejor el episodio y su posible causa."
      },
      {
        "question": "¿Es recomendable grabar en video una convulsión mientras se atiende a la persona?",
        "options": ["Nunca, es una falta de respeto sin excepción", "Puede ser útil para mostrar al médico, si otra persona atiende directamente al paciente", "Es más importante que atender a la persona", "No aporta ninguna información médica"],
        "correctIndex": 1,
        "explanation": "Un video breve puede ayudar al diagnóstico médico, siempre que no sustituya la atención directa a la persona."
      }
    ]
  },
  {
    "module": "convulsion",
    "order": 4,
    "title": "Convulsión — Después del episodio",
    "xpReward": 35,
    "questions": [
      {
        "question": "¿Qué es el 'periodo postictal' después de una convulsión?",
        "options": ["El momento antes de que empiece la convulsión", "El estado de confusión, cansancio o somnolencia que sigue después de la convulsión", "Un tipo distinto de convulsión", "Un síntoma de que va a convulsionar de nuevo pronto"],
        "correctIndex": 1,
        "explanation": "Después de convulsionar, es común que la persona se sienta confundida o muy cansada durante un tiempo."
      },
      {
        "question": "¿Qué se debe hacer si la persona, tras la convulsión, quiere levantarse de inmediato?",
        "options": ["Dejarla levantarse sola de inmediato sin apoyo", "Ayudarla a incorporarse poco a poco, asegurándose de que esté orientada y estable", "Impedir que se mueva por horas", "Hacerla correr para 'despertar' más rápido"],
        "correctIndex": 1,
        "explanation": "La persona puede estar confundida o débil, por lo que se debe apoyar su recuperación gradual."
      },
      {
        "question": "¿Qué se debe verificar en la boca de la persona después de la convulsión?",
        "options": ["Nada, no es necesario revisar", "Si hay lesiones por mordedura de lengua o mejillas, y limpiar con cuidado si hay saliva o vómito", "Contar sus dientes", "Darle de comer de inmediato"],
        "correctIndex": 1,
        "explanation": "Es común que la persona se muerda la lengua durante la convulsión; se revisa con cuidado y se limpia la vía aérea si es necesario."
      },
      {
        "question": "¿Qué información es importante compartir con la persona (o su familia) sobre el episodio una vez que se recupera?",
        "options": ["Nada, mejor no mencionarlo", "Cuánto duró, qué se observó y si es recomendable buscar atención médica según el caso", "Inventar detalles que no se vieron", "Solo la hora en que despertó"],
        "correctIndex": 1,
        "explanation": "Compartir información precisa ayuda a la persona y a su familia a buscar el seguimiento médico adecuado."
      },
      {
        "question": "¿Cuándo se recomienda que alguien con antecedentes de convulsiones consulte a su médico tratante después de un episodio?",
        "options": ["Nunca es necesario si ya tiene un diagnóstico", "Si el episodio fue distinto a los habituales, más largo, o si hubo lesiones durante la convulsión", "Solo si la persona se siente perfectamente bien", "No aplica en personas con epilepsia diagnosticada"],
        "correctIndex": 1,
        "explanation": "Cambios en el patrón habitual de las convulsiones ameritan revisión médica, aunque la persona ya tenga un diagnóstico previo."
      }
    ]
  },
  {
    "module": "convulsion",
    "order": 5,
    "title": "Convulsión — Casos avanzados",
    "xpReward": 40,
    "requiredLevel": 3,
    "questions": [
      {
        "question": "¿Qué se debe hacer si una persona embarazada presenta convulsiones (posible eclampsia)?",
        "options": ["Tratarla igual que cualquier convulsión y no dar importancia adicional", "Protegerla de golpes, colocarla de lado, y buscar atención médica urgente", "Ignorarlo si se recupera rápido", "Darle de beber agua de inmediato"],
        "correctIndex": 1,
        "explanation": "Las convulsiones en el embarazo pueden indicar eclampsia, una condición grave que requiere atención médica urgente."
      },
      {
        "question": "¿Qué se debe hacer si una persona con diabetes presenta una convulsión relacionada con niveles muy bajos de azúcar?",
        "options": ["Darle azúcar o alimento dulce mientras convulsiona", "Proteger a la persona durante la convulsión, y una vez que pueda tragar con seguridad, ofrecer algo dulce; buscar ayuda médica", "Ignorar la posible causa", "Solo dejar que se recupere sin intervención"],
        "correctIndex": 1,
        "explanation": "No se debe dar nada por la boca mientras convulsiona por riesgo de atragantamiento; se actúa una vez que puede tragar de forma segura."
      },
      {
        "question": "¿Por qué las convulsiones repetidas sin recuperación completa entre ellas son especialmente peligrosas?",
        "options": ["No representan mayor riesgo que una convulsión única", "Pueden causar falta de oxígeno prolongada al cerebro y otros órganos, siendo una emergencia crítica", "Solo causan cansancio temporal", "Se resuelven siempre solas sin tratamiento"],
        "correctIndex": 1,
        "explanation": "La falta de recuperación entre convulsiones puede comprometer seriamente la oxigenación cerebral."
      },
      {
        "question": "¿Qué papel juega la medicación anticonvulsiva en personas con epilepsia diagnosticada?",
        "options": ["Ninguno, no ayuda a prevenir convulsiones", "Ayuda a reducir la frecuencia y severidad de las convulsiones cuando se toma según lo indicado", "Solo se usa durante una convulsión activa", "Cura la epilepsia por completo siempre"],
        "correctIndex": 1,
        "explanation": "La medicación ayuda a controlar la condición, pero su efectividad depende de tomarla correctamente según la indicación médica."
      },
      {
        "question": "¿Qué se debe hacer si una persona deja de tomar su medicación anticonvulsiva y presenta más convulsiones de lo habitual?",
        "options": ["Es normal, no requiere atención", "Consultar con su médico tratante lo antes posible, ya que suspender la medicación puede aumentar el riesgo", "Aumentar la dosis por su cuenta sin indicación médica", "Ignorarlo mientras pueda seguir con sus actividades"],
        "correctIndex": 1,
        "explanation": "La suspensión de medicación puede desestabilizar el control de las convulsiones y requiere ajuste médico oportuno."
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