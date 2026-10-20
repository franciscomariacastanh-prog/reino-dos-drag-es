import { Dragon, DragonSkill, Egg } from '../types';
import { ALL_ARMORS } from './armors';

export const STARTER_MAGMA_TITAN: Dragon = {
  id: 'dragon_magma_titan_initial',
  name: 'Ignis, o Titã de Magma',
  species: 'Colosso Vulcânico Ancestral',
  element: 'magma',
  rarity: 'tita',
  level: 100, // Começamos com um dragão de magma nível Titã permanente!
  maxLevel: 100,
  xp: 0,
  xpToNext: 0,
  hp: 4800,
  maxHp: 4800,
  atk: 520,
  def: 420,
  spd: 310,
  isTitanPermanent: true, // Permanente - nunca pode ser perdido
  title: 'Lorde do Núcleo da Terra',
  description: 'O dragão titânico supremo nascido nas entranhas do primeiro vulcão do mundo. Seu coração pulsa com lava a milhares de graus e suas escamas são impenetráveis.',
  discoveredAt: 'Guardião Inicial Permanente',
  visual: {
    primaryColor: '#ef4444', // Red-500
    secondaryColor: '#f97316', // Orange-500
    glowColor: '#fbbf24', // Amber-400
    hornStyle: 'titan-crown',
    wingStyle: 'draconic-fire',
    auraType: 'flames',
    skinStyle: 'obsidian-crag-scales'
  },
  skills: [
    {
      id: 'skill_magma_1',
      name: 'Mordida Incandescente',
      element: 'magma',
      power: 85,
      cooldown: 0,
      currentCooldown: 0,
      type: 'attack',
      description: 'Cravas dentes em brasa que inflamam a couraça inimiga.',
      particleEffect: 'flame-slash'
    },
    {
      id: 'skill_magma_2',
      name: 'Erupção Piroclástica',
      element: 'magma',
      power: 140,
      cooldown: 2,
      currentCooldown: 0,
      type: 'special',
      description: 'Lança um jato violento de magma borbulhante e cinzas vulcânicas cortantes.',
      particleEffect: 'volcano-burst'
    },
    {
      id: 'skill_magma_3',
      name: 'Bastião de Obsidiana',
      element: 'magma',
      power: 60,
      cooldown: 3,
      currentCooldown: 0,
      type: 'defense',
      description: 'Cria uma muralha de basalto fundido que concede escudo e reflete 30% do dano recebido.',
      particleEffect: 'shield-flame'
    },
    {
      id: 'skill_magma_4',
      name: 'Cataclismo do Titã',
      element: 'magma',
      power: 280,
      cooldown: 4,
      currentCooldown: 0,
      type: 'ultimate',
      description: 'Habilidade Suprema: Desperta toda a fúria do manto terrestre gerando terremoto de fogo e chuva de meteoros.',
      particleEffect: 'meteor-storm'
    }
  ],
  equippedArmor: {
    elmo: ALL_ARMORS.find(a => a.id === 'armor_magma_helm_1'),
    peitoral: ALL_ARMORS.find(a => a.id === 'armor_magma_chest_1'),
    asas: ALL_ARMORS.find(a => a.id === 'armor_magma_wings_1'),
    garras: ALL_ARMORS.find(a => a.id === 'armor_magma_claws_1')
  }
};

// Modelos de dragões que podem nascer dos ovos dos biomas
export const DRAGON_SPECIES_POOL = [
  // ================= ROBÓTICO (OS MELHORES NINHOS) =================
  {
    species: 'Mecha-Draco Cyber-Apex X-900',
    name: 'Cyber-Apex X-900',
    element: 'robotico' as const,
    rarity: 'tita' as const,
    title: 'Soberano Cibernético do Futuro',
    description: 'Chocado a partir do ninho de elite da Metrópole Cibernética. Equipado com micro-reator de plasma e blindagem nanotecnológica suprema.',
    baseHp: 4400,
    baseAtk: 490,
    baseDef: 450,
    baseSpd: 360,
    visual: {
      primaryColor: '#06b6d4', // Cyan-500
      secondaryColor: '#3b82f6', // Blue-500
      glowColor: '#a855f7', // Purple-500
      hornStyle: 'cyber-antennas' as const,
      wingStyle: 'mecha-jets' as const,
      auraType: 'plasma' as const
    },
    skills: [
      { id: 'rs1', name: 'Laser de Fótons', element: 'robotico' as const, power: 90, cooldown: 0, currentCooldown: 0, type: 'attack' as const, description: 'Disparo de feixes de laser contínuos.', particleEffect: 'laser-beam' },
      { id: 'rs2', name: 'Canhão de Plasma Dual', element: 'robotico' as const, power: 155, cooldown: 2, currentCooldown: 0, type: 'special' as const, description: 'Descarga devastadora de esferas de plasma elétrico.', particleEffect: 'plasma-blast' },
      { id: 'rs3', name: 'Barreira Nano-Magnética', element: 'robotico' as const, power: 75, cooldown: 3, currentCooldown: 0, type: 'defense' as const, description: 'Campo de força de partículas que anula projéteis.', particleEffect: 'cyber-shield' },
      { id: 'rs4', name: 'Protocolo Extermínio Orbital', element: 'robotico' as const, power: 295, cooldown: 4, currentCooldown: 0, type: 'ultimate' as const, description: 'Chama bombardeio iônico de satélite em órbita com dano supremo.', particleEffect: 'orbital-strike' }
    ]
  },
  {
    species: 'Androide Dracônico Sentinel-V',
    name: 'Sentinel-V',
    element: 'robotico' as const,
    rarity: 'mitico' as const,
    title: 'Sentinela Autônomo de Alta Liga',
    description: 'Um dragão de aço reforçado com inteligência quântica e asas propulsionadas por jatos.',
    baseHp: 3800,
    baseAtk: 410,
    baseDef: 390,
    baseSpd: 330,
    visual: {
      primaryColor: '#64748b',
      secondaryColor: '#0ea5e9',
      glowColor: '#38bdf8',
      hornStyle: 'cyber-antennas' as const,
      wingStyle: 'mecha-jets' as const,
      auraType: 'plasma' as const
    },
    skills: [
      { id: 'rs2_1', name: 'Corte Metálico', element: 'robotico' as const, power: 75, cooldown: 0, currentCooldown: 0, type: 'attack' as const, description: 'Golpe com garras de tungstênio.', particleEffect: 'metal-slash' },
      { id: 'rs2_2', name: 'Sobrecarga Voltaica', element: 'robotico' as const, power: 130, cooldown: 2, currentCooldown: 0, type: 'special' as const, description: 'Explosão elétrica de alta voltagem.', particleEffect: 'electric-burst' },
      { id: 'rs2_3', name: 'Escudo Anti-Pulso', element: 'robotico' as const, power: 50, cooldown: 3, currentCooldown: 0, type: 'defense' as const, description: 'Reforça as placas de armadura.', particleEffect: 'shield' },
      { id: 'rs2_4', name: 'Hiper-Raio Laser', element: 'robotico' as const, power: 240, cooldown: 4, currentCooldown: 0, type: 'ultimate' as const, description: 'Feixe concentrado com perfuração total de armadura.', particleEffect: 'hyper-beam' }
    ]
  },

  // ================= AQUÁTICO =================
  {
    species: 'Leviatã das Fossas Abissais',
    name: 'Thalassor',
    element: 'aquatico' as const,
    rarity: 'mitico' as const,
    title: 'Senhor dos Mares Negros',
    description: 'Habitante das profundezas oceânicas onde a luz nunca chega. Domina correntes titânicas e maremotos.',
    baseHp: 3900,
    baseAtk: 380,
    baseDef: 360,
    baseSpd: 290,
    visual: {
      primaryColor: '#0284c7',
      secondaryColor: '#06b6d4',
      glowColor: '#67e8f9',
      hornStyle: 'coral' as const,
      wingStyle: 'fin-wings' as const,
      auraType: 'tides' as const
    },
    skills: [
      { id: 'as1', name: 'Jato de Pressão Abissal', element: 'aquatico' as const, power: 80, cooldown: 0, currentCooldown: 0, type: 'attack' as const, description: 'Água em alta pressão cortante.', particleEffect: 'water-cut' },
      { id: 'as2', name: 'Vórtice Oceânico', element: 'aquatico' as const, power: 135, cooldown: 2, currentCooldown: 0, type: 'special' as const, description: 'Prende o oponente em um redemoinho esmagador.', particleEffect: 'vortex' },
      { id: 'as3', name: 'Casulo de Correntes', element: 'aquatico' as const, power: 65, cooldown: 3, currentCooldown: 0, type: 'defense' as const, description: 'Cura e reduz danos usando marés vivas.', particleEffect: 'water-shield' },
      { id: 'as4', name: 'Dilúvio do Tsunami Titânico', element: 'aquatico' as const, power: 260, cooldown: 4, currentCooldown: 0, type: 'ultimate' as const, description: 'Invoca uma onda monumental que arrasta tudo.', particleEffect: 'tsunami' }
    ]
  },

  // ================= FLORESTA =================
  {
    species: 'Draco da Seiva Primordial',
    name: 'Sylvanus',
    element: 'floresta' as const,
    rarity: 'lendario' as const,
    title: 'Guardião dos Bosques Esmeralda',
    description: 'Nascido da madeira sagrada da floresta primordial. Suas escamas são cascas inquebráveis e suas asas folhas mágicas.',
    baseHp: 3600,
    baseAtk: 350,
    baseDef: 370,
    baseSpd: 270,
    visual: {
      primaryColor: '#16a34a',
      secondaryColor: '#22c55e',
      glowColor: '#86efac',
      hornStyle: 'branching' as const,
      wingStyle: 'feathered' as const,
      auraType: 'spores' as const
    },
    skills: [
      { id: 'fs1', name: 'Chicote de Vinhas', element: 'floresta' as const, power: 75, cooldown: 0, currentCooldown: 0, type: 'attack' as const, description: 'Golpeia com espinhos vegetais.', particleEffect: 'vine-slash' },
      { id: 'fs2', name: 'Fúria dos Espinhos', element: 'floresta' as const, power: 125, cooldown: 2, currentCooldown: 0, type: 'special' as const, description: 'Saraivada de estacas de madeira afiada.', particleEffect: 'thorn-barrage' },
      { id: 'fs3', name: 'Regeneração Clorofiliana', element: 'floresta' as const, power: 80, cooldown: 3, currentCooldown: 0, type: 'defense' as const, description: 'Cura expressiva absorvendo luz.', particleEffect: 'nature-heal' },
      { id: 'fs4', name: 'Ira da Floresta Ancestral', element: 'floresta' as const, power: 235, cooldown: 4, currentCooldown: 0, type: 'ultimate' as const, description: 'Raízes gigantescas brotam do chão esmagando o inimigo.', particleEffect: 'earth-roots' }
    ]
  },

  // ================= NEVE =================
  {
    species: 'Glacius do Zero Absoluto',
    name: 'Glacius',
    element: 'neve' as const,
    rarity: 'lendario' as const,
    title: 'Emperador dos Picos Congelados',
    description: 'Suas asas esculpidas em gelo eterno desprendem cristais afiados. Sua presença congela rios instantaneamente.',
    baseHp: 3500,
    baseAtk: 370,
    baseDef: 350,
    baseSpd: 310,
    visual: {
      primaryColor: '#38bdf8',
      secondaryColor: '#e0f2fe',
      glowColor: '#bae6fd',
      hornStyle: 'crystal-spikes' as const,
      wingStyle: 'crystalline' as const,
      auraType: 'blizzard' as const
    },
    skills: [
      { id: 'ss1', name: 'Garras de Gelo Afiado', element: 'neve' as const, power: 78, cooldown: 0, currentCooldown: 0, type: 'attack' as const, description: 'Corte gélido que reduz velocidade inimiga.', particleEffect: 'ice-claw' },
      { id: 'ss2', name: 'Lança Glacial Perfurante', element: 'neve' as const, power: 130, cooldown: 2, currentCooldown: 0, type: 'special' as const, description: 'Dispara estalactites densas.', particleEffect: 'ice-spear' },
      { id: 'ss3', name: 'Armadura de Cristal Congelado', element: 'neve' as const, power: 65, cooldown: 3, currentCooldown: 0, type: 'defense' as const, description: 'Reveste o corpo com camada de gelo defensiva.', particleEffect: 'ice-armor' },
      { id: 'ss4', name: 'Nevasca do Zero Absoluto', element: 'neve' as const, power: 245, cooldown: 4, currentCooldown: 0, type: 'ultimate' as const, description: 'Queda drástica de temperatura que congela e estilhaça.', particleEffect: 'absolute-zero' }
    ]
  },

  // ================= PÂNTANO =================
  {
    species: 'Basilisco das Brumas Fétidas',
    name: 'Noxious',
    element: 'pantano' as const,
    rarity: 'epico' as const,
    title: 'Terror dos Mangues Venenosos',
    description: 'Serpe alada envolta em névoa tóxica escura. Suas presas gotejam veneno capaz de corroer rochas.',
    baseHp: 3400,
    baseAtk: 360,
    baseDef: 320,
    baseSpd: 300,
    visual: {
      primaryColor: '#84cc16',
      secondaryColor: '#4d7c0f',
      glowColor: '#a3e635',
      hornStyle: 'curved' as const,
      wingStyle: 'leather' as const,
      auraType: 'toxic' as const
    },
    skills: [
      { id: 'sw1', name: 'Mordida Envenenada', element: 'pantano' as const, power: 72, cooldown: 0, currentCooldown: 0, type: 'attack' as const, description: 'Inocula toxinas que queimam por turnos.', particleEffect: 'poison-bite' },
      { id: 'sw2', name: 'Nuvem de Miasma Corrosiva', element: 'pantano' as const, power: 120, cooldown: 2, currentCooldown: 0, type: 'special' as const, description: 'Fumaça púrpura corrosiva que enfraquece a defesa.', particleEffect: 'miasma-cloud' },
      { id: 'sw3', name: 'Camufalgem de Lodo', element: 'pantano' as const, power: 55, cooldown: 3, currentCooldown: 0, type: 'defense' as const, description: 'Esconde-se no pântano, aumentando esquiva.', particleEffect: 'swamp-stealth' },
      { id: 'sw4', name: 'Peste Negra do Pântano', element: 'pantano' as const, power: 220, cooldown: 4, currentCooldown: 0, type: 'ultimate' as const, description: 'Onda letal de vapores venenosos que consome a vitalidade.', particleEffect: 'toxic-plague' }
    ]
  },

  // ================= PLANÍCIE =================
  {
    species: 'Zephyrus dos Ventos Galopantes',
    name: 'Zephyrus',
    element: 'planicie' as const,
    rarity: 'epico' as const,
    title: 'Guardião Alado das Estepes Douradas',
    description: 'O mais ágil entre os dragões alados. Seus voos rasantes sobre as planícies criam tornados de poeira dourada.',
    baseHp: 3300,
    baseAtk: 365,
    baseDef: 310,
    baseSpd: 380,
    visual: {
      primaryColor: '#eab308',
      secondaryColor: '#fef08a',
      glowColor: '#facc15',
      hornStyle: 'curved' as const,
      wingStyle: 'feathered' as const,
      auraType: 'wind' as const
    },
    skills: [
      { id: 'pl1', name: 'Golpe de Asa Cortante', element: 'planicie' as const, power: 76, cooldown: 0, currentCooldown: 0, type: 'attack' as const, description: 'Dispara lâminas de vento sônico.', particleEffect: 'wind-blade' },
      { id: 'pl2', name: 'Tufão Dourado', element: 'planicie' as const, power: 128, cooldown: 2, currentCooldown: 0, type: 'special' as const, description: 'Redemoinho veloz que desorienta o inimigo.', particleEffect: 'tornado' },
      { id: 'pl3', name: 'Vento de Cauda Acelerador', element: 'planicie' as const, power: 50, cooldown: 3, currentCooldown: 0, type: 'defense' as const, description: 'Aumenta a velocidade e reflexos em 40%.', particleEffect: 'tailwind' },
      { id: 'pl4', name: 'Tempestade dos Quatro Ventos', element: 'planicie' as const, power: 225, cooldown: 4, currentCooldown: 0, type: 'ultimate' as const, description: 'Converge correntes de tempestade desferindo múltiplos impactos sonoros.', particleEffect: 'storm-cyclone' }
    ]
  },

  // ================= VILA ANCESTRAL (EXCLUSIVO ILHA SECRETA) =================
  {
    species: 'Colosso Místico da Vila Ancestral',
    name: 'Chronos',
    element: 'ancestral' as const,
    rarity: 'tita' as const,
    title: 'Soberano Primordial da Ilha Secreta',
    description: 'Habitante lendário das ruínas sagradas da Vila Ancestral. Canaliza runas do alvorecer do mundo e seu rugido reverbera através do tempo.',
    baseHp: 4700,
    baseAtk: 495,
    baseDef: 450,
    baseSpd: 360,
    visual: {
      primaryColor: '#fef3c7',
      secondaryColor: '#f59e0b',
      glowColor: '#fbbf24',
      hornStyle: 'branching' as const,
      wingStyle: 'feathered' as const,
      auraType: 'wind' as const
    },
    skills: [
      { id: 'anc1', name: 'Golpe de Runa Primordial', element: 'ancestral' as const, power: 88, cooldown: 0, currentCooldown: 0, type: 'attack' as const, description: 'Lança estilhaços de relíquias rúnicas sagradas.', particleEffect: 'rune-strike' },
      { id: 'anc2', name: 'Feixe Celestial da Vila Ancestral', element: 'ancestral' as const, power: 145, cooldown: 2, currentCooldown: 0, type: 'special' as const, description: 'Dispara um pilar dourado de energia ancestral.', particleEffect: 'solar-beam' },
      { id: 'anc3', name: 'Égide dos Mil Milênios', element: 'ancestral' as const, power: 75, cooldown: 3, currentCooldown: 0, type: 'defense' as const, description: 'Barreira impenetrável erguida pelos espíritos antigos.', particleEffect: 'ancient-barrier' },
      { id: 'anc4', name: 'Julgamento dos Deuses Ancestrais', element: 'ancestral' as const, power: 260, cooldown: 4, currentCooldown: 0, type: 'ultimate' as const, description: 'Onda cósmica devastadora que purifica o campo de batalha.', particleEffect: 'cosmic-judgment' }
    ]
  },

  // ================= BIOMA NEGRO (EXCLUSIVO ILHA SECRETA) =================
  {
    species: 'Dragão do Abismo das Trevas',
    name: 'Nyx',
    element: 'negro' as const,
    rarity: 'tita' as const,
    title: 'Lorde do Eclipse do Bioma Negro',
    description: 'Nascido da matéria escura mais densa do Bioma Negro na Ilha Secreta. Suas asas devoram raios de luz e seu sopro oblitera os adversários no vácuo.',
    baseHp: 4800,
    baseAtk: 515,
    baseDef: 435,
    baseSpd: 375,
    visual: {
      primaryColor: '#0a0910',
      secondaryColor: '#581c87',
      glowColor: '#c084fc',
      hornStyle: 'curved' as const,
      wingStyle: 'draconic-fire' as const,
      auraType: 'plasma' as const
    },
    skills: [
      { id: 'neg1', name: 'Garras do Vazio Negro', element: 'negro' as const, power: 92, cooldown: 0, currentCooldown: 0, type: 'attack' as const, description: 'Talho de pura matéria escura que ignora parte da armadura.', particleEffect: 'dark-claw' },
      { id: 'neg2', name: 'Chamas Obscuras Devoradoras', element: 'negro' as const, power: 150, cooldown: 2, currentCooldown: 0, type: 'special' as const, description: 'Fogo negro e púrpura que incinera almas.', particleEffect: 'black-fire' },
      { id: 'neg3', name: 'Manto da Escuridão Absoluta', element: 'negro' as const, power: 70, cooldown: 3, currentCooldown: 0, type: 'defense' as const, description: 'Dissolve o dragão nas sombras aumentando esquiva e defesas.', particleEffect: 'void-cloak' },
      { id: 'neg4', name: 'Singularidade de Buraco Negro', element: 'negro' as const, power: 275, cooldown: 4, currentCooldown: 0, type: 'ultimate' as const, description: 'Abre um vórtice gravitacional que colapsa os inimigos no vazio.', particleEffect: 'black-hole' }
    ]
  }
];

export function createDragonFromEgg(egg: Egg): Dragon {
  // Find matching template or choose from element pool
  const matches = DRAGON_SPECIES_POOL.filter(p => p.element === egg.element);
  const template = matches.length > 0 ? matches[Math.floor(Math.random() * matches.length)] : DRAGON_SPECIES_POOL[0];
  
  // Calculate level based on egg rarity
  let initialLevel = 15;
  if (egg.rarity === 'epico') initialLevel = 30;
  if (egg.rarity === 'lendario') initialLevel = 50;
  if (egg.rarity === 'mitico') initialLevel = 75;
  if (egg.rarity === 'tita') initialLevel = 90;

  const mult = 0.8 + (initialLevel * 0.015);
  const hp = Math.round(template.baseHp * mult);
  const atk = Math.round(template.baseAtk * mult);
  const def = Math.round(template.baseDef * mult);
  const spd = Math.round(template.baseSpd * mult);

  // Give a set piece of matching element armor as a gift
  const matchingArmors = ALL_ARMORS.filter(a => a.element === egg.element);
  const freeArmorPiece = matchingArmors[Math.floor(Math.random() * matchingArmors.length)];
  const initialArmors = freeArmorPiece ? { [freeArmorPiece.slot]: freeArmorPiece } : {};

  const isTitan = egg.rarity === 'tita' || egg.isRoboticApex;

  return {
    id: `dragon_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name: isTitan ? `Titã ${template.name} #${Math.floor(100 + Math.random() * 900)}` : `${template.name} #${Math.floor(100 + Math.random() * 900)}`,
    species: isTitan ? `Titã Supremo ${template.species}` : template.species,
    element: template.element,
    rarity: egg.rarity,
    level: initialLevel,
    maxLevel: 100,
    xp: 0,
    xpToNext: initialLevel * 100,
    hp,
    maxHp: hp,
    atk,
    def,
    spd,
    isTitanPermanent: isTitan,
    title: isTitan ? `Titã Supremo dos Céus de ${template.element.toUpperCase()}` : template.title,
    description: isTitan
      ? `Nascido de um legítimo Ovo Titã coletado nos ninhos do continente. Possui poder primordial avassalador e aura de Titã permanente.`
      : template.description,
    discoveredAt: `Eclodido da Incubadora (Origem: ${egg.biomeOrigin.toUpperCase()})`,
    visual: template.visual,
    skills: template.skills.map(s => ({ ...s })),
    equippedArmor: initialArmors
  };
}
