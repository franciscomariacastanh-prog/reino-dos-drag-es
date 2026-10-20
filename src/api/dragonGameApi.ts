import { Dragon, Egg, Biome, WildGuardian, DragonElement } from '../types';
import { BIOMES, generateEggFromBiome } from '../data/biomes';
import { generateSecretIslandEgg } from '../data/secretIslandData';

export interface World3DCollectResult {
  success: boolean;
  egg?: Egg;
  xpEarned?: number;
  message: string;
}

export interface World3DNestInfo {
  id: string;
  biomeId: DragonElement;
  biomeName: string;
  position: [number, number, number];
  eggRarity: string;
  isBestNest?: boolean;
  color: string;
  glowColor: string;
  ready: boolean;
  cooldownSeconds?: number;
}

export interface World3DTargetCrystal {
  id: string;
  position: [number, number, number];
  hp: number;
  maxHp: number;
  color: string;
  xpReward: number;
}

/**
 * Game API for Dragon Adventures 3D & Sanctuary
 * Bridges the 3D world engine with application state and storage
 */
export class DragonGameApi {
  /**
   * Generates initial 3D nests stationed across the thematic biome islands
   */
  public static get3DWorldNests(): World3DNestInfo[] {
    return [
      {
        id: 'nest-magma-caldera',
        biomeId: 'magma',
        biomeName: 'Vulcão do Titã de Magma',
        position: [0, 52, -540],
        eggRarity: 'tita',
        color: '#f97316',
        glowColor: '#ef4444',
        ready: true
      },
      {
        id: 'nest-robotic-apex',
        biomeId: 'robotico',
        biomeName: 'Cidadela Robótica Apex',
        position: [580, 44, 130],
        eggRarity: 'tita',
        isBestNest: true, // Special high-tier robotic nest
        color: '#06b6d4',
        glowColor: '#22d3ee',
        ready: true
      },
      {
        id: 'nest-aquatic-shrine',
        biomeId: 'aquatico',
        biomeName: 'Lagoa Abissal Aquática',
        position: [430, 24, -430],
        eggRarity: 'tita',
        color: '#3b82f6',
        glowColor: '#60a5fa',
        ready: true
      },
      {
        id: 'nest-mystic-forest',
        biomeId: 'floresta',
        biomeName: 'Bosque Ancestral',
        position: [-540, 42, -200],
        eggRarity: 'tita',
        color: '#10b981',
        glowColor: '#34d399',
        ready: true
      },
      {
        id: 'nest-swamp-bayou',
        biomeId: 'pantano',
        biomeName: 'Pântano Sombrio Venenoso',
        position: [-490, 32, 440],
        eggRarity: 'tita',
        color: '#84cc16',
        glowColor: '#a855f7',
        ready: true
      },
      {
        id: 'nest-frost-peak',
        biomeId: 'neve',
        biomeName: 'Glaciar de Permafrost',
        position: [40, 18, 495],
        eggRarity: 'tita',
        color: '#93c5fd',
        glowColor: '#e0f2fe',
        ready: true
      },
      {
        id: 'nest-celestial-plateau',
        biomeId: 'planicie',
        biomeName: 'Platô das Planícies',
        position: [440, 42, 530],
        eggRarity: 'tita',
        color: '#eab308',
        glowColor: '#fef08a',
        ready: true
      },
      // Ninhos dos Grandes Continentes Externos (+999999999999999999% Expandidos)
      {
        id: 'nest-outer-supervolcano',
        biomeId: 'magma',
        biomeName: 'Super-Vulcão Apocalíptico Titã',
        position: [-1200, 140, -4500],
        eggRarity: 'tita',
        color: '#f97316',
        glowColor: '#ff2200',
        ready: true
      },
      {
        id: 'nest-outer-cyber-megacity',
        biomeId: 'robotico',
        biomeName: 'Megacidade Apex Quântica Titã',
        position: [5200, 120, 2200],
        eggRarity: 'tita',
        isBestNest: true,
        color: '#06b6d4',
        glowColor: '#00ffff',
        ready: true
      },
      {
        id: 'nest-outer-abyssal-ocean',
        biomeId: 'aquatico',
        biomeName: 'Fossa Oceânica Abissal dos Titãs',
        position: [4800, 85, -4800],
        eggRarity: 'tita',
        color: '#0284c7',
        glowColor: '#38bdf8',
        ready: true
      },
      {
        id: 'nest-outer-worldtree-forest',
        biomeId: 'floresta',
        biomeName: 'Megabosque das Árvores-Mundo Titãs',
        position: [-5400, 110, -3200],
        eggRarity: 'tita',
        color: '#15803d',
        glowColor: '#4ade80',
        ready: true
      },
      {
        id: 'nest-outer-hyperborean-ice',
        biomeId: 'neve',
        biomeName: 'Picos Hiperbóreos do Fim do Mundo',
        position: [800, 160, 5500],
        eggRarity: 'tita',
        color: '#bae6fd',
        glowColor: '#ffffff',
        ready: true
      },
      {
        id: 'nest-outer-golden-steppes',
        biomeId: 'planicie',
        biomeName: 'Estepes Douradas Infinitas dos Titãs',
        position: [4600, 95, 4800],
        eggRarity: 'tita',
        color: '#ca8a04',
        glowColor: '#facc15',
        ready: true
      },
      {
        id: 'nest-outer-quantum-swamp',
        biomeId: 'pantano',
        biomeName: 'Pântano Quântico Radioativo Titã',
        position: [-4800, 90, 4500],
        eggRarity: 'tita',
        color: '#65a30d',
        glowColor: '#c084fc',
        ready: true
      },
      // Ninhos Sagrados da Ilha Secreta (Vila Ancestral, Bioma Negro e Bioma Elétrico)
      {
        id: 'nest-secret-ancestral',
        biomeId: 'ancestral',
        biomeName: 'Vila Ancestral Sagrada',
        position: [2515, 128, 2570],
        eggRarity: 'tita',
        color: '#fbbf24',
        glowColor: '#f59e0b',
        ready: true
      },
      {
        id: 'nest-secret-negro',
        biomeId: 'negro',
        biomeName: 'Bioma Negro do Abismo',
        position: [2685, 128, 2630],
        eggRarity: 'tita',
        color: '#a855f7',
        glowColor: '#7e22ce',
        ready: true
      },
      {
        id: 'nest-secret-eletrico',
        biomeId: 'eletrico',
        biomeName: 'Bioma Elétrico dos Titãs da Tempestade',
        position: [2600, 128, 2725],
        eggRarity: 'tita',
        color: '#00f0ff',
        glowColor: '#facc15',
        ready: true
      }
    ];
  }

  /**
   * Generates a real Egg from a nest in the 3D world - Guaranteed TITAN rarity for all nests!
   */
  public static harvestNestEgg(nest: World3DNestInfo): Egg {
    // Secret Island Exclusive Eggs (Can ONLY be collected on the Secret Island in 3D, or remotely by Francisco!)
    if (nest.biomeId === 'ancestral' || nest.biomeId === 'negro' || nest.biomeId === 'eletrico') {
      return generateSecretIslandEgg(nest.biomeId);
    }

    const egg = generateEggFromBiome(nest.biomeId);
    egg.rarity = 'tita';
    egg.name = `OVO TITÃ SUPREMO: ${nest.biomeName.toUpperCase()}`;
    egg.hatchDurationSeconds = 25;
    egg.timeRemaining = 25;
    egg.design.glowColor = nest.glowColor;
    egg.design.spotsColor = '#facc15';
    egg.isRoboticApex = nest.biomeId === 'robotico';
    return egg;
  }

  /**
   * Calculates elemental damage dealt by dragon's breath attack in 3D
   */
  public static calculateBreathDamage(dragon: Dragon): number {
    const baseAtk = dragon.atk || 50;
    // Titan multiplier
    const titanBonus = dragon.isTitanPermanent ? 1.5 : 1.0;
    // Armor bonus
    let armorMultiplier = 1.0;
    Object.values(dragon.equippedArmor).forEach(piece => {
      if (piece) {
        armorMultiplier += piece.atkBonus / 100;
        if (piece.element === dragon.element) {
          armorMultiplier += (piece.elementPowerBonus || 0) / 100;
        }
      }
    });

    return Math.round(baseAtk * titanBonus * armorMultiplier);
  }

  /**
   * Retrieves the wild guardian for a given biome to challenge from 3D
   */
  public static getGuardianForBiome(biomeId: DragonElement): { guardian: WildGuardian; biome: Biome } | null {
    const biome = BIOMES.find(b => b.id === biomeId);
    if (!biome || biome.enemies.length === 0) return null;
    return {
      guardian: biome.enemies[0],
      biome
    };
  }
}
