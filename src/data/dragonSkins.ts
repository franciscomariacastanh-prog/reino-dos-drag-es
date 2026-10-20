import { DragonSkinStyle, DragonElement } from '../types';

export interface DragonSkinDefinition {
  id: DragonSkinStyle;
  name: string;
  category: string;
  tagline: string;
  description: string;
  rarity: 'raro' | 'epico' | 'lendario' | 'tita';
  recommendedElement?: DragonElement;
  primaryColor: string;
  secondaryColor: string;
  emissiveColor: string;
  bumpScale: number;
  roughness: number;
  metalness: number;
  emissiveIntensity: number;
  features: string[];
  gradientBadge: string;
}

export const DRAGON_SKINS: DragonSkinDefinition[] = [
  {
    id: 'realistic-drake-scales',
    name: 'Titã Drake Realista',
    category: 'Anatomia Realista',
    tagline: 'Escamas queratínicas esculpidas com relevo 3D de alta definição',
    description: 'Textura de derme reptiliana ancestral inspirada nos maiores répteis ápice. Cada escama possui facetas micro-sulcadas, bordas reflexivas e fendas profundas de oclusão que reagem à luz do sol.',
    rarity: 'tita',
    primaryColor: '#1c1917',
    secondaryColor: '#ea580c',
    emissiveColor: '#f97316',
    bumpScale: 0.12,
    roughness: 0.48,
    metalness: 0.15,
    emissiveIntensity: 0.5,
    features: [
      'Escamas 3D com curvatura esférica e relevo pronunciado',
      'Micro-poros dérmicos e ranhuras longitudinais',
      'Membranas alares com rede vascular capilar translúcida',
      'Olhos reptilianos com fenda vertical e reflexo corneano'
    ],
    gradientBadge: 'from-amber-700 via-orange-600 to-stone-900'
  },
  {
    id: 'obsidian-crag-scales',
    name: 'Obsidiana Vulcânica & Fogo Rúnico',
    category: 'Magma & Chamas',
    tagline: 'Placas de basalto vulcânico com veias de lava incandescente ativa',
    description: 'Escamas de rocha vulcânica vítrea e obsidiana negra endurecida sob pressões do manto terrestre. Entre as placas rochosas correm fendas de magma líquido borbulhante e brasas radiantes.',
    rarity: 'lendario',
    recommendedElement: 'magma',
    primaryColor: '#140c0a',
    secondaryColor: '#dc2626',
    emissiveColor: '#ff5500',
    bumpScale: 0.14,
    roughness: 0.62,
    metalness: 0.25,
    emissiveIntensity: 1.1,
    features: [
      'Fissuras de lava líquida entre as placas de obsidiana',
      'Placas dorsais com aspecto de rocha magmática rugosa',
      'Asas com nervuras de fogo em brasa incandescente',
      'Cornos basálticos com pontas de diamante em brasa'
    ],
    gradientBadge: 'from-red-600 via-orange-600 to-stone-950'
  },
  {
    id: 'glacial-frost-crystal',
    name: 'Glaciar Permafrost Cristalino',
    category: 'Gelo Perpétuo',
    tagline: 'Facetas de gelo cristalino translúcido com brilho de diamante',
    description: 'Armadura dérmica forjada no coração da montanha de gelo eterno. Escamas hexagonais de gelo permafrost que refratam a luz em reflexos azul-celestes e dispersão prismática.',
    rarity: 'lendario',
    recommendedElement: 'neve',
    primaryColor: '#0f172a',
    secondaryColor: '#38bdf8',
    emissiveColor: '#e0f2fe',
    bumpScale: 0.09,
    roughness: 0.22,
    metalness: 0.45,
    emissiveIntensity: 0.85,
    features: [
      'Superfície vítrea de gelo com alta especularidade diamantífera',
      'Cristais pontiagudos de permafrost nos espigões dorsais',
      'Membrana alar translúcida com cristais dendríticos de geada',
      'Olhos azuis glaciais com pupila em fenda brilhante'
    ],
    gradientBadge: 'from-sky-500 via-blue-600 to-indigo-950'
  },
  {
    id: 'cyber-apex-nano-composite',
    name: 'Cyber-Apex Nano-Blindagem',
    category: 'Tecnologia Apex',
    tagline: 'Nano-composto de fibra de carbono com trilhas quânticas iluminadas',
    description: 'O ápice da engenharia mecânica dos Titãs. Placas de liga de titânio escovado e fibra de carbono entrelaçada com circuitos nano-quânticos integrados pulsando em energia neon.',
    rarity: 'tita',
    recommendedElement: 'robotico',
    primaryColor: '#090d16',
    secondaryColor: '#00f0ff',
    emissiveColor: '#22d3ee',
    bumpScale: 0.08,
    roughness: 0.28,
    metalness: 0.88,
    emissiveIntensity: 1.25,
    features: [
      'Tecelagem de micro-hexágonos em fibra de carbono realística',
      'Condutores quânticos luminescentes com pulsos de luz',
      'Placas articuladas de titânio usinado com acabamento acetinado',
      'Propulsores de asas com grelhas de ventilação iônica'
    ],
    gradientBadge: 'from-cyan-500 via-blue-600 to-slate-950'
  },
  {
    id: 'abyssal-leviathan-bioluminescent',
    name: 'Leviatã Abissal Bioluminescente',
    category: 'Profundezas Oceânicas',
    tagline: 'Escamas marinhas madrepérola com fotóforos bioluminescentes',
    description: 'Inspirado nos predadores ápice das fossas abissais do oceano. Escamas flexíveis hidrodinâmicas com iridescência madrepérola e padrões de órgãos luminosos bioluminescentes ciano.',
    rarity: 'tita',
    recommendedElement: 'aquatico',
    primaryColor: '#031726',
    secondaryColor: '#06b6d4',
    emissiveColor: '#38bdf8',
    bumpScale: 0.07,
    roughness: 0.25,
    metalness: 0.35,
    emissiveIntensity: 0.95,
    features: [
      'Iridescência madrepérola com reflexos subaquáticos',
      'Fotóforos e veias bioluminescentes ao longo da crista dorsal',
      'Membranas alares fluídas com aspecto de barbatana de arraia gigante',
      'Placas ventrais impermeáveis de textura aquática suave'
    ],
    gradientBadge: 'from-teal-500 via-cyan-600 to-sky-950'
  },
  {
    id: 'ancient-runic-gold',
    name: 'Ouro Sagrado Imperial dos Titãs',
    category: 'Ancestral Divino',
    tagline: 'Escamas douradas com filigrana e runas celestiais gravadas',
    description: 'Uma pele lendária concedida aos fundadores do Santuário. Placas de ouro puro celestial reforçadas com runas titânicas gravadas em baixo relevo que canalizam a energia da criação.',
    rarity: 'tita',
    recommendedElement: 'ancestral',
    primaryColor: '#2d1f05',
    secondaryColor: '#eab308',
    emissiveColor: '#fef08a',
    bumpScale: 0.11,
    roughness: 0.32,
    metalness: 0.82,
    emissiveIntensity: 0.9,
    features: [
      'Entalhes rúnicos ancestrais emitindo luz solar pura',
      'Placas esculpidas de ouro martelado com brilho nobre',
      'Cornos e garras em bronze polido com pontas facetadas',
      'Aura dourada e asas com constelações sacras bordadas'
    ],
    gradientBadge: 'from-amber-400 via-yellow-600 to-amber-950'
  },
  {
    id: 'celestial-lightning-plasma',
    name: 'Tempestade & Raios Cósmicos',
    category: 'Eletricidade Primordial',
    tagline: 'Escamas cobalto ionizadas percorridas por arcos elétricos vivos',
    description: 'Armadura biológica forjada nas nuvens de plasma da Ilha Secreta. O dragão ressoa como uma bobina de alta tensão, com filamentos elétricos azuis e dourados percorrendo sua espinha.',
    rarity: 'lendario',
    recommendedElement: 'eletrico',
    primaryColor: '#051829',
    secondaryColor: '#00f0ff',
    emissiveColor: '#facc15',
    bumpScale: 0.1,
    roughness: 0.35,
    metalness: 0.6,
    emissiveIntensity: 1.3,
    features: [
      'Trilhas dérmicas condutivas com arcos de plasma vivos',
      'Coloração cobalto ionizado com transição elétrica ciano-ouro',
      'Crista dorsal com espículas tesla de descarga contínua',
      'Membrana alar transparente percorrida por relâmpagos ramificados'
    ],
    gradientBadge: 'from-cyan-400 via-blue-500 to-yellow-500'
  },
  {
    id: 'void-shadow-umbral',
    name: 'Vazio Negro do Abismo',
    category: 'Sombra & Trevas',
    tagline: 'Obsidiana fosca devoradora de luz com fendas de matéria escura',
    description: 'Nascido nas regiões sem luz do cosmos. Suas escamas de textura aveludada absorvem a iluminação ambiente, revelando fissuras roxas pulsantes de energia do vazio estelar.',
    rarity: 'lendario',
    recommendedElement: 'negro',
    primaryColor: '#05040a',
    secondaryColor: '#7c3aed',
    emissiveColor: '#c084fc',
    bumpScale: 0.12,
    roughness: 0.65,
    metalness: 0.3,
    emissiveIntensity: 1.0,
    features: [
      'Placas ultra-escuras que geram contraste visual dramático',
      'Veias de nébula cósmica roxa luminescente',
      'Olhos cor de ametista em chamas etéreas',
      'Asas com degradê de matéria escura e poeira estelar'
    ],
    gradientBadge: 'from-purple-600 via-violet-800 to-zinc-950'
  },
  {
    id: 'emerald-forest-wyrm',
    name: 'Serpente Real da Floresta',
    category: 'Vida Ancestral',
    tagline: 'Escamas de jade natural com veios de seiva dourada e musgo perene',
    description: 'Criatura mística dos bosques milenares. Escamas sobrepostas semelhantes a folhagens endurecidas de jade, com espinhos de madeira fóssil e garras de âmbar polido.',
    rarity: 'raro',
    recommendedElement: 'floresta',
    primaryColor: '#0a1e0f',
    secondaryColor: '#16a34a',
    emissiveColor: '#4ade80',
    bumpScale: 0.1,
    roughness: 0.42,
    metalness: 0.18,
    emissiveIntensity: 0.6,
    features: [
      'Escamas imbricadas em tom jade profundo com reflexos esmeralda',
      'Garras de âmbar dourado fossilizado de alta dureza',
      'Placas ventrais coriáceas de casca antiga',
      'Membranas alares com venação botânica delicada'
    ],
    gradientBadge: 'from-emerald-500 via-green-700 to-stone-950'
  },
  {
    id: 'toxic-swamp-hydra',
    name: 'Hidra do Pântano Tóxico',
    category: 'Veneno & Pântano',
    tagline: 'Carapaça de besouro titã com iridescência tóxica verde-limão',
    description: 'Armadura dérmica venenosa forjada nos mangues venenosos. As escamas possuem micro-ranhuras ópticas que alternam entre verde ácido, púrpura profundo e preto brilhante.',
    rarity: 'epico',
    recommendedElement: 'pantano',
    primaryColor: '#111807',
    secondaryColor: '#84cc16',
    emissiveColor: '#a3e635',
    bumpScale: 0.11,
    roughness: 0.38,
    metalness: 0.4,
    emissiveIntensity: 0.75,
    features: [
      'Efeito iridescente dicroico tipo carapaça de escaravelho',
      'Gânglios bioluminescentes de veneno corrosivo',
      'Espigões dorsais curvos e afiados com resíduos ácidos',
      'Olhos dourados predatórios com pupila elíptica fendida'
    ],
    gradientBadge: 'from-lime-500 via-emerald-800 to-zinc-950'
  }
];

export function getSkinDefinition(style?: DragonSkinStyle): DragonSkinDefinition {
  if (!style) return DRAGON_SKINS[0];
  const found = DRAGON_SKINS.find(s => s.id === style);
  return found || DRAGON_SKINS[0];
}

export function getDefaultSkinForElement(element: DragonElement): DragonSkinStyle {
  switch (element) {
    case 'magma':
      return 'obsidian-crag-scales';
    case 'aquatico':
      return 'abyssal-leviathan-bioluminescent';
    case 'robotico':
      return 'cyber-apex-nano-composite';
    case 'neve':
      return 'glacial-frost-crystal';
    case 'ancestral':
      return 'ancient-runic-gold';
    case 'eletrico':
      return 'celestial-lightning-plasma';
    case 'negro':
      return 'void-shadow-umbral';
    case 'floresta':
      return 'emerald-forest-wyrm';
    case 'pantano':
      return 'toxic-swamp-hydra';
    case 'planicie':
    default:
      return 'realistic-drake-scales';
  }
}
