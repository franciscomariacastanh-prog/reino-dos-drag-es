import { RiderClothingItem, RiderCustomizationOptions } from '../types';

export const DEFAULT_RIDER_CUSTOMIZATION: RiderCustomizationOptions = {
  armorColor: '#27272a',
  goldAccentColor: '#eab308',
  clothColor: '#18181b',
  capeColor: '#7c2d12',
  visorGlowColor: '#f97316',
  skinColor: '#d4a373',
  helmetStyle: 'horns',
  capeStyle: 'flowing'
};

export const FREE_OUTFITS: RiderClothingItem[] = [
  {
    id: 'outfit_francisco_creator',
    name: 'Soberano Supremo Titã (Exclusivo Francisco)',
    category: 'outfit',
    description: 'Armadura celestial de ouro puro forjada no coração do mundo para Francisco. Concede coroa de dragão, capa estelar e aura de Mestre Titã.',
    isFree: true,
    previewColor: '#fbbf24',
    badge: '👑 EXCLUSIVO',
    properties: {
      armorColor: '#1c1917',
      goldAccentColor: '#f59e0b',
      clothColor: '#0f172a',
      capeColor: '#d97706',
      visorGlowColor: '#fbbf24',
      skinColor: '#e0a96d',
      helmetStyle: 'crown',
      capeStyle: 'royal'
    }
  },
  {
    id: 'outfit_magma',
    name: 'Cavaleiro do Fogo de Magma',
    category: 'outfit',
    description: 'Armadura de ferro forjada em rocha vulcânica com manto rubro e visor de lava incandescente.',
    isFree: true,
    previewColor: '#f97316',
    badge: 'Popular',
    properties: {
      armorColor: '#27272a',
      goldAccentColor: '#f59e0b',
      clothColor: '#1c1917',
      capeColor: '#991b1b',
      visorGlowColor: '#f97316',
      helmetStyle: 'horns',
      capeStyle: 'flowing'
    }
  },
  {
    id: 'outfit_celestial',
    name: 'Lorde Celeste do Trovão',
    category: 'outfit',
    description: 'Vestimenta cerimonial de aço reluzente e safira com capa azul tempestuoso e elmo alado.',
    isFree: true,
    previewColor: '#38bdf8',
    badge: 'Céus',
    properties: {
      armorColor: '#1e293b',
      goldAccentColor: '#38bdf8',
      clothColor: '#0f172a',
      capeColor: '#0284c7',
      visorGlowColor: '#38bdf8',
      helmetStyle: 'wings',
      capeStyle: 'royal'
    }
  },
  {
    id: 'outfit_forest',
    name: 'Guardião da Floresta Rúnica',
    category: 'outfit',
    description: 'Couros nobres élficos e placas de bronze esculpidas com manto verde musgo e capuz místico.',
    isFree: true,
    previewColor: '#22c55e',
    badge: 'Natureza',
    properties: {
      armorColor: '#14532d',
      goldAccentColor: '#84cc16',
      clothColor: '#1b2a1e',
      capeColor: '#166534',
      visorGlowColor: '#4ade80',
      helmetStyle: 'hood',
      capeStyle: 'flowing'
    }
  },
  {
    id: 'outfit_cyber',
    name: 'Piloto Cyber-Dracônico',
    category: 'outfit',
    description: 'Exoesqueleto de titânio futurista com luzes neon ciano, visor de combate e capa cibernética.',
    isFree: true,
    previewColor: '#06b6d4',
    badge: 'Apex Tech',
    properties: {
      armorColor: '#0f172a',
      goldAccentColor: '#06b6d4',
      clothColor: '#020617',
      capeColor: '#0891b2',
      visorGlowColor: '#22d3ee',
      helmetStyle: 'cyber',
      capeStyle: 'flowing'
    }
  },
  {
    id: 'outfit_void',
    name: 'Sombra do Abismo Vazio',
    category: 'outfit',
    description: 'Tecido etéreo das trevas cósmicas com detalhes em ametista e visor espectral violeta.',
    isFree: true,
    previewColor: '#a855f7',
    badge: 'Místico',
    properties: {
      armorColor: '#18181b',
      goldAccentColor: '#c084fc',
      clothColor: '#09090b',
      capeColor: '#581c87',
      visorGlowColor: '#c084fc',
      helmetStyle: 'hood',
      capeStyle: 'flowing'
    }
  },
  {
    id: 'outfit_frost',
    name: 'Paladino das Neves Eternas',
    category: 'outfit',
    description: 'Armadura pesada de prata ártica reluzente com capa azul glacial e chifres de gelo cristalino.',
    isFree: true,
    previewColor: '#93c5fd',
    badge: 'Glacial',
    properties: {
      armorColor: '#334155',
      goldAccentColor: '#cbd5e1',
      clothColor: '#1e293b',
      capeColor: '#1d4ed8',
      visorGlowColor: '#60a5fa',
      helmetStyle: 'wings',
      capeStyle: 'royal'
    }
  },
  {
    id: 'outfit_emperor',
    name: 'Imperador Soberano dos Dragões',
    category: 'outfit',
    description: 'Armadura nobre confeccionada inteiramente em ouro 24k com capa escarlate imperial e coroa.',
    isFree: true,
    previewColor: '#eab308',
    badge: 'Real',
    properties: {
      armorColor: '#ca8a04',
      goldAccentColor: '#fef08a',
      clothColor: '#451a03',
      capeColor: '#7f1d1d',
      visorGlowColor: '#facc15',
      helmetStyle: 'crown',
      capeStyle: 'royal'
    }
  },
  {
    id: 'outfit_nomad',
    name: 'Nômade Aventureiro dos Céus',
    category: 'outfit',
    description: 'Traje de viagem de couro leve, confortável para longas viagens aéreas sobre as nuvens.',
    isFree: true,
    previewColor: '#d97706',
    badge: 'Explorador',
    properties: {
      armorColor: '#451a03',
      goldAccentColor: '#f59e0b',
      clothColor: '#292524',
      capeColor: '#78350f',
      visorGlowColor: '#fbbf24',
      helmetStyle: 'none',
      capeStyle: 'tattered'
    }
  },
  {
    id: 'outfit_toxic',
    name: 'Alquimista do Pântano Venenoso',
    category: 'outfit',
    description: 'Armadura de escamas densas tratada com compostos alquímicos e capa verde musgosa.',
    isFree: true,
    previewColor: '#10b981',
    badge: 'Alquimia',
    properties: {
      armorColor: '#064e3b',
      goldAccentColor: '#34d399',
      clothColor: '#022c22',
      capeColor: '#065f46',
      visorGlowColor: '#10b981',
      helmetStyle: 'hood',
      capeStyle: 'flowing'
    }
  },
  {
    id: 'outfit_desert',
    name: 'Guerreiro das Dunas Solares',
    category: 'outfit',
    description: 'Armadura leve de bronze e seda das planícies com capa dourada e coroa radiante.',
    isFree: true,
    previewColor: '#e11d48',
    badge: 'Solar',
    properties: {
      armorColor: '#7c2d12',
      goldAccentColor: '#fbbf24',
      clothColor: '#3f2212',
      capeColor: '#b91c1c',
      visorGlowColor: '#f43f5e',
      helmetStyle: 'crown',
      capeStyle: 'royal'
    }
  }
];

export const FREE_HELMETS: RiderClothingItem[] = [
  {
    id: 'helm_horns',
    name: 'Elmo Dracônico de Guerra',
    category: 'helmet',
    description: 'Elmo clássico de aço temperado com chifres curvados de dragão.',
    isFree: true,
    previewColor: '#f59e0b',
    properties: {
      helmetStyle: 'horns'
    }
  },
  {
    id: 'helm_crown',
    name: 'Coroa Imperial dos Titãs',
    category: 'helmet',
    description: 'Coroa nobre forjada em ouro maciço ornada com joias elementais.',
    isFree: true,
    previewColor: '#eab308',
    properties: {
      helmetStyle: 'crown'
    }
  },
  {
    id: 'helm_wings',
    name: 'Elmo Alado de Valquíria',
    category: 'helmet',
    description: 'Elmo aerodinâmico adornado com asas de dragão para voo em alta velocidade.',
    isFree: true,
    previewColor: '#38bdf8',
    properties: {
      helmetStyle: 'wings'
    }
  },
  {
    id: 'helm_hood',
    name: 'Capuz Sombrio do Rastreador',
    category: 'helmet',
    description: 'Capuz místico confeccionado em tecido reforçado para viagens secretas.',
    isFree: true,
    previewColor: '#a855f7',
    properties: {
      helmetStyle: 'hood'
    }
  },
  {
    id: 'helm_cyber',
    name: 'Visor Holo-Tático Neon',
    category: 'helmet',
    description: 'Visor tático avançado com interface de navegação holográfica e mira ótica.',
    isFree: true,
    previewColor: '#06b6d4',
    properties: {
      helmetStyle: 'cyber'
    }
  },
  {
    id: 'helm_none',
    name: 'Sem Capacete (Cabelo Livre)',
    category: 'helmet',
    description: 'Cabelo estiloso ao vento livre sem capacete ou elmo na cabeça.',
    isFree: true,
    previewColor: '#d4a373',
    properties: {
      helmetStyle: 'none'
    }
  }
];

export const FREE_CAPES: RiderClothingItem[] = [
  {
    id: 'cape_flowing',
    name: 'Capa da Fúria de Magma',
    category: 'cape',
    description: 'Capa ondulante escarlate viva que tremula gloriosamente com a velocidade do dragão.',
    isFree: true,
    previewColor: '#dc2626',
    properties: {
      capeColor: '#991b1b',
      capeStyle: 'flowing'
    }
  },
  {
    id: 'cape_royal_blue',
    name: 'Manto do Céu Tempestuoso',
    category: 'cape',
    description: 'Capa real azul safira com corte largo e bordados prateados reluzentes.',
    isFree: true,
    previewColor: '#0284c7',
    properties: {
      capeColor: '#0284c7',
      capeStyle: 'royal'
    }
  },
  {
    id: 'cape_emerald',
    name: 'Manto da Aurora Esmeralda',
    category: 'cape',
    description: 'Tecido encantado que brilha com a vitalidade das grandes florestas primitivas.',
    isFree: true,
    previewColor: '#16a34a',
    properties: {
      capeColor: '#15803d',
      capeStyle: 'flowing'
    }
  },
  {
    id: 'cape_void',
    name: 'Capa do Vazio Cósmico',
    category: 'cape',
    description: 'Capa roxa escura que absorve a luz e emana uma suave névoa mágica.',
    isFree: true,
    previewColor: '#7c3aed',
    properties: {
      capeColor: '#581c87',
      capeStyle: 'flowing'
    }
  },
  {
    id: 'cape_gold',
    name: 'Capa Dourada Soberana',
    category: 'cape',
    description: 'Capa majestosa confeccionada com fios de ouro reluzentes para campeões.',
    isFree: true,
    previewColor: '#eab308',
    properties: {
      capeColor: '#a16207',
      capeStyle: 'royal'
    }
  },
  {
    id: 'cape_tattered',
    name: 'Manto Desgastado de Explorador',
    category: 'cape',
    description: 'Capa rústica de aventureiro experiente com cortes de batalha.',
    isFree: true,
    previewColor: '#78350f',
    properties: {
      capeColor: '#572c10',
      capeStyle: 'tattered'
    }
  },
  {
    id: 'cape_none',
    name: 'Sem Capa (Silhueta Limpa)',
    category: 'cape',
    description: 'Remova a capa para destacar a armadura dorsal e movimentos acrobáticos.',
    isFree: true,
    previewColor: '#71717a',
    properties: {
      capeStyle: 'none'
    }
  }
];

export const FREE_COLOR_DYES = [
  { id: 'dye_obsidian', name: 'Obsidiana Vulcânica', hex: '#18181b', type: 'armor' },
  { id: 'dye_steel', name: 'Aço de Batalha', hex: '#3f3f46', type: 'armor' },
  { id: 'dye_gold', name: 'Ouro Imperial', hex: '#ca8a04', type: 'armor' },
  { id: 'dye_silver', name: 'Prata Divina', hex: '#cbd5e1', type: 'armor' },
  { id: 'dye_cobalt', name: 'Cobalto Celeste', hex: '#1e3a8a', type: 'armor' },
  { id: 'dye_emerald', name: 'Esmeralda Antiga', hex: '#14532d', type: 'armor' },
  { id: 'dye_crimson', name: 'Carmesim Rubro', hex: '#7f1d1d', type: 'armor' },
  { id: 'dye_purple', name: 'Ametista Espectral', hex: '#4c1d95', type: 'armor' }
];

export const FREE_GLOW_DYES = [
  { id: 'glow_flame', name: 'Chama de Magma', hex: '#f97316' },
  { id: 'glow_cyan', name: 'Ciano Elétrico', hex: '#06b6d4' },
  { id: 'glow_emerald', name: 'Verde Rúnico', hex: '#22c55e' },
  { id: 'glow_purple', name: 'Púrpura Místico', hex: '#c084fc' },
  { id: 'glow_gold', name: 'Dourado Solar', hex: '#facc15' },
  { id: 'glow_ice', name: 'Azul Glacial', hex: '#60a5fa' },
  { id: 'glow_white', name: 'Luz Pura', hex: '#f8fafc' }
];
