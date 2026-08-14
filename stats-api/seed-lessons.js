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