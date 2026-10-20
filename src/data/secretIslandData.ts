import { Egg } from '../types';

export const SECRET_ISLAND_CONFIG = {
  // Secret Passage Portal on the Snow Mountain
  snowMountainPassage: {
    x: -30,
    y: 72,
    z: 665,
    name: 'Passagem Secreta da Montanha Glacial',
    description: 'Portal arcano oculto entre as rochas e cristais de gelo permafrost que conecta o continente à Ilha Secreta Perdida.'
  },
  
  // The Secret Island Coordinates (Mystical Lost Realm)
  islandCenter: {
    x: 2600,
    y: 126,
    z: 2600,
    name: 'Ilha Secreta Perdida: Vila Ancestral & Bioma Negro',
    description: 'Ilha flutuante lendária envolta em névoa mística e energia do vácuo. Abriga a Vila Ancestral e o Abismo Negro.'
  },

  // Ancestral Village (West Side)
  ancestralVillage: {
    x: 2515,
    y: 126,
    z: 2570,
    nestId: 'nest-secret-ancestral',
    name: 'Vila Ancestral Sagrada',
    nestName: 'Altar Rúnico dos Deuses Ancestrais',
    color: '#fbbf24',
    glowColor: '#f59e0b'
  },

  // Dark Void Biome (East Side)
  darkVoidBiome: {
    x: 2685,
    y: 126,
    z: 2630,
    nestId: 'nest-secret-negro',
    name: 'Bioma Negro do Abismo das Trevas',
    nestName: 'Cripta de Obsidiana do Vazio Negro',
    color: '#a855f7',
    glowColor: '#7e22ce'
  },

  // Electric Storm Biome (North Side of Secret Island)
  electricBiome: {
    x: 2600,
    y: 126,
    z: 2725,
    nestId: 'nest-secret-eletrico',
    name: 'Bioma Elétrico dos Titãs da Tempestade',
    nestName: 'Gerador Cósmico de Relâmpagos Titânicos',
    color: '#00f0ff',
    glowColor: '#facc15'
  }
};

/**
 * Generates the exclusive eggs that can ONLY be collected in 3D on the Secret Island!
 * (Or collected remotely by Francisco, the Master Creator!)
 */
export function generateSecretIslandEgg(element: 'ancestral' | 'negro' | 'eletrico'): Egg {
  if (element === 'ancestral') {
    return {
      id: `egg_secret_ancestral_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: 'Ovo Titã Sagrado da Vila Ancestral',
      element: 'ancestral',
      rarity: 'tita',
      hatchDurationSeconds: 25,
      timeRemaining: 25,
      biomeOrigin: 'ancestral',
      isSecretIslandExclusive: true,
      design: {
        baseColor: '#fde68a',
        glowColor: '#f59e0b',
        spotsColor: '#d97706',
        pattern: 'rune-markings'
      }
    };
  } else if (element === 'negro') {
    return {
      id: `egg_secret_negro_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: 'Ovo Titã Obscuro do Bioma Negro',
      element: 'negro',
      rarity: 'tita',
      hatchDurationSeconds: 25,
      timeRemaining: 25,
      biomeOrigin: 'negro',
      isSecretIslandExclusive: true,
      design: {
        baseColor: '#1e1b4b',
        glowColor: '#c084fc',
        spotsColor: '#9333ea',
        pattern: 'rune-markings'
      }
    };
  } else {
    return {
      id: `egg_secret_eletrico_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: 'Ovo Titã Voltaico da Tempestade Elétrica',
      element: 'eletrico',
      rarity: 'tita',
      hatchDurationSeconds: 25,
      timeRemaining: 25,
      biomeOrigin: 'eletrico',
      isSecretIslandExclusive: true,
      design: {
        baseColor: '#082f49',
        glowColor: '#facc15',
        spotsColor: '#00f0ff',
        pattern: 'circuit-lines'
      }
    };
  }
}

/**
 * Returns all 3 Secret Island exclusive eggs for remote collection
 */
export function getAllSecretIslandEggs(): Egg[] {
  return [
    generateSecretIslandEgg('ancestral'),
    generateSecretIslandEgg('negro'),
    generateSecretIslandEgg('eletrico')
  ];
}
