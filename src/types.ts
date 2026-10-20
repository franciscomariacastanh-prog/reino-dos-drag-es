export type DragonElement = 
  | 'magma' 
  | 'aquatico' 
  | 'floresta' 
  | 'robotico' 
  | 'neve' 
  | 'pantano' 
  | 'planicie'
  | 'ancestral'
  | 'negro'
  | 'eletrico';

export type DragonRarity = 
  | 'comum' 
  | 'raro' 
  | 'epico' 
  | 'lendario' 
  | 'mitico' 
  | 'tita';

export type ArmorSlot = 'elmo' | 'peitoral' | 'asas' | 'garras';

export interface DragonSkill {
  id: string;
  name: string;
  element: DragonElement;
  power: number;
  cooldown: number;
  currentCooldown: number;
  type: 'attack' | 'special' | 'defense' | 'ultimate';
  description: string;
  particleEffect: string;
}

export interface Armor {
  id: string;
  name: string;
  slot: ArmorSlot;
  element: DragonElement;
  rarity: DragonRarity;
  atkBonus: number;
  defBonus: number;
  hpBonus: number;
  spdBonus: number;
  elementPowerBonus: number; // Percentual de reforço elemental (ex: +35% para dragões do mesmo elemento)
  description: string;
  setName: string;
  isFree: true; // Todas as armaduras são 100% grátis como pedido
  icon: string;
}

export type DragonSkinStyle =
  | 'realistic-drake-scales'
  | 'obsidian-crag-scales'
  | 'glacial-frost-crystal'
  | 'cyber-apex-nano-composite'
  | 'abyssal-leviathan-bioluminescent'
  | 'ancient-runic-gold'
  | 'celestial-lightning-plasma'
  | 'void-shadow-umbral'
  | 'emerald-forest-wyrm'
  | 'toxic-swamp-hydra';

export interface DragonVisual {
  primaryColor: string;
  secondaryColor: string;
  glowColor: string;
  hornStyle: 'titan-crown' | 'curved' | 'cyber-antennas' | 'crystal-spikes' | 'coral' | 'branching';
  wingStyle: 'draconic-fire' | 'mecha-jets' | 'feathered' | 'fin-wings' | 'crystalline' | 'leather';
  auraType: 'flames' | 'plasma' | 'spores' | 'blizzard' | 'tides' | 'wind' | 'toxic';
  skinStyle?: DragonSkinStyle;
}

export interface Dragon {
  id: string;
  name: string;
  species: string;
  element: DragonElement;
  rarity: DragonRarity;
  level: number;
  maxLevel: number;
  xp: number;
  xpToNext: number;
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  spd: number;
  isTitanPermanent?: boolean; // O Dragão de Magma Titã permanente inicial
  equippedArmor: Partial<Record<ArmorSlot, Armor>>;
  skills: DragonSkill[];
  visual: DragonVisual;
  description: string;
  title: string;
  discoveredAt: string;
}

export interface Egg {
  id: string;
  name: string;
  element: DragonElement;
  rarity: DragonRarity;
  hatchDurationSeconds: number;
  timeRemaining: number;
  biomeOrigin: DragonElement;
  incubatorSlotId?: number;
  isRoboticApex?: boolean; // Ninhos do bioma robótico são os melhores
  isSecretIslandExclusive?: boolean; // Só pode ser coletado fisicamente na ilha secreta
  design: {
    baseColor: string;
    glowColor: string;
    spotsColor: string;
    pattern: 'magma-cracks' | 'circuit-lines' | 'water-ripples' | 'ice-shards' | 'leaf-veins' | 'rune-markings';
  };
}

export interface Biome {
  id: DragonElement;
  name: string;
  tagline: string;
  description: string;
  isBestNestBiome?: boolean; // Destaque: os ninhos do bioma robótico são os melhores
  nestQualityLabel: string;
  bgGradient: string;
  accentColor: string;
  textColor: string;
  borderColor: string;
  enemies: WildGuardian[];
  nestRarityWeights: Record<DragonRarity, number>;
}

export interface WildGuardian {
  id: string;
  name: string;
  element: DragonElement;
  level: number;
  maxHp: number;
  currentHp: number;
  atk: number;
  def: number;
  spd: number;
  rewardXp: number;
  description: string;
  skills: { name: string; power: number; desc: string }[];
}

export interface BattleLog {
  id: string;
  text: string;
  type: 'player' | 'enemy' | 'system' | 'crit' | 'heal';
  timestamp: number;
}

export interface IncubatorSlot {
  id: number;
  egg: Egg | null;
  isIncubating: boolean;
  startedAt?: number;
}

export type RiderHelmetStyle = 'horns' | 'wings' | 'crown' | 'hood' | 'cyber' | 'none';
export type RiderCapeStyle = 'royal' | 'flowing' | 'tattered' | 'none';

export interface RiderCustomizationOptions {
  armorColor: string;
  goldAccentColor: string;
  clothColor: string;
  capeColor: string;
  visorGlowColor: string;
  skinColor?: string;
  helmetStyle?: RiderHelmetStyle;
  capeStyle?: RiderCapeStyle;
}

export interface RiderClothingItem {
  id: string;
  name: string;
  category: 'outfit' | 'helmet' | 'cape' | 'color';
  description: string;
  isFree: true; // 100% grátis
  previewColor: string;
  badge?: string;
  properties: Partial<RiderCustomizationOptions>;
}

export interface RiderCustomizationState {
  equippedOutfitId: string;
  equippedHelmetId: string;
  equippedCapeId: string;
  currentOptions: RiderCustomizationOptions;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  isCreator: boolean;
  activeTitle: string;
}

export interface RemotePlayer {
  id: string;
  username: string;
  email: string;
  isCreator: boolean;
  dragon: Dragon;
  rider: RiderCustomizationState;
  pos: [number, number, number];
  rot: [number, number, number];
  state: {
    isFlying: boolean;
    isMounted: boolean;
    isGliding: boolean;
    isRunning: boolean;
    speed: number;
    isAttacking?: boolean;
    isRoaring?: boolean;
  };
  lastUpdate: number;
  lastChatMessage?: string;
  chatBubbleTimer?: number;
}

export interface MultiplayerChatMessage {
  id: string;
  senderId: string;
  username: string;
  isCreator: boolean;
  message: string;
  timestamp: number;
  type: 'chat' | 'system' | 'action';
}
