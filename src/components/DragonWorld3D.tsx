import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { Dragon, Egg, Biome, WildGuardian, DragonElement } from '../types';
import { DragonGameApi, World3DNestInfo, World3DTargetCrystal } from '../api/dragonGameApi';
import { soundFx } from '../utils/audio';
import { 
  ArrowLeft, 
  Wind, 
  Flame, 
  Compass, 
  Sparkles, 
  Zap, 
  Shield, 
  Volume2, 
  VolumeX, 
  HelpCircle, 
  ChevronUp, 
  ChevronDown, 
  Eye, 
  Trophy, 
  Layers, 
  Check, 
  ZoomIn, 
  ZoomOut, 
  User, 
  Footprints, 
  Shirt,
  Rocket,
  MapPin,
  Globe,
  Navigation,
  Crown,
  Users,
  MessageSquare,
  Palette
} from 'lucide-react';
import {
  RiderCustomizationOptions,
  RiderCustomizationState,
  UserProfile,
  RemotePlayer,
  DragonSkinStyle
} from '../types';
import { DEFAULT_RIDER_CUSTOMIZATION } from '../data/riderOutfits';
import { ClothesShopModal } from './ClothesShopModal';
import { TeleportMapModal } from './TeleportMapModal';
import { MultiplayerChatHUD } from './MultiplayerChatHUD';
import { DragonSkinModal } from './DragonSkinModal';
import { getDefaultSkinForElement } from '../data/dragonSkins';
import { useMultiplayer } from '../utils/useMultiplayer';
import { buildSnowMountainSecretPortal, buildSecretIslandRealm } from '../utils/secretIslandBuilder';
import { SECRET_ISLAND_CONFIG, getAllSecretIslandEggs } from '../data/secretIslandData';

function createPlayerNameTagSprite(username: string, isCreator: boolean, dragonName: string): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 140;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, 512, 140);

  ctx.fillStyle = isCreator ? 'rgba(30, 20, 5, 0.90)' : 'rgba(10, 10, 18, 0.85)';
  ctx.strokeStyle = isCreator ? '#f59e0b' : '#38bdf8';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.roundRect(16, 16, 480, 108, 24);
  ctx.fill();
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  if (isCreator) {
    ctx.font = 'bold 32px sans-serif';
    ctx.fillStyle = '#fbbf24';
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 12;
    ctx.fillText(`👑 [CRIADOR] ${username}`, 256, 50);
  } else {
    ctx.font = 'bold 30px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(username, 256, 50);
  }

  ctx.shadowBlur = 0;
  ctx.font = 'bold 20px monospace';
  ctx.fillStyle = isCreator ? '#fed7aa' : '#94a3b8';
  ctx.fillText(`🐉 ${dragonName}`, 256, 92);

  const texture = new THREE.CanvasTexture(canvas);
  const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.scale.set(7, 1.9, 1);
  return sprite;
}

function createTitanCreatorHalo(): THREE.Group {
  const group = new THREE.Group();
  
  const ringGeo = new THREE.TorusGeometry(1.3, 0.12, 16, 32);
  const ringMat = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    emissive: 0xd97706,
    emissiveIntensity: 0.8,
    metalness: 0.9,
    roughness: 0.2
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI / 2;
  group.add(ring);

  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2;
    const spikeGeo = new THREE.ConeGeometry(0.22, 0.8, 8);
    const spikeMat = new THREE.MeshStandardMaterial({
      color: 0xfde047,
      emissive: 0xb45309,
      emissiveIntensity: 0.7,
      metalness: 0.9
    });
    const spike = new THREE.Mesh(spikeGeo, spikeMat);
    spike.position.set(Math.cos(angle) * 1.2, 0.4, Math.sin(angle) * 1.2);
    group.add(spike);
  }

  return group;
}
import {
  createScaleTexture,
  createGrassTexture,
  createStoneTexture,
  createCobbleTexture,
  createWaterTexture,
  createLavaTexture,
  createAtmosphericSkyTexture,
  createAncientRuinTexture
} from '../utils/realisticTextures';
import {
  buildRealisticDragonModel,
  RealisticDragonInstance
} from '../utils/dragonModelBuilder';
import {
  buildHumanoidRiderModel,
  RealisticRiderInstance
} from '../utils/riderModelBuilder';
import {
  buildSanctuaryPantheonRuins,
  buildVolcanoMagmaRuins,
  buildAquaticLagoonRuins,
  buildRoboticApexRuins,
  buildPlainsColiseumRuins,
  buildIcePermafrostRuins,
  buildSwampBogRuins,
  buildForestGroveRuins,
  buildCrossroadsWatchtowers,
  RuinsBuilderMaterials
} from '../utils/ruinsBuilder';
import { buildContinentMountainRanges } from '../utils/mountainBuilder';

export interface WorldIslandInfo {
  id: string;
  name: string;
  biomeId: DragonElement;
  x: number;
  y: number;
  z: number;
  radius: number;
  surfaceY: number;
}

// Single Grand Hyper-Continent Dimensions (+999999999999999999% Colossal Expansion!)
// Radius: 60,000 meters (120 km across!) - Invisible Celestial Barrier: 64,000 meters!
export const SINGLE_ISLAND_RADIUS = 60000.0;
export const INVISIBLE_BARRIER_RADIUS = 64000.0;
export const ISLAND_SURFACE_Y = 2.5;

/**
 * Procedural Mountain Elevation Map for the +999999999999999999% Expanded Continent
 * Returns elevation height in meters above baseline ISLAND_SURFACE_Y
 */
export const getMountainElevation = (x: number, z: number): number => {
  const dist = Math.hypot(x, z);

  // Central Sanctuary Prime (sacred peaceful valley & temple plateau)
  if (dist < 130) {
    return Math.max(0, (1 - dist / 130) * 1.5);
  }

  let totalElevation = 0;

  // 1. Cordilheira Vulcânica de Magma (North: z around -540, x around 0)
  const dVolcano = Math.hypot(x, z + 540);
  if (dVolcano < 380) {
    const vFactor = Math.max(0, 1 - dVolcano / 380);
    const calderaDip = dVolcano < 55 ? Math.cos((dVolcano / 55) * Math.PI) * 16 : 0;
    const vCrag = Math.sin(x * 0.05) * Math.cos(z * 0.05) * 12;
    totalElevation += Math.max(0, vFactor * 135 - calderaDip + vCrag);
  }

  // 2. Picos Glaciais de Permafrost (South: z around +640, x around 0)
  const dIce = Math.hypot(x, z - 640);
  if (dIce < 380) {
    let icePhysicalCone = 0;
    if (dIce < 210) {
      icePhysicalCone = (1 - dIce / 210) * 160;
      if (dIce < 38) {
        icePhysicalCone += (1 - dIce / 38) * 50;
      }
    }
    const iFactor = Math.max(0, 1 - dIce / 380);
    const iceRidges = (Math.sin(x * 0.04 + z * 0.03) + Math.cos(x * 0.02 - z * 0.04)) * 16;
    totalElevation += Math.max(icePhysicalCone, iFactor * 148 + iceRidges);
  }

  // 3. Maciço Apex Mecânico (East: x around 580, z around 130)
  const dRobo = Math.hypot(x - 580, z - 130);
  if (dRobo < 360) {
    const rFactor = Math.max(0, 1 - dRobo / 360);
    const plateau = Math.sin(x * 0.03) * 10 + Math.cos(z * 0.03) * 10;
    totalElevation += Math.max(0, rFactor * 115 + plateau);
  }

  // 4. Serra Ancestral das Florestas (West: x around -540, z around -200)
  const dForest = Math.hypot(x + 540, z + 200);
  if (dForest < 360) {
    const fFactor = Math.max(0, 1 - dForest / 360);
    const crags = Math.sin(x * 0.035) * Math.sin(z * 0.035) * 14;
    totalElevation += Math.max(0, fFactor * 110 + crags);
  }

  // 5. Agulhas do Pântano Sombrio (South-West: x around -490, z around 440)
  const dSwamp = Math.hypot(x + 490, z - 440);
  if (dSwamp < 340) {
    const sFactor = Math.max(0, 1 - dSwamp / 340);
    const spires = (Math.sin(x * 0.06) + Math.cos(z * 0.06)) * 12;
    totalElevation += Math.max(0, sFactor * 98 + spires);
  }

  // 6. Lagoa dos Picos Abissais (North-East: x around 430, z around -430)
  const dAqua = Math.hypot(x - 430, z + 430);
  if (dAqua < 350) {
    const aFactor = Math.max(0, 1 - dAqua / 350);
    const canyon = dAqua < 65 ? -10 : Math.sin(x * 0.04) * 12;
    totalElevation += Math.max(0, aFactor * 92 + canyon);
  }

  // 7. Maciço Dourado das Planícies Celestes (South-East: x around 440, z around 530)
  const dPlains = Math.hypot(x - 440, z - 530);
  if (dPlains < 350) {
    const pFactor = Math.max(0, 1 - dPlains / 350);
    totalElevation += Math.max(0, pFactor * 105 + Math.sin(x * 0.03) * 10);
  }

  // --- GRANDES CONTINENTES EXTERNOS (+999999999999999999% EXPANDIDOS) ---
  // A. Super-Vulcão do Magma Cósmico (x: -1200, z: -4500)
  const dOuterVolcano = Math.hypot(x + 1200, z + 4500);
  if (dOuterVolcano < 2200) {
    const ovFactor = Math.max(0, 1 - dOuterVolcano / 2200);
    const caldera = dOuterVolcano < 220 ? Math.cos((dOuterVolcano / 220) * Math.PI) * 45 : 0;
    totalElevation += Math.max(0, ovFactor * 380 - caldera);
  }

  // B. Megacidade Apex dos Titãs Cibernéticos (x: 5200, z: 2200)
  const dOuterCyber = Math.hypot(x - 5200, z - 2200);
  if (dOuterCyber < 2400) {
    const ocFactor = Math.max(0, 1 - dOuterCyber / 2400);
    totalElevation += Math.max(0, ocFactor * 320);
  }

  // C. Picos Hiperbóreos Glaciais do Fim do Mundo (x: 800, z: 5500)
  const dOuterIce = Math.hypot(x - 800, z - 5500);
  if (dOuterIce < 2500) {
    const oiFactor = Math.max(0, 1 - dOuterIce / 2500);
    totalElevation += Math.max(0, oiFactor * 420);
  }

  // D. Megabosque das Árvores-Mundo Titãs (x: -5400, z: -3200)
  const dOuterForest = Math.hypot(x + 5400, z + 3200);
  if (dOuterForest < 2500) {
    const ofFactor = Math.max(0, 1 - dOuterForest / 2500);
    totalElevation += Math.max(0, ofFactor * 280);
  }

  // E. Fossa Oceânica Abissal (x: 4800, z: -4800)
  const dOuterAqua = Math.hypot(x - 4800, z + 4800);
  if (dOuterAqua < 2300) {
    const oaFactor = Math.max(0, 1 - dOuterAqua / 2300);
    totalElevation += Math.max(0, oaFactor * 240);
  }

  // F. Estepes Douradas Infinitas (x: 4600, z: 4800)
  const dOuterPlains = Math.hypot(x - 4600, z - 4800);
  if (dOuterPlains < 2400) {
    const opFactor = Math.max(0, 1 - dOuterPlains / 2400);
    totalElevation += Math.max(0, opFactor * 260);
  }

  // G. Pântano Quântico Radioativo (x: -4800, z: 4500)
  const dOuterSwamp = Math.hypot(x + 4800, z - 4500);
  if (dOuterSwamp < 2400) {
    const osFactor = Math.max(0, 1 - dOuterSwamp / 2400);
    totalElevation += Math.max(0, osFactor * 230);
  }

  // H. Suaves Colinas & Ondulações Continentais Gerais entre 800m e 58,000m
  if (dist > 800 && dist < 58000) {
    const broadUndulation = (Math.sin(x * 0.0008) * Math.cos(z * 0.0008) * 35) +
                            (Math.sin(x * 0.00025 + z * 0.0003) * 55);
    totalElevation += Math.max(0, broadUndulation);
  }

  // I. Colossal Outer Mountain Wall Rim (Cordilheira Fronteiriça Cósmica entre 35,000m e 58,000m)
  if (dist > 35000 && dist < 59000) {
    const rimDist = Math.abs(dist - 47000);
    const rimFactor = Math.max(0, 1 - rimDist / 12000);
    const mountainTeeth = (Math.sin(Math.atan2(z, x) * 24) * 160) + (Math.cos(Math.atan2(z, x) * 48) * 80);
    totalElevation += Math.max(0, rimFactor * 750 + mountainTeeth);
  }

  // J. Ilha Secreta Perdida: Vila Ancestral & Bioma Negro (x: 2600, z: 2600, altitude 126m)
  const dSecret = Math.hypot(x - 2600, z - 2600);
  if (dSecret < 190) {
    return 126 - ISLAND_SURFACE_Y;
  }

  return Math.max(0, totalElevation);
};

// Thematic Biome Sectors on the Single Grand +999999999999999999% Expanded Continent
export const WORLD_ISLAND_SECTORS: WorldIslandInfo[] = [
  { id: 'sanctuary', name: 'Santuário Sagrado Prime', biomeId: 'planicie', x: 0, y: 0, z: 0, radius: 250, surfaceY: ISLAND_SURFACE_Y },
  { id: 'volcano', name: 'Cordilheira Vulcânica (Magma)', biomeId: 'magma', x: 0, y: 0, z: -540, radius: 450, surfaceY: ISLAND_SURFACE_Y },
  { id: 'aquatic', name: 'Lagoa dos Picos Abissais (Aquático)', biomeId: 'aquatico', x: 430, y: 0, z: -430, radius: 400, surfaceY: ISLAND_SURFACE_Y },
  { id: 'robotic', name: 'Cidadela Mecânica Apex (Robótico)', biomeId: 'robotico', x: 580, y: 0, z: 130, radius: 420, surfaceY: ISLAND_SURFACE_Y },
  { id: 'plains', name: 'Maciço Dourado (Planície)', biomeId: 'planicie', x: 440, y: 0, z: 530, radius: 400, surfaceY: ISLAND_SURFACE_Y },
  { id: 'ice', name: 'Picos Glaciais Permafrost (Neve)', biomeId: 'neve', x: 0, y: 0, z: 640, radius: 450, surfaceY: ISLAND_SURFACE_Y },
  { id: 'swamp', name: 'Agulhas Sombrias (Pântano)', biomeId: 'pantano', x: -490, y: 0, z: 440, radius: 400, surfaceY: ISLAND_SURFACE_Y },
  { id: 'forest', name: 'Serra Ancestral (Floresta)', biomeId: 'floresta', x: -540, y: 0, z: -200, radius: 420, surfaceY: ISLAND_SURFACE_Y },
  // Setores dos Grandes Continentes Externos (+999999999999999999%)
  { id: 'outer-volcano', name: 'Super-Vulcão do Magma Cósmico', biomeId: 'magma', x: -1200, y: 0, z: -4500, radius: 2500, surfaceY: ISLAND_SURFACE_Y },
  { id: 'outer-cyber', name: 'Megacidade Apex Quântica', biomeId: 'robotico', x: 5200, y: 0, z: 2200, radius: 2800, surfaceY: ISLAND_SURFACE_Y },
  { id: 'outer-ice', name: 'Cordilheira Hiperbórea do Fim do Mundo', biomeId: 'neve', x: 800, y: 0, z: 5500, radius: 3000, surfaceY: ISLAND_SURFACE_Y },
  { id: 'outer-forest', name: 'Megabosque das Árvores-Mundo', biomeId: 'floresta', x: -5400, y: 0, z: -3200, radius: 2800, surfaceY: ISLAND_SURFACE_Y },
  { id: 'outer-aquatic', name: 'Oceano Abissal dos Titãs', biomeId: 'aquatico', x: 4800, y: 0, z: -4800, radius: 2600, surfaceY: ISLAND_SURFACE_Y },
  { id: 'outer-plains', name: 'Estepes Douradas Infinitas', biomeId: 'planicie', x: 4600, y: 0, z: 4800, radius: 2600, surfaceY: ISLAND_SURFACE_Y },
  { id: 'outer-swamp', name: 'Pântano Quântico Radioativo', biomeId: 'pantano', x: -4800, y: 0, z: 4500, radius: 2700, surfaceY: ISLAND_SURFACE_Y },
  { id: 'titan-rim', name: 'Fronteira Cósmica da Barreira Titânica', biomeId: 'planicie', x: 0, y: 0, z: 45000, radius: 15000, surfaceY: ISLAND_SURFACE_Y },
  // Ilha Secreta Perdida (Vila Ancestral, Bioma Negro e Bioma Elétrico)
  { id: 'secret-ancestral', name: 'Vila Ancestral Sagrada (Ilha Secreta)', biomeId: 'ancestral', x: 2515, y: 0, z: 2570, radius: 110, surfaceY: 126 },
  { id: 'secret-negro', name: 'Bioma Negro do Abismo (Ilha Secreta)', biomeId: 'negro', x: 2685, y: 0, z: 2630, radius: 110, surfaceY: 126 },
  { id: 'secret-eletrico', name: 'Bioma Elétrico da Tempestade (Ilha Secreta)', biomeId: 'eletrico', x: 2600, y: 0, z: 2725, radius: 110, surfaceY: 126 },
  { id: 'secret-island-core', name: 'Ilha Secreta Perdida', biomeId: 'ancestral', x: 2600, y: 0, z: 2600, radius: 240, surfaceY: 126 }
];

export const WORLD_ISLANDS = WORLD_ISLAND_SECTORS;

export const getIslandAt = (x: number, z: number): WorldIslandInfo | null => {
  const dist = Math.hypot(x, z);
  if (dist > INVISIBLE_BARRIER_RADIUS + 50.0) {
    return null;
  }
  // The entire realm is ONE SINGLE UNIFIED CONTINENT EXPANDED BY +999999999999999999%!
  let closest = WORLD_ISLAND_SECTORS[0];
  let minDist = Infinity;
  for (const sector of WORLD_ISLAND_SECTORS) {
    const d = Math.hypot(x - sector.x, z - sector.z);
    if (d < minDist) {
      minDist = d;
      closest = sector;
    }
  }
  const elevation = getMountainElevation(x, z);
  return {
    ...closest,
    surfaceY: ISLAND_SURFACE_Y + elevation
  };
};

interface DragonWorld3DProps {
  activeDragon: Dragon;
  allDragons: Dragon[];
  onSelectActiveDragon: (id: string) => void;
  onCollectEgg: (egg: Egg) => void;
  onAwardXp: (amount: number) => void;
  onStartBattle: (guardian: WildGuardian, biome: Biome) => void;
  onReturnToBase: () => void;
  onOpenIncubator: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  userProfile?: UserProfile;
  isCreatorMode?: boolean;
  onOpenCreatorPanel?: () => void;
  multiplayer?: any;
  onUpdateDragonSkin?: (dragonId: string, skinStyle: DragonSkinStyle, customColors?: { primary: string; secondary: string; emissive: string }) => void;
}

export const DragonWorld3D: React.FC<DragonWorld3DProps> = ({
  activeDragon,
  allDragons,
  onSelectActiveDragon,
  onCollectEgg,
  onAwardXp,
  onStartBattle,
  onReturnToBase,
  onOpenIncubator,
  isMuted,
  onToggleMute,
  userProfile,
  isCreatorMode = false,
  onOpenCreatorPanel,
  multiplayer,
  onUpdateDragonSkin
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Flight & Movement HUD states
  const [isFlying, setIsFlying] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(true);
  const [distanceToDragon, setDistanceToDragon] = useState<number>(0);
  const [altitude, setAltitude] = useState<number>(0);
  const [speed, setSpeed] = useState<number>(0);
  const [stamina, setStamina] = useState<number>(100);
  const [heading, setHeading] = useState<{ deg: number; cardinal: string }>({ deg: 0, cardinal: 'N' });
  const [flightStateName, setFlightStateName] = useState<string>('EM SOLO');
  const [nearbyInteraction, setNearbyInteraction] = useState<{
    type: 'nest' | 'guardian' | 'crystal' | 'dragon' | 'shop' | 'portal';
    title: string;
    description: string;
    actionLabel: string;
    id: string;
    data?: any;
  } | null>(null);

  const [collectedNotification, setCollectedNotification] = useState<{
    text: string;
    subtext: string;
    icon: string;
  } | null>(null);

  const [showControlsGuide, setShowControlsGuide] = useState<boolean>(false);
  const [showDragonSelector, setShowDragonSelector] = useState<boolean>(false);
  const [showClothesShop, setShowClothesShop] = useState<boolean>(false);
  const [showTeleportMap, setShowTeleportMap] = useState<boolean>(false);
  const [showSkinModal, setShowSkinModal] = useState<boolean>(false);
  const [isHyperSpeed, setIsHyperSpeed] = useState<boolean>(false);
  const [playerCoords, setPlayerCoords] = useState<{ x: number; z: number }>({ x: 0, z: 0 });
  const [isAttacking, setIsAttacking] = useState<boolean>(false);
  const [isRoaring, setIsRoaring] = useState<boolean>(false);
  const [currentBiomeName, setCurrentBiomeName] = useState<string>('Santuário Central');
  const currentBiomeNameRef = useRef<string>('Santuário Central');

  // Rider Wardrobe / Free Clothing Customization State
  const [customizationState, setCustomizationState] = useState<RiderCustomizationState>(() => {
    try {
      const saved = localStorage.getItem('dragon_rider_customization');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {}
    return {
      equippedOutfitId: 'outfit_magma',
      equippedHelmetId: 'helm_horns',
      equippedCapeId: 'cape_flowing',
      currentOptions: { ...DEFAULT_RIDER_CUSTOMIZATION }
    };
  });
  const customizationStateRef = useRef<RiderCustomizationState>(customizationState);
  customizationStateRef.current = customizationState;

  const riderInstanceRef = useRef<RealisticRiderInstance | null>(null);
  const playerDragonRef = useRef<RealisticDragonInstance | null>(null);

  const handleApplyCustomization = (
    newOptions: Partial<RiderCustomizationOptions>,
    outfitId?: string,
    helmetId?: string,
    capeId?: string
  ) => {
    setCustomizationState(prev => {
      const updated: RiderCustomizationState = {
        equippedOutfitId: outfitId !== undefined ? outfitId : prev.equippedOutfitId,
        equippedHelmetId: helmetId !== undefined ? helmetId : prev.equippedHelmetId,
        equippedCapeId: capeId !== undefined ? capeId : prev.equippedCapeId,
        currentOptions: {
          ...prev.currentOptions,
          ...newOptions
        }
      };
      try {
        localStorage.setItem('dragon_rider_customization', JSON.stringify(updated));
      } catch (e) {}

      if (riderInstanceRef.current) {
        riderInstanceRef.current.applyCustomization(updated.currentOptions);
      }
      if (playerDragonRef.current?.updateMountedRiderCustomization) {
        playerDragonRef.current.updateMountedRiderCustomization(updated.currentOptions);
      }

      return updated;
    });
  };

  // Active Dragon Stats in 3D
  const breathDamage = useMemo(() => DragonGameApi.calculateBreathDamage(activeDragon), [activeDragon]);

  // References to pass state into animation loop without closures
  const actionHandlersRef = useRef<{
    takeoff: () => void;
    land: () => void;
    attack: () => void;
    roar: () => void;
    dismount?: () => void;
    mount?: () => void;
    callDragon?: () => void;
    teleportTo?: (x: number, z: number, name: string) => void;
    toggleHyperSpeed?: () => void;
    zoomIn?: () => void;
    zoomOut?: () => void;
  } | null>(null);

  const stateRef = useRef({
    isFlying: false,
    isMounted: true,
    isHyperSpeed: false,
    stamina: 100,
    keys: {
      KeyW: false,
      KeyS: false,
      KeyA: false,
      KeyD: false,
      Space: false,
      ShiftLeft: false,
      ShiftRight: false,
      KeyC: false,
      KeyQ: false,
      KeyE: false,
      KeyF: false,
      KeyR: false,
      KeyV: false,
      KeyX: false,
      KeyT: false,
      KeyM: false,
      ArrowUp: false,
      ArrowDown: false,
      ArrowLeft: false,
      ArrowRight: false
    },
    touchMovement: { x: 0, y: 0 },
    touchFlyingUp: false,
    touchFlyingDown: false,
    touchBoosting: false,
    touchAttacking: false,
    touchRoaring: false,
    isMouseDown: false,
    mouseLastX: 0,
    mouseLastY: 0,
    cameraAngles: { theta: 0, phi: 0.30, radius: 10.5 },
    dragonPos: new THREE.Vector3(0, 3.35, 0),
    riderPos: new THREE.Vector3(0, 2.5, 0),
    riderYaw: 0,
    riderForwardSpeed: 0,
    riderVerticalSpeed: 0,
    riderIsGrounded: true,
    forwardSpeed: 0,
    verticalSpeed: 0,
    dragonYaw: 0,
    dragonPitch: 0,
    dragonRoll: 0,
    wingFlapTime: 0,
    tailTime: 0,
    legTime: 0,
    roarCooldown: 0,
    attackCooldown: 0,
    takeoffGrace: 0,
    autoLanding: false,
    flapSoundTimer: 0,
    nests: DragonGameApi.get3DWorldNests(),
    crystals: [
      { id: 'c1', position: [25, 3.5, 25] as [number, number, number], collected: false },
      { id: 'c2', position: [-25, 3.5, -25] as [number, number, number], collected: false },
      { id: 'c3', position: [0, 18.0, 0] as [number, number, number], collected: false },
      { id: 'c4', position: [0, 72.0, -510] as [number, number, number], collected: false },
      { id: 'c5', position: [75, 45.0, -560] as [number, number, number], collected: false },
      { id: 'c6', position: [420, 24.0, -410] as [number, number, number], collected: false },
      { id: 'c7', position: [460, 32.0, -450] as [number, number, number], collected: false },
      { id: 'c8', position: [560, 48.0, 110] as [number, number, number], collected: false },
      { id: 'c9', position: [610, 62.0, 150] as [number, number, number], collected: false },
      { id: 'c10', position: [420, 42.0, 510] as [number, number, number], collected: false },
      { id: 'c11', position: [470, 52.0, 550] as [number, number, number], collected: false },
      { id: 'c12', position: [0, 85.0, 620] as [number, number, number], collected: false },
      { id: 'c13', position: [-470, 38.0, 420] as [number, number, number], collected: false },
      { id: 'c14', position: [-520, 45.0, -180] as [number, number, number], collected: false }
    ],
    targetCrystals: [
      { id: 't1', position: [45, 3.5, -45] as [number, number, number], hp: 120, maxHp: 120, destroyed: false },
      { id: 't2', position: [-45, 3.5, 45] as [number, number, number], hp: 160, maxHp: 160, destroyed: false },
      { id: 't3', position: [0, 55.0, -480] as [number, number, number], hp: 200, maxHp: 200, destroyed: false },
      { id: 't4', position: [390, 22.0, -390] as [number, number, number], hp: 180, maxHp: 180, destroyed: false },
      { id: 't5', position: [540, 38.0, 120] as [number, number, number], hp: 190, maxHp: 190, destroyed: false },
      { id: 't6', position: [410, 38.0, 490] as [number, number, number], hp: 170, maxHp: 170, destroyed: false },
      { id: 't7', position: [0, 75.0, 600] as [number, number, number], hp: 180, maxHp: 180, destroyed: false },
      { id: 't8', position: [-450, 32.0, 400] as [number, number, number], hp: 190, maxHp: 190, destroyed: false },
      { id: 't9', position: [-500, 40.0, -160] as [number, number, number], hp: 180, maxHp: 180, destroyed: false }
    ],
    guardians: [
      {
        id: 'wild-magma-drake',
        name: 'Guardião do Vulcão de Magma',
        biomeId: 'magma' as DragonElement,
        position: [0, 56.0, -560] as [number, number, number]
      },
      {
        id: 'wild-cyber-mech',
        name: 'Sentinela Apex Robótico',
        biomeId: 'robotico' as DragonElement,
        position: [610, 48.0, 140] as [number, number, number]
      },
      {
        id: 'wild-celestial-wyrm',
        name: 'Serpe Celestial das Planícies',
        biomeId: 'planicie' as DragonElement,
        position: [460, 46.0, 550] as [number, number, number]
      },
      {
        id: 'wild-abyssal-leviathan',
        name: 'Leviatã da Lagoa Abissal',
        biomeId: 'aquatico' as DragonElement,
        position: [450, 26.0, -450] as [number, number, number]
      },
      {
        id: 'wild-ancient-treant-dragon',
        name: 'Dragão Silvestre Ancião',
        biomeId: 'floresta' as DragonElement,
        position: [-560, 46.0, -210] as [number, number, number]
      },
      {
        id: 'wild-permafrost-colossus',
        name: 'Colosso Glacial de Neve',
        biomeId: 'neve' as DragonElement,
        position: [0, 68.0, 660] as [number, number, number]
      },
      {
        id: 'wild-toxic-hydra',
        name: 'Hidra Venenosa do Pântano',
        biomeId: 'pantano' as DragonElement,
        position: [-510, 36.0, 460] as [number, number, number]
      }
    ]
  });

  // Main Three.js Scene Setup & Game Loop
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const width = containerRef.current.clientWidth || window.innerWidth;
    const height = containerRef.current.clientHeight || 700;

    // 1. Scene, Camera, Renderer with Photorealistic Tone Mapping
    const scene = new THREE.Scene();

    // Generate Procedural Realistic Textures
    const skyTexture = createAtmosphericSkyTexture();
    const grassTexture = createGrassTexture();
    const stoneTexture = createStoneTexture();
    const cobbleTexture = createCobbleTexture();
    const waterTexture = createWaterTexture();
    const lavaTexture = createLavaTexture();

    // Majestic Atmospheric Sky Dome (Expanded for +999999999999999999% continent view)
    const skyGeo = new THREE.SphereGeometry(160000, 32, 24);
    const skyMat = new THREE.MeshBasicMaterial({
      map: skyTexture,
      side: THREE.BackSide,
      fog: false
    });
    const skyDome = new THREE.Mesh(skyGeo, skyMat);
    scene.add(skyDome);

    // Realistic atmospheric haze fog across colossal mountain distances (tuned for 60km horizon)
    scene.fog = new THREE.FogExp2('#141d2e', 0.000015);

    const camera = new THREE.PerspectiveCamera(58, width / height, 0.5, 350000);
    camera.position.set(0, 6, 14);

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // 2. Realistic Multi-point Environmental Lights
    // Natural Sky & Ground Bounce Light
    const hemiLight = new THREE.HemisphereLight('#78a6d4', '#1f1b18', 0.85);
    scene.add(hemiLight);

    // Radiant Sun Light
    const sunLight = new THREE.DirectionalLight('#fff5e6', 2.2);
    sunLight.position.set(450, 750, 350);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 1600;
    const d = 280;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.bias = -0.0003;
    sunLight.shadow.normalBias = 0.04; // Eliminates shadow acne completely
    scene.add(sunLight);

    // Cinematic Rim / Backlight for specular silhouettes and scale definition
    const rimLight = new THREE.DirectionalLight('#93c5fd', 0.85);
    rimLight.position.set(-80, 50, -80);
    scene.add(rimLight);

    // Warm elemental ambient glow at Sanctuary
    const ambientPoint = new THREE.PointLight('#ea580c', 1.8, 120);
    ambientPoint.position.set(0, 14, 0);
    scene.add(ambientPoint);

    // 3. Ambient Atmospheric Dust & Sparkles
    const starsGeo = new THREE.BufferGeometry();
    const starCount = 600;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 600;
      starPositions[i + 1] = Math.random() * 250 + 10;
      starPositions[i + 2] = (Math.random() - 0.5) * 600;
    }
    starsGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starsMat = new THREE.PointsMaterial({
      color: '#ffffff',
      size: 1.4,
      transparent: true,
      opacity: 0.7
    });
    const stars = new THREE.Points(starsGeo, starsMat);
    scene.add(stars);

    // Volumetric Soft Floating Clouds removed for crystal clear skies ("tira as nuvens")
    const cloudsGroup = new THREE.Group();
    scene.add(cloudsGroup);

    // 4. Build Procedural Grand Unified Continent (All Biomes Together) & Protective Barrier
    const worldGroup = new THREE.Group();
    scene.add(worldGroup);

    // Ancient Ruin PBR Texture & Material
    const ruinTexture = createAncientRuinTexture();
    const ruinStoneMat = new THREE.MeshStandardMaterial({
      map: ruinTexture,
      bumpMap: ruinTexture,
      bumpScale: 0.1,
      roughness: 0.86,
      metalness: 0.08
    });

    // Material definitions for all biomes with rich PBR Bump & Roughness Maps
    const stoneMat = new THREE.MeshStandardMaterial({
      map: stoneTexture,
      bumpMap: stoneTexture,
      bumpScale: 0.08,
      color: '#3a3a46',
      roughness: 0.88,
      metalness: 0.1
    });
    const stonePathMat = new THREE.MeshStandardMaterial({
      map: cobbleTexture,
      bumpMap: cobbleTexture,
      bumpScale: 0.06,
      roughness: 0.78
    });
    const grassMat = new THREE.MeshStandardMaterial({
      map: grassTexture,
      bumpMap: grassTexture,
      bumpScale: 0.04,
      color: '#385c32',
      roughness: 0.82,
      metalness: 0.05
    });
    const forestGrassMat = new THREE.MeshStandardMaterial({
      map: grassTexture,
      bumpMap: grassTexture,
      bumpScale: 0.05,
      color: '#1a4224',
      roughness: 0.85
    });
    const magmaRockMat = new THREE.MeshStandardMaterial({
      map: stoneTexture,
      bumpMap: stoneTexture,
      bumpScale: 0.12,
      color: '#1f1614',
      roughness: 0.95
    });
    const lavaMat = new THREE.MeshStandardMaterial({
      map: lavaTexture,
      emissiveMap: lavaTexture,
      emissive: '#ea580c',
      emissiveIntensity: 0.85,
      roughness: 0.35
    });
    const cyberMat = new THREE.MeshStandardMaterial({
      color: '#182430',
      metalness: 0.88,
      roughness: 0.18
    });
    const cyanNeonMat = new THREE.MeshBasicMaterial({ color: '#00ffff' });
    const iceMat = new THREE.MeshStandardMaterial({
      color: '#d4ebff',
      roughness: 0.15,
      metalness: 0.25
    });
    const goldMat = new THREE.MeshStandardMaterial({
      color: '#d97706',
      metalness: 0.85,
      roughness: 0.22
    });
    const goldGrassMat = new THREE.MeshStandardMaterial({
      map: grassTexture,
      bumpMap: grassTexture,
      bumpScale: 0.04,
      color: '#ca8a04',
      roughness: 0.75
    });
    const waterMat = new THREE.MeshStandardMaterial({
      map: waterTexture,
      color: '#0284c7',
      roughness: 0.08,
      metalness: 0.25,
      transparent: true,
      opacity: 0.82
    });
    const swampMat = new THREE.MeshStandardMaterial({
      map: grassTexture,
      bumpMap: grassTexture,
      bumpScale: 0.05,
      color: '#213024',
      roughness: 0.9
    });
    const toxicWaterMat = new THREE.MeshStandardMaterial({
      map: waterTexture,
      color: '#16a34a',
      roughness: 0.15,
      emissive: '#14532d',
      emissiveIntensity: 0.4,
      transparent: true,
      opacity: 0.8
    });

    // Unified materials palette for procedural ruins
    const ruinsMats: RuinsBuilderMaterials = {
      stoneMat,
      ruinStoneMat,
      magmaRockMat,
      lavaMat,
      cyberMat,
      cyanNeonMat,
      iceMat,
      goldMat,
      goldStoneMat: goldGrassMat,
      swampStoneMat: swampMat,
      mossyStoneMat: stoneMat
    };

    // --- A. INVISIBLE BARRIER (Protective forcefield that prevents falling across 64km radius) ---
    const barrierGeo = new THREE.CylinderGeometry(INVISIBLE_BARRIER_RADIUS, INVISIBLE_BARRIER_RADIUS, 14000, 64, 8, true);
    const barrierMat = new THREE.MeshStandardMaterial({
      color: '#38bdf8',
      emissive: '#0284c7',
      emissiveIntensity: 0.15,
      transparent: true,
      opacity: 0.025, // faint shimmer when undisturbed; brightens dynamically on approach or contact
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const barrierMesh = new THREE.Mesh(barrierGeo, barrierMat);
    barrierMesh.position.y = 6000;
    scene.add(barrierMesh);

    // Ancient Runic Beacons around the perimeter securing the barrier
    const beaconCount = 64;
    const beaconGroup = new THREE.Group();
    scene.add(beaconGroup);
    for (let i = 0; i < beaconCount; i++) {
      const angle = (i / beaconCount) * Math.PI * 2;
      const bx = Math.cos(angle) * (INVISIBLE_BARRIER_RADIUS - 30.0);
      const bz = Math.sin(angle) * (INVISIBLE_BARRIER_RADIUS - 30.0);

      const pCol = new THREE.Mesh(
        new THREE.CylinderGeometry(18, 25, 60, 6),
        new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.8 })
      );
      pCol.position.set(bx, 28, bz);
      beaconGroup.add(pCol);

      const pRune = new THREE.Mesh(
        new THREE.OctahedronGeometry(14),
        new THREE.MeshBasicMaterial({ color: '#38bdf8' })
      );
      pRune.position.set(bx, 68, bz);
      beaconGroup.add(pRune);

      const pBeam = new THREE.Mesh(
        new THREE.CylinderGeometry(4.0, 4.0, 5000, 6),
        new THREE.MeshBasicMaterial({ color: '#0ea5e9', transparent: true, opacity: 0.28 })
      );
      pBeam.position.set(bx, 2500, bz);
      beaconGroup.add(pBeam);
    }

    // --- B. A GRANDE ILHA DOS DRAGÕES (+999999999999999999% EXPANDIDA - 60KM DE RAIO!) ---
    // Single Continuous Island Base Body
    const islandBaseGeo = new THREE.CylinderGeometry(SINGLE_ISLAND_RADIUS, SINGLE_ISLAND_RADIUS - 120, 60, 64);
    const islandBaseMesh = new THREE.Mesh(islandBaseGeo, grassMat);
    islandBaseMesh.position.y = ISLAND_SURFACE_Y - 30.0; // Top face sits exactly at ISLAND_SURFACE_Y (2.5)
    islandBaseMesh.receiveShadow = true;
    worldGroup.add(islandBaseMesh);

    // Perimeter Natural Cliff Edge Rim of the colossal island
    const rimGeo = new THREE.TorusGeometry(SINGLE_ISLAND_RADIUS - 10.0, 45.0, 8, 96);
    const rimMesh = new THREE.Mesh(rimGeo, stoneMat);
    rimMesh.rotation.x = Math.PI / 2;
    rimMesh.position.y = ISLAND_SURFACE_Y - 1.0;
    rimMesh.receiveShadow = true;
    worldGroup.add(rimMesh);

    // Majestic Floating Island Underside (Inverted Mountain Crags)
    const undersideGeo = new THREE.ConeGeometry(SINGLE_ISLAND_RADIUS - 120, 5500, 48);
    const underside = new THREE.Mesh(undersideGeo, new THREE.MeshStandardMaterial({ color: '#121218', roughness: 0.95 }));
    underside.rotation.x = Math.PI;
    underside.position.y = (ISLAND_SURFACE_Y - 60) - 2750;
    worldGroup.add(underside);

    // Dangling stalactites and crystal roots under the single island
    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2;
      const rad = 250 + (i % 6) * 600;
      const stalactiteGeo = new THREE.ConeGeometry(25, 180 + (i % 4) * 80, 6);
      const stalactite = new THREE.Mesh(stalactiteGeo, new THREE.MeshStandardMaterial({ color: '#1a1a24', roughness: 0.9 }));
      stalactite.rotation.x = Math.PI;
      stalactite.position.set(Math.cos(angle) * rad, -100 - (i % 3) * 60, Math.sin(angle) * rad);
      worldGroup.add(stalactite);

      const tipGeo = new THREE.OctahedronGeometry(12);
      const tipMat = new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? '#38bdf8' : '#f59e0b' });
      const tip = new THREE.Mesh(tipGeo, tipMat);
      tip.position.set(Math.cos(angle) * rad, -220 - (i % 3) * 90, Math.sin(angle) * rad);
      worldGroup.add(tip);
    }

    // --- C. SETORES BIOMÁTICOS INTEGRADOS NA SUPERFÍCIE DA ÚNICA ILHA ---
    // 1. Santuário Sagrado Central (x: 0, z: 0)
    const sanctuaryPlazaGeo = new THREE.CircleGeometry(32, 40);
    const sanctuaryPlaza = new THREE.Mesh(sanctuaryPlazaGeo, stoneMat);
    sanctuaryPlaza.rotation.x = -Math.PI / 2;
    sanctuaryPlaza.position.set(0, ISLAND_SURFACE_Y + 0.02, 0);
    sanctuaryPlaza.receiveShadow = true;
    worldGroup.add(sanctuaryPlaza);

    const obeliskGeo = new THREE.ConeGeometry(3.0, 24, 6);
    const obeliskMesh = new THREE.Mesh(obeliskGeo, stoneMat);
    obeliskMesh.position.set(0, ISLAND_SURFACE_Y + 12, 0);
    obeliskMesh.castShadow = true;
    worldGroup.add(obeliskMesh);

    const coreGeo = new THREE.SphereGeometry(1.8, 16, 16);
    const coreMat = new THREE.MeshBasicMaterial({ color: '#f97316' });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreMesh.position.set(0, ISLAND_SURFACE_Y + 16, 0);
    worldGroup.add(coreMesh);

    // 6 Monólitos Guardiões nos limites do Santuário
    for (let m = 0; m < 6; m++) {
      const mAngle = (m / 6) * Math.PI * 2;
      const mx = Math.cos(mAngle) * 22;
      const mz = Math.sin(mAngle) * 22;

      const monoGeo = new THREE.BoxGeometry(1.8, 7.5, 1.8);
      const mono = new THREE.Mesh(monoGeo, stoneMat);
      mono.position.set(mx, ISLAND_SURFACE_Y + 3.75, mz);
      worldGroup.add(mono);

      const eyeGeo = new THREE.OctahedronGeometry(0.65);
      const eye = new THREE.Mesh(eyeGeo, new THREE.MeshBasicMaterial({ color: '#38bdf8' }));
      eye.position.set(mx, ISLAND_SURFACE_Y + 8.2, mz);
      worldGroup.add(eye);
    }

    // --- 1.1 BOUTIQUE & LOJA DE ROUPAS 100% GRÁTIS DOS CONDUTORES ---
    // Posicionada no Santuário Central (x: 16, z: 12)
    const shopGroup = new THREE.Group();
    shopGroup.position.set(16, ISLAND_SURFACE_Y, 12);
    worldGroup.add(shopGroup);

    // Dais circular de mármore nobre
    const shopDais = new THREE.Mesh(
      new THREE.CylinderGeometry(5.8, 6.4, 0.45, 24),
      new THREE.MeshStandardMaterial({ color: '#262626', roughness: 0.4, metalness: 0.2 })
    );
    shopDais.position.y = 0.22;
    shopDais.receiveShadow = true;
    shopGroup.add(shopDais);

    // Tapete imperial de veludo roxo com acabamento dourado
    const shopCarpet = new THREE.Mesh(
      new THREE.CircleGeometry(4.8, 24),
      new THREE.MeshStandardMaterial({ color: '#581c87', roughness: 0.8 })
    );
    shopCarpet.rotation.x = -Math.PI / 2;
    shopCarpet.position.y = 0.46;
    shopGroup.add(shopCarpet);

    const carpetTrim = new THREE.Mesh(
      new THREE.RingGeometry(4.7, 4.88, 32),
      new THREE.MeshStandardMaterial({ color: '#eab308', metalness: 0.85, roughness: 0.2 })
    );
    carpetTrim.rotation.x = -Math.PI / 2;
    carpetTrim.position.y = 0.47;
    shopGroup.add(carpetTrim);

    // 4 Colunas com capitéis dourados
    const columnMat = new THREE.MeshStandardMaterial({ color: '#f5f5f5', roughness: 0.35, metalness: 0.1 });
    const colCapMat = new THREE.MeshStandardMaterial({ color: '#eab308', metalness: 0.85, roughness: 0.25 });
    const colRadius = 3.6;
    for (let c = 0; c < 4; c++) {
      const cAngle = (c / 4) * Math.PI * 2 + Math.PI / 4;
      const cx = Math.cos(cAngle) * colRadius;
      const cz = Math.sin(cAngle) * colRadius;

      const colMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 4.6, 12), columnMat);
      colMesh.position.set(cx, 2.7, cz);
      colMesh.castShadow = true;
      shopGroup.add(colMesh);

      const capMesh = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.25, 0.7), colCapMat);
      capMesh.position.set(cx, 5.05, cz);
      shopGroup.add(capMesh);
    }

    // Pavilhão / Teto da Loja de Roupas
    const shopRoof = new THREE.Mesh(
      new THREE.ConeGeometry(4.8, 2.2, 16),
      new THREE.MeshStandardMaterial({ color: '#7e22ce', roughness: 0.4, metalness: 0.3 })
    );
    shopRoof.position.y = 6.2;
    shopRoof.castShadow = true;
    shopGroup.add(shopRoof);

    // Finial & Joia Mística no topo
    const finialMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.18, 1.2, 8), colCapMat);
    finialMesh.position.y = 7.7;
    shopGroup.add(finialMesh);

    // Ícone 3D Flutuante da Loja (Coroa/Cabide Mágico)
    const floatingShopIcon = new THREE.Group();
    floatingShopIcon.position.set(0, 3.2, 0);
    shopGroup.add(floatingShopIcon);

    const iconCrown = new THREE.Mesh(
      new THREE.TorusGeometry(0.65, 0.14, 8, 16),
      new THREE.MeshStandardMaterial({ color: '#eab308', metalness: 0.9, roughness: 0.15 })
    );
    iconCrown.rotation.x = Math.PI / 2;
    floatingShopIcon.add(iconCrown);

    const iconGem = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.35),
      new THREE.MeshBasicMaterial({ color: '#c084fc' })
    );
    floatingShopIcon.add(iconGem);

    // 3 Manequins de Exibição com Armaduras e Capas
    const mannequinMat = new THREE.MeshStandardMaterial({ color: '#3b0764', metalness: 0.6, roughness: 0.3 });
    const mannequinAngles = [-Math.PI / 3, 0, Math.PI / 3];
    mannequinAngles.forEach(ang => {
      const mx = Math.cos(ang) * 2.5;
      const mz = Math.sin(ang) * 2.5;

      const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.42, 0.8, 12), colCapMat);
      stand.position.set(mx, 0.85, mz);
      shopGroup.add(stand);

      const mTorso = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.65, 0.28), mannequinMat);
      mTorso.position.set(mx, 1.55, mz);
      shopGroup.add(mTorso);

      const mHead = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), colCapMat);
      mHead.position.set(mx, 2.05, mz);
      shopGroup.add(mHead);
    });

    // Anel Rúnico Mágico Interativo no chão
    const runeRing = new THREE.Mesh(
      new THREE.RingGeometry(1.6, 1.85, 32),
      new THREE.MeshBasicMaterial({ color: '#a855f7', side: THREE.DoubleSide })
    );
    runeRing.rotation.x = -Math.PI / 2;
    runeRing.position.y = 0.48;
    shopGroup.add(runeRing);

    // 7 Estradas de pedra pavimentadas ligando o Santuário a cada setor da ilha
    for (let i = 0; i < 7; i++) {
      const angle = (i / 7) * Math.PI * 2;
      const pathGeo = new THREE.PlaneGeometry(8.5, 78);
      const pathMesh = new THREE.Mesh(pathGeo, stonePathMat);
      pathMesh.rotation.x = -Math.PI / 2;
      pathMesh.rotation.z = -angle + Math.PI / 2;
      pathMesh.position.set(Math.cos(angle) * 44, ISLAND_SURFACE_Y + 0.03, Math.sin(angle) * 44);
      pathMesh.receiveShadow = true;
      worldGroup.add(pathMesh);
    }

    // 2. Setor Vulcânico de Magma (Norte: x: 0, z: -540)
    const magmaGroundGeo = new THREE.CircleGeometry(160, 36);
    const magmaGround = new THREE.Mesh(magmaGroundGeo, magmaRockMat);
    magmaGround.rotation.x = -Math.PI / 2;
    magmaGround.position.set(0, ISLAND_SURFACE_Y + 0.02, -540);
    magmaGround.receiveShadow = true;
    worldGroup.add(magmaGround);

    const lavaPoolGeo = new THREE.CircleGeometry(80, 28);
    const lavaPool = new THREE.Mesh(lavaPoolGeo, lavaMat);
    lavaPool.rotation.x = -Math.PI / 2;
    lavaPool.position.set(0, ISLAND_SURFACE_Y + 0.04, -540);
    worldGroup.add(lavaPool);

    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const spireGeo = new THREE.ConeGeometry(9.0, 38 + (i % 3) * 12, 5);
      const spire = new THREE.Mesh(spireGeo, magmaRockMat);
      spire.position.set(Math.cos(angle) * 110, ISLAND_SURFACE_Y + 19 + (i % 3) * 6, -540 + Math.sin(angle) * 110);
      worldGroup.add(spire);
    }

    // 3. Setor Lagoa Abissal Aquática (Nordeste: x: 430, z: -430)
    const aquaticGroundGeo = new THREE.CircleGeometry(150, 36);
    const aquaticGround = new THREE.Mesh(aquaticGroundGeo, new THREE.MeshStandardMaterial({ color: '#234152', roughness: 0.85 }));
    aquaticGround.rotation.x = -Math.PI / 2;
    aquaticGround.position.set(430, ISLAND_SURFACE_Y + 0.02, -430);
    aquaticGround.receiveShadow = true;
    worldGroup.add(aquaticGround);

    const lagoonGeo = new THREE.CircleGeometry(85, 28);
    const lagoonMesh = new THREE.Mesh(lagoonGeo, waterMat);
    lagoonMesh.rotation.x = -Math.PI / 2;
    lagoonMesh.position.set(430, ISLAND_SURFACE_Y + 0.04, -430);
    worldGroup.add(lagoonMesh);

    for (let i = 0; i < 7; i++) {
      const angle = (i / 7) * Math.PI * 2;
      const coralGeo = new THREE.ConeGeometry(6.0, 24 + i * 4, 5);
      const coralMat = new THREE.MeshStandardMaterial({ color: '#38bdf8', emissive: '#0284c7', emissiveIntensity: 0.4 });
      const coral = new THREE.Mesh(coralGeo, coralMat);
      coral.position.set(430 + Math.cos(angle) * 95, ISLAND_SURFACE_Y + 12 + i * 2, -430 + Math.sin(angle) * 95);
      worldGroup.add(coral);
    }

    // 4. Setor Cidadela Apex Robótica (Leste: x: 580, z: 130)
    const cyberGroundGeo = new THREE.CircleGeometry(160, 36);
    const cyberGround = new THREE.Mesh(cyberGroundGeo, cyberMat);
    cyberGround.rotation.x = -Math.PI / 2;
    cyberGround.position.set(580, ISLAND_SURFACE_Y + 0.02, 130);
    cyberGround.receiveShadow = true;
    worldGroup.add(cyberGround);

    const ringGeo = new THREE.TorusGeometry(55, 1.8, 12, 32);
    const ringMesh = new THREE.Mesh(ringGeo, cyanNeonMat);
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.position.set(580, ISLAND_SURFACE_Y + 12.0, 130);
    worldGroup.add(ringMesh);

    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const pylonGeo = new THREE.BoxGeometry(8, 48, 8);
      const pylon = new THREE.Mesh(pylonGeo, cyberMat);
      pylon.position.set(580 + Math.cos(angle) * 95, ISLAND_SURFACE_Y + 24, 130 + Math.sin(angle) * 95);
      worldGroup.add(pylon);
    }

    // 5. Setor Campos Dourados das Planícies (Sudeste: x: 440, z: 530)
    const plainsGroundGeo = new THREE.CircleGeometry(150, 36);
    const plainsGround = new THREE.Mesh(plainsGroundGeo, goldGrassMat);
    plainsGround.rotation.x = -Math.PI / 2;
    plainsGround.position.set(440, ISLAND_SURFACE_Y + 0.02, 530);
    plainsGround.receiveShadow = true;
    worldGroup.add(plainsGround);

    const archGeo = new THREE.TorusGeometry(36, 3.5, 8, 24, Math.PI);
    const arch = new THREE.Mesh(archGeo, goldMat);
    arch.position.set(440, ISLAND_SURFACE_Y + 36, 530);
    worldGroup.add(arch);

    // 6. Setor Glaciar Permafrost de Neve (Sul: x: 0, z: 640)
    const iceGroundGeo = new THREE.CircleGeometry(160, 36);
    const iceGround = new THREE.Mesh(iceGroundGeo, iceMat);
    iceGround.rotation.x = -Math.PI / 2;
    iceGround.position.set(0, ISLAND_SURFACE_Y + 0.02, 640);
    iceGround.receiveShadow = true;
    worldGroup.add(iceGround);

    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2;
      const shardGeo = new THREE.ConeGeometry(7.0, 42, 4);
      const shard = new THREE.Mesh(shardGeo, iceMat);
      shard.position.set(Math.cos(angle) * 105, ISLAND_SURFACE_Y + 21, 640 + Math.sin(angle) * 105);
      shard.rotation.z = (i % 2 === 0 ? 1 : -1) * 0.15;
      worldGroup.add(shard);
    }

    // 7. Setor Pântano Sombrio Venenoso (Sudoeste: x: -490, z: 440)
    const swampGroundGeo = new THREE.CircleGeometry(150, 36);
    const swampGround = new THREE.Mesh(swampGroundGeo, swampMat);
    swampGround.rotation.x = -Math.PI / 2;
    swampGround.position.set(-490, ISLAND_SURFACE_Y + 0.02, 440);
    swampGround.receiveShadow = true;
    worldGroup.add(swampGround);

    const swampWaterGeo = new THREE.CircleGeometry(75, 28);
    const swampWater = new THREE.Mesh(swampWaterGeo, toxicWaterMat);
    swampWater.rotation.x = -Math.PI / 2;
    swampWater.position.set(-490, ISLAND_SURFACE_Y + 0.04, 440);
    worldGroup.add(swampWater);

    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const stem = new THREE.Mesh(
        new THREE.CylinderGeometry(1.8, 2.6, 16, 6),
        new THREE.MeshStandardMaterial({ color: '#334155' })
      );
      const cap = new THREE.Mesh(
        new THREE.SphereGeometry(6.0, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2),
        new THREE.MeshStandardMaterial({
          color: i % 2 === 0 ? '#a855f7' : '#84cc16',
          emissive: i % 2 === 0 ? '#9333ea' : '#65a30d',
          emissiveIntensity: 0.6
        })
      );
      cap.position.y = 8;
      stem.add(cap);
      stem.position.set(-490 + Math.cos(angle) * 85, ISLAND_SURFACE_Y + 8, 440 + Math.sin(angle) * 85);
      worldGroup.add(stem);
    }

    // 8. Setor Bosque Ancestral da Floresta (Noroeste: x: -540, z: -200)
    const forestGroundGeo = new THREE.CircleGeometry(160, 36);
    const forestGround = new THREE.Mesh(forestGroundGeo, forestGrassMat);
    forestGround.rotation.x = -Math.PI / 2;
    forestGround.position.set(-540, ISLAND_SURFACE_Y + 0.02, -200);
    forestGround.receiveShadow = true;
    worldGroup.add(forestGround);

    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const trunkGeo = new THREE.CylinderGeometry(4.5, 7.5, 45, 6);
      const trunkMat = new THREE.MeshStandardMaterial({ color: '#3d2516', roughness: 0.9 });
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      const leavesGeo = new THREE.DodecahedronGeometry(18);
      const leavesMat = new THREE.MeshStandardMaterial({ color: '#166534', roughness: 0.7 });
      const leaves = new THREE.Mesh(leavesGeo, leavesMat);
      leaves.position.y = 25;
      trunk.add(leaves);
      trunk.position.set(-540 + Math.cos(angle) * 90, ISLAND_SURFACE_Y + 22.5, -200 + Math.sin(angle) * 90);
      worldGroup.add(trunk);
    }

    // --- D. RUÍNAS ANCESTRAIS PROCEDURAIS ESPALHADAS NOS BIOMAS ---
    // Ruínas do Santuário Central (Colunata e Panteão Sagrado dos Dragões)
    worldGroup.add(buildSanctuaryPantheonRuins(ISLAND_SURFACE_Y, ruinsMats));

    // Ruínas Vulcânicas de Magma (Muralhas de Basalto, Arcos e Altar de Fogo)
    worldGroup.add(buildVolcanoMagmaRuins(0, -540, ISLAND_SURFACE_Y, ruinsMats));

    // Ruínas Aquáticas da Lagoa Abissal (Rotunda Submersa, Degraus e Pilares Inclinados)
    worldGroup.add(buildAquaticLagoonRuins(430, -430, ISLAND_SURFACE_Y, ruinsMats));

    // Ruínas Robóticas da Cidadela Apex (Hangar em Ruínas, Núcleo e Portais Tecno-Místicos)
    worldGroup.add(buildRoboticApexRuins(580, 130, ISLAND_SURFACE_Y, ruinsMats));

    // Ruínas do Coliseu das Planícies (Grande Arco Triunfal, Arena e Pedestais)
    worldGroup.add(buildPlainsColiseumRuins(440, 530, ISLAND_SURFACE_Y, ruinsMats));

    // Ruínas do Glaciar Permafrost de Neve (Monólitos Dolmen, Círculo de Gelo e Obeliscos)
    worldGroup.add(buildIcePermafrostRuins(0, 640, ISLAND_SURFACE_Y, ruinsMats));

    // Ruínas do Pântano Sombrio (Mausoléu Afundado na Lama, Colunas Quebradas e Sepulcro)
    worldGroup.add(buildSwampBogRuins(-490, 440, ISLAND_SURFACE_Y, ruinsMats));

    // Ruínas do Bosque Ancestral da Floresta (Stonehenge Druídico, Dólmen e Altares de Musgo)
    worldGroup.add(buildForestGroveRuins(-540, -200, ISLAND_SURFACE_Y, ruinsMats));

    // Torres de Vigília e Ruínas Antigas nas Encruzilhadas entre os Biomas
    worldGroup.add(buildCrossroadsWatchtowers(ISLAND_SURFACE_Y, SINGLE_ISLAND_RADIUS, ruinsMats));

    // --- D2. MARCOS DOS GRANDES CONTINENTES EXTERNOS (+999999999999999999% EXPANDIDOS) ---
    // 1. Super-Vulcão do Magma Cósmico (x: -1200, z: -4500)
    const outerMagmaGeo = new THREE.CircleGeometry(1200, 32);
    const outerMagmaMesh = new THREE.Mesh(outerMagmaGeo, magmaRockMat);
    outerMagmaMesh.rotation.x = -Math.PI / 2;
    outerMagmaMesh.position.set(-1200, ISLAND_SURFACE_Y + 0.05, -4500);
    worldGroup.add(outerMagmaMesh);

    const outerLavaGeo = new THREE.CircleGeometry(480, 24);
    const outerLavaMesh = new THREE.Mesh(outerLavaGeo, lavaMat);
    outerLavaMesh.rotation.x = -Math.PI / 2;
    outerLavaMesh.position.set(-1200, ISLAND_SURFACE_Y + 0.1, -4500);
    worldGroup.add(outerLavaMesh);

    // 2. Megacidade Apex Quântica (x: 5200, z: 2200)
    const outerCyberGeo = new THREE.CircleGeometry(1300, 32);
    const outerCyberMesh = new THREE.Mesh(outerCyberGeo, cyberMat);
    outerCyberMesh.rotation.x = -Math.PI / 2;
    outerCyberMesh.position.set(5200, ISLAND_SURFACE_Y + 0.05, 2200);
    worldGroup.add(outerCyberMesh);

    const outerCyberRing = new THREE.Mesh(
      new THREE.TorusGeometry(320, 12, 8, 32),
      cyanNeonMat
    );
    outerCyberRing.rotation.x = Math.PI / 2;
    outerCyberRing.position.set(5200, ISLAND_SURFACE_Y + 60, 2200);
    worldGroup.add(outerCyberRing);

    // 3. Fossa Oceânica Abissal dos Titãs (x: 4800, z: -4800)
    const outerAquaGeo = new THREE.CircleGeometry(1400, 32);
    const outerAquaMesh = new THREE.Mesh(outerAquaGeo, waterMat);
    outerAquaMesh.rotation.x = -Math.PI / 2;
    outerAquaMesh.position.set(4800, ISLAND_SURFACE_Y + 0.05, -4800);
    worldGroup.add(outerAquaMesh);

    // 4. Megabosque das Árvores-Mundo (x: -5400, z: -3200)
    const outerForestGeo = new THREE.CircleGeometry(1400, 32);
    const outerForestMesh = new THREE.Mesh(outerForestGeo, forestGrassMat);
    outerForestMesh.rotation.x = -Math.PI / 2;
    outerForestMesh.position.set(-5400, ISLAND_SURFACE_Y + 0.05, -3200);
    worldGroup.add(outerForestMesh);

    for (let t = 0; t < 6; t++) {
      const tAngle = (t / 6) * Math.PI * 2;
      const tx = -5400 + Math.cos(tAngle) * 350;
      const tz = -3200 + Math.sin(tAngle) * 350;
      const worldTreeTrunk = new THREE.Mesh(
        new THREE.CylinderGeometry(18, 32, 180, 8),
        new THREE.MeshStandardMaterial({ color: '#2d180f', roughness: 0.9 })
      );
      worldTreeTrunk.position.set(tx, ISLAND_SURFACE_Y + 90, tz);
      const worldTreeCrown = new THREE.Mesh(
        new THREE.DodecahedronGeometry(85),
        new THREE.MeshStandardMaterial({ color: '#166534', roughness: 0.7 })
      );
      worldTreeCrown.position.y = 110;
      worldTreeTrunk.add(worldTreeCrown);
      worldGroup.add(worldTreeTrunk);
    }

    // 5. Cordilheira Hiperbórea do Fim do Mundo (x: 800, z: 5500)
    const outerIceGeo = new THREE.CircleGeometry(1500, 32);
    const outerIceMesh = new THREE.Mesh(outerIceGeo, iceMat);
    outerIceMesh.rotation.x = -Math.PI / 2;
    outerIceMesh.position.set(800, ISLAND_SURFACE_Y + 0.05, 5500);
    worldGroup.add(outerIceMesh);

    // 6. Estepes Douradas Infinitas (x: 4600, z: 4800)
    const outerPlainsGeo = new THREE.CircleGeometry(1400, 32);
    const outerPlainsMesh = new THREE.Mesh(outerPlainsGeo, goldGrassMat);
    outerPlainsMesh.rotation.x = -Math.PI / 2;
    outerPlainsMesh.position.set(4600, ISLAND_SURFACE_Y + 0.05, 4800);
    worldGroup.add(outerPlainsMesh);

    // 7. Pântano Quântico Radioativo (x: -4800, z: 4500)
    const outerSwampGeo = new THREE.CircleGeometry(1400, 32);
    const outerSwampMesh = new THREE.Mesh(outerSwampGeo, swampMat);
    outerSwampMesh.rotation.x = -Math.PI / 2;
    outerSwampMesh.position.set(-4800, ISLAND_SURFACE_Y + 0.05, 4500);
    worldGroup.add(outerSwampMesh);

    // --- E. GRANDES CORDILHEIRAS E MONTANHAS PROCEDURAIS EXPANDIDAS ---
    buildContinentMountainRanges(
      worldGroup,
      {
        stoneMat,
        iceMat,
        magmaRockMat,
        lavaMat,
        cyberMat,
        cyanNeonMat,
        goldMat,
        goldGrassMat,
        swampMat,
        forestGrassMat,
        grassMat
      },
      ISLAND_SURFACE_Y
    );

    // 3D Realistic Wild Guardian Dragons perched majestically in each Biome Sector
    const guardianGroup = new THREE.Group();
    scene.add(guardianGroup);
    const guardianInstances: { guardianId: string; dragon: RealisticDragonInstance; baseRotY: number }[] = [];

    stateRef.current.guardians.forEach(guardian => {
      // Create natural rocky crag pedestal for the guardian dragon
      const perchGeo = new THREE.CylinderGeometry(4.2, 5.8, 3.2, 8);
      const perchMat = new THREE.MeshStandardMaterial({
        color: guardian.biomeId === 'magma' ? '#271b16' : guardian.biomeId === 'neve' ? '#334155' : '#1f2937',
        roughness: 0.95
      });
      const perch = new THREE.Mesh(perchGeo, perchMat);
      perch.position.set(guardian.position[0], guardian.position[1] + 0.8, guardian.position[2]);
      perch.receiveShadow = true;
      guardianGroup.add(perch);

      // Construct anatomically realistic 3D wild guardian dragon
      const wildDragon = buildRealisticDragonModel({
        element: guardian.biomeId,
        skinStyle: getDefaultSkinForElement(guardian.biomeId),
        isTitan: true,
        scale: 0.65,
        isPlayer: false
      });

      wildDragon.group.position.set(guardian.position[0], guardian.position[1] + 2.5, guardian.position[2]);
      const faceAngle = Math.atan2(-guardian.position[0], -guardian.position[2]);
      wildDragon.group.rotation.y = faceAngle;
      guardianGroup.add(wildDragon.group);

      guardianInstances.push({
        guardianId: guardian.id,
        dragon: wildDragon,
        baseRotY: faceAngle
      });
    });

    // Cloud mist sea removed for crystal clear visibility ("tira as nuvens")

    // 5. 3D Nests with Collectible Dragon Eggs
    const nestsGroup = new THREE.Group();
    scene.add(nestsGroup);

    const nestMeshes: { id: string; group: THREE.Group; eggMesh: THREE.Mesh; nestInfo: World3DNestInfo }[] = [];

    stateRef.current.nests.forEach(nest => {
      const nestGroup = new THREE.Group();
      nestGroup.position.set(nest.position[0], nest.position[1], nest.position[2]);

      // Nest bowl
      const bowlGeo = new THREE.TorusGeometry(2.8, 0.9, 8, 16);
      const bowlMat = new THREE.MeshStandardMaterial({
        color: nest.isBestNest ? '#0891b2' : '#3d2b1f',
        roughness: 0.9
      });
      const bowl = new THREE.Mesh(bowlGeo, bowlMat);
      bowl.rotation.x = Math.PI / 2;
      bowl.position.y = 0.5;
      nestGroup.add(bowl);

      // Glowing nest beacon aura
      const auraGeo = new THREE.RingGeometry(2.5, 3.8, 16);
      const auraMat = new THREE.MeshBasicMaterial({
        color: nest.glowColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.5
      });
      const aura = new THREE.Mesh(auraGeo, auraMat);
      aura.rotation.x = -Math.PI / 2;
      aura.position.y = 0.1;
      nestGroup.add(aura);

      // 3D Colossal Titan Egg inside the nest!
      const eggGeo = new THREE.SphereGeometry(1.4, 20, 20);
      eggGeo.scale(1, 1.52, 1);
      const eggMat = new THREE.MeshStandardMaterial({
        color: nest.color,
        emissive: nest.glowColor,
        emissiveIntensity: 0.45,
        roughness: 0.25,
        metalness: nest.biomeId === 'robotico' ? 0.75 : 0.2
      });
      const eggMesh = new THREE.Mesh(eggGeo, eggMat);
      eggMesh.position.y = 1.6;
      eggMesh.castShadow = true;
      nestGroup.add(eggMesh);

      // Golden Titan Halo Ring orbiting the egg
      const titanHaloGeo = new THREE.TorusGeometry(1.65, 0.08, 8, 24);
      const titanHaloMat = new THREE.MeshBasicMaterial({
        color: '#facc15',
        transparent: true,
        opacity: 0.85
      });
      const titanHalo = new THREE.Mesh(titanHaloGeo, titanHaloMat);
      titanHalo.rotation.x = Math.PI / 2.8;
      eggMesh.add(titanHalo);

      // Golden Titan Orbiting Crest
      const crestGeo = new THREE.OctahedronGeometry(0.35);
      const crestMat = new THREE.MeshBasicMaterial({ color: '#fef08a' });
      const crest = new THREE.Mesh(crestGeo, crestMat);
      crest.position.y = 2.4;
      eggMesh.add(crest);

      // Floating beacon beam upward
      const beamGeo = new THREE.CylinderGeometry(0.25, 0.5, 35, 8);
      const beamMat = new THREE.MeshBasicMaterial({
        color: nest.glowColor,
        transparent: true,
        opacity: 0.35
      });
      const beam = new THREE.Mesh(beamGeo, beamMat);
      beam.position.y = 15;
      nestGroup.add(beam);

      nestsGroup.add(nestGroup);
      nestMeshes.push({ id: nest.id, group: nestGroup, eggMesh, nestInfo: nest });
    });

    // 5.5 Passagem Secreta na Montanha de Neve e Ilha Secreta Perdida (Vila Ancestral & Bioma Negro)
    const snowPassageElevation = getMountainElevation(SECRET_ISLAND_CONFIG.snowMountainPassage.x, SECRET_ISLAND_CONFIG.snowMountainPassage.z);
    const snowPortalY = snowPassageElevation + ISLAND_SURFACE_Y;
    const snowPortalResult = buildSnowMountainSecretPortal(snowPortalY);
    scene.add(snowPortalResult.group);

    const secretIslandResult = buildSecretIslandRealm();
    scene.add(secretIslandResult.group);

    const secretIslandAnimList = [...snowPortalResult.animList, ...secretIslandResult.animList];
    const snowPassagePos = new THREE.Vector3(
      SECRET_ISLAND_CONFIG.snowMountainPassage.x,
      snowPortalY,
      SECRET_ISLAND_CONFIG.snowMountainPassage.z
    );
    const returnPortalPos = new THREE.Vector3(
      SECRET_ISLAND_CONFIG.islandCenter.x,
      SECRET_ISLAND_CONFIG.islandCenter.y,
      SECRET_ISLAND_CONFIG.islandCenter.z
    );

    // 6. Floating Draconic Crystals / Gems
    const crystalsGroup = new THREE.Group();
    scene.add(crystalsGroup);
    const crystalMeshList: { id: string; mesh: THREE.Mesh }[] = [];

    stateRef.current.crystals.forEach(c => {
      const geo = new THREE.OctahedronGeometry(1.1);
      const mat = new THREE.MeshStandardMaterial({
        color: '#38bdf8',
        emissive: '#0284c7',
        emissiveIntensity: 0.6,
        roughness: 0.2,
        metalness: 0.4
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(c.position[0], c.position[1], c.position[2]);
      crystalsGroup.add(mesh);
      crystalMeshList.push({ id: c.id, mesh });
    });

    // 7. Breakable Target Crystals (for Breath Attack test)
    const targetsGroup = new THREE.Group();
    scene.add(targetsGroup);
    const targetMeshList: { id: string; mesh: THREE.Mesh }[] = [];

    stateRef.current.targetCrystals.forEach(t => {
      const geo = new THREE.DodecahedronGeometry(1.8);
      const mat = new THREE.MeshStandardMaterial({
        color: '#f43f5e',
        emissive: '#e11d48',
        emissiveIntensity: 0.5,
        roughness: 0.3
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(t.position[0], t.position[1], t.position[2]);
      targetsGroup.add(mesh);
      targetMeshList.push({ id: t.id, mesh });
    });

    // 8. Construct Photorealistic Anatomical 3D Dragon Model
    const isTitan = !!activeDragon.isTitanPermanent || activeDragon.rarity === 'tita';
    const dragonScale = isTitan ? 0.78 : 0.54;

    const elementColors: Record<string, { primary: string; secondary: string; emissive: string }> = {
      magma: { primary: '#1c1310', secondary: '#ea580c', emissive: '#f97316' },
      aquatico: { primary: '#0c2838', secondary: '#0284c7', emissive: '#38bdf8' },
      floresta: { primary: '#152e18', secondary: '#16a34a', emissive: '#4ade80' },
      robotico: { primary: '#222831', secondary: '#06b6d4', emissive: '#22d3ee' },
      neve: { primary: '#2d3748', secondary: '#93c5fd', emissive: '#e0f2fe' },
      pantano: { primary: '#241429', secondary: '#a855f7', emissive: '#c084fc' },
      planicie: { primary: '#3d2c14', secondary: '#eab308', emissive: '#fde047' },
      ancestral: { primary: '#3d301b', secondary: '#f59e0b', emissive: '#fbbf24' },
      negro: { primary: '#09070e', secondary: '#4c1d95', emissive: '#a855f7' },
      eletrico: { primary: '#082f49', secondary: '#00f0ff', emissive: '#facc15' }
    };
    const curElemColors = elementColors[activeDragon.element] || elementColors.magma;

    const playerDragon = buildRealisticDragonModel({
      element: activeDragon.element,
      skinStyle: activeDragon.visual?.skinStyle || getDefaultSkinForElement(activeDragon.element),
      customColors: {
        primary: activeDragon.visual?.primaryColor || curElemColors.primary,
        secondary: activeDragon.visual?.secondaryColor || curElemColors.secondary,
        emissive: activeDragon.visual?.glowColor || curElemColors.emissive
      },
      isTitan,
      scale: dragonScale,
      equippedArmor: activeDragon.equippedArmor,
      isPlayer: true
    });
    scene.add(playerDragon.group);
    playerDragonRef.current = playerDragon;

    // Apply active rider custom clothing to mounted rider
    if (playerDragon.updateMountedRiderCustomization) {
      playerDragon.updateMountedRiderCustomization(customizationStateRef.current.currentOptions);
    }

    // Humanoid Dragon Rider Character Model for On-Foot Exploration
    const riderCharacter = buildHumanoidRiderModel({
      element: activeDragon.element,
      scale: 1.0,
      customization: customizationStateRef.current.currentOptions
    });
    riderCharacter.group.visible = false;
    scene.add(riderCharacter.group);
    riderInstanceRef.current = riderCharacter;

    // 3D Titan Creator Golden Crown Halo for Francisco
    let creatorCrownHalo: THREE.Group | null = null;
    if (isCreatorMode) {
      creatorCrownHalo = createTitanCreatorHalo();
      scene.add(creatorCrownHalo);
    }

    // 3D Remote Multiplayer Players Map
    const remotePlayers3DMap = new Map<string, {
      group: THREE.Group;
      dragon: RealisticDragonInstance;
      rider: RealisticRiderInstance;
      nameTag: THREE.Sprite;
    }>();

    const dragonGroup = playerDragon.group;
    const breathEmitter = playerDragon.breathEmitter;

    // Breath Attack Particles Particle System
    const breathCount = 150;
    const breathGeo = new THREE.BufferGeometry();
    const breathPos = new Float32Array(breathCount * 3);
    const breathVel: { x: number; y: number; z: number; life: number }[] = [];
    for (let i = 0; i < breathCount; i++) {
      breathPos[i * 3] = 0;
      breathPos[i * 3 + 1] = -1000;
      breathPos[i * 3 + 2] = 0;
      breathVel.push({ x: 0, y: 0, z: 0, life: 0 });
    }
    breathGeo.setAttribute('position', new THREE.BufferAttribute(breathPos, 3));
    const breathMat = new THREE.PointsMaterial({
      color: curElemColors.emissive,
      size: 2.2,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });
    const breathParticles = new THREE.Points(breathGeo, breathMat);
    scene.add(breathParticles);

    // Ambient Dragon Trail Particles (Embers/Mist)
    const trailCount = 60;
    const trailGeo = new THREE.BufferGeometry();
    const trailPos = new Float32Array(trailCount * 3);
    for (let i = 0; i < trailCount * 3; i += 3) {
      trailPos[i] = 0;
      trailPos[i + 1] = -1000;
      trailPos[i + 2] = 0;
    }
    trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPos, 3));
    const trailMat = new THREE.PointsMaterial({
      color: curElemColors.secondary,
      size: 1.8,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });
    const trailParticles = new THREE.Points(trailGeo, trailMat);
    scene.add(trailParticles);
    let trailIndex = 0;

    // 9. Input Listeners
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code in stateRef.current.keys) {
        (stateRef.current.keys as any)[e.code] = true;
      }

      // Space key flight toggle / ascend (or jump on foot)
      if (e.code === 'Space') {
        if (stateRef.current.isMounted && !stateRef.current.isFlying) {
          triggerTakeoff();
        }
      }

      // X key Dismount / Mount toggle
      if (e.code === 'KeyX') {
        if (stateRef.current.isMounted) {
          triggerDismount();
        } else {
          triggerMount();
        }
      }

      // V key toggle flight mode (Takeoff / Landing)
      if (e.code === 'KeyV') {
        if (stateRef.current.isMounted) {
          if (!stateRef.current.isFlying) {
            triggerTakeoff();
          } else {
            triggerLanding();
          }
        }
      }

      // R key Roar
      if (e.code === 'KeyR' && stateRef.current.roarCooldown <= 0) {
        triggerRoar();
      }

      // F key or Click Breath Attack
      if (e.code === 'KeyF') {
        triggerBreathAttack();
      }

      // E key Interact / Collect / Mount
      if (e.code === 'KeyE') {
        triggerInteraction();
      }

      // T key Toggle Hyper-Speed Mode
      if (e.code === 'KeyT') {
        triggerToggleHyperSpeed();
      }

      // M key Toggle Teleport Map
      if (e.code === 'KeyM') {
        setShowTeleportMap(prev => !prev);
      }

      // K key Toggle Realistic Skins Modal
      if (e.code === 'KeyK') {
        setShowSkinModal(prev => !prev);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code in stateRef.current.keys) {
        (stateRef.current.keys as any)[e.code] = false;
      }
    };

    let mouseMoved = false;
    const handleMouseDown = (e: MouseEvent) => {
      mouseMoved = false;
      stateRef.current.isMouseDown = true;
      stateRef.current.mouseLastX = e.clientX;
      stateRef.current.mouseLastY = e.clientY;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (stateRef.current.isMouseDown) {
        const deltaX = e.clientX - stateRef.current.mouseLastX;
        const deltaY = e.clientY - stateRef.current.mouseLastY;
        if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
          mouseMoved = true;
        }
        stateRef.current.mouseLastX = e.clientX;
        stateRef.current.mouseLastY = e.clientY;

        stateRef.current.cameraAngles.theta -= deltaX * 0.007;
        stateRef.current.cameraAngles.phi = Math.max(
          0.05,
          Math.min(Math.PI / 2.2, stateRef.current.cameraAngles.phi + deltaY * 0.007)
        );
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (stateRef.current.isMouseDown && !mouseMoved && e.button === 0) {
        triggerBreathAttack();
      }
      stateRef.current.isMouseDown = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      stateRef.current.cameraAngles.radius = Math.max(
        5,
        Math.min(24, stateRef.current.cameraAngles.radius + e.deltaY * 0.02)
      );
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    canvasRef.current.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    canvasRef.current.addEventListener('wheel', handleWheel, { passive: false });

    // 10. Action Triggers & Flight Controls
    const triggerTakeoff = () => {
      const state = stateRef.current;
      if (!state.isFlying) {
        state.isFlying = true;
        state.takeoffGrace = 2.5; // generous grace period to ascend smoothly
        state.verticalSpeed = 26.0;
        state.dragonPos.y += 3.5;
        state.forwardSpeed = Math.max(state.forwardSpeed, 28.0);
        state.autoLanding = false;
        setIsFlying(true);
        soundFx.playWingFlap();
        soundFx.playWhoosh();
      }
    };

    const triggerLanding = () => {
      const state = stateRef.current;
      if (!state.isFlying) return;
      const island = getIslandAt(state.dragonPos.x, state.dragonPos.z);
      const groundY = island ? island.surfaceY : 2.5;
      const standingY = groundY + 0.85;
      const dist = state.dragonPos.y - standingY;

      if (dist < 10.0) {
        state.dragonPos.y = standingY;
        state.verticalSpeed = 0;
        state.forwardSpeed = Math.min(state.forwardSpeed, 10);
        state.isFlying = false;
        state.autoLanding = false;
        setIsFlying(false);
        soundFx.playWingFlap();
      } else {
        // High in the air: initiate smooth automated descent until touchdown
        state.autoLanding = true;
      }
    };

    const triggerRoar = () => {
      stateRef.current.roarCooldown = 3;
      setIsRoaring(true);
      soundFx.playRoar(activeDragon.element);
      if (multiplayer?.sendAction) {
        multiplayer.sendAction('roar');
      }
      setTimeout(() => setIsRoaring(false), 1200);

      // Camera shake
      stateRef.current.cameraAngles.radius += 1.5;
    };

    const triggerBreathAttack = () => {
      setIsAttacking(true);
      if (multiplayer?.sendAction) {
        multiplayer.sendAction('attack');
      }
      if (activeDragon.element === 'robotico') {
        soundFx.playLaser();
      } else {
        soundFx.playFire();
      }
      setTimeout(() => setIsAttacking(false), 800);

      // Spawn breath particles in forward trajectory from mouth
      const mouthPos = new THREE.Vector3();
      breathEmitter.getWorldPosition(mouthPos);

      const forwardDir = new THREE.Vector3(0, 0, 1)
        .applyAxisAngle(new THREE.Vector3(0, 1, 0), stateRef.current.dragonYaw)
        .normalize();

      for (let i = 0; i < 25; i++) {
        const idx = (Math.floor(Math.random() * breathCount));
        breathPos[idx * 3] = mouthPos.x;
        breathPos[idx * 3 + 1] = mouthPos.y;
        breathPos[idx * 3 + 2] = mouthPos.z;

        const spread = 0.25;
        breathVel[idx] = {
          x: (forwardDir.x + (Math.random() - 0.5) * spread) * 28,
          y: (forwardDir.y + (Math.random() - 0.5) * spread) * 28,
          z: (forwardDir.z + (Math.random() - 0.5) * spread) * 28,
          life: 0.7
        };
      }
      breathGeo.attributes.position.needsUpdate = true;

      // Check hit against target breakable crystals
      stateRef.current.targetCrystals.forEach(target => {
        if (target.destroyed) return;
        const targetPos = new THREE.Vector3(...target.position);
        if (mouthPos.distanceTo(targetPos) < 18) {
          target.hp -= breathDamage;
          if (target.hp <= 0) {
            target.destroyed = true;
            onAwardXp(120);
            soundFx.playVictory();
            setCollectedNotification({
              text: 'Cristal Dracônico Destruído!',
              subtext: '+120 XP concedido ao seu Dragão!',
              icon: '💎'
            });
            setTimeout(() => setCollectedNotification(null), 3500);
          }
        }
      });
    };

    // Rider Mount & Dismount Action Handlers
    const triggerDismount = () => {
      const state = stateRef.current;
      if (!state.isMounted) return;

      if (state.isFlying) {
        setCollectedNotification({
          text: 'Pousa Primeiro!',
          subtext: 'Aterriza o dragão em solo firme antes de desmontar.',
          icon: '⚠️'
        });
        setTimeout(() => setCollectedNotification(null), 3000);
        return;
      }

      // Calculate dismount position next to dragon (to the left side)
      const sideOffset = new THREE.Vector3(-2.8, 0, 0.4);
      sideOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), state.dragonYaw);
      const dismountPos = state.dragonPos.clone().add(sideOffset);
      const ground = getIslandAt(dismountPos.x, dismountPos.z);
      dismountPos.y = (ground ? ground.surfaceY : 2.5) + 0.05;

      state.riderPos.copy(dismountPos);
      state.riderYaw = state.dragonYaw;
      state.riderForwardSpeed = 0;
      state.riderVerticalSpeed = 0;
      state.riderIsGrounded = true;
      state.isMounted = false;
      setIsMounted(false);

      playerDragon.setRiderMounted?.(false);
      riderCharacter.group.visible = true;
      riderCharacter.group.position.copy(dismountPos);
      riderCharacter.group.rotation.y = state.riderYaw;

      // Adjust camera distance for third-person on-foot view
      state.cameraAngles.radius = 6.2;
      state.cameraAngles.phi = 0.28;

      soundFx.playWingFlap();
      setCollectedNotification({
        text: 'Condutor Desmontou do Dragão!',
        subtext: 'Podes explorar a ilha e as ruínas a pé. Pressiona [E] ou toca em Montar para voltar ao dragão!',
        icon: '🚶'
      });
      setTimeout(() => setCollectedNotification(null), 3500);
    };

    const triggerMount = () => {
      const state = stateRef.current;
      if (state.isMounted) return;

      const dist = state.riderPos.distanceTo(state.dragonPos);
      if (dist > 7.5) {
        setCollectedNotification({
          text: 'Muito longe do dragão!',
          subtext: 'Aproxima-te do teu dragão ou toca em "Chamar Dragão" para ele vir até ti.',
          icon: '🐉'
        });
        setTimeout(() => setCollectedNotification(null), 3000);
        return;
      }

      state.isMounted = true;
      setIsMounted(true);
      playerDragon.setRiderMounted?.(true);
      riderCharacter.group.visible = false;

      // Adjust camera distance back to dragon view
      state.cameraAngles.radius = 10.5;
      state.cameraAngles.phi = 0.30;

      soundFx.playRoar(activeDragon.element);
      setCollectedNotification({
        text: 'Montaste no teu Dragão!',
        subtext: `Pronto para voar e lutar com ${activeDragon.name}!`,
        icon: '🐉'
      });
      setTimeout(() => setCollectedNotification(null), 3500);
    };

    const triggerCallDragon = () => {
      const state = stateRef.current;
      if (state.isMounted) return;

      // Teleport / summon dragon right behind and beside the rider
      const sideOffset = new THREE.Vector3(2.8, 0, -1.2);
      sideOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), state.riderYaw);
      const targetPos = state.riderPos.clone().add(sideOffset);
      const ground = getIslandAt(targetPos.x, targetPos.z);
      targetPos.y = (ground ? ground.surfaceY : 2.5) + 0.85;

      state.dragonPos.copy(targetPos);
      state.dragonYaw = state.riderYaw;
      state.forwardSpeed = 0;
      state.verticalSpeed = 0;
      state.isFlying = false;

      soundFx.playRoar(activeDragon.element);
      setCollectedNotification({
        text: 'Dragão Chamado!',
        subtext: `${activeDragon.name} atendeu ao teu chamado e pousou ao teu lado!`,
        icon: '📯'
      });
      setTimeout(() => setCollectedNotification(null), 3500);
    };

    const triggerTeleport = (targetX: number, targetZ: number, sectorName: string) => {
      const state = stateRef.current;
      const targetGround = getIslandAt(targetX, targetZ);
      const targetY = (targetGround ? targetGround.surfaceY : ISLAND_SURFACE_Y) + 1.5;

      if (state.isMounted) {
        state.dragonPos.set(targetX, targetY, targetZ);
        state.forwardSpeed = 0;
        state.verticalSpeed = 0;
        state.isFlying = false;
        playerDragon.group.position.copy(state.dragonPos);
      } else {
        state.riderPos.set(targetX, targetY, targetZ);
        state.riderForwardSpeed = 0;
        state.riderVerticalSpeed = 0;
        state.riderIsGrounded = true;
        state.dragonPos.set(targetX + 3.0, targetY, targetZ);
        state.forwardSpeed = 0;
        state.verticalSpeed = 0;
        riderCharacter.group.position.copy(state.riderPos);
        playerDragon.group.position.copy(state.dragonPos);
      }
      soundFx.playWhoosh();
      setCollectedNotification({
        text: `Dobra Hiperespacial Concluída!`,
        subtext: `Chegaste a: ${sectorName} no Continente Cósmico!`,
        icon: '🌌'
      });
      setTimeout(() => setCollectedNotification(null), 3500);
    };

    const triggerToggleHyperSpeed = () => {
      setIsHyperSpeed(prev => {
        const next = !prev;
        stateRef.current.isHyperSpeed = next;
        soundFx.playWhoosh();
        setCollectedNotification({
          text: next ? '🚀 HIPER-VELOCIDADE TITÂNICA ATIVADA!' : 'Propulsão Normal Ativada',
          subtext: next ? 'Velocidades Supersônicas Mach 3+ ativadas para cruzar a ilha gigantesca!' : 'Modo de cruzeiro padrão ativado.',
          icon: next ? '🚀' : '✈️'
        });
        setTimeout(() => setCollectedNotification(null), 3000);
        return next;
      });
    };

    actionHandlersRef.current = {
      takeoff: triggerTakeoff,
      land: triggerLanding,
      attack: triggerBreathAttack,
      roar: triggerRoar,
      dismount: triggerDismount,
      mount: triggerMount,
      callDragon: triggerCallDragon,
      teleportTo: triggerTeleport,
      toggleHyperSpeed: triggerToggleHyperSpeed,
      openClothesShop: () => setShowClothesShop(true),
      zoomIn: () => {
        stateRef.current.cameraAngles.radius = Math.max(5, stateRef.current.cameraAngles.radius - 2);
      },
      zoomOut: () => {
        stateRef.current.cameraAngles.radius = Math.min(24, stateRef.current.cameraAngles.radius + 2);
      }
    };

    const triggerInteraction = () => {
      const state = stateRef.current;
      // If dismounted and near dragon, mount dragon!
      if (!state.isMounted) {
        const distToDragon = state.riderPos.distanceTo(state.dragonPos);
        if (distToDragon <= 7.0) {
          triggerMount();
          return;
        }
      }

      // Check nearest nest (using active player position: dragonPos if mounted, riderPos if on foot)
      const playerPos = state.isMounted ? state.dragonPos : state.riderPos;

      // Check nearest Clothes Shop pavilion in Sanctuary
      const shopPos = new THREE.Vector3(16, ISLAND_SURFACE_Y, 12);
      if (playerPos.distanceTo(shopPos) < 9.5) {
        setShowClothesShop(true);
        soundFx.playVictory();
        return;
      }

      // Check Snow Mountain Secret Passage Portal
      if (playerPos.distanceTo(snowPassagePos) < 14) {
        soundFx.playWhoosh();
        soundFx.playVictory();
        triggerTeleport(
          SECRET_ISLAND_CONFIG.islandCenter.x,
          SECRET_ISLAND_CONFIG.islandCenter.z,
          'Ilha Secreta Perdida: Vila Ancestral & Bioma Negro'
        );
        setCollectedNotification({
          text: '✨ BEM-VINDO À ILHA SECRETA PERDIDA!',
          subtext: 'Descobriste a Ilha Secreta! Explora a Vila Ancestral a Oeste e o Bioma Negro a Leste. Só aqui podes coletar estes ovos!',
          icon: '🏝️'
        });
        setTimeout(() => setCollectedNotification(null), 5000);
        return;
      }

      // Check Return Portal on Secret Island
      if (playerPos.distanceTo(returnPortalPos) < 14) {
        soundFx.playWhoosh();
        triggerTeleport(
          SECRET_ISLAND_CONFIG.snowMountainPassage.x,
          SECRET_ISLAND_CONFIG.snowMountainPassage.z + 18,
          'Montanha de Neve'
        );
        setCollectedNotification({
          text: '❄️ RETORNOU AO CONTINENTE',
          subtext: 'De volta aos picos glaciais da Montanha de Neve.',
          icon: '🏔️'
        });
        setTimeout(() => setCollectedNotification(null), 4000);
        return;
      }

      for (const nest of stateRef.current.nests) {
        const nestPos = new THREE.Vector3(...nest.position);
        if (playerPos.distanceTo(nestPos) < 12 && nest.ready) {
          nest.ready = false;
          const newEgg = DragonGameApi.harvestNestEgg(nest);
          onCollectEgg(newEgg);
          soundFx.playEggCrack();
          soundFx.playVictory();
          const isSecret = nest.biomeId === 'ancestral' || nest.biomeId === 'negro' || nest.biomeId === 'eletrico';
          const secretIcon = nest.biomeId === 'ancestral' ? '🏛️' : nest.biomeId === 'eletrico' ? '⚡' : '🌑';
          setCollectedNotification({
            text: isSecret ? `✨ OVO TITÃ DA ILHA SECRETA COLETADO!` : `👑 OVO TITÃ SUPREMO COLETADO!`,
            subtext: `${newEgg.name} (Raridade TITÃ) adicionado à tua Incubadora! ${isSecret ? 'Exclusivo da Ilha Secreta no Mundo 3D!' : ''}`,
            icon: isSecret ? secretIcon : '👑'
          });
          setTimeout(() => setCollectedNotification(null), 4500);

          // Nest respawn timer
          setTimeout(() => {
            nest.ready = true;
          }, 30000);
          return;
        }
      }

      // Check nearest wild guardian
      for (const guardian of stateRef.current.guardians) {
        const guardianPos = new THREE.Vector3(...guardian.position);
        if (playerPos.distanceTo(guardianPos) < 15) {
          const battleData = DragonGameApi.getGuardianForBiome(guardian.biomeId);
          if (battleData) {
            onStartBattle(battleData.guardian, battleData.biome);
          }
          return;
        }
      }
    };

    // 11. Responsive Resize Observer
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const newW = entry.contentRect.width;
        const newH = entry.contentRect.height;
        if (newW > 0 && newH > 0) {
          camera.aspect = newW / newH;
          camera.updateProjectionMatrix();
          renderer.setSize(newW, newH);
        }
      }
    });
    resizeObserver.observe(containerRef.current);

    // 12. Main Animation / Physics Loop
    let animationFrameId: number;
    let lastTime = performance.now();
    let barrierImpactIntensity = 0;
    let barrierNoticeCooldown = 0;
    let teleportCooldown = 0;

    const animate = (currentTime: number) => {
      animationFrameId = requestAnimationFrame(animate);

      const dt = Math.min(0.1, (currentTime - lastTime) / 1000);
      lastTime = currentTime;

      const state = stateRef.current;
      const keys = state.keys;

      // Handle cooldowns & timers
      if (state.roarCooldown > 0) state.roarCooldown -= dt;
      if (state.takeoffGrace > 0) state.takeoffGrace -= dt;
      if (teleportCooldown > 0) teleportCooldown -= dt;

      // Movement Input Processing
      const inputForward = (keys.KeyW || keys.ArrowUp ? 1 : 0) - (keys.KeyS || keys.ArrowDown ? 0.6 : 0) + state.touchMovement.y;
      const inputTurn = (keys.KeyD || keys.ArrowRight ? -1 : 0) + (keys.KeyA || keys.ArrowLeft ? 1 : 0) - state.touchMovement.x;
      const inputAscend = (keys.Space || state.touchFlyingUp) ? 1 : 0;
      const inputDescend = (keys.ShiftLeft || keys.ShiftRight || keys.KeyC || state.touchFlyingDown) ? 1 : 0;
      const isBoostKey = keys.KeyQ || state.touchBoosting;
      const isHyper = state.isHyperSpeed;
      const canBoost = isBoostKey && (isHyper || state.stamina > 8);

      // --- BRANCH: MOUNTED DRAGON VS ON-FOOT RIDER ---
      if (state.isMounted) {
        // --- MOUNTED DRAGON MODE ---
        // Turn dragon yaw & banking roll
        if (Math.abs(inputTurn) > 0.05) {
          const turnRate = state.isFlying ? (isHyper ? 3.0 : 2.4) : 2.8;
          state.dragonYaw += inputTurn * turnRate * dt;
          const targetRoll = inputTurn * (state.isFlying ? (isHyper ? 0.7 : 0.55) : 0.2);
          state.dragonRoll = THREE.MathUtils.lerp(state.dragonRoll, targetRoll, 0.12);
        } else {
          state.dragonRoll = THREE.MathUtils.lerp(state.dragonRoll, 0, 0.1);
        }

        // Authoritative ground height on the unified continent
        const currentIsland = getIslandAt(state.dragonPos.x, state.dragonPos.z);
        const groundY = currentIsland ? currentIsland.surfaceY : 2.0;

        // Vertical & horizontal flight dynamics
        if (state.isFlying) {
          // Stamina management in flight
          if (isHyper) {
            state.stamina = 100;
          } else if (inputAscend && state.stamina > 5) {
            state.stamina = Math.max(0, state.stamina - 12 * dt);
          } else if (canBoost && isBoostKey) {
            state.stamina = Math.max(0, state.stamina - 16 * dt);
          } else {
            // Regenerate stamina during steady glide
            state.stamina = Math.min(100, state.stamina + 10 * dt);
          }

          // Vertical speed target
          let targetVertSpeed = 0;
          if (inputAscend && (isHyper || state.stamina > 5)) {
            targetVertSpeed = isHyper ? (canBoost ? 140 : 85) : (canBoost ? 42 : 24);
            state.flapSoundTimer += dt;
            if (state.flapSoundTimer > (isHyper ? 0.22 : 0.40)) {
              soundFx.playWingFlap();
              state.flapSoundTimer = 0;
            }
          } else if (inputDescend || state.autoLanding) {
            targetVertSpeed = isHyper ? (canBoost ? -140 : -85) : (canBoost ? -38 : -22);
          } else {
            // Subtle natural gliding wave
            targetVertSpeed = Math.sin(currentTime * 0.003) * (isHyper ? 2.5 : 1.2);
          }

          state.verticalSpeed = THREE.MathUtils.lerp(state.verticalSpeed, targetVertSpeed, 0.14);
          state.dragonPos.y += state.verticalSpeed * dt;

          // Flight ceiling (raised to 6000m to allow soaring far above all mountains into the stratosphere!)
          if (state.dragonPos.y > 6000) {
            state.dragonPos.y = 6000;
            state.verticalSpeed = Math.min(0, state.verticalSpeed);
          }

          // Pitch based on climb / dive / forward motion
          const pitchGoal = (state.verticalSpeed * 0.025) - (inputForward * 0.1);
          state.dragonPitch = THREE.MathUtils.lerp(state.dragonPitch, pitchGoal, 0.1);

          // Forward speed in flight (Hyper-Speed Mach 3+ across the 60km continent!)
          const baseSpeed = isHyper ? (canBoost ? 750 : 380) : (canBoost ? 95 : 46);
          const diveBonus = state.verticalSpeed < -4 ? Math.abs(state.verticalSpeed) * (isHyper ? 1.4 : 0.65) : 0;
          const targetForward = (inputForward !== 0 ? inputForward : 0.45) * (baseSpeed + diveBonus);
          state.forwardSpeed = THREE.MathUtils.lerp(state.forwardSpeed, targetForward, isHyper ? 0.06 : 0.08);

          // Landing check: only touch down when the player is deliberately landing (autoLanding or inputDescend)
          const standingY = groundY + 0.85;
          const isActivelyLanding = state.autoLanding || inputDescend;

          if (isActivelyLanding && state.takeoffGrace <= 0 && state.dragonPos.y <= standingY + 1.5) {
            state.dragonPos.y = standingY;
            state.verticalSpeed = 0;
            state.forwardSpeed = Math.min(state.forwardSpeed, 12);
            state.isFlying = false;
            state.autoLanding = false;
            setIsFlying(false);
            soundFx.playWingFlap();
          }

          // Absolute safety floor: dragon glides smoothly over ground & mountain contours without clipping!
          if (state.dragonPos.y < standingY) {
            state.dragonPos.y = standingY;
            state.verticalSpeed = Math.max(0, state.verticalSpeed);
          }
        } else {
          // GROUND MODE
          state.dragonPos.y = groundY + 0.85;
          state.verticalSpeed = 0;
          state.stamina = Math.min(100, state.stamina + 25 * dt);
          state.dragonPitch = THREE.MathUtils.lerp(state.dragonPitch, 0, 0.15);

          const groundMoveSpeed = isHyper ? (canBoost ? 75 : 40) : (canBoost ? 28 : 16);
          const targetForward = inputForward * groundMoveSpeed;
          state.forwardSpeed = THREE.MathUtils.lerp(state.forwardSpeed, targetForward, 0.15);
        }

        // Forward vector based on yaw
        const forwardX = Math.sin(state.dragonYaw);
        const forwardZ = Math.cos(state.dragonYaw);
        state.dragonPos.x += forwardX * state.forwardSpeed * dt;
        state.dragonPos.z += forwardZ * state.forwardSpeed * dt;

        // SOLID ICE MOUNTAIN COLLISION ENFORCEMENT ("faz com que não atravessemos a montanha de gelo")
        const dIce = Math.hypot(state.dragonPos.x - 0, state.dragonPos.z - 640);
        if (dIce < 225) {
          const distToPassage = Math.hypot(state.dragonPos.x - (-30), state.dragonPos.z - 665);
          const isAtPassagePortal = distToPassage < 15;
          if (!isAtPassagePortal) {
            const coneRadius = 210;
            const coneHeight = 160;
            const heightFrac = Math.max(0, Math.min(1, (state.dragonPos.y - ISLAND_SURFACE_Y) / coneHeight));
            const solidConeRadius = coneRadius * (1 - heightFrac) + 6.0;

            if (dIce < solidConeRadius) {
              const pushAngle = Math.atan2(state.dragonPos.z - 640, state.dragonPos.x - 0);
              state.dragonPos.x = Math.cos(pushAngle) * solidConeRadius;
              state.dragonPos.z = 640 + Math.sin(pushAngle) * solidConeRadius;
              state.forwardSpeed = Math.min(state.forwardSpeed, 4.0);
            }

            const updatedIsland = getIslandAt(state.dragonPos.x, state.dragonPos.z);
            const solidFloorY = (updatedIsland ? updatedIsland.surfaceY : ISLAND_SURFACE_Y) + 0.85;
            if (state.dragonPos.y < solidFloorY) {
              state.dragonPos.y = solidFloorY;
              state.verticalSpeed = Math.max(0, state.verticalSpeed);
            }
          }
        }

        // Position dragon group
        playerDragon.group.position.copy(state.dragonPos);
        playerDragon.group.rotation.y = state.dragonYaw;
        playerDragon.group.rotation.x = state.dragonPitch;
        playerDragon.group.rotation.z = state.dragonRoll;

        // Update photorealistic dragon anatomical kinematics
        playerDragon.updateAnimation(dt, currentTime, {
          isFlying: state.isFlying,
          forwardSpeed: state.forwardSpeed,
          verticalSpeed: state.verticalSpeed,
          stamina: state.stamina,
          isRoaring: isRoaring || state.roarCooldown > 0,
          isAttacking: isAttacking || state.attackCooldown > 0,
          tailTime: state.tailTime,
          wingFlapTime: state.wingFlapTime
        });

        playerDragon.setRiderMounted?.(true);
        riderCharacter.group.visible = false;
      } else {
        // --- ON-FOOT RIDER MODE (CONDUTOR FORA DO DRAGÃO) ---
        // Dragon rests peacefully on ground
        const dragonIsland = getIslandAt(state.dragonPos.x, state.dragonPos.z);
        const dragonGroundY = (dragonIsland ? dragonIsland.surfaceY : 2.5) + 0.85;
        state.dragonPos.y = dragonGroundY;
        state.forwardSpeed = 0;
        state.verticalSpeed = 0;
        state.dragonPitch = 0;
        state.dragonRoll = 0;

        playerDragon.group.position.copy(state.dragonPos);
        playerDragon.group.rotation.y = state.dragonYaw;
        playerDragon.group.rotation.x = 0;
        playerDragon.group.rotation.z = 0;

        playerDragon.updateAnimation(dt, currentTime, {
          isFlying: false,
          forwardSpeed: 0,
          verticalSpeed: 0,
          stamina: 100,
          isRoaring: false,
          isAttacking: false,
          tailTime: state.tailTime * 0.35,
          wingFlapTime: 0
        });

        playerDragon.setRiderMounted?.(false);

        // Rider stamina
        const isSprinting = (keys.ShiftLeft || keys.ShiftRight || keys.KeyQ || state.touchBoosting) && (isHyper || state.stamina > 10);
        if (isSprinting && Math.abs(inputForward) > 0.1) {
          if (!isHyper) state.stamina = Math.max(0, state.stamina - 18 * dt);
        } else {
          state.stamina = Math.min(100, state.stamina + 25 * dt);
        }

        // Rider turn yaw
        if (Math.abs(inputTurn) > 0.05) {
          state.riderYaw += inputTurn * 3.8 * dt;
        }

        // Rider velocity
        const riderMaxSpeed = isSprinting ? (isHyper ? 35.0 : 20.0) : (isHyper ? 16.0 : 10.0);
        const targetRiderSpeed = inputForward * riderMaxSpeed;
        state.riderForwardSpeed = THREE.MathUtils.lerp(state.riderForwardSpeed, targetRiderSpeed, 0.22);

        // Jump physics
        if (inputAscend && state.riderIsGrounded) {
          state.riderVerticalSpeed = 11.5;
          state.riderIsGrounded = false;
          soundFx.playWingFlap();
        }

        // Gravity on rider
        state.riderVerticalSpeed -= 28.0 * dt;
        state.riderPos.y += state.riderVerticalSpeed * dt;

        // Move forward
        const rForwardX = Math.sin(state.riderYaw);
        const rForwardZ = Math.cos(state.riderYaw);
        state.riderPos.x += rForwardX * state.riderForwardSpeed * dt;
        state.riderPos.z += rForwardZ * state.riderForwardSpeed * dt;

        // SOLID ICE MOUNTAIN COLLISION FOR RIDER ("faz com que não atravessemos a montanha de gelo")
        const rDistIce = Math.hypot(state.riderPos.x - 0, state.riderPos.z - 640);
        if (rDistIce < 225) {
          const distToPassage = Math.hypot(state.riderPos.x - (-30), state.riderPos.z - 665);
          const isAtPassagePortal = distToPassage < 15;
          if (!isAtPassagePortal) {
            const coneRadius = 210;
            const coneHeight = 160;
            const heightFrac = Math.max(0, Math.min(1, (state.riderPos.y - ISLAND_SURFACE_Y) / coneHeight));
            const solidConeRadius = coneRadius * (1 - heightFrac) + 3.0;

            if (rDistIce < solidConeRadius) {
              const pushAngle = Math.atan2(state.riderPos.z - 640, state.riderPos.x - 0);
              state.riderPos.x = Math.cos(pushAngle) * solidConeRadius;
              state.riderPos.z = 640 + Math.sin(pushAngle) * solidConeRadius;
              state.riderForwardSpeed = 0;
            }

            const updatedRiderIsland = getIslandAt(state.riderPos.x, state.riderPos.z);
            const solidFloorY = (updatedRiderIsland ? updatedRiderIsland.surfaceY : ISLAND_SURFACE_Y) + 0.02;
            if (state.riderPos.y < solidFloorY) {
              state.riderPos.y = solidFloorY;
              state.riderVerticalSpeed = 0;
              state.riderIsGrounded = true;
            }
          }
        }

        // Ground collision for rider
        const riderIsland = getIslandAt(state.riderPos.x, state.riderPos.z);
        const rGroundY = (riderIsland ? riderIsland.surfaceY : 2.5) + 0.02;
        if (state.riderPos.y <= rGroundY) {
          state.riderPos.y = rGroundY;
          state.riderVerticalSpeed = 0;
          state.riderIsGrounded = true;
        }

        // Barrier clamping for rider
        const riderDist = Math.hypot(state.riderPos.x, state.riderPos.z);
        if (riderDist > INVISIBLE_BARRIER_RADIUS - 1.0) {
          const ang = Math.atan2(state.riderPos.z, state.riderPos.x);
          state.riderPos.x = Math.cos(ang) * (INVISIBLE_BARRIER_RADIUS - 1.0);
          state.riderPos.z = Math.sin(ang) * (INVISIBLE_BARRIER_RADIUS - 1.0);
          state.riderForwardSpeed = 0;
        }

        // Position and animate humanoid rider
        riderCharacter.group.visible = true;
        riderCharacter.group.position.copy(state.riderPos);
        riderCharacter.group.rotation.y = state.riderYaw;
        riderCharacter.updateAnimation(dt, currentTime, {
          isMoving: Math.abs(state.riderForwardSpeed) > 0.4,
          speed: Math.abs(state.riderForwardSpeed),
          isSprinting,
          isJumping: !state.riderIsGrounded,
          stamina: state.stamina
        });
      }

      // Active followed entity (dragon when mounted, rider when on foot)
      const activeFollowPos = state.isMounted ? state.dragonPos : state.riderPos;
      const activeFollowYaw = state.isMounted ? state.dragonYaw : state.riderYaw;

      // --- INVISIBLE BARRIER COLLISION & ENFORCEMENT ---
      const distFromCenter = Math.hypot(activeFollowPos.x, activeFollowPos.z);
      let isNearBarrier = false;

      if (distFromCenter > INVISIBLE_BARRIER_RADIUS) {
        // Impenetrable forcefield: clamps entity inside the continent
        const angle = Math.atan2(activeFollowPos.z, activeFollowPos.x);
        activeFollowPos.x = Math.cos(angle) * INVISIBLE_BARRIER_RADIUS;
        activeFollowPos.z = Math.sin(angle) * INVISIBLE_BARRIER_RADIUS;

        // Gentle rebound from the boundary
        if (state.isMounted && state.forwardSpeed > 0) {
          state.forwardSpeed = -2.0;
        } else if (!state.isMounted && state.riderForwardSpeed > 0) {
          state.riderForwardSpeed = -1.0;
        }

        barrierImpactIntensity = 1.0;
        isNearBarrier = true;

        if (barrierNoticeCooldown <= 0) {
          barrierNoticeCooldown = 3.0;
          soundFx.playLaser();
          setCollectedNotification({
            text: '🛡️ Barreira da Ilha Única',
            subtext: 'Campo de força místico cerca a ilha e impede qualquer queda!',
            icon: '🛡️'
          });
          setTimeout(() => setCollectedNotification(null), 2800);
        }
      } else if (distFromCenter > INVISIBLE_BARRIER_RADIUS - 12.0) {
        isNearBarrier = true;
      }

      if (barrierNoticeCooldown > 0) barrierNoticeCooldown -= dt;
      barrierImpactIntensity = Math.max(0, barrierImpactIntensity - dt * 2.5);

      // Shimmer barrier material dynamically on proximity or collision
      if (barrierMat) {
        const proximityShimmer = isNearBarrier 
          ? ((distFromCenter - (INVISIBLE_BARRIER_RADIUS - 12.0)) / 12.0) * 0.32 
          : 0;
        barrierMat.opacity = Math.min(0.55, 0.03 + proximityShimmer + barrierImpactIntensity * 0.4);
      }

      // Wing flap & tail timing
      if (state.isMounted && state.isFlying) {
        const flapRate = canBoost ? 14 : (inputAscend ? 10 : 6);
        state.wingFlapTime += dt * flapRate;
      }
      state.tailTime += dt * 5;

      // Atmospheric environmental animations
      cloudsGroup.rotation.y += dt * 0.012;
      waterTexture.offset.x = (waterTexture.offset.x + dt * 0.03) % 1;
      waterTexture.offset.y = (waterTexture.offset.y + dt * 0.02) % 1;

      // Smooth Camera tracking behind active character/dragon
      const camAngles = state.cameraAngles;
      const camDist = camAngles.radius;
      const camHeight = camDist * Math.sin(camAngles.phi);
      const camHorizontalDist = camDist * Math.cos(camAngles.phi);

      const targetCamX = activeFollowPos.x - Math.sin(activeFollowYaw + camAngles.theta) * camHorizontalDist;
      const rawCamY = activeFollowPos.y + camHeight + (state.isMounted ? 0.7 : 0.8);
      const targetCamZ = activeFollowPos.z - Math.cos(activeFollowYaw + camAngles.theta) * camHorizontalDist;

      // Prevent camera from clipping inside island terrain
      const camIsland = getIslandAt(targetCamX, targetCamZ);
      const minCamY = (camIsland ? camIsland.surfaceY : -22) + 0.8;
      const targetCamY = Math.max(minCamY, rawCamY);

      camera.position.lerp(new THREE.Vector3(targetCamX, targetCamY, targetCamZ), 0.14);
      camera.lookAt(activeFollowPos.x, activeFollowPos.y + (state.isMounted ? 0.8 : 1.1), activeFollowPos.z);

      // Update Breath Particles
      const bPos = breathGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < breathCount; i++) {
        if (breathVel[i].life > 0) {
          breathVel[i].life -= dt;
          bPos[i * 3] += breathVel[i].x * dt;
          bPos[i * 3 + 1] += breathVel[i].y * dt;
          bPos[i * 3 + 2] += breathVel[i].z * dt;
        } else {
          bPos[i * 3 + 1] = -1000;
        }
      }
      breathGeo.attributes.position.needsUpdate = true;

      // Update Dragon Trail Particles (Embers)
      const tPos = trailGeo.attributes.position.array as Float32Array;
      if (state.isMounted) {
        tPos[trailIndex * 3] = state.dragonPos.x + (Math.random() - 0.5) * 1.5;
        tPos[trailIndex * 3 + 1] = state.dragonPos.y + (Math.random() - 0.5) * 1.0;
        tPos[trailIndex * 3 + 2] = state.dragonPos.z + (Math.random() - 0.5) * 1.5;
        trailIndex = (trailIndex + 1) % trailCount;
      }
      trailGeo.attributes.position.needsUpdate = true;

      // Egg & Crystal idle rotations
      nestMeshes.forEach(n => {
        n.eggMesh.rotation.y += dt * 1.2;
        n.eggMesh.position.y = 1.4 + Math.sin(currentTime * 0.003) * 0.2;
        n.eggMesh.visible = n.nestInfo.ready;
      });

      crystalMeshList.forEach(c => {
        c.mesh.rotation.y += dt * 1.5;
        c.mesh.rotation.x += dt * 0.8;
      });

      // Check Crystal Collisions
      state.crystals.forEach(c => {
        if (c.collected) return;
        const crystalPos = new THREE.Vector3(...c.position);
        if (activeFollowPos.distanceTo(crystalPos) < 5.5) {
          c.collected = true;
          const targetMesh = crystalMeshList.find(m => m.id === c.id);
          if (targetMesh) targetMesh.mesh.visible = false;
          soundFx.playGemCollect();
          onAwardXp(50);
          setCollectedNotification({
            text: 'Cristal de Essência Coletado!',
            subtext: '+50 XP Dracônico adicionado!',
            icon: '✨'
          });
          setTimeout(() => setCollectedNotification(null), 3000);
        }
      });

      // Update 3D Wild Guardian Dragons (Organic Breathing, Tail Sway, Alert Facing)
      guardianInstances.forEach((gInst, idx) => {
        const distToPlayer = gInst.dragon.group.position.distanceTo(activeFollowPos);
        const isNearby = distToPlayer < 26;
        gInst.dragon.updateAnimation(dt, currentTime + idx * 800, {
          isFlying: false,
          forwardSpeed: 0,
          verticalSpeed: 0,
          stamina: 100,
          isRoaring: isNearby && Math.sin(currentTime * 0.002 + idx) > 0.88,
          isAttacking: false,
          tailTime: state.tailTime + idx * 0.7,
          wingFlapTime: 0
        });

        if (isNearby) {
          // Alert: guardian turns head and body towards player
          const targetYaw = Math.atan2(
            activeFollowPos.x - gInst.dragon.group.position.x,
            activeFollowPos.z - gInst.dragon.group.position.z
          );
          gInst.dragon.group.rotation.y = THREE.MathUtils.lerp(
            gInst.dragon.group.rotation.y,
            targetYaw,
            0.05
          );
        } else {
          // Return gently to natural biome lookout orientation
          gInst.dragon.group.rotation.y = THREE.MathUtils.lerp(
            gInst.dragon.group.rotation.y,
            gInst.baseRotY,
            0.02
          );
        }
      });

      // Update Remote Multiplayer Players in 3D
      if (multiplayer && multiplayer.remotePlayersRef) {
        const remoteMap = multiplayer.remotePlayersRef.current;
        
        // Remove players who disconnected
        for (const [rId, rData] of remotePlayers3DMap.entries()) {
          if (!remoteMap.has(rId)) {
            scene.remove(rData.group);
            remotePlayers3DMap.delete(rId);
          }
        }

        // Add or sync players
        for (const [rId, rPlayer] of remoteMap.entries()) {
          let rData = remotePlayers3DMap.get(rId);
          if (!rData) {
            const group = new THREE.Group();
            const dElem = rPlayer.dragon?.element || 'magma';
            const dragonInst = buildRealisticDragonModel({
              element: dElem,
              skinStyle: rPlayer.dragon?.visual?.skinStyle || getDefaultSkinForElement(dElem),
              customColors: rPlayer.dragon?.visual ? {
                primary: rPlayer.dragon.visual.primaryColor,
                secondary: rPlayer.dragon.visual.secondaryColor,
                emissive: rPlayer.dragon.visual.glowColor
              } : undefined,
              isTitan: rPlayer.dragon?.rarity === 'tita',
              scale: 1.0,
              equippedArmor: rPlayer.dragon?.equippedArmor ? {
                peitoral: !!rPlayer.dragon.equippedArmor.peitoral,
                elmo: !!rPlayer.dragon.equippedArmor.elmo,
                asas: !!rPlayer.dragon.equippedArmor.asas,
                garras: !!rPlayer.dragon.equippedArmor.garras
              } : undefined
            });
            const riderInst = buildHumanoidRiderModel({
              element: dElem,
              scale: 1.0,
              customization: rPlayer.rider?.currentOptions
            });
            const nameTag = createPlayerNameTagSprite(
              rPlayer.username,
              rPlayer.isCreator,
              rPlayer.dragon?.name || 'Dragão Titã'
            );
            nameTag.position.set(0, 4.8, 0);

            group.add(dragonInst.group);
            group.add(riderInst.group);
            group.add(nameTag);
            scene.add(group);

            rData = { group, dragon: dragonInst, rider: riderInst, nameTag };
            remotePlayers3DMap.set(rId, rData);
          }

          // Lerp position & rotation smoothly
          const targetPos = new THREE.Vector3(...rPlayer.pos);
          rData.group.position.lerp(targetPos, 0.22);
          rData.group.rotation.y = THREE.MathUtils.lerp(rData.group.rotation.y, rPlayer.rot[1], 0.22);

          // Animate remote dragon
          rData.dragon.updateAnimation(dt, currentTime, {
            isFlying: rPlayer.state.isFlying,
            forwardSpeed: rPlayer.state.speed || 0,
            verticalSpeed: 0,
            stamina: 100,
            isRoaring: rPlayer.state.isRoaring || false,
            isAttacking: rPlayer.state.isAttacking || false,
            tailTime: state.tailTime,
            wingFlapTime: rPlayer.state.isFlying ? state.wingFlapTime : 0
          });

          // Rider mounted vs dismounted
          if (rPlayer.state.isMounted) {
            rData.rider.group.visible = false;
            rData.dragon.setRiderMounted?.(true);
          } else {
            rData.rider.group.visible = true;
            rData.rider.group.position.set(2.8, 0, 0);
            rData.dragon.setRiderMounted?.(false);
            rData.rider.updateAnimation(dt, currentTime, {
              isMoving: Math.abs(rPlayer.state.speed || 0) > 0.5,
              speed: Math.abs(rPlayer.state.speed || 0),
              isSprinting: false,
              isJumping: false,
              stamina: 100
            });
          }
        }

        // Send local player position to server
        multiplayer.sendMove(
          [activeFollowPos.x, activeFollowPos.y, activeFollowPos.z],
          [state.dragonPitch, state.dragonYaw, state.dragonRoll],
          {
            isFlying: state.isFlying,
            isMounted: state.isMounted,
            isGliding: false,
            isRunning: Math.abs(state.forwardSpeed) > 1.0,
            speed: state.forwardSpeed
          }
        );
      }

      // 3D Titan Creator Crown Halo for Francisco
      if (creatorCrownHalo) {
        creatorCrownHalo.position.set(activeFollowPos.x, activeFollowPos.y + (state.isMounted ? 4.4 : 3.0), activeFollowPos.z);
        creatorCrownHalo.rotation.y += dt * 1.8;
      }

      // Proximity Detection for HUD Prompt (Dragon, Nests, Guardians)
      let interactionFound = false;

      // Check proximity to Dragon when on foot
      if (!state.isMounted) {
        const distToDragon = state.riderPos.distanceTo(state.dragonPos);
        setDistanceToDragon(Math.round(distToDragon));
        if (distToDragon < 6.5) {
          setNearbyInteraction({
            type: 'dragon',
            title: `Teu Dragão: ${activeDragon.name}`,
            description: `O teu dragão fiel está descansando e aguarda o teu comando.`,
            actionLabel: 'Pressione [E] ou [X] para Montar no Dragão',
            id: 'mount-dragon'
          });
          interactionFound = true;
        }
      }

      // Direct step-in or fly-through portal teleportation with cooldown
      if (activeFollowPos.distanceTo(snowPassagePos) < 5.0 && teleportCooldown <= 0) {
        teleportCooldown = 4.0;
        soundFx.playWhoosh();
        soundFx.playVictory();
        triggerTeleport(
          SECRET_ISLAND_CONFIG.islandCenter.x,
          SECRET_ISLAND_CONFIG.islandCenter.z,
          'Ilha Secreta Perdida: Vila Ancestral & Bioma Negro'
        );
        setCollectedNotification({
          text: '✨ ILHA SECRETA DESCOBERTA!',
          subtext: 'Chegaste à Ilha Secreta! Explora a Vila Ancestral a Oeste e o Bioma Negro a Leste. Só aqui podes coletar estes ovos no 3D!',
          icon: '🏝️'
        });
        setTimeout(() => setCollectedNotification(null), 5000);
      } else if (activeFollowPos.distanceTo(returnPortalPos) < 5.0 && teleportCooldown <= 0) {
        teleportCooldown = 4.0;
        soundFx.playWhoosh();
        triggerTeleport(
          SECRET_ISLAND_CONFIG.snowMountainPassage.x,
          SECRET_ISLAND_CONFIG.snowMountainPassage.z + 18,
          'Montanha de Neve'
        );
        setCollectedNotification({
          text: '❄️ RETORNOU AO CONTINENTE',
          subtext: 'De volta aos picos glaciais da Montanha de Neve.',
          icon: '🏔️'
        });
        setTimeout(() => setCollectedNotification(null), 4000);
      }

      // A. Check Nests
      if (!interactionFound) {
        for (const nest of state.nests) {
          const nestPos = new THREE.Vector3(...nest.position);
          const dist = activeFollowPos.distanceTo(nestPos);
          if (dist < 12 && nest.ready) {
            const isSecret = nest.biomeId === 'ancestral' || nest.biomeId === 'negro' || nest.biomeId === 'eletrico';
            const nestTitle = nest.biomeId === 'ancestral'
              ? '🏛️ NINHO SAGRADO: Vila Ancestral (Ilha Secreta)'
              : nest.biomeId === 'negro'
              ? '🌑 NINHO DO VAZIO: Bioma Negro (Ilha Secreta)'
              : nest.biomeId === 'eletrico'
              ? '⚡ NINHO DA TEMPESTADE: Bioma Elétrico (Ilha Secreta)'
              : `👑 NINHO TITÃ: ${nest.biomeName}`;
            const nestDesc = isSecret
              ? `Ovo Titã Exclusivo da Ilha Secreta! Só pode ser coletado fisicamente aqui no mundo 3D.`
              : `Ovo Titã Supremo (Raridade TITÃ) emitindo energia colossal no ninho.`;
            setNearbyInteraction({
              type: 'nest',
              title: nestTitle,
              description: nestDesc,
              actionLabel: isSecret ? 'Pressione [E] para Coletar Ovo Exclusivo da Ilha' : 'Pressione [E] para Coletar Ovo Titã',
              id: nest.id
            });
            interactionFound = true;
            break;
          }
        }
      }

      // B. Check Guardians
      if (!interactionFound) {
        for (const guardian of state.guardians) {
          const guardianPos = new THREE.Vector3(...guardian.position);
          const dist = activeFollowPos.distanceTo(guardianPos);
          if (dist < 16) {
            setNearbyInteraction({
              type: 'guardian',
              title: guardian.name,
              description: 'Guardião territorial defendendo seu cume dracônico.',
              actionLabel: 'Pressione [E] para Entrar em Combate',
              id: guardian.id
            });
            interactionFound = true;
            break;
          }
        }
      }

      // C. Check Clothes Shop Pavilion in Sanctuary
      if (!interactionFound) {
        const shopPos = new THREE.Vector3(16, ISLAND_SURFACE_Y, 12);
        const distToShop = activeFollowPos.distanceTo(shopPos);
        if (distToShop < 8.5) {
          setNearbyInteraction({
            type: 'shop',
            title: '👗 Loja de Roupas Grátis dos Condutores',
            description: 'Experimenta e equipa trajes completos, elmos, capas e tintas sem custo!',
            actionLabel: 'Pressione [E] ou toque para Abrir Loja',
            id: 'clothes-shop'
          });
          interactionFound = true;
        }
      }

      // D. Check Snow Mountain Passage Portal
      if (!interactionFound) {
        const distToSnowPortal = activeFollowPos.distanceTo(snowPassagePos);
        if (distToSnowPortal < 15) {
          setNearbyInteraction({
            type: 'portal',
            title: '🌀 PASSAGEM SECRETA DA MONTANHA DE NEVE',
            description: 'Portal arcano oculto entre os picos glaciais! Teletransporta para a Ilha Secreta Perdida (Vila Ancestral & Bioma Negro).',
            actionLabel: 'Entrar na Ilha Secreta (Pressione [E])',
            id: 'snow-secret-passage'
          });
          interactionFound = true;
        }
      }

      // E. Check Return Portal on Secret Island
      if (!interactionFound) {
        const distToReturn = activeFollowPos.distanceTo(returnPortalPos);
        if (distToReturn < 15) {
          setNearbyInteraction({
            type: 'portal',
            title: '🌀 PORTAL DE RETORNO AO CONTINENTE',
            description: 'Portal arcano ancestral. Teletransporta de volta para a Montanha de Neve do Continente Principal.',
            actionLabel: 'Voltar ao Continente (Pressione [E])',
            id: 'secret-island-return'
          });
          interactionFound = true;
        }
      }

      // Gentle floating and spinning animation for shop icon and rune circle
      if (floatingShopIcon) {
        floatingShopIcon.rotation.y = currentTime * 0.0018;
        floatingShopIcon.position.y = 3.2 + Math.sin(currentTime * 0.003) * 0.15;
      }
      if (runeRing) {
        runeRing.rotation.z = currentTime * 0.0012;
      }

      // Secret Island & Snow Portal 3D animations
      secretIslandAnimList.forEach(item => {
        if (item.rotSpeed) {
          item.mesh.rotation.z += item.rotSpeed * dt;
        }
        if (item.speedY) {
          item.mesh.position.y += Math.sin(currentTime * 0.003) * 0.01;
        }
      });
      secretIslandResult.voidFlames.forEach((flame, idx) => {
        const s = 1.0 + Math.sin(currentTime * 0.008 + idx) * 0.25;
        flame.scale.set(s, s * 1.3, s);
      });

      if (!interactionFound) {
        setNearbyInteraction(null);
      }

      // Update HUD stats
      const islandUnder = getIslandAt(activeFollowPos.x, activeFollowPos.z);
      if (islandUnder && islandUnder.name !== currentBiomeNameRef.current) {
        currentBiomeNameRef.current = islandUnder.name;
        setCurrentBiomeName(islandUnder.name);
      }
      const relativeGround = islandUnder ? islandUnder.surfaceY : 2.0;
      setAltitude(Math.max(0, Math.round(activeFollowPos.y - relativeGround)));
      const activeSpeed = state.isMounted ? Math.abs(state.forwardSpeed) : Math.abs(state.riderForwardSpeed);
      setSpeed(Math.round(activeSpeed * 3.6));
      setStamina(Math.round(state.stamina));
      setPlayerCoords({ x: Math.round(activeFollowPos.x), z: Math.round(activeFollowPos.z) });

      // Calculate Gyroscopic Compass Heading (0° - 359°) and Cardinal
      const rawDeg = Math.round(((-activeFollowYaw * 180) / Math.PI) % 360);
      const headingDeg = rawDeg < 0 ? rawDeg + 360 : rawDeg;
      const cardinals = ['N', 'NE', 'L', 'SE', 'S', 'SO', 'O', 'NO'];
      const cardIdx = Math.round(headingDeg / 45) % 8;
      setHeading({ deg: headingDeg, cardinal: cardinals[cardIdx] });

      // Determine Realistic Avionics Flight / Walk Status
      let modeText = 'EM SOLO';
      if (!state.isMounted) {
        const isSprinting = (keys.ShiftLeft || keys.ShiftRight || keys.KeyQ || state.touchBoosting) && Math.abs(state.riderForwardSpeed) > 1.0;
        modeText = isSprinting ? 'CORRENDO A PÉ' : (Math.abs(state.riderForwardSpeed) > 0.4 ? 'CAMINHANDO A PÉ' : 'A PÉ (CONDUTOR)');
      } else if (state.isFlying) {
        if (state.isHyperSpeed) {
          modeText = canBoost ? 'HIPER-VELOCIDADE MACH 3+' : 'CRUZEIRO HIPERSÔNICO';
        } else if (canBoost && (inputForward !== 0 || inputAscend)) {
          modeText = 'TURBO SÔNICO';
        } else if (state.verticalSpeed < -5) {
          modeText = 'MERGULHO';
        } else if (state.verticalSpeed > 4) {
          modeText = 'ASCENSÃO';
        } else if (state.forwardSpeed > 35) {
          modeText = 'CRUZEIRO';
        } else {
          modeText = 'PLANANDO';
        }
      }
      setFlightStateName(modeText);

      // Render Three.js scene
      renderer.render(scene, camera);
    };

    animationFrameId = requestAnimationFrame(animate);

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      resizeObserver.disconnect();
      remotePlayers3DMap.forEach(r => scene.remove(r.group));
      remotePlayers3DMap.clear();
      if (creatorCrownHalo) scene.remove(creatorCrownHalo);
      renderer.dispose();
    };
  }, [activeDragon, breathDamage]);

  const handleRemoteCollectSecretIslandEggs = () => {
    soundFx.playVictory();
    soundFx.playEggCrack();
    const eggs = getAllSecretIslandEggs();
    eggs.forEach(egg => {
      onCollectEgg({
        ...egg,
        hatchDurationSeconds: 0,
        timeRemaining: 0
      });
    });
    setCollectedNotification({
      text: '⚡ COLETA REMOTA CONCLUÍDA!',
      subtext: '3 Ovos Titãs da Ilha Secreta (Ancestral, Negro e Elétrico) coletados à distância com sucesso!',
      icon: '👑'
    });
    setTimeout(() => setCollectedNotification(null), 5000);
  };

  return (
    <div className="relative w-full h-[82vh] min-h-[580px] bg-[#0a0a0f] rounded-2xl overflow-hidden border border-white/10 shadow-2xl select-none font-sans">
      {/* 3D WebGL Canvas */}
      <div ref={containerRef} className="w-full h-full relative cursor-grab active:cursor-grabbing">
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>

      {/* TOP BAR OVERLAY */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between gap-4 pointer-events-none">
        {/* Left: Back to Base, Active Dragon, & Biome Badge */}
        <div className="flex items-center gap-2.5 pointer-events-auto">
          <button
            onClick={onReturnToBase}
            className="px-3.5 py-2 rounded-xl bg-[#111114]/90 hover:bg-white/10 text-white border border-white/10 text-xs font-mono font-bold flex items-center gap-2 transition-all shadow-lg backdrop-blur-md active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 text-orange-400" />
            <span>Voltar ao Santuário</span>
          </button>

          <button
            onClick={() => setShowDragonSelector(!showDragonSelector)}
            className="px-3 py-2 rounded-xl bg-[#111114]/90 hover:bg-white/10 text-white border border-white/10 text-xs font-mono flex items-center gap-2 transition-all shadow-lg backdrop-blur-md"
          >
            <Flame className="w-4 h-4 text-orange-400" />
            <span className="font-bold">{activeDragon.name}</span>
            <span className="text-[10px] text-white/50 uppercase">Lvl {activeDragon.level}</span>
          </button>

          {/* Quick Realistic Skin Button */}
          <button
            onClick={() => {
              soundFx.playClick();
              setShowSkinModal(true);
            }}
            className="px-3 py-2 rounded-xl bg-amber-950/80 hover:bg-amber-900/90 text-amber-300 border border-amber-500/50 text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-lg backdrop-blur-md active:scale-95"
            title="Personalizar Skin Realista do Dragão [K]"
          >
            <Palette className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Skin Realista [K]</span>
          </button>

          {/* Single Island Sector Badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#111114]/90 border border-white/10 text-xs font-mono shadow-lg backdrop-blur-md">
            <Compass className="w-4 h-4 text-orange-400" />
            <div className="text-left leading-tight">
              <span className="text-[9px] block text-white/40 uppercase tracking-wider font-bold">Ilha dos Dragões</span>
              <span className="font-bold text-white text-xs">{currentBiomeName}</span>
            </div>
          </div>

          {/* Hyper-Continent +999999999999999999% Badge */}
          <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/70 border border-purple-500/40 text-xs font-mono shadow-lg backdrop-blur-md text-purple-300">
            <Globe className="w-3.5 h-3.5 text-purple-400" />
            <span className="font-bold">+999.999.999.999.999.999% (60km)</span>
          </div>

          {/* Mode Badge (Mounted vs On-Foot Explorer) */}
          {!isMounted ? (
            <div 
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-xs font-mono shadow-lg backdrop-blur-md text-emerald-300"
              title="Condutor a pé explorando as ruínas e a ilha"
            >
              <User className="w-4 h-4 text-emerald-400 animate-bounce" />
              <div className="text-left leading-tight">
                <span className="text-[9px] block text-emerald-400/60 uppercase tracking-wider font-bold">A Pé</span>
                <span className="text-[11px] font-bold">Dragão a {distanceToDragon}m</span>
              </div>
            </div>
          ) : (
            <div 
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-xs font-mono shadow-lg backdrop-blur-md text-cyan-300"
              title="Barreira Protetora Ativa: O continente cósmico de 60km está 100% protegido contra quedas!"
            >
              <Shield className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span className="text-[11px] font-bold">Continente Protegido</span>
            </div>
          )}
        </div>

        {/* Right: Quick Tools (Teleport, HyperSpeed, Audio, Help, Incubator, Clothes Shop) */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Online Players Counter & Room Badge */}
          {multiplayer && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#111114]/90 border border-emerald-500/40 text-emerald-300 text-xs font-mono shadow-lg backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{multiplayer.remotePlayers.size + 1} Online</span>
            </div>
          )}

          {/* Creator Panel Button */}
          {isCreatorMode && onOpenCreatorPanel && (
            <button
              onClick={onOpenCreatorPanel}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-black font-mono font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/30 transition-all border border-amber-300/40 active:scale-95"
              title="Abrir Painel Exclusivo de Criador Titã com Tudo Grátis"
            >
              <Crown className="w-4 h-4 text-black" />
              <span className="hidden sm:inline">Criador (Tudo Grátis)</span>
              <span className="sm:hidden">Criador</span>
            </button>
          )}

          {/* Remote Secret Island Eggs (EXCLUSIVELY FOR FRANCISCO!) */}
          {isCreatorMode && (
            <button
              onClick={handleRemoteCollectSecretIslandEggs}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 via-purple-600 to-amber-500 hover:brightness-110 text-white font-mono font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/30 transition-all border border-cyan-300/40 active:scale-95"
              title="⚡ Coletar remotamente os 3 Ovos Titãs da Ilha Secreta (Vila Ancestral, Bioma Negro e Bioma Elétrico) sem precisares de viajar até lá fisicamente!"
            >
              <Zap className="w-4 h-4 text-yellow-300 animate-pulse" />
              <span className="hidden sm:inline">⚡ Coleta Remota Ilha</span>
              <span className="sm:hidden">⚡ Ilha</span>
            </button>
          )}

          {/* Quick Teleport Map Button */}
          <button
            onClick={() => setShowTeleportMap(true)}
            className="px-3.5 py-2 rounded-xl bg-cyan-950/80 hover:bg-cyan-900/90 text-cyan-200 border border-cyan-500/40 text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-lg backdrop-blur-md active:scale-95"
            title="Abrir Portal de Dobra Hiperespacial / Mapa dos Biomas [M]"
          >
            <Navigation className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Dobra & Mapa</span>
            <kbd className="hidden md:inline px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 text-[10px]">M</kbd>
          </button>

          {/* Hyper-Speed Toggle Button */}
          {isMounted && (
            <button
              onClick={() => actionHandlersRef.current?.toggleHyperSpeed?.()}
              className={`px-3.5 py-2 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-lg backdrop-blur-md active:scale-95 ${
                isHyperSpeed
                  ? 'bg-amber-600/30 border-amber-400 text-amber-200 shadow-[0_0_15px_rgba(251,191,36,0.3)] animate-pulse'
                  : 'bg-[#111114]/90 hover:bg-white/10 text-white/80 border-white/10'
              }`}
              title="Alternar Hiper-Velocidade Titânica Mach 3+ [T]"
            >
              <Rocket className={`w-4 h-4 ${isHyperSpeed ? 'text-amber-400' : 'text-white/60'}`} />
              <span className="hidden sm:inline">{isHyperSpeed ? 'Mach 3+ ATIVO' : 'Hiper-Velocidade'}</span>
              <kbd className="hidden md:inline px-1.5 py-0.2 rounded bg-white/10 text-white/70 text-[10px]">T</kbd>
            </button>
          )}

          <button
            onClick={() => setShowClothesShop(true)}
            className="px-3.5 py-2 rounded-xl bg-purple-950/80 hover:bg-purple-900/80 text-purple-200 border border-purple-500/40 text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-lg backdrop-blur-md active:scale-95"
            title="Loja de Roupas Grátis dos Condutores (Trajes, Elmos, Capas e Tintas)"
          >
            <Shirt className="w-4 h-4 text-purple-400" />
            <span className="hidden sm:inline">Loja de Roupas</span>
            <span className="text-[10px] px-1 py-0.5 rounded bg-emerald-500/30 text-emerald-300 font-bold">Grátis</span>
          </button>

          <button
            onClick={onOpenIncubator}
            className="px-3.5 py-2 rounded-xl bg-cyan-950/80 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-lg backdrop-blur-md"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Incubadora</span>
          </button>

          {/* Camera Zoom Buttons */}
          <div className="hidden sm:flex items-center gap-1 bg-[#111114]/90 border border-white/10 rounded-xl p-1 shadow-lg backdrop-blur-md">
            <button
              onClick={() => actionHandlersRef.current?.zoomIn?.()}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
              title="Aproximar Câmera (+)"
            >
              <ZoomIn className="w-4 h-4 text-orange-400" />
            </button>
            <button
              onClick={() => actionHandlersRef.current?.zoomOut?.()}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
              title="Afastar Câmera (-)"
            >
              <ZoomOut className="w-4 h-4 text-orange-400" />
            </button>
          </div>

          <button
            onClick={() => setShowControlsGuide(!showControlsGuide)}
            className="p-2 rounded-xl bg-[#111114]/90 hover:bg-white/10 text-white/70 border border-white/10 transition-colors shadow-lg backdrop-blur-md"
            title="Guia de Comandos"
          >
            <HelpCircle className="w-4 h-4 text-orange-400" />
          </button>

          <button
            onClick={onToggleMute}
            className="p-2 rounded-xl bg-[#111114]/90 hover:bg-white/10 text-white/70 border border-white/10 transition-colors shadow-lg backdrop-blur-md"
            title={isMuted ? 'Desmutar Áudio' : 'Silenciar'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-orange-400" />}
          </button>
        </div>
      </div>

      {/* DRAGON SELECTOR DROPDOWN MODAL */}
      {showDragonSelector && (
        <div className="absolute top-16 left-4 z-30 w-72 bg-[#111114] border border-white/10 rounded-xl p-3 shadow-2xl backdrop-blur-md space-y-2 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-white/60 pb-2 border-b border-white/10">
            <span>Montar em outro Dragão</span>
            <button onClick={() => setShowDragonSelector(false)} className="text-white/40 hover:text-white">✕</button>
          </div>
          <div className="max-h-60 overflow-y-auto space-y-1">
            {allDragons.map(d => (
              <button
                key={d.id}
                onClick={() => {
                  onSelectActiveDragon(d.id);
                  setShowDragonSelector(false);
                  soundFx.playRoar(d.element);
                }}
                className={`w-full p-2 rounded-lg text-left text-xs font-mono flex items-center justify-between transition-colors ${
                  d.id === activeDragon.id
                    ? 'bg-orange-600/20 text-orange-400 border border-orange-500/40'
                    : 'hover:bg-white/5 text-white/80'
                }`}
              >
                <div>
                  <div className="font-bold truncate">{d.name}</div>
                  <div className="text-[10px] text-white/40 capitalize">{d.element} • Nível {d.level}</div>
                </div>
                {d.id === activeDragon.id && <Check className="w-4 h-4 text-orange-400" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* CONTROLS GUIDE OVERLAY */}
      {showControlsGuide && (
        <div className="absolute top-16 right-4 z-30 w-84 bg-[#111114]/95 border border-white/10 rounded-2xl p-4 shadow-2xl backdrop-blur-md text-xs font-mono space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-orange-400" /> Controles do Dragão 3D
            </span>
            <button onClick={() => setShowControlsGuide(false)} className="text-white/40 hover:text-white">✕</button>
          </div>
          <div className="space-y-1.5 text-white/70 text-[11px]">
            <div className="flex justify-between">
              <span className="text-cyan-400 font-bold">M (Mapa & Dobra):</span>
              <span>Abrir Portal de Teletransporte Dimensional</span>
            </div>
            <div className="flex justify-between">
              <span className="text-amber-400 font-bold">T (Hiper-Velocidade):</span>
              <span>Alternar Modo Mach 3+ (Supersônico)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-orange-400 font-bold">W / S / A / D:</span>
              <span>Mover / Curvar (A pé ou Montado)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-emerald-400 font-bold">X:</span>
              <span>Desmontar / Montar no Dragão</span>
            </div>
            <div className="flex justify-between">
              <span className="text-orange-400 font-bold">Espaço (Space):</span>
              <span>Pular a pé / Decolar no Dragão</span>
            </div>
            <div className="flex justify-between">
              <span className="text-orange-400 font-bold">Shift:</span>
              <span>Correr a pé / Mergulho voando</span>
            </div>
            <div className="flex justify-between">
              <span className="text-orange-400 font-bold">Q (Turbo/Sprint):</span>
              <span>Corrida Máxima / Turbo Aéreo</span>
            </div>
            <div className="flex justify-between">
              <span className="text-orange-400 font-bold">F / Clique:</span>
              <span>Sopro Elemental Destrutivo</span>
            </div>
            <div className="flex justify-between">
              <span className="text-orange-400 font-bold">R:</span>
              <span>Rugido Dracônico Épico</span>
            </div>
            <div className="flex justify-between">
              <span className="text-orange-400 font-bold">E:</span>
              <span>Interagir / Coletar Ovo Titã</span>
            </div>
            <div className="flex justify-between">
              <span className="text-orange-400 font-bold">Arrastar Mouse:</span>
              <span>Orbitar Câmera 360°</span>
            </div>
            <div className="flex justify-between">
              <span className="text-orange-400 font-bold">Roda / Botões Zoom:</span>
              <span>Aproximar / Afastar Câmera</span>
            </div>
          </div>
        </div>
      )}

      {/* NOTIFICATION BANNER (Item collected, XP earned) */}
      {collectedNotification && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 bg-[#111114]/95 border border-orange-500/50 text-white px-5 py-3 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-3 animate-in zoom-in-95 text-xs font-mono">
          <span className="text-2xl">{collectedNotification.icon}</span>
          <div>
            <div className="font-bold text-orange-400">{collectedNotification.text}</div>
            <div className="text-white/60 text-[11px]">{collectedNotification.subtext}</div>
          </div>
        </div>
      )}

      {/* NEARBY PROXIMITY INTERACTION PROMPT */}
      {nearbyInteraction && (
        <div className={`absolute bottom-28 left-1/2 -translate-x-1/2 z-30 bg-[#111114]/95 ${
          nearbyInteraction.type === 'shop' 
            ? 'border border-purple-500/80 shadow-[0_0_25px_rgba(168,85,247,0.2)]' 
            : nearbyInteraction.type === 'portal'
            ? 'border border-cyan-400/80 shadow-[0_0_25px_rgba(6,182,212,0.3)]'
            : 'border border-orange-500/70'
        } p-4 rounded-2xl shadow-2xl backdrop-blur-md text-center animate-in slide-in-from-bottom-4 max-w-sm w-full mx-4`}>
          <div className={`text-[10px] uppercase font-mono tracking-widest ${
            nearbyInteraction.type === 'shop' 
              ? 'text-purple-400' 
              : nearbyInteraction.type === 'portal'
              ? 'text-cyan-400 animate-pulse'
              : 'text-orange-400'
          } font-bold mb-0.5`}>
            {nearbyInteraction.type === 'shop' 
              ? 'Boutique do Santuário' 
              : nearbyInteraction.type === 'portal'
              ? '🌀 Portal Dimensional Arcano'
              : 'Interação Dracônica Próxima'}
          </div>
          <div className="text-sm font-bold text-white font-serif">{nearbyInteraction.title}</div>
          <p className="text-[11px] text-white/50 my-2">{nearbyInteraction.description}</p>
          <button
            onClick={() => {
              if (nearbyInteraction.id === 'clothes-shop') {
                setShowClothesShop(true);
                return;
              }
              const e = new KeyboardEvent('keydown', { code: 'KeyE' });
              window.dispatchEvent(e);
            }}
            className={`w-full py-2.5 ${
              nearbyInteraction.type === 'shop'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500'
                : nearbyInteraction.type === 'portal'
                ? 'bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600'
                : 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500'
            } text-white font-mono font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all active:scale-95`}
          >
            {nearbyInteraction.actionLabel}
          </button>
        </div>
      )}

      {/* BOTTOM HUD INSTRUMENTS (Altitude, Speed, Stamina, Compass, Flight Status) */}
      <div className="absolute bottom-4 left-4 z-20 flex flex-wrap items-center gap-2.5 pointer-events-none">
        {/* Flight Mode Indicator Badge */}
        <div className="bg-[#111114]/90 border border-white/10 rounded-xl px-3.5 py-2 shadow-lg backdrop-blur-md flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${
            isHyperSpeed ? 'bg-amber-400 shadow-[0_0_10px_#fbbf24] animate-ping' :
            (isFlying ? 'bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-pulse' : 'bg-emerald-400')
          }`} />
          <span className="text-xs font-mono font-bold uppercase text-white">
            {flightStateName}
          </span>
        </div>

        {/* Speedometer */}
        <div className="bg-[#111114]/90 border border-white/10 rounded-xl px-3.5 py-2 shadow-lg backdrop-blur-md font-mono text-center">
          <div className="text-[9px] uppercase text-white/40">Velocidade</div>
          <div className="text-sm font-bold text-orange-400">
            {speed >= 1000 ? (
              <span>Mach {(speed / 1234.8).toFixed(1)} <span className="text-[10px] text-white/50">({speed} km/h)</span></span>
            ) : (
              <span>{speed} <span className="text-[10px] text-white/50">km/h</span></span>
            )}
          </div>
        </div>

        {/* Altimeter */}
        <div className="bg-[#111114]/90 border border-white/10 rounded-xl px-3.5 py-2 shadow-lg backdrop-blur-md font-mono text-center">
          <div className="text-[9px] uppercase text-white/40">Altitude</div>
          <div className="text-sm font-bold text-cyan-400">
            {altitude >= 1000 ? (
              <span>{(altitude / 1000).toFixed(1)} <span className="text-[10px] text-white/50">km</span></span>
            ) : (
              <span>{altitude} <span className="text-[10px] text-white/50">m</span></span>
            )}
          </div>
        </div>

        {/* Compass & Heading */}
        <div className="hidden sm:block bg-[#111114]/90 border border-white/10 rounded-xl px-3.5 py-2 shadow-lg backdrop-blur-md font-mono text-center">
          <div className="text-[9px] uppercase text-white/40">Rumo / Bússola</div>
          <div className="text-sm font-bold text-amber-300">{heading.deg}° <span className="text-[10px] text-white/50">{heading.cardinal}</span></div>
        </div>

        {/* Stamina Meter */}
        <div className="bg-[#111114]/90 border border-white/10 rounded-xl px-3.5 py-2 shadow-lg backdrop-blur-md font-mono text-center min-w-[76px]">
          <div className="text-[9px] uppercase text-white/40">Estamina</div>
          <div className="text-sm font-bold text-amber-400">{isHyperSpeed ? '∞' : `${stamina}%`}</div>
          <div className="w-full bg-white/10 h-1 rounded-full mt-1 overflow-hidden">
            <div
              className={`h-full ${isHyperSpeed ? 'bg-amber-400 shadow-[0_0_8px_#fbbf24]' : 'bg-gradient-to-r from-amber-500 to-emerald-400'} transition-all duration-150`}
              style={{ width: `${isHyperSpeed ? 100 : stamina}%` }}
            />
          </div>
        </div>
      </div>

      {/* QUICK ON-SCREEN ACTION BUTTONS */}
      <div className="absolute bottom-4 right-4 z-20 flex flex-wrap items-center justify-end gap-2">
        {/* In-Flight Ascend / Descend Controls */}
        {isMounted && isFlying && (
          <div className="flex items-center gap-1.5 bg-[#111114]/90 p-1 rounded-xl border border-cyan-500/30 backdrop-blur-md shadow-lg">
            <button
              onMouseDown={() => { stateRef.current.touchFlyingUp = true; }}
              onMouseUp={() => { stateRef.current.touchFlyingUp = false; }}
              onTouchStart={() => { stateRef.current.touchFlyingUp = true; }}
              onTouchEnd={() => { stateRef.current.touchFlyingUp = false; }}
              className="px-2.5 py-1.5 rounded-lg bg-cyan-900/60 hover:bg-cyan-800/80 text-cyan-200 border border-cyan-500/40 text-xs font-mono font-bold active:scale-95"
              title="Subir aos Céus (Espaço)"
            >
              ▲ Subir
            </button>
            <button
              onMouseDown={() => { stateRef.current.touchFlyingDown = true; }}
              onMouseUp={() => { stateRef.current.touchFlyingDown = false; }}
              onTouchStart={() => { stateRef.current.touchFlyingDown = true; }}
              onTouchEnd={() => { stateRef.current.touchFlyingDown = false; }}
              className="px-2.5 py-1.5 rounded-lg bg-cyan-900/60 hover:bg-cyan-800/80 text-cyan-200 border border-cyan-500/40 text-xs font-mono font-bold active:scale-95"
              title="Mergulhar / Descer (Shift)"
            >
              ▼ Descer
            </button>
          </div>
        )}

        {/* Hyper-Speed Toggle Button (bottom quick action) */}
        {isMounted && (
          <button
            onClick={() => actionHandlersRef.current?.toggleHyperSpeed?.()}
            className={`px-3 py-2.5 rounded-xl border font-mono font-bold text-xs flex items-center gap-1.5 shadow-lg backdrop-blur-md active:scale-95 transition-all ${
              isHyperSpeed
                ? 'bg-amber-600/40 border-amber-400 text-amber-200 animate-pulse shadow-[0_0_15px_rgba(251,191,36,0.3)]'
                : 'bg-[#111114]/90 border-white/10 text-white/80 hover:bg-white/10'
            }`}
            title="Alternar Hiper-Velocidade Titânica Mach 3+ [T]"
          >
            <Rocket className={`w-4 h-4 ${isHyperSpeed ? 'text-amber-400' : 'text-white/60'}`} />
            <span>{isHyperSpeed ? 'Mach 3+ ON' : 'Hiper-Velocidade [T]'}</span>
          </button>
        )}

        {/* Dobra & Mapa Teleport Button (bottom quick action) */}
        <button
          onClick={() => setShowTeleportMap(true)}
          className="px-3 py-2.5 rounded-xl bg-cyan-950/80 hover:bg-cyan-900/90 border border-cyan-500/40 text-cyan-200 font-mono font-bold text-xs flex items-center gap-1.5 shadow-lg backdrop-blur-md active:scale-95 transition-all"
          title="Abrir Portal de Dobra Hiperespacial / Mapa dos Biomas [M]"
        >
          <Navigation className="w-4 h-4 text-cyan-400" />
          <span>Dobra [M]</span>
        </button>

        {/* Realistic Dragon Skins Button */}
        <button
          onClick={() => {
            soundFx.playClick();
            setShowSkinModal(true);
          }}
          className="px-3 py-2.5 rounded-xl bg-amber-950/80 hover:bg-amber-900/90 border border-amber-500/50 text-amber-200 font-mono font-bold text-xs flex items-center gap-1.5 shadow-lg backdrop-blur-md active:scale-95 transition-all"
          title="Personalizar Skin Realista do Dragão [K]"
        >
          <Palette className="w-4 h-4 text-amber-400" />
          <span>Skins [K]</span>
        </button>

        {/* PRIMARY: Dismount or Mount Dragon Button */}
        {isMounted ? (
          <button
            onClick={() => {
              actionHandlersRef.current?.dismount?.();
            }}
            className="px-3.5 py-2.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900/80 border border-emerald-500/50 text-emerald-300 font-mono font-bold text-xs flex items-center gap-1.5 shadow-lg backdrop-blur-md active:scale-95 transition-all"
            title="Sair do dragão para explorar as ruínas e a ilha a pé [X]"
          >
            <User className="w-4 h-4 text-emerald-400" />
            <span>Desmontar [X]</span>
          </button>
        ) : (
          <>
            <button
              onClick={() => {
                actionHandlersRef.current?.mount?.();
              }}
              className={`px-3.5 py-2.5 rounded-xl border font-mono font-bold text-xs flex items-center gap-1.5 shadow-lg backdrop-blur-md active:scale-95 transition-all ${
                distanceToDragon <= 7
                  ? 'bg-amber-600/30 hover:bg-amber-600/40 border-amber-400 text-amber-200 animate-pulse'
                  : 'bg-[#111114]/90 border-white/10 text-white/70 hover:bg-white/10'
              }`}
              title="Subir de volta no dragão [X / E]"
            >
              <Footprints className="w-4 h-4 text-amber-400" />
              <span>Montar [X]{distanceToDragon > 7 ? ` (${distanceToDragon}m)` : ''}</span>
            </button>

            {distanceToDragon > 7 && (
              <button
                onClick={() => {
                  actionHandlersRef.current?.callDragon?.();
                }}
                className="px-3 py-2.5 rounded-xl bg-cyan-950/80 hover:bg-cyan-900/80 border border-cyan-500/40 text-cyan-300 font-mono font-bold text-xs flex items-center gap-1.5 shadow-lg backdrop-blur-md active:scale-95 transition-all"
                title="Chamar o dragão para pousar ao seu lado"
              >
                <Wind className="w-4 h-4 text-cyan-400" />
                <span>Chamar Dragão</span>
              </button>
            )}
          </>
        )}

        {/* Toggle Flight Button (only when mounted) */}
        {isMounted && (
          <button
            onClick={() => {
              if (!isFlying) {
                actionHandlersRef.current?.takeoff();
              } else {
                actionHandlersRef.current?.land();
              }
            }}
            className={`px-3.5 py-2.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 shadow-lg backdrop-blur-md transition-all active:scale-95 ${
              isFlying
                ? 'bg-cyan-600/30 border-cyan-400 text-cyan-200'
                : 'bg-[#111114]/90 border-white/10 text-white hover:bg-white/10'
            }`}
          >
            <Wind className="w-4 h-4 text-cyan-400" />
            <span>{isFlying ? 'Pousar [V]' : 'Decolar [Espaço/V]'}</span>
          </button>
        )}

        {/* Breath Attack Button */}
        <button
          onClick={() => {
            actionHandlersRef.current?.attack();
          }}
          className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-mono font-bold text-xs flex items-center gap-1.5 shadow-lg active:scale-95"
        >
          <Flame className="w-4 h-4 text-orange-200" />
          <span>Sopro [F]</span>
        </button>

        {/* Roar Button */}
        <button
          onClick={() => {
            actionHandlersRef.current?.roar();
          }}
          className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-mono font-bold text-xs flex items-center gap-1.5 shadow-lg active:scale-95"
        >
          <Zap className="w-4 h-4 text-amber-400" />
          <span>Rugir [R]</span>
        </button>

        {/* FREE CLOTHES SHOP ACTION BUTTON */}
        <button
          onClick={() => setShowClothesShop(true)}
          className="px-3.5 py-2.5 rounded-xl bg-purple-950/80 hover:bg-purple-900/90 border border-purple-500/50 text-purple-200 font-mono font-bold text-xs flex items-center gap-1.5 shadow-lg backdrop-blur-md active:scale-95 transition-all"
          title="Loja de Roupas Grátis dos Condutores (Trajes, Elmos, Capas e Tintas)"
        >
          <Shirt className="w-4 h-4 text-purple-400" />
          <span>Loja Roupas</span>
          <span className="text-[10px] px-1 py-0.2 rounded bg-emerald-500/30 text-emerald-300 font-bold">Grátis</span>
        </button>
      </div>

      {/* Screen Effects on Roar / Attack */}
      {isRoaring && (
        <div className="absolute inset-0 border-4 border-orange-500/40 pointer-events-none animate-pulse rounded-2xl" />
      )}
      {isAttacking && (
        <div className="absolute inset-0 bg-orange-600/5 pointer-events-none rounded-2xl" />
      )}

      {/* REALISTIC DRAGON SKIN MODAL */}
      <DragonSkinModal
        dragon={activeDragon}
        isOpen={showSkinModal}
        onClose={() => setShowSkinModal(false)}
        onEquipSkin={(dragonId, skinStyle, customColors) => {
          if (playerDragonRef.current?.updateSkin) {
            playerDragonRef.current.updateSkin(skinStyle, customColors);
          }
          if (onUpdateDragonSkin) {
            onUpdateDragonSkin(dragonId, skinStyle, customColors);
          }
        }}
        isCreatorMode={isCreatorMode}
      />

      {/* FREE CLOTHES SHOP MODAL */}
      <ClothesShopModal
        isOpen={showClothesShop}
        onClose={() => setShowClothesShop(false)}
        customizationState={customizationState}
        onApplyCustomization={handleApplyCustomization}
      />

      {/* TELEPORT MAP MODAL */}
      <TeleportMapModal
        isOpen={showTeleportMap}
        onClose={() => setShowTeleportMap(false)}
        currentX={playerCoords.x}
        currentZ={playerCoords.z}
        onTeleport={(x, z, name) => {
          actionHandlersRef.current?.teleportTo?.(x, z, name);
        }}
      />

      {/* MULTIPLAYER IN-GAME CHAT & PLAYERS RADAR */}
      {multiplayer && (
        <MultiplayerChatHUD
          chatMessages={multiplayer.chatMessages}
          remotePlayers={multiplayer.remotePlayers}
          onSendChat={multiplayer.sendChat}
          onSendAction={multiplayer.sendAction}
          playerCoords={playerCoords}
          currentRoom={multiplayer.currentRoom}
          isCreator={isCreatorMode}
          myUsername={userProfile?.username || 'Francisco'}
          onTeleportNearPlayer={(pos) => {
            if (actionHandlersRef.current?.teleportTo) {
              actionHandlersRef.current.teleportTo(pos[0], pos[2], 'Jogador Aliado');
            }
          }}
        />
      )}
    </div>
  );
};
