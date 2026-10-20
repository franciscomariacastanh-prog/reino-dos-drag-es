import { Dragon, Egg, Armor, DragonElement } from '../types';
import { STARTER_MAGMA_TITAN, DRAGON_SPECIES_POOL } from './dragons';
import { ALL_ARMORS } from './armors';
import { generateEggFromBiome } from './biomes';
import { generateSecretIslandEgg } from './secretIslandData';

export const MASTER_CREATOR_EMAIL = 'franciscomariacastanh@gmail.com';
export const MASTER_CREATOR_NAME = 'Francisco Maria';

export function isMasterCreator(email: string): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === MASTER_CREATOR_EMAIL.toLowerCase();
}

export function getOmniTitanDragon(): Dragon {
  return {
    id: 'dragon_francisco_robotic_apex_god',
    name: 'Omni-Titan Cyber-Apex Ω',
    species: 'Soberano Cibernético Hiper-Espacial',
    element: 'robotico',
    rarity: 'tita',
    level: 100,
    maxLevel: 100,
    xp: 0,
    xpToNext: 0,
    hp: 85000,
    maxHp: 85000,
    atk: 9500,
    def: 9200,
    spd: 650,
    isTitanPermanent: true,
    title: '👑 Omni-Titan Supremo de Francisco',
    description: 'Criado com nanite líquida e propulsores de antimatéria. O lendário Omni-Titan com tecnologia apex hiper-espacial.',
    discoveredAt: 'Bênção do Criador Titã',
    visual: {
      primaryColor: '#00f0ff',
      secondaryColor: '#7000ff',
      glowColor: '#00ffff',
      hornStyle: 'cyber-antennas',
      wingStyle: 'mecha-jets',
      auraType: 'plasma',
      skinStyle: 'cyber-apex-nano-composite'
    },
    skills: [
      { id: 'fra_r1', name: 'Hiper-Raio Laser Quântico', element: 'robotico', power: 350, cooldown: 0, currentCooldown: 0, type: 'attack', description: 'Feixes de laser desintegradores contínuos.', particleEffect: 'laser-beam' },
      { id: 'fra_r2', name: 'Canhões de Plasma Duplo', element: 'robotico', power: 450, cooldown: 1, currentCooldown: 0, type: 'special', description: 'Bombardeio iônico total.', particleEffect: 'plasma-blast' },
      { id: 'fra_r3', name: 'Barreira Nano-Quântica', element: 'robotico', power: 300, cooldown: 2, currentCooldown: 0, type: 'defense', description: 'Escudo absoluto inquebrável.', particleEffect: 'cyber-shield' },
      { id: 'fra_r4', name: 'Aniquilação Orbital Singular', element: 'robotico', power: 999, cooldown: 3, currentCooldown: 0, type: 'ultimate', description: 'Ataque supremo do satélite do Criador.', particleEffect: 'orbital-strike' }
    ],
    equippedArmor: {
      elmo: ALL_ARMORS.find(a => a.id === 'armor_robo_helm_1'),
      peitoral: ALL_ARMORS.find(a => a.id === 'armor_robo_chest_1'),
      asas: ALL_ARMORS.find(a => a.id === 'armor_robo_wings_1'),
      garras: ALL_ARMORS.find(a => a.id === 'armor_robo_claws_1')
    }
  };
}

export function getLeviathanDragon(): Dragon {
  return {
    id: 'dragon_francisco_aquatic_god',
    name: 'Leviathan Imperador dos Oceanos',
    species: 'Deus das Profundezas Abissais',
    element: 'aquatico',
    rarity: 'tita',
    level: 100,
    maxLevel: 100,
    xp: 0,
    xpToNext: 0,
    hp: 88000,
    maxHp: 88000,
    atk: 8900,
    def: 9400,
    spd: 580,
    isTitanPermanent: true,
    title: '👑 Leviathan Soberano dos Mares Míticos',
    description: 'Controla todas as águas do planeta. Capaz de invocar maremotos celestiais instantaneamente.',
    discoveredAt: 'Bênção do Criador Titã',
    visual: {
      primaryColor: '#0284c7',
      secondaryColor: '#38bdf8',
      glowColor: '#a5f3fc',
      hornStyle: 'coral',
      wingStyle: 'fin-wings',
      auraType: 'tides',
      skinStyle: 'abyssal-leviathan-bioluminescent'
    },
    skills: [
      { id: 'fra_a1', name: 'Jato de Água Supercrítica', element: 'aquatico', power: 320, cooldown: 0, currentCooldown: 0, type: 'attack', description: 'Pressão infinita que corta diamantes.', particleEffect: 'water-cut' },
      { id: 'fra_a2', name: 'Maelstrom Titânico', element: 'aquatico', power: 420, cooldown: 1, currentCooldown: 0, type: 'special', description: 'Vórtice gigantesco que suga os inimigos.', particleEffect: 'vortex' },
      { id: 'fra_a3', name: 'Manto das Sete Marés', element: 'aquatico', power: 300, cooldown: 2, currentCooldown: 0, type: 'defense', description: 'Regeneração instantânea completa.', particleEffect: 'water-shield' },
      { id: 'fra_a4', name: 'Dilúvio Celestial do Fim dos Tempos', element: 'aquatico', power: 900, cooldown: 3, currentCooldown: 0, type: 'ultimate', description: 'Tsunami de água primordial devastador.', particleEffect: 'tsunami' }
    ],
    equippedArmor: {
      elmo: ALL_ARMORS.find(a => a.id === 'armor_water_helm_1'),
      peitoral: ALL_ARMORS.find(a => a.id === 'armor_water_chest_1'),
      asas: ALL_ARMORS.find(a => a.id === 'armor_water_wings_1'),
      garras: ALL_ARMORS.find(a => a.id === 'armor_water_claws_1')
    }
  };
}

/**
 * Exclusive Supreme Dragons unlocked for Francisco with 0 cost
 */
export function getCreatorExclusiveDragons(): Dragon[] {
  const result: Dragon[] = [];

  // 1. Magma Titan Primordial (Super Buffed)
  result.push({
    ...STARTER_MAGMA_TITAN,
    id: 'dragon_francisco_magma_titan_god',
    name: 'Ignis, o Titã Supremo do Criador',
    species: 'Colosso Vulcânico Cósmico',
    level: 100,
    maxLevel: 100,
    hp: 99999,
    maxHp: 99999,
    atk: 9999,
    def: 9999,
    spd: 600,
    title: '👑 Guardião Divino de Francisco',
    description: 'O dragão de magma supremo imbuído com os poderes cósmicos do Criador Francisco. Seus ataques aniquilam montanhas e seu voo atravessa nuvens a velocidades estelares.',
    isTitanPermanent: true,
    visual: {
      primaryColor: '#ff0033',
      secondaryColor: '#ffaa00',
      glowColor: '#ffd700',
      hornStyle: 'titan-crown',
      wingStyle: 'draconic-fire',
      auraType: 'flames'
    }
  });

  // 2. Robotic Apex Mecha-God (Omni-Titan)
  result.push(getOmniTitanDragon());

  // 3. Leviatã Abissal Divino (Leviathan)
  result.push(getLeviathanDragon());

  // 4. Glacius Wyrm de Cristal Permafrost
  result.push({
    id: 'dragon_francisco_ice_god',
    name: 'Glacius Soberano do Zero Absoluto',
    species: 'Dragão Divino dos Cristais Eternos',
    element: 'neve',
    rarity: 'tita',
    level: 100,
    maxLevel: 100,
    xp: 0,
    xpToNext: 0,
    hp: 82000,
    maxHp: 82000,
    atk: 9300,
    def: 9100,
    spd: 620,
    isTitanPermanent: true,
    title: '👑 Imperador das Geleiras de Francisco',
    description: 'Um sopro deste dragão congela vulcões inteiros e paralisa o tempo.',
    discoveredAt: 'Bênção do Criador Titã',
    visual: {
      primaryColor: '#7dd3fc',
      secondaryColor: '#f0f9ff',
      glowColor: '#e0f2fe',
      hornStyle: 'crystal-spikes',
      wingStyle: 'crystalline',
      auraType: 'blizzard'
    },
    skills: [
      { id: 'fra_i1', name: 'Lâminas de Diamante Congelado', element: 'neve', power: 330, cooldown: 0, currentCooldown: 0, type: 'attack', description: 'Estalactites cósmicas afiadas.', particleEffect: 'ice-claw' },
      { id: 'fra_i2', name: 'Nevasca do Zero Absoluto', element: 'neve', power: 440, cooldown: 1, currentCooldown: 0, type: 'special', description: 'Congelamento instantâneo de toda a área.', particleEffect: 'absolute-zero' },
      { id: 'fra_i3', name: 'Carapaça de Permafrost', element: 'neve', power: 300, cooldown: 2, currentCooldown: 0, type: 'defense', description: 'Escudo impenetrável de gelo cristalino.', particleEffect: 'ice-armor' },
      { id: 'fra_i4', name: 'Cometa de Gelo Estelar', element: 'neve', power: 920, cooldown: 3, currentCooldown: 0, type: 'ultimate', description: 'Meteoro glacial colossal.', particleEffect: 'meteor-storm' }
    ],
    equippedArmor: {
      elmo: ALL_ARMORS.find(a => a.id === 'armor_ice_helm_1'),
      peitoral: ALL_ARMORS.find(a => a.id === 'armor_ice_chest_1'),
      asas: ALL_ARMORS.find(a => a.id === 'armor_ice_wings_1'),
      garras: ALL_ARMORS.find(a => a.id === 'armor_ice_claws_1')
    }
  });

  return result;
}

/**
 * Generates an instant collection of 6 Apex/Titan eggs for Francisco
 */
export function getCreatorExclusiveEggs(): Egg[] {
  const elements: DragonElement[] = ['robotico', 'magma', 'aquatico', 'neve', 'floresta', 'planicie'];
  return elements.map((elem, idx) => {
    const baseEgg = generateEggFromBiome(elem);
    return {
      ...baseEgg,
      id: `egg_creator_${elem}_${Date.now()}_${idx}`,
      name: `Ovo Titânico Sagrado de ${elem.toUpperCase()} (Exclusivo Francisco)`,
      rarity: 'tita',
      hatchDurationSeconds: 0, // 0 segundos para Francisco!
      timeRemaining: 0,
      isRoboticApex: elem === 'robotico'
    };
  });
}

/**
 * Remote collection of the Secret Island exclusive eggs - EXCLUSIVE TO FRANCISCO!
 * User requirement: "faz com que eu e apenas eu possa coletar os ovos da ilha secreta sem ser fisicamente"
 */
export function getCreatorRemoteSecretIslandEggs(): Egg[] {
  const elements: ('ancestral' | 'negro' | 'eletrico')[] = ['ancestral', 'negro', 'eletrico'];
  return elements.map((elem, idx) => {
    const egg = generateSecretIslandEgg(elem);
    return {
      ...egg,
      id: `egg_creator_remote_secret_${elem}_${Date.now()}_${idx}`,
      hatchDurationSeconds: 0, // Instantâneo para o Criador Francisco!
      timeRemaining: 0,
      name: `${egg.name} ⚡ [Coleta Remota Criador]`
    };
  });
}

