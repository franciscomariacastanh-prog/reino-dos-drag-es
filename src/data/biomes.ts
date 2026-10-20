import { Biome, Egg, DragonRarity, DragonElement } from '../types';

export const BIOMES: Biome[] = [
  // 1. BIOMA ROBÓTICO (OS MELHORES NINHOS)
  {
    id: 'robotico',
    name: 'Bioma Robótico',
    tagline: 'Metrópole de Titânio & Ninhos de Alta Tecnologia',
    description: 'A vanguarda da evolução dracônica cibernética. Seus ninhos são equipados com cápsulas criogênicas, nano-alimentadores e núcleos de plasma: contém os MELHORES ovos de todo o continente!',
    isBestNestBiome: true,
    nestQualityLabel: 'Ninhos de Grau Apex (100% Ovos Titãs!)',
    bgGradient: 'from-slate-950 via-cyan-950 to-blue-950',
    accentColor: '#06b6d4',
    textColor: 'text-cyan-400',
    borderColor: 'border-cyan-500/40',
    nestRarityWeights: {
      comum: 0,
      raro: 0,
      epico: 0,
      lendario: 0,
      mitico: 0,
      tita: 100 // Todos os ninhos têm ovos Titãs garantidos!
    },
    enemies: [
      {
        id: 'guard_robo_1',
        name: 'Dreadnought Dracônico Mecha-01',
        element: 'robotico',
        level: 65,
        maxHp: 3600,
        currentHp: 3600,
        atk: 420,
        def: 380,
        spd: 310,
        rewardXp: 850,
        description: 'Guardião mecânico autônomo armado com canhões de pulso e blindagem de liga estelar.',
        skills: [
          { name: 'Disparo Laser Teleguiado', power: 110, desc: 'Laser de alta precisão.' },
          { name: 'Sobrecarga de Energia', power: 170, desc: 'Explosão de capacitores iônicos.' }
        ]
      },
      {
        id: 'guard_robo_2',
        name: 'Giga-Androide Cyber-Wyrm',
        element: 'robotico',
        level: 80,
        maxHp: 4400,
        currentHp: 4400,
        atk: 480,
        def: 430,
        spd: 340,
        rewardXp: 1200,
        description: 'Construção titanica robótica patrulhando os ninhos mais secretos da fábrica.',
        skills: [
          { name: 'Feixe de Antimatéria', power: 140, desc: 'Corte devastador com raio de fótons.' },
          { name: 'Impulso Hiper-Sônico', power: 190, desc: 'Investida propulsada por foguetes.' }
        ]
      }
    ]
  },

  // 2. BIOMA AQUÁTICO
  {
    id: 'aquatico',
    name: 'Bioma Aquático',
    tagline: 'Fossas Abissais & Recife dos Corais Azuis',
    description: 'Um oceano bioluminescente de águas cristalinas e fossas profundas. Os ninhos flutuam em conchas peroladas entre cardumes brilhantes.',
    nestQualityLabel: 'Ninhos de Pérola Abissal (100% Ovos Titãs!)',
    bgGradient: 'from-slate-950 via-blue-950 to-cyan-950',
    accentColor: '#0284c7',
    textColor: 'text-sky-400',
    borderColor: 'border-sky-500/40',
    nestRarityWeights: {
      comum: 0,
      raro: 0,
      epico: 0,
      lendario: 0,
      mitico: 0,
      tita: 100
    },
    enemies: [
      {
        id: 'guard_aqua_1',
        name: 'Serpe das Fendas Abissais',
        element: 'aquatico',
        level: 45,
        maxHp: 2700,
        currentHp: 2700,
        atk: 320,
        def: 290,
        spd: 280,
        rewardXp: 550,
        description: 'Predador das profundezas com dentes translúcidos e escamas reflexivas.',
        skills: [
          { name: 'Chicote de Água Fervente', power: 95, desc: 'Jato de água sob alta pressão.' },
          { name: 'Maelstrom Sufocante', power: 135, desc: 'Cria um redemoinho subaquático.' }
        ]
      },
      {
        id: 'guard_aqua_2',
        name: 'Leviatã Guardião dos Corais',
        element: 'aquatico',
        level: 60,
        maxHp: 3500,
        currentHp: 3500,
        atk: 390,
        def: 360,
        spd: 300,
        rewardXp: 850,
        description: 'Imensa criatura de carapaça calcificada que vigia os ninhos oceânicos.',
        skills: [
          { name: 'Bomba de Hidro-Pressão', power: 125, desc: 'Explosão aquática em choque.' },
          { name: 'Tsunami Devastador', power: 175, desc: 'Onda monumental.' }
        ]
      }
    ]
  },

  // 3. BIOMA FLORESTA
  {
    id: 'floresta',
    name: 'Bioma Floresta',
    tagline: 'Selva Esmeralda & Copa das Árvores-Mundo',
    description: 'Florestas antigas intocadas onde raízes colossais e flores exóticas abrigam ninhos verdejantes cheios de ovos cobertos de vinhas protetoras.',
    nestQualityLabel: 'Ninhos de Seiva Primordial (100% Ovos Titãs!)',
    bgGradient: 'from-slate-950 via-emerald-950 to-green-950',
    accentColor: '#16a34a',
    textColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/40',
    nestRarityWeights: {
      comum: 0,
      raro: 0,
      epico: 0,
      lendario: 0,
      mitico: 0,
      tita: 100
    },
    enemies: [
      {
        id: 'guard_forest_1',
        name: 'Draco da Casca de Carvalho',
        element: 'floresta',
        level: 40,
        maxHp: 2600,
        currentHp: 2600,
        atk: 290,
        def: 330,
        spd: 240,
        rewardXp: 480,
        description: 'Dragão camuflado em troncos milenares com resistência física inacreditável.',
        skills: [
          { name: 'Espinhos de Bambu Feroz', power: 90, desc: 'Lança feixes de espinhos afiados.' },
          { name: 'Esmagamento de Tronco', power: 130, desc: 'Golpe pesado com a cauda.' }
        ]
      },
      {
        id: 'guard_forest_2',
        name: 'Quimera Alada das Copas',
        element: 'floresta',
        level: 55,
        maxHp: 3200,
        currentHp: 3200,
        atk: 360,
        def: 310,
        spd: 320,
        rewardXp: 720,
        description: 'Ágil caçadora aérea entre as copas com veneno paralisante suave.',
        skills: [
          { name: 'Corte de Folha Navalha', power: 115, desc: 'Disparo de folhas cortantes.' },
          { name: 'Fúria das Raízes', power: 160, desc: 'Envolve o inimigo em raízes vivas.' }
        ]
      }
    ]
  },

  // 4. BIOMA NEVE
  {
    id: 'neve',
    name: 'Bioma Neve',
    tagline: 'Picos do Zero Absoluto & Glaciares Eternos',
    description: 'Montanhas gélidas esculpidas pelo vento polar. Os ninhos são encrustados em cavernas de gelo reluzente e conservam ovos em sono criogênico natural.',
    nestQualityLabel: 'Ninhos de Cristal Glacial (100% Ovos Titãs!)',
    bgGradient: 'from-slate-950 via-sky-950 to-indigo-950',
    accentColor: '#38bdf8',
    textColor: 'text-sky-300',
    borderColor: 'border-sky-400/40',
    nestRarityWeights: {
      comum: 0,
      raro: 0,
      epico: 0,
      lendario: 0,
      mitico: 0,
      tita: 100
    },
    enemies: [
      {
        id: 'guard_snow_1',
        name: 'Wyrm das Cavernas de Gelo',
        element: 'neve',
        level: 48,
        maxHp: 2900,
        currentHp: 2900,
        atk: 340,
        def: 310,
        spd: 290,
        rewardXp: 620,
        description: 'Serpente ártica com escamas de gelo pontiagudo que refletem o sol polar.',
        skills: [
          { name: 'Sopro da Geada', power: 105, desc: 'Gela o ar diminuindo o movimento.' },
          { name: 'Granizo Cortante', power: 140, desc: 'Pedras de gelo afiadas como lâminas.' }
        ]
      },
      {
        id: 'guard_snow_2',
        name: 'Monólito da Nevasca',
        element: 'neve',
        level: 62,
        maxHp: 3800,
        currentHp: 3800,
        atk: 385,
        def: 390,
        spd: 260,
        rewardXp: 900,
        description: 'Colosso blindado por geleiras eternas que guarda o topo da cordilheira.',
        skills: [
          { name: 'Avalanche Sísmica', power: 135, desc: 'Tombamento de blocos de gelo.' },
          { name: 'Congelamento Instantâneo', power: 180, desc: 'Impacto criogênico concentrado.' }
        ]
      }
    ]
  },

  // 5. BIOMA PÂNTANO
  {
    id: 'pantano',
    name: 'Bioma Pântano',
    tagline: 'Mangues das Brumas & Lama Tóxica',
    description: 'Um charco misterioso iluminado por fungos bioluminescentes e névoas venenosas. Seus ninhos são forrados com carapaças resistentes e musgos venenosos.',
    nestQualityLabel: 'Ninhos de Lama Venenosa (100% Ovos Titãs!)',
    bgGradient: 'from-slate-950 via-lime-950 to-emerald-950',
    accentColor: '#84cc16',
    textColor: 'text-lime-400',
    borderColor: 'border-lime-500/40',
    nestRarityWeights: {
      comum: 0,
      raro: 0,
      epico: 0,
      lendario: 0,
      mitico: 0,
      tita: 100
    },
    enemies: [
      {
        id: 'guard_swamp_1',
        name: 'Jacaré-Dracônico do Lodo',
        element: 'pantano',
        level: 38,
        maxHp: 2450,
        currentHp: 2450,
        atk: 280,
        def: 300,
        spd: 260,
        rewardXp: 440,
        description: 'Espreita sob as águas escuras esperando intrusos para arrastar ao fundo.',
        skills: [
          { name: 'Mordida Ácida', power: 85, desc: 'Dano corrosivo direto.' },
          { name: 'Jato de Lama Tóxica', power: 120, desc: 'Cega e envenena o alvo.' }
        ]
      },
      {
        id: 'guard_swamp_2',
        name: 'Quimera da Névoa Escura',
        element: 'pantano',
        level: 52,
        maxHp: 3100,
        currentHp: 3100,
        atk: 350,
        def: 290,
        spd: 330,
        rewardXp: 680,
        description: 'Voo silencioso que deixa um rastro de pólen tóxico pelas árvores murchas.',
        skills: [
          { name: 'Sopro Fétido', power: 110, desc: 'Nuvem asfixiante de gases sulfurosos.' },
          { name: 'Garras Necróticas', power: 155, desc: 'Arranhão infeccioso.' }
        ]
      }
    ]
  },

  // 6. BIOMA PLANÍCIE
  {
    id: 'planicie',
    name: 'Bioma Planície',
    tagline: 'Estepes Douradas & Céus do Vento Livre',
    description: 'Vastos campos ensolarados varridos por brisas constantes e manadas de feras selvagens. Os ninhos situam-se em montes rochosos banhados pelo sol da alvorada.',
    nestQualityLabel: 'Ninhos do Vento Solar (100% Ovos Titãs!)',
    bgGradient: 'from-slate-950 via-amber-950 to-yellow-950',
    accentColor: '#eab308',
    textColor: 'text-amber-400',
    borderColor: 'border-amber-500/40',
    nestRarityWeights: {
      comum: 0,
      raro: 0,
      epico: 0,
      lendario: 0,
      mitico: 0,
      tita: 100
    },
    enemies: [
      {
        id: 'guard_plains_1',
        name: 'Falcão-Dragão das Estepes',
        element: 'planicie',
        level: 35,
        maxHp: 2200,
        currentHp: 2200,
        atk: 310,
        def: 240,
        spd: 370,
        rewardXp: 400,
        description: 'Extremamente rápido e acrobático, mergulha em rasantes sobre a grama dourada.',
        skills: [
          { name: 'Mergulho Sônico', power: 85, desc: 'Ataque em alta velocidade.' },
          { name: 'Rajada de Poeira Dourada', power: 115, desc: 'Cega momentaneamente o oponente.' }
        ]
      },
      {
        id: 'guard_plains_2',
        name: 'Bisão Dracônico Couraçado',
        element: 'planicie',
        level: 50,
        maxHp: 3300,
        currentHp: 3300,
        atk: 340,
        def: 360,
        spd: 280,
        rewardXp: 650,
        description: 'Colosso terrestre que abala o solo com suas patadas vigorosas.',
        skills: [
          { name: 'Investida Terrestre', power: 120, desc: 'Carga maciça contra o alvo.' },
          { name: 'Onda Sísmica das Estepes', power: 160, desc: 'Fratura a terra sob os pés inimigos.' }
        ]
      }
    ]
  },
  {
    id: 'eletrico',
    name: 'Bioma Elétrico dos Titãs da Tempestade',
    tagline: 'Relâmpagos Cósmicos & Geradores Voltaicos na Ilha Secreta',
    description: 'Setor arcano na Ilha Secreta onde tempestades perpétuas e relâmpagos quânticos energizam os ninhos sagrados.',
    nestQualityLabel: 'Geradores Titânicos (100% Ovos Titãs!)',
    accentColor: '#00f0ff',
    textColor: 'text-cyan-400',
    bgGradient: 'from-cyan-950 via-blue-900 to-indigo-950',
    borderColor: 'border-cyan-400/40',
    nestRarityWeights: {
      comum: 0,
      raro: 0,
      epico: 0,
      lendario: 0,
      mitico: 0,
      tita: 100
    },
    enemies: [
      {
        id: 'guard_elec_1',
        name: 'Dragão dos Relâmpagos de Plasma',
        element: 'eletrico',
        level: 85,
        maxHp: 5500,
        currentHp: 5500,
        atk: 680,
        def: 520,
        spd: 620,
        rewardXp: 1200,
        description: 'Envolto em campos de plasma giratórios que descarregam megawatts instantaneamente.',
        skills: [
          { name: 'Arco Voltaico Megawatt', power: 220, desc: 'Corrente elétrica de alta tensão.' },
          { name: 'Tempestade de Íons', power: 290, desc: 'Tempestade ionizante em área.' }
        ]
      }
    ]
  }
];

export function generateEggFromBiome(biomeId: DragonElement): Egg {
  const biome = BIOMES.find(b => b.id === biomeId) || BIOMES[0];
  
  // Guaranteed TITAN Rarity for all nests in all biomes!
  const chosenRarity: DragonRarity = 'tita';
  const isRoboticApex = biomeId === 'robotico';

  // Hatch duration: fast & exciting 25 seconds for rapid hatching
  const duration = 25;

  const namesByElement: Record<DragonElement, string> = {
    magma: 'Ovo Titã de Magma Primordial',
    aquatico: 'Ovo Titã Abissal dos Mares Profundos',
    floresta: 'Ovo Titã da Seiva das Árvores-Mundo',
    robotico: 'OVO CIBERNÉTICO TITÂNIO-APEX',
    neve: 'Ovo Titã Glacial do Zero Absoluto',
    pantano: 'Ovo Titã das Brumas Venenosas',
    planicie: 'Ovo Titã das Estepes Douradas',
    ancestral: 'Ovo Titã Sagrado da Vila Ancestral',
    negro: 'Ovo Titã Obscuro do Bioma Negro',
    eletrico: 'Ovo Titã Voltaico da Tempestade Elétrica'
  };

  const patternMap: Record<DragonElement, Egg['design']['pattern']> = {
    magma: 'magma-cracks',
    aquatico: 'water-ripples',
    floresta: 'leaf-veins',
    robotico: 'circuit-lines',
    neve: 'ice-shards',
    pantano: 'rune-markings',
    planicie: 'rune-markings',
    ancestral: 'rune-markings',
    negro: 'rune-markings',
    eletrico: 'circuit-lines'
  };

  const glowColorMap: Record<DragonElement, string> = {
    magma: '#f97316',
    aquatico: '#38bdf8',
    floresta: '#22c55e',
    robotico: '#06b6d4',
    neve: '#bae6fd',
    pantano: '#a3e635',
    planicie: '#facc15',
    ancestral: '#f59e0b',
    negro: '#c084fc',
    eletrico: '#00f0ff'
  };

  return {
    id: `egg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: namesByElement[biomeId],
    element: biomeId,
    rarity: chosenRarity,
    hatchDurationSeconds: duration,
    timeRemaining: duration,
    biomeOrigin: biomeId,
    isRoboticApex,
    design: {
      baseColor: biome.accentColor,
      glowColor: glowColorMap[biomeId],
      spotsColor: '#facc15', // Golden Titan flecks on all eggs
      pattern: patternMap[biomeId]
    }
  };
}
