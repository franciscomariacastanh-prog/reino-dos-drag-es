import * as THREE from 'three';
import { Dragon, DragonElement, DragonSkinStyle, RiderCustomizationOptions } from '../types';
import {
  createScaleTexture,
  createWingLeatherTexture,
  createUnderbellyTexture,
  createRealisticDragonSkinPBR,
  createRealisticWingMembraneTexture,
  createRealisticGastrostegesTexture,
  createRealisticHornTexture,
  createRealisticEyeTexture
} from './realisticTextures';
import { getDefaultSkinForElement, getSkinDefinition } from '../data/dragonSkins';

export interface RealisticDragonConfig {
  element: DragonElement;
  scale?: number;
  skinStyle?: DragonSkinStyle;
  equippedArmor?: {
    peitoral?: boolean;
    elmo?: boolean;
    asas?: boolean;
    garras?: boolean;
  };
  isPlayer?: boolean;
  isTitan?: boolean;
  customColors?: {
    primary: string;
    secondary: string;
    emissive: string;
  };
  customization?: Partial<RiderCustomizationOptions>;
}

export interface RealisticDragonInstance {
  group: THREE.Group;
  torsoGroup: THREE.Group;
  torsoMesh: THREE.Mesh;
  neckGroup: THREE.Group;
  headGroup: THREE.Group;
  lowerJaw: THREE.Group;
  leftWingGroup: THREE.Group;
  rightWingGroup: THREE.Group;
  tailBones: THREE.Group[];
  frontLeftLeg: THREE.Group;
  frontRightLeg: THREE.Group;
  backLeftLeg: THREE.Group;
  backRightLeg: THREE.Group;
  breathEmitter: THREE.Object3D;
  mountedRiderGroup?: THREE.Group;
  setRiderMounted?: (mounted: boolean) => void;
  updateMountedRiderCustomization?: (opts: Partial<RiderCustomizationOptions>) => void;
  updateSkin?: (newSkin: DragonSkinStyle, newColors?: { primary: string; secondary: string; emissive: string }) => void;
  updateAnimation: (
    dt: number,
    currentTime: number,
    opt: {
      isFlying: boolean;
      forwardSpeed: number;
      verticalSpeed: number;
      stamina: number;
      isRoaring: boolean;
      isAttacking: boolean;
      wingFlapTime?: number;
      tailTime?: number;
      legTime?: number;
      pitch?: number;
    }
  ) => void;
}

const ELEMENT_PALETTES: Record<DragonElement, { primary: string; secondary: string; emissive: string }> = {
  magma: { primary: '#1a0e0a', secondary: '#ea580c', emissive: '#f97316' },
  aquatico: { primary: '#082333', secondary: '#0284c7', emissive: '#38bdf8' },
  floresta: { primary: '#0d2814', secondary: '#16a34a', emissive: '#4ade80' },
  robotico: { primary: '#1e293b', secondary: '#06b6d4', emissive: '#22d3ee' },
  neve: { primary: '#1e293b', secondary: '#93c5fd', emissive: '#e0f2fe' },
  pantano: { primary: '#1a1024', secondary: '#a855f7', emissive: '#c084fc' },
  planicie: { primary: '#2a1f0a', secondary: '#eab308', emissive: '#fde047' },
  ancestral: { primary: '#3d301b', secondary: '#f59e0b', emissive: '#fbbf24' },
  negro: { primary: '#08060c', secondary: '#4c1d95', emissive: '#a855f7' },
  eletrico: { primary: '#082f49', secondary: '#00f0ff', emissive: '#facc15' }
};

/**
 * Builds an anatomically rich, highly articulated 3D dragon with:
 * - Reptilian head with sculpted cranium, brow ridges, nostrils, fangs, and articulated lower jaw
 * - Multi-segment S-curve neck with dorsal crests and underbelly scutes
 * - Muscular barrel ribcage with ventral plastron and dual spinal ridges
 * - True anatomical wings with humerus, elbow, radius/ulna, carpus thumb claw, 4 radiating finger struts & scalloped membrane
 * - Articulated legs with muscular haunches, hocks, and predatory talons
 * - Flexible 5-segment tail with aerodynamic flight rudder spade
 */
export function buildRealisticDragonModel(config: RealisticDragonConfig): RealisticDragonInstance {
  const element = config.element || 'magma';
  let activeSkinStyle: DragonSkinStyle = config.skinStyle || getDefaultSkinForElement(element);
  const skinDef = getSkinDefinition(activeSkinStyle);
  let curColors = config.customColors || {
    primary: skinDef.primaryColor || ELEMENT_PALETTES[element]?.primary || ELEMENT_PALETTES.magma.primary,
    secondary: skinDef.secondaryColor || ELEMENT_PALETTES[element]?.secondary || ELEMENT_PALETTES.magma.secondary,
    emissive: skinDef.emissiveColor || ELEMENT_PALETTES[element]?.emissive || ELEMENT_PALETTES.magma.emissive
  };
  const isTitan = !!config.isTitan;
  const baseScale = config.scale || (isTitan ? 0.78 : 0.54);

  const mainGroup = new THREE.Group();
  mainGroup.scale.set(baseScale, baseScale, baseScale);

  // 1. Photorealistic Procedural Multi-Map PBR Textures
  const isMecha = element === 'robotico' || activeSkinStyle === 'cyber-apex-nano-composite';
  let pbrMaps = createRealisticDragonSkinPBR(activeSkinStyle, curColors.primary, curColors.secondary, curColors.emissive);
  let bellyTex = createRealisticGastrostegesTexture(activeSkinStyle, curColors.secondary, curColors.primary);
  let wingTex = createRealisticWingMembraneTexture(activeSkinStyle, curColors.primary, curColors.secondary, curColors.emissive);
  let hornTex = createRealisticHornTexture(isMecha ? '#0a0f1d' : '#140f12', curColors.secondary);

  // 2. High-Fidelity Specialized PBR MeshPhysicalMaterials
  const bodyMat = new THREE.MeshPhysicalMaterial({
    map: pbrMaps.map,
    bumpMap: pbrMaps.bumpMap,
    bumpScale: skinDef.bumpScale,
    normalMap: pbrMaps.normalMap,
    normalScale: new THREE.Vector2(1.8, 1.8),
    roughnessMap: pbrMaps.roughnessMap,
    emissiveMap: pbrMaps.emissiveMap,
    emissive: new THREE.Color(curColors.emissive),
    emissiveIntensity: skinDef.emissiveIntensity,
    color: new THREE.Color(curColors.primary),
    roughness: skinDef.roughness,
    metalness: skinDef.metalness,
    clearcoat: 0.32,
    clearcoatRoughness: 0.22
  });

  const bellyMat = new THREE.MeshPhysicalMaterial({
    map: bellyTex,
    bumpMap: bellyTex,
    bumpScale: 0.08,
    color: new THREE.Color(curColors.secondary),
    roughness: 0.42,
    metalness: isMecha ? 0.6 : 0.1,
    clearcoat: 0.22,
    clearcoatRoughness: 0.28
  });

  const accentMat = new THREE.MeshPhysicalMaterial({
    map: pbrMaps.map,
    bumpMap: pbrMaps.bumpMap,
    bumpScale: 0.06,
    normalMap: pbrMaps.normalMap,
    normalScale: new THREE.Vector2(1.5, 1.5),
    color: new THREE.Color(curColors.secondary),
    emissive: new THREE.Color(curColors.emissive),
    emissiveIntensity: Math.min(1.4, skinDef.emissiveIntensity * 1.2),
    roughness: 0.3,
    metalness: isMecha ? 0.75 : 0.25,
    clearcoat: 0.35,
    clearcoatRoughness: 0.18
  });

  const wingMat = new THREE.MeshStandardMaterial({
    map: wingTex,
    bumpMap: wingTex,
    bumpScale: 0.05,
    color: new THREE.Color(curColors.secondary),
    side: THREE.DoubleSide,
    roughness: 0.58,
    metalness: isMecha ? 0.45 : 0.06,
    transparent: true,
    opacity: 0.94
  });

  const hornMat = new THREE.MeshPhysicalMaterial({
    map: hornTex,
    bumpMap: hornTex,
    bumpScale: 0.06,
    color: new THREE.Color(isMecha ? '#0f172a' : '#141016'),
    roughness: 0.26,
    metalness: isMecha ? 0.82 : 0.24,
    clearcoat: 0.38,
    clearcoatRoughness: 0.2
  });

  const talonMat = new THREE.MeshPhysicalMaterial({
    color: '#08060a',
    roughness: 0.16,
    metalness: 0.35,
    clearcoat: 0.55,
    clearcoatRoughness: 0.12
  });

  const fangMat = new THREE.MeshPhysicalMaterial({
    color: '#fdfcf5',
    roughness: 0.12,
    metalness: 0.06,
    clearcoat: 0.65,
    clearcoatRoughness: 0.1
  });

  const mouthMat = new THREE.MeshStandardMaterial({
    color: '#2a070a',
    roughness: 0.55
  });

  const armorMat = new THREE.MeshStandardMaterial({
    color: '#d97706',
    metalness: 0.88,
    roughness: 0.18
  });

  // Customizable Mounted Rider Materials
  const initialRider = config.customization || {};
  const riderClothMat = new THREE.MeshStandardMaterial({
    color: initialRider.clothColor || '#18181b',
    roughness: 0.8
  });
  const riderArmorMat = new THREE.MeshStandardMaterial({
    color: initialRider.armorColor || '#27272a',
    metalness: 0.82,
    roughness: 0.26
  });
  const riderGoldMat = new THREE.MeshStandardMaterial({
    color: initialRider.goldAccentColor || '#eab308',
    metalness: 0.9,
    roughness: 0.2
  });
  const riderCapeMat = new THREE.MeshStandardMaterial({
    color: initialRider.capeColor || '#7c2d12',
    roughness: 0.75,
    side: THREE.DoubleSide
  });
  const riderVisorGlowMat = new THREE.MeshStandardMaterial({
    color: initialRider.visorGlowColor || '#f97316',
    emissive: initialRider.visorGlowColor || '#f97316',
    emissiveIntensity: 0.95,
    roughness: 0.1
  });
  const riderSkinMat = new THREE.MeshStandardMaterial({
    color: initialRider.skinColor || '#d4a373',
    roughness: 0.7
  });

  // 3. Torso & Muscular Anatomy
  const torsoGroup = new THREE.Group();
  mainGroup.add(torsoGroup);

  // Chest / Pectoral Barrel
  const chestGeo = new THREE.CylinderGeometry(1.65, 1.45, 2.6, 12);
  chestGeo.rotateX(Math.PI / 2);
  const chestMesh = new THREE.Mesh(chestGeo, bodyMat);
  chestMesh.position.set(0, 0, 0.4);
  chestMesh.scale.set(1.15, 1.35, 1.0);
  chestMesh.castShadow = true;
  chestMesh.receiveShadow = true;
  torsoGroup.add(chestMesh);
  const torsoMesh = chestMesh; // referenced for breathing

  // Abdomen / Pelvis
  const abdoGeo = new THREE.CylinderGeometry(1.4, 1.05, 2.4, 10);
  abdoGeo.rotateX(Math.PI / 2);
  const abdoMesh = new THREE.Mesh(abdoGeo, bodyMat);
  abdoMesh.position.set(0, -0.05, -1.8);
  abdoMesh.scale.set(1.05, 1.15, 1.0);
  abdoMesh.castShadow = true;
  torsoGroup.add(abdoMesh);

  // Ventral Underbelly Armor Scutes (Plastron)
  const bellyPlateGeo = new THREE.CylinderGeometry(1.35, 1.0, 4.4, 8, 1, false, 0, Math.PI);
  bellyPlateGeo.rotateX(Math.PI / 2);
  bellyPlateGeo.rotateZ(Math.PI);
  const bellyMesh = new THREE.Mesh(bellyPlateGeo, bellyMat);
  bellyMesh.position.set(0, -0.65, -0.7);
  bellyMesh.scale.set(0.92, 0.75, 1.0);
  torsoGroup.add(bellyMesh);

  // Chest Armor (if equipped)
  if (config.equippedArmor?.peitoral) {
    const cuirassGeo = new THREE.CylinderGeometry(1.75, 1.85, 2.4, 10);
    cuirassGeo.rotateX(Math.PI / 2);
    const cuirassMesh = new THREE.Mesh(cuirassGeo, armorMat);
    cuirassMesh.position.set(0, 0.05, 0.35);
    cuirassMesh.scale.set(1.18, 1.38, 1.0);
    torsoGroup.add(cuirassMesh);
  }

  // Dual Serrated Dorsal Spine Spikes
  for (let i = 0; i < 7; i++) {
    const spikeHeight = 0.75 + Math.sin((i / 7) * Math.PI) * 0.55;
    const spikeGeo = new THREE.ConeGeometry(0.28, spikeHeight, 4);
    const spike = new THREE.Mesh(spikeGeo, accentMat);
    spike.position.set(0, 1.25 + Math.sin((i / 7) * Math.PI) * 0.3, 1.4 - i * 0.65);
    spike.rotation.x = -0.15;
    spike.castShadow = true;
    torsoGroup.add(spike);
  }

  // Shoulder and Hip Muscular Bulges
  const shoulderBulgeGeo = new THREE.SphereGeometry(0.85, 8, 8);
  shoulderBulgeGeo.scale(0.8, 1.2, 1.2);
  const leftShoulder = new THREE.Mesh(shoulderBulgeGeo, bodyMat);
  leftShoulder.position.set(1.45, 0.2, 1.1);
  const rightShoulder = leftShoulder.clone();
  rightShoulder.position.x = -1.45;
  torsoGroup.add(leftShoulder, rightShoulder);

  const hipBulgeGeo = new THREE.SphereGeometry(0.9, 8, 8);
  hipBulgeGeo.scale(0.85, 1.25, 1.25);
  const leftHip = new THREE.Mesh(hipBulgeGeo, bodyMat);
  leftHip.position.set(1.3, 0.0, -1.9);
  const rightHip = leftHip.clone();
  rightHip.position.x = -1.3;
  torsoGroup.add(leftHip, rightHip);

  // Humanoid Rider (for player dragon)
  let mountedRiderGroup: THREE.Group | undefined;
  let mountedHornsGroup: THREE.Group | undefined;
  let mountedCrownGroup: THREE.Group | undefined;
  let mountedWingsGroup: THREE.Group | undefined;
  let mountedHoodGroup: THREE.Group | undefined;
  let mountedCyberGroup: THREE.Group | undefined;
  let mountedHairMesh: THREE.Mesh | undefined;
  let mountedVisorMesh: THREE.Mesh | undefined;
  let mountedHelmMesh: THREE.Mesh | undefined;
  let mountedCapeGroup: THREE.Group | undefined;
  const mountedCapeSegments: THREE.Mesh[] = [];

  if (config.isPlayer) {
    // Saddle always stays attached to the dragon torso
    const saddleGeo = new THREE.BoxGeometry(0.95, 0.24, 1.05);
    const saddle = new THREE.Mesh(saddleGeo, hornMat);
    saddle.position.set(0, 1.45, 0.2);
    saddle.castShadow = true;
    torsoGroup.add(saddle);

    // Cantle & Pommel of saddle
    const pommel = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 0.18), hornMat);
    pommel.position.set(0, 1.65, 0.65);
    torsoGroup.add(pommel);

    const cantle = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.42, 0.2), hornMat);
    cantle.position.set(0, 1.68, -0.28);
    torsoGroup.add(cantle);

    // Mounted rider group (toggled on/off when mounted/dismounted)
    mountedRiderGroup = new THREE.Group();
    mountedRiderGroup.position.set(0, 1.48, 0.2);

    // Hips / Pelvis sitting in the saddle
    const riderHips = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.28, 0.48), riderClothMat);
    riderHips.position.y = 0.18;
    mountedRiderGroup.add(riderHips);

    // Torso (Tunic + Cuirass armor plate)
    const riderTorso = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.65, 0.42), riderClothMat);
    riderTorso.position.y = 0.58;
    riderTorso.castShadow = true;
    mountedRiderGroup.add(riderTorso);

    const cuirassPlate = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.55, 0.46), riderArmorMat);
    cuirassPlate.position.set(0, 0.60, 0.01);
    cuirassPlate.castShadow = true;
    mountedRiderGroup.add(cuirassPlate);

    // Gold Belt & Buckle
    const belt = new THREE.Mesh(new THREE.BoxGeometry(0.70, 0.12, 0.48), riderArmorMat);
    belt.position.set(0, 0.32, 0.01);
    mountedRiderGroup.add(belt);

    const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.14, 0.52), riderGoldMat);
    buckle.position.set(0, 0.32, 0);
    mountedRiderGroup.add(buckle);

    // Shoulder Pauldrons
    const pauldronGeo = new THREE.BoxGeometry(0.24, 0.16, 0.32);
    const leftPauldron = new THREE.Mesh(pauldronGeo, riderArmorMat);
    leftPauldron.position.set(0.44, 0.88, 0);
    const rightPauldron = leftPauldron.clone();
    rightPauldron.position.x = -0.44;
    mountedRiderGroup.add(leftPauldron, rightPauldron);

    // Head Group
    const headGroupRider = new THREE.Group();
    headGroupRider.position.set(0, 1.05, 0);
    mountedRiderGroup.add(headGroupRider);

    // Neck
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.16, 8), riderSkinMat);
    neck.position.y = -0.06;
    headGroupRider.add(neck);

    // Base Face / Head
    const baseHead = new THREE.Mesh(new THREE.SphereGeometry(0.26, 12, 10), riderSkinMat);
    baseHead.position.y = 0.18;
    headGroupRider.add(baseHead);

    // Helmet Dome
    const helmGeo = new THREE.SphereGeometry(0.29, 12, 10);
    helmGeo.scale(0.96, 1.1, 1.05);
    mountedHelmMesh = new THREE.Mesh(helmGeo, riderArmorMat);
    mountedHelmMesh.position.y = 0.20;
    mountedHelmMesh.castShadow = true;
    headGroupRider.add(mountedHelmMesh);

    // Glowing Combat Eye Visor Slit
    const visorGeo = new THREE.BoxGeometry(0.34, 0.065, 0.1);
    mountedVisorMesh = new THREE.Mesh(visorGeo, riderVisorGlowMat);
    mountedVisorMesh.position.set(0, 0.22, 0.24);
    headGroupRider.add(mountedVisorMesh);

    // A. Dragon Horns
    mountedHornsGroup = new THREE.Group();
    headGroupRider.add(mountedHornsGroup);
    const hornGeo = new THREE.ConeGeometry(0.045, 0.24, 5);
    const hL = new THREE.Mesh(hornGeo, riderGoldMat);
    hL.position.set(0.16, 0.42, -0.04);
    hL.rotation.z = -0.4;
    hL.rotation.x = -0.3;
    const hR = hL.clone();
    hR.position.x = -0.16;
    hR.rotation.z = 0.4;
    mountedHornsGroup.add(hL, hR);

    // B. Imperial Crown
    mountedCrownGroup = new THREE.Group();
    headGroupRider.add(mountedCrownGroup);
    const crownRing = new THREE.Mesh(new THREE.CylinderGeometry(0.29, 0.27, 0.08, 12, 1, true), riderGoldMat);
    crownRing.position.set(0, 0.38, 0);
    mountedCrownGroup.add(crownRing);
    for (let k = 0; k < 5; k++) {
      const kAngle = (k / 5) * Math.PI * 2;
      const peak = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.14, 4), riderGoldMat);
      peak.position.set(Math.cos(kAngle) * 0.28, 0.46, Math.sin(kAngle) * 0.28);
      mountedCrownGroup.add(peak);
      const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.025), riderVisorGlowMat);
      gem.position.set(Math.cos(kAngle) * 0.29, 0.40, Math.sin(kAngle) * 0.29);
      mountedCrownGroup.add(gem);
    }

    // C. Valkyrie Wings
    mountedWingsGroup = new THREE.Group();
    headGroupRider.add(mountedWingsGroup);
    for (let s = -1; s <= 1; s += 2) {
      const wWing = new THREE.Group();
      wWing.position.set(s * 0.28, 0.30, -0.02);
      for (let f = 0; f < 3; f++) {
        const feather = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.20 - f * 0.03, 0.09 + f * 0.02), riderGoldMat);
        feather.position.set(s * 0.05 * f, 0.08 + f * 0.06, -0.06 * f);
        feather.rotation.z = s * (0.35 + f * 0.15);
        wWing.add(feather);
      }
      mountedWingsGroup.add(wWing);
    }

    // D. Ranger / Assassin Cowl Hood
    mountedHoodGroup = new THREE.Group();
    headGroupRider.add(mountedHoodGroup);
    const hoodGeo = new THREE.ConeGeometry(0.36, 0.48, 8);
    hoodGeo.rotateX(-0.15);
    const hoodMesh = new THREE.Mesh(hoodGeo, riderClothMat);
    hoodMesh.position.set(0, 0.34, -0.06);
    mountedHoodGroup.add(hoodMesh);

    // E. Cyber Holo Visor
    mountedCyberGroup = new THREE.Group();
    headGroupRider.add(mountedCyberGroup);
    const cybBand = new THREE.Mesh(new THREE.BoxGeometry(0.40, 0.09, 0.14), riderArmorMat);
    cybBand.position.set(0, 0.24, 0.22);
    mountedCyberGroup.add(cybBand);
    const cybLens = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.045, 0.06), riderVisorGlowMat);
    cybLens.position.set(0, 0.24, 0.28);
    mountedCyberGroup.add(cybLens);
    const cybAnt = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.28), riderGoldMat);
    cybAnt.position.set(0.30, 0.36, 0.05);
    cybAnt.rotation.z = -0.3;
    mountedCyberGroup.add(cybAnt);

    // F. Hair Mesh (when helmet is disabled / 'none')
    mountedHairMesh = new THREE.Mesh(
      new THREE.ConeGeometry(0.30, 0.24, 7),
      new THREE.MeshStandardMaterial({ color: '#451a03', roughness: 0.9 })
    );
    mountedHairMesh.position.set(0, 0.38, -0.02);
    headGroupRider.add(mountedHairMesh);

    // Set initial helmet styles
    const initH = initialRider.helmetStyle || 'horns';
    mountedHornsGroup.visible = initH === 'horns';
    mountedCrownGroup.visible = initH === 'crown';
    mountedWingsGroup.visible = initH === 'wings';
    mountedHoodGroup.visible = initH === 'hood';
    mountedCyberGroup.visible = initH === 'cyber';
    mountedHairMesh.visible = initH === 'none';
    mountedVisorMesh.visible = initH !== 'none' && initH !== 'hood';
    mountedHelmMesh.visible = initH !== 'none';

    // Flowing Cape attached to shoulders
    mountedCapeGroup = new THREE.Group();
    mountedCapeGroup.position.set(0, 0.88, -0.22);
    mountedRiderGroup.add(mountedCapeGroup);

    const capeWidth = 0.58;
    const capeSegH = 0.34;
    for (let i = 0; i < 3; i++) {
      const cGeo = new THREE.PlaneGeometry(capeWidth + i * 0.08, capeSegH, 4, 1);
      const cMesh = new THREE.Mesh(cGeo, riderCapeMat);
      cMesh.position.set(0, -capeSegH * (i + 0.5), -i * 0.04);
      cMesh.castShadow = true;
      mountedCapeGroup.add(cMesh);
      mountedCapeSegments.push(cMesh);
    }
    mountedCapeGroup.visible = (initialRider.capeStyle || 'flowing') !== 'none';

    // Articulated Arms holding the reins
    const armUpperGeo = new THREE.CylinderGeometry(0.09, 0.08, 0.34, 6);
    const armLowerGeo = new THREE.CylinderGeometry(0.08, 0.07, 0.34, 6);

    const leftArmUpper = new THREE.Mesh(armUpperGeo, riderClothMat);
    leftArmUpper.position.set(0.44, 0.65, 0.12);
    leftArmUpper.rotation.x = -Math.PI / 4;
    leftArmUpper.rotation.z = Math.PI / 6;
    mountedRiderGroup.add(leftArmUpper);

    const leftArmFore = new THREE.Mesh(armLowerGeo, riderArmorMat);
    leftArmFore.position.set(0.48, 0.45, 0.32);
    leftArmFore.rotation.x = -Math.PI / 3;
    mountedRiderGroup.add(leftArmFore);

    const rightArmUpper = new THREE.Mesh(armUpperGeo, riderClothMat);
    rightArmUpper.position.set(-0.44, 0.65, 0.12);
    rightArmUpper.rotation.x = -Math.PI / 4;
    rightArmUpper.rotation.z = -Math.PI / 6;
    mountedRiderGroup.add(rightArmUpper);

    const rightArmFore = new THREE.Mesh(armLowerGeo, riderArmorMat);
    rightArmFore.position.set(-0.48, 0.45, 0.32);
    rightArmFore.rotation.x = -Math.PI / 3;
    mountedRiderGroup.add(rightArmFore);

    // Seated Legs in stirrups gripping the dragon torso
    const thighGeo = new THREE.CylinderGeometry(0.14, 0.12, 0.55, 6);
    const calfGeo = new THREE.CylinderGeometry(0.12, 0.10, 0.52, 6);

    const leftThigh = new THREE.Mesh(thighGeo, riderClothMat);
    leftThigh.position.set(0.46, 0.18, 0.18);
    leftThigh.rotation.x = Math.PI / 3;
    leftThigh.rotation.z = -0.35;
    mountedRiderGroup.add(leftThigh);

    const leftCalf = new THREE.Mesh(calfGeo, riderArmorMat);
    leftCalf.position.set(0.52, -0.16, 0.28);
    leftCalf.rotation.x = -0.25;
    leftCalf.rotation.z = -0.15;
    mountedRiderGroup.add(leftCalf);

    const rightThigh = new THREE.Mesh(thighGeo, riderClothMat);
    rightThigh.position.set(-0.46, 0.18, 0.18);
    rightThigh.rotation.x = Math.PI / 3;
    rightThigh.rotation.z = 0.35;
    mountedRiderGroup.add(rightThigh);

    const rightCalf = new THREE.Mesh(calfGeo, riderArmorMat);
    rightCalf.position.set(-0.52, -0.16, 0.28);
    rightCalf.rotation.x = -0.25;
    rightCalf.rotation.z = 0.15;
    mountedRiderGroup.add(rightCalf);

    torsoGroup.add(mountedRiderGroup);
  }

  // 4. S-Curve Articulated Neck (3 Segments)
  const neckGroup = new THREE.Group();
  neckGroup.position.set(0, 0.6, 1.8);
  torsoGroup.add(neckGroup);

  // Neck Segment 1 (Base, arching forward)
  const neckSeg1Geo = new THREE.CylinderGeometry(1.0, 1.35, 1.3, 8);
  neckSeg1Geo.rotateX(Math.PI / 4);
  const neckSeg1 = new THREE.Mesh(neckSeg1Geo, bodyMat);
  neckSeg1.position.set(0, 0.35, 0.4);
  neckGroup.add(neckSeg1);

  // Neck Segment 2 (Mid-arch)
  const neckSeg2Group = new THREE.Group();
  neckSeg2Group.position.set(0, 0.8, 0.85);
  neckGroup.add(neckSeg2Group);

  const neckSeg2Geo = new THREE.CylinderGeometry(0.85, 1.0, 1.2, 8);
  neckSeg2Geo.rotateX(Math.PI / 5);
  const neckSeg2 = new THREE.Mesh(neckSeg2Geo, bodyMat);
  neckSeg2.position.set(0, 0.4, 0.35);
  neckSeg2Group.add(neckSeg2);

  // Neck Segment 3 (Upper neck meeting cranium)
  const neckSeg3Group = new THREE.Group();
  neckSeg3Group.position.set(0, 0.75, 0.75);
  neckSeg2Group.add(neckSeg3Group);

  const neckSeg3Geo = new THREE.CylinderGeometry(0.72, 0.88, 1.1, 8);
  neckSeg3Geo.rotateX(Math.PI / 6);
  const neckSeg3 = new THREE.Mesh(neckSeg3Geo, bodyMat);
  neckSeg3.position.set(0, 0.35, 0.3);
  neckSeg3Group.add(neckSeg3);

  // Spikes along neck spine
  const neckSpike1 = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.7, 4), accentMat);
  neckSpike1.position.set(0, 0.75, 0.2);
  neckSpike1.rotation.x = -0.2;
  neckGroup.add(neckSpike1);

  const neckSpike2 = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.65, 4), accentMat);
  neckSpike2.position.set(0, 0.8, 0.2);
  neckSpike2.rotation.x = -0.2;
  neckSeg2Group.add(neckSpike2);

  const neckSpike3 = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.6, 4), accentMat);
  neckSpike3.position.set(0, 0.75, 0.15);
  neckSpike3.rotation.x = -0.2;
  neckSeg3Group.add(neckSpike3);

  // 5. Realistic Sculpted Head & Jaws
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0.6, 0.7);
  neckSeg3Group.add(headGroup);

  // A. Cranium / Upper Skull
  const craniumGeo = new THREE.BoxGeometry(1.2, 0.75, 1.4);
  const craniumMesh = new THREE.Mesh(craniumGeo, bodyMat);
  craniumMesh.position.set(0, 0.1, 0.1);
  craniumMesh.castShadow = true;
  headGroup.add(craniumMesh);

  // Sloping Forehead Brow
  const browGeo = new THREE.BoxGeometry(1.25, 0.35, 0.9);
  browGeo.rotateX(-Math.PI / 8);
  const browMesh = new THREE.Mesh(browGeo, bodyMat);
  browMesh.position.set(0, 0.38, 0.3);
  headGroup.add(browMesh);

  // Arching Supraorbital Brow Horns (Menacing Predatory Eye Ridges)
  const browRidgeGeo = new THREE.ConeGeometry(0.18, 0.95, 5);
  browRidgeGeo.rotateX(-Math.PI / 3);
  const leftBrowRidge = new THREE.Mesh(browRidgeGeo, hornMat);
  leftBrowRidge.position.set(0.58, 0.44, 0.45);
  leftBrowRidge.rotation.z = -0.32;
  leftBrowRidge.rotation.y = 0.22;
  const rightBrowRidge = new THREE.Mesh(browRidgeGeo, hornMat);
  rightBrowRidge.position.set(-0.58, 0.44, 0.45);
  rightBrowRidge.rotation.z = 0.32;
  rightBrowRidge.rotation.y = -0.22;
  headGroup.add(leftBrowRidge, rightBrowRidge);

  // Tapered Upper Snout
  const snoutGeo = new THREE.ConeGeometry(0.72, 1.8, 6);
  snoutGeo.rotateX(-Math.PI / 2);
  snoutGeo.scale(1.15, 0.75, 1.0);
  const snoutMesh = new THREE.Mesh(snoutGeo, bodyMat);
  snoutMesh.position.set(0, 0.05, 1.3);
  snoutMesh.castShadow = true;
  headGroup.add(snoutMesh);

  // Dorsal Nasal Bridge Keel Spikes
  for (let n = 0; n < 3; n++) {
    const nSpike = new THREE.Mesh(new THREE.ConeGeometry(0.08 - n * 0.015, 0.24 - n * 0.04, 4), accentMat);
    nSpike.position.set(0, 0.36 - n * 0.05, 1.1 + n * 0.35);
    nSpike.rotation.x = -0.28;
    headGroup.add(nSpike);
  }

  // Flared Draconic Nostril Ridges
  const nostrilLeft = new THREE.Mesh(new THREE.SphereGeometry(0.11, 6, 6), hornMat);
  nostrilLeft.position.set(0.24, 0.18, 2.05);
  const nostrilRight = nostrilLeft.clone();
  nostrilRight.position.x = -0.24;
  headGroup.add(nostrilLeft, nostrilRight);

  // Deep nostril cavities
  const nostrilHoleGeo = new THREE.SphereGeometry(0.055, 4, 4);
  const nostrilHoleMat = new THREE.MeshBasicMaterial({ color: '#050203' });
  const holeL = new THREE.Mesh(nostrilHoleGeo, nostrilHoleMat);
  holeL.position.set(0.25, 0.18, 2.12);
  const holeR = holeL.clone();
  holeR.position.x = -0.25;
  headGroup.add(holeL, holeR);

  // Primary Saber Canines (Prominent curved predatory fangs)
  const saberGeo = new THREE.ConeGeometry(0.085, 0.48, 5);
  saberGeo.rotateX(Math.PI * 0.88);
  const saberL = new THREE.Mesh(saberGeo, fangMat);
  saberL.position.set(0.36, -0.16, 1.4);
  saberL.rotation.z = -0.1;
  const saberR = saberL.clone();
  saberR.position.x = -0.36;
  saberR.rotation.z = 0.1;
  headGroup.add(saberL, saberR);

  // Upper Fangs / Serrated Teeth Along Jawline
  for (let t = 0; t < 6; t++) {
    const fangGeo = new THREE.ConeGeometry(0.055, 0.28, 4);
    fangGeo.rotateX(Math.PI * 0.92);
    const fangL = new THREE.Mesh(fangGeo, fangMat);
    fangL.position.set(0.34 - t * 0.035, -0.15, 0.8 + t * 0.18);
    const fangR = fangL.clone();
    fangR.position.x = -fangL.position.x;
    headGroup.add(fangL, fangR);
  }

  // B. Articulated Lower Jaw (Mandible)
  const lowerJaw = new THREE.Group();
  lowerJaw.position.set(0, -0.15, 0.1);
  headGroup.add(lowerJaw);

  const jawGeo = new THREE.ConeGeometry(0.68, 1.7, 6);
  jawGeo.rotateX(-Math.PI / 2);
  jawGeo.scale(1.05, 0.55, 1.0);
  const jawMesh = new THREE.Mesh(jawGeo, bodyMat);
  jawMesh.position.set(0, -0.1, 1.15);
  lowerJaw.add(jawMesh);

  // Mouth Interior Palate
  const palateGeo = new THREE.BoxGeometry(0.65, 0.08, 1.2);
  const palateMesh = new THREE.Mesh(palateGeo, mouthMat);
  palateMesh.position.set(0, 0.02, 1.0);
  lowerJaw.add(palateMesh);

  // Lower Interlocking Fangs
  for (let t = 0; t < 5; t++) {
    const lFangGeo = new THREE.ConeGeometry(0.055, 0.25, 4);
    lFangGeo.rotateX(-0.1);
    const lFangL = new THREE.Mesh(lFangGeo, fangMat);
    lFangL.position.set(0.31 - t * 0.035, 0.1, 0.75 + t * 0.2);
    const lFangR = lFangL.clone();
    lFangR.position.x = -lFangL.position.x;
    lowerJaw.add(lFangL, lFangR);
  }

  // Bioluminescent Forked Draconic Tongue
  const tongueMat = new THREE.MeshStandardMaterial({
    color: curColors.emissive,
    emissive: curColors.emissive,
    emissiveIntensity: 0.85
  });
  const tongueGeo = new THREE.BoxGeometry(0.16, 0.04, 0.75);
  const tongue = new THREE.Mesh(tongueGeo, tongueMat);
  tongue.position.set(0, 0.06, 0.95);
  lowerJaw.add(tongue);

  // Forked tongue tips
  const forkGeo = new THREE.ConeGeometry(0.035, 0.25, 4);
  forkGeo.rotateX(-Math.PI / 2);
  const forkL = new THREE.Mesh(forkGeo, tongueMat);
  forkL.position.set(0.05, 0.06, 1.4);
  forkL.rotation.y = 0.22;
  const forkR = forkL.clone();
  forkR.position.x = -0.05;
  forkR.rotation.y = -0.22;
  lowerJaw.add(forkL, forkR);

  // Helmet Armor (if equipped)
  if (config.equippedArmor?.elmo) {
    const helmGeo = new THREE.BoxGeometry(1.35, 0.9, 1.5);
    const helmMesh = new THREE.Mesh(helmGeo, armorMat);
    helmMesh.position.set(0, 0.25, 0.2);
    headGroup.add(helmMesh);
  }

  // C. Photorealistic Dragon Eyes (Glowing Iris, Vertical Slit Pupil, Cornea Gloss)
  const eyeTexture = createRealisticEyeTexture(curColors.emissive, curColors.secondary, isMecha);
  const eyeMat = new THREE.MeshStandardMaterial({
    map: eyeTexture,
    emissiveMap: eyeTexture,
    emissive: new THREE.Color(curColors.emissive),
    emissiveIntensity: 0.75,
    roughness: 0.06,
    metalness: 0.15
  });

  const createDragonEye = () => {
    const eyeGroup = new THREE.Group();

    // Cornea Sclera Sphere
    const corneaGeo = new THREE.SphereGeometry(0.24, 16, 16);
    const cornea = new THREE.Mesh(corneaGeo, eyeMat);
    cornea.rotation.y = Math.PI / 2;
    eyeGroup.add(cornea);

    // Eyelid Rim
    const rimGeo = new THREE.TorusGeometry(0.26, 0.06, 8, 16);
    const rim = new THREE.Mesh(rimGeo, bodyMat);
    eyeGroup.add(rim);

    return eyeGroup;
  };

  const leftEye = createDragonEye();
  leftEye.position.set(0.62, 0.28, 0.55);
  leftEye.rotation.y = 0.25;
  const rightEye = createDragonEye();
  rightEye.position.set(-0.62, 0.28, 0.55);
  rightEye.rotation.y = -0.25;
  headGroup.add(leftEye, rightEye);

  // D. Majestic Swept-Back Curved Horns (Segmented Architecture)
  const createCurvedHorn = (isLeft: boolean) => {
    const hornGroup = new THREE.Group();
    const sign = isLeft ? 1 : -1;

    // Segment 1 (Base, angling up and backward)
    const baseGeo = new THREE.CylinderGeometry(0.22, 0.32, 1.2, 7);
    baseGeo.rotateX(-Math.PI / 3);
    baseGeo.rotateZ(sign * 0.25);
    const baseMesh = new THREE.Mesh(baseGeo, hornMat);
    baseMesh.position.set(sign * 0.25, 0.45, -0.3);
    hornGroup.add(baseMesh);

    // Segment 2 (Mid curvature, tapering and flaring out)
    const midGeo = new THREE.CylinderGeometry(0.14, 0.22, 1.2, 6);
    midGeo.rotateX(-Math.PI / 2.6);
    midGeo.rotateZ(sign * 0.4);
    const midMesh = new THREE.Mesh(midGeo, hornMat);
    midMesh.position.set(sign * 0.55, 1.2, -0.9);
    hornGroup.add(midMesh);

    // Segment 3 (Sharp tip)
    const tipGeo = new THREE.ConeGeometry(0.14, 1.1, 5);
    tipGeo.rotateX(-Math.PI / 2.2);
    tipGeo.rotateZ(sign * 0.55);
    const tipMesh = new THREE.Mesh(tipGeo, accentMat);
    tipMesh.position.set(sign * 0.9, 1.85, -1.5);
    hornGroup.add(tipMesh);

    return hornGroup;
  };

  const leftHorn = createCurvedHorn(true);
  leftHorn.position.set(0.35, 0.35, -0.3);
  const rightHorn = createCurvedHorn(false);
  rightHorn.position.set(-0.35, 0.35, -0.3);
  headGroup.add(leftHorn, rightHorn);

  // Secondary Cheek Spikes & Jaw Frills
  const cheekSpikeGeo = new THREE.ConeGeometry(0.14, 0.7, 4);
  cheekSpikeGeo.rotateZ(Math.PI / 2.5);
  const leftCheek = new THREE.Mesh(cheekSpikeGeo, accentMat);
  leftCheek.position.set(0.72, -0.05, 0.2);
  const rightCheek = leftCheek.clone();
  rightCheek.rotation.z = -Math.PI / 2.5;
  rightCheek.position.x = -0.72;
  headGroup.add(leftCheek, rightCheek);

  // Crown / Occipital Spines
  for (let c = 0; c < 3; c++) {
    const cSpike = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.5 + c * 0.1, 4), accentMat);
    cSpike.position.set((c - 1) * 0.35, 0.5, -0.5);
    cSpike.rotation.x = -0.6;
    headGroup.add(cSpike);
  }

  // Breath Emitter Node (Mouth orifice point)
  const breathEmitter = new THREE.Object3D();
  breathEmitter.position.set(0, -0.05, 2.3);
  headGroup.add(breathEmitter);

  // 6. True Anatomical Dragon Wings (Muscular Arm + 4 Radiating Phalanges + Scalloped Leather Membrane)
  const createAnatomicalWing = (isLeft: boolean) => {
    const wingRoot = new THREE.Group();
    const sign = isLeft ? 1 : -1;
    wingRoot.position.set(sign * 1.5, 0.9, 0.5);

    // Bone 1: Humerus (Upper arm, heavy muscle)
    const humerusGeo = new THREE.CylinderGeometry(0.38, 0.44, 2.6, 7);
    humerusGeo.rotateZ(-sign * Math.PI / 3.2);
    const humerus = new THREE.Mesh(humerusGeo, bodyMat);
    humerus.position.set(sign * 1.1, 0.6, -0.2);
    wingRoot.add(humerus);

    // Elbow Joint Group
    const elbowJoint = new THREE.Group();
    elbowJoint.position.set(sign * 2.2, 1.25, -0.4);
    wingRoot.add(elbowJoint);

    // Elbow spur
    const elbowSpur = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.65, 4), accentMat);
    elbowSpur.position.set(-sign * 0.15, -0.2, -0.3);
    elbowSpur.rotation.x = -Math.PI / 3;
    elbowJoint.add(elbowSpur);

    // Bone 2: Forearm (Radius / Ulna)
    const forearmGeo = new THREE.CylinderGeometry(0.28, 0.36, 3.2, 6);
    forearmGeo.rotateZ(-sign * Math.PI / 4);
    forearmGeo.rotateY(sign * 0.2);
    const forearm = new THREE.Mesh(forearmGeo, bodyMat);
    forearm.position.set(sign * 1.3, 1.1, 0.2);
    elbowJoint.add(forearm);

    // Carpus / Wrist Joint Group
    const wristJoint = new THREE.Group();
    wristJoint.position.set(sign * 2.5, 2.2, 0.4);
    elbowJoint.add(wristJoint);

    // Alula / Hooked Thumb Claw
    const thumbGeo = new THREE.ConeGeometry(0.16, 0.75, 4);
    thumbGeo.rotateX(Math.PI / 3);
    thumbGeo.rotateZ(-sign * Math.PI / 4);
    const thumb = new THREE.Mesh(thumbGeo, talonMat);
    thumb.position.set(0, 0.2, 0.2);
    wristJoint.add(thumb);

    // 4 Radiating Elongated Wing Fingers (Phalanges Struts)
    const fingerDefs = [
      { len: 5.8, angleZ: -sign * 0.25, angleY: -sign * 0.1 }, // Leading spar
      { len: 5.2, angleZ: -sign * 0.55, angleY: -sign * 0.25 }, // Finger 2
      { len: 4.6, angleZ: -sign * 0.85, angleY: -sign * 0.4 },  // Finger 3
      { len: 3.8, angleZ: -sign * 1.15, angleY: -sign * 0.55 }  // Trailing finger 4
    ];

    fingerDefs.forEach(f => {
      const fGeo = new THREE.CylinderGeometry(0.08, 0.16, f.len, 5);
      fGeo.rotateZ(f.angleZ);
      fGeo.rotateY(f.angleY);
      const fMesh = new THREE.Mesh(fGeo, bodyMat);
      fMesh.position.set(
        sign * Math.cos(f.angleZ) * (f.len * 0.45),
        Math.sin(f.angleZ) * (f.len * 0.45),
        0
      );
      wristJoint.add(fMesh);
    });

    // Scalloped Curved Leathery Wing Membrane Geometry
    // Constructed with multi-panel curved vertices spanning between bones and finger tips
    const membraneGeo = new THREE.BufferGeometry();
    const vertices: number[] = [];
    const uvs: number[] = [];

    // Main anchor points
    const pBody = [0, 0, -1.2];
    const pHumerus = [sign * 1.1, 0.6, -0.5];
    const pElbow = [sign * 2.2, 1.25, -0.6];
    const pWrist = [sign * 4.7, 3.45, 0.0];

    // Finger tip targets
    const tip1 = [sign * 8.8, 4.6, -0.4];
    const tip2 = [sign * 8.2, 2.2, -1.8];
    const tip3 = [sign * 6.8, 0.4, -2.8];
    const tip4 = [sign * 5.2, -1.2, -3.2];
    const pFlank = [sign * 0.5, -0.4, -2.2];

    const addTri = (p1: number[], p2: number[], p3: number[]) => {
      vertices.push(...p1, ...p2, ...p3);
      uvs.push(0, 0, 1, 0, 0.5, 1);
    };

    // Inner arm web
    addTri(pBody, pHumerus, pElbow);
    addTri(pBody, pElbow, pFlank);

    // Main wing panels across fingers
    addTri(pElbow, pWrist, tip1);
    addTri(pElbow, tip1, tip2);
    addTri(pElbow, tip2, tip3);
    addTri(pElbow, tip3, tip4);
    addTri(pElbow, tip4, pFlank);

    membraneGeo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    membraneGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    membraneGeo.computeVertexNormals();

    const membraneMesh = new THREE.Mesh(membraneGeo, wingMat);
    membraneMesh.castShadow = true;
    wingRoot.add(membraneMesh);

    // Armor Blade on Wing (if equipped)
    if (config.equippedArmor?.asas) {
      const bladeGeo = new THREE.BoxGeometry(0.2, 3.6, 0.9);
      bladeGeo.rotateZ(-sign * 0.4);
      const blade = new THREE.Mesh(bladeGeo, armorMat);
      blade.position.set(sign * 4.2, 2.6, 0);
      wingRoot.add(blade);
    }

    return wingRoot;
  };

  const leftWingGroup = createAnatomicalWing(true);
  const rightWingGroup = createAnatomicalWing(false);
  torsoGroup.add(leftWingGroup, rightWingGroup);

  // 7. Muscular Predatory Legs & Claws
  const createArticulatedLeg = (isFront: boolean, isLeft: boolean) => {
    const legRoot = new THREE.Group();
    const sign = isLeft ? 1 : -1;
    const zPos = isFront ? 1.15 : -1.85;
    const xPos = sign * (isFront ? 1.35 : 1.3);
    legRoot.position.set(xPos, -0.3, zPos);

    if (isFront) {
      // Foreleg: Muscular shoulder, bicep, forearm, wrist, and foot
      const bicepGeo = new THREE.CylinderGeometry(0.38, 0.32, 1.4, 6);
      const bicep = new THREE.Mesh(bicepGeo, bodyMat);
      bicep.position.set(0, -0.6, 0);
      bicep.castShadow = true;
      legRoot.add(bicep);

      const forearmJoint = new THREE.Group();
      forearmJoint.position.set(0, -1.2, 0);
      legRoot.add(forearmJoint);

      const foreArmGeo = new THREE.CylinderGeometry(0.3, 0.26, 1.3, 6);
      const foreArm = new THREE.Mesh(foreArmGeo, bodyMat);
      foreArm.position.set(0, -0.55, 0.1);
      foreArm.rotation.x = 0.15;
      forearmJoint.add(foreArm);

      // Foot & Claws
      const footGeo = new THREE.BoxGeometry(0.65, 0.3, 0.9);
      const foot = new THREE.Mesh(
        footGeo,
        config.equippedArmor?.garras ? armorMat : bodyMat
      );
      foot.position.set(0, -1.15, 0.35);
      forearmJoint.add(foot);

      // 3 Sharp Forward Talons + 1 Dewclaw
      for (let c = 0; c < 3; c++) {
        const clawGeo = new THREE.ConeGeometry(0.09, 0.42, 4);
        clawGeo.rotateX(Math.PI / 2.8);
        const claw = new THREE.Mesh(clawGeo, talonMat);
        claw.position.set((c - 1) * 0.22, -1.15, 0.85);
        forearmJoint.add(claw);
      }
    } else {
      // Hindleg: Powerful Haunch / Thigh, Hock Knee, Metatarsal & Foot
      const thighGeo = new THREE.CylinderGeometry(0.55, 0.42, 1.6, 7);
      thighGeo.rotateX(Math.PI / 8);
      const thigh = new THREE.Mesh(thighGeo, bodyMat);
      thigh.position.set(0, -0.65, 0.1);
      thigh.castShadow = true;
      legRoot.add(thigh);

      // Hock Knee
      const hockJoint = new THREE.Group();
      hockJoint.position.set(0, -1.3, -0.15);
      legRoot.add(hockJoint);

      const shankGeo = new THREE.CylinderGeometry(0.36, 0.28, 1.5, 6);
      shankGeo.rotateX(-Math.PI / 7);
      const shank = new THREE.Mesh(shankGeo, bodyMat);
      shank.position.set(0, -0.65, -0.1);
      hockJoint.add(shank);

      // Heavy Taloned Foot
      const footGeo = new THREE.BoxGeometry(0.75, 0.32, 1.1);
      const foot = new THREE.Mesh(
        footGeo,
        config.equippedArmor?.garras ? armorMat : bodyMat
      );
      foot.position.set(0, -1.35, 0.25);
      hockJoint.add(foot);

      // Heavy Curved Talons
      for (let c = 0; c < 3; c++) {
        const clawGeo = new THREE.ConeGeometry(0.12, 0.55, 4);
        clawGeo.rotateX(Math.PI / 2.6);
        const claw = new THREE.Mesh(clawGeo, talonMat);
        claw.position.set((c - 1) * 0.25, -1.35, 0.85);
        hockJoint.add(claw);
      }
    }

    torsoGroup.add(legRoot);
    return legRoot;
  };

  const frontLeftLeg = createArticulatedLeg(true, true);
  const frontRightLeg = createArticulatedLeg(true, false);
  const backLeftLeg = createArticulatedLeg(false, true);
  const backRightLeg = createArticulatedLeg(false, false);

  // 8. Articulated 5-Segment Tail with Dorsal Crests & Flight Rudder Spade
  const tailBones: THREE.Group[] = [];
  let parentBone: THREE.Group = torsoGroup;

  const segmentRadius = [1.2, 0.95, 0.72, 0.5, 0.32];
  const segmentLength = [1.5, 1.4, 1.3, 1.2, 1.1];

  for (let i = 0; i < 5; i++) {
    const bone = new THREE.Group();
    bone.position.set(0, -0.05, i === 0 ? -2.7 : -segmentLength[i - 1]);

    const tGeo = new THREE.ConeGeometry(segmentRadius[i], segmentLength[i], 7);
    tGeo.rotateX(-Math.PI / 2);
    const tMesh = new THREE.Mesh(tGeo, bodyMat);
    tMesh.position.set(0, 0, -segmentLength[i] / 2);
    tMesh.castShadow = true;
    bone.add(tMesh);

    // Dorsal tail spine
    const tailSpine = new THREE.Mesh(
      new THREE.ConeGeometry(0.15 - i * 0.02, 0.65 - i * 0.08, 4),
      accentMat
    );
    tailSpine.position.set(0, segmentRadius[i] * 0.8, -segmentLength[i] / 2);
    tailSpine.rotation.x = -0.3;
    bone.add(tailSpine);

    parentBone.add(bone);
    tailBones.push(bone);
    parentBone = bone;
  }

  // Aerodynamic Dual Flight Rudder Spade at Tail Tip
  const tipBone = tailBones[tailBones.length - 1];
  const spadeGeo = new THREE.BufferGeometry();
  const spadeVerts = new Float32Array([
    // Left rudder fin
    0, 0, 0,
    1.4, 0.3, -1.2,
    0, 0, -1.8,
    // Right rudder fin
    0, 0, 0,
    -1.4, 0.3, -1.2,
    0, 0, -1.8,
    // Dorsal stabilizer
    0, 0, 0,
    0, 1.2, -1.1,
    0, 0, -1.8
  ]);
  spadeGeo.setAttribute('position', new THREE.BufferAttribute(spadeVerts, 3));
  spadeGeo.computeVertexNormals();
  const spadeMesh = new THREE.Mesh(spadeGeo, accentMat);
  spadeMesh.position.set(0, 0, -segmentLength[4]);
  tipBone.add(spadeMesh);

  // 9. Dynamic Organic Animation Engine
  const updateAnimation = (
    dt: number,
    currentTime: number,
    opt: {
      isFlying: boolean;
      forwardSpeed: number;
      verticalSpeed: number;
      stamina: number;
      isRoaring: boolean;
      isAttacking: boolean;
      wingFlapTime?: number;
      tailTime?: number;
      legTime?: number;
      pitch?: number;
    }
  ) => {
    // Breathing Torso Pulse
    const breathRate = opt.isFlying ? 0.005 : 0.003;
    const breathPulse = Math.sin(currentTime * breathRate) * 0.035;
    torsoMesh.scale.set(1.15 + breathPulse, 1.35 + breathPulse * 0.7, 1.0);

    // Lower Jaw Open / Roar / Breath Attack
    if (opt.isRoaring || opt.isAttacking) {
      lowerJaw.rotation.x = THREE.MathUtils.lerp(lowerJaw.rotation.x, 0.55, 0.2);
    } else {
      lowerJaw.rotation.x = THREE.MathUtils.lerp(lowerJaw.rotation.x, 0.03, 0.1);
    }

    // Wing Flapping & Aerodynamics
    if (opt.isFlying) {
      const flapTime = opt.wingFlapTime ?? 0;
      const wingAngle = Math.sin(flapTime) * 0.65 + 0.1;
      leftWingGroup.rotation.z = wingAngle;
      rightWingGroup.rotation.z = -wingAngle;

      // Aerodynamic pitch flexion
      const wingPitch = Math.cos(flapTime) * 0.16 - (opt.pitch ?? 0) * 0.3;
      leftWingGroup.rotation.x = wingPitch;
      rightWingGroup.rotation.x = wingPitch;
    } else {
      // Ground idle fold
      leftWingGroup.rotation.z = THREE.MathUtils.lerp(leftWingGroup.rotation.z, -0.42, 0.1);
      rightWingGroup.rotation.z = THREE.MathUtils.lerp(rightWingGroup.rotation.z, 0.42, 0.1);
      leftWingGroup.rotation.x = THREE.MathUtils.lerp(leftWingGroup.rotation.x, 0.1, 0.1);
      rightWingGroup.rotation.x = THREE.MathUtils.lerp(rightWingGroup.rotation.x, 0.1, 0.1);
    }

    // Articulated Tail Serpentine Sine Propagation
    const tailT = opt.tailTime ?? 0;
    tailBones.forEach((b, idx) => {
      const freqOffset = idx * 0.65;
      b.rotation.y = Math.sin(tailT - freqOffset) * (0.12 + idx * 0.03);
      b.rotation.x = Math.cos(tailT * 0.6 - freqOffset) * 0.04;
    });

    // Leg Kinematics (Walk vs Ground Idle vs In-Flight Tuck)
    if (!opt.isFlying && Math.abs(opt.forwardSpeed) > 0.5) {
      const legT = opt.legTime ?? 0;
      const legSwing = Math.sin(legT) * 0.48;
      frontLeftLeg.rotation.x = legSwing;
      frontRightLeg.rotation.x = -legSwing;
      backLeftLeg.rotation.x = -legSwing;
      backRightLeg.rotation.x = legSwing;
    } else if (!opt.isFlying) {
      frontLeftLeg.rotation.x = THREE.MathUtils.lerp(frontLeftLeg.rotation.x, 0, 0.1);
      frontRightLeg.rotation.x = THREE.MathUtils.lerp(frontRightLeg.rotation.x, 0, 0.1);
      backLeftLeg.rotation.x = THREE.MathUtils.lerp(backLeftLeg.rotation.x, 0, 0.1);
      backRightLeg.rotation.x = THREE.MathUtils.lerp(backRightLeg.rotation.x, 0, 0.1);
    } else {
      // In-flight tucked legs
      frontLeftLeg.rotation.x = THREE.MathUtils.lerp(frontLeftLeg.rotation.x, 0.65, 0.1);
      frontRightLeg.rotation.x = THREE.MathUtils.lerp(frontRightLeg.rotation.x, 0.65, 0.1);
      backLeftLeg.rotation.x = THREE.MathUtils.lerp(backLeftLeg.rotation.x, -0.75, 0.1);
      backRightLeg.rotation.x = THREE.MathUtils.lerp(backRightLeg.rotation.x, -0.75, 0.1);
    }

    // Natural Neck serpentine sway
    neckGroup.rotation.y = Math.sin(tailT * 0.4) * 0.05;
    if (opt.pitch) {
      neckGroup.rotation.x = -opt.pitch * 0.3;
      headGroup.rotation.x = -opt.pitch * 0.2;
    }

    // Dynamic Mounted Rider Cape Flutter in wind
    if (mountedCapeGroup && mountedCapeGroup.visible && mountedCapeSegments.length > 0) {
      const flapRate = opt.isFlying ? 14 : (Math.abs(opt.forwardSpeed) > 1 ? 7 : 2.5);
      const windBend = opt.isFlying ? Math.min(1.45, 0.6 + opt.forwardSpeed * 0.015) : 0.2;
      mountedCapeSegments.forEach((seg, sIdx) => {
        seg.rotation.x = -windBend + Math.sin(currentTime * 0.008 * flapRate + sIdx * 0.8) * (opt.isFlying ? 0.32 : 0.08);
      });
    }
  };

  return {
    group: mainGroup,
    torsoGroup,
    torsoMesh,
    neckGroup,
    headGroup,
    lowerJaw,
    leftWingGroup,
    rightWingGroup,
    tailBones,
    frontLeftLeg,
    frontRightLeg,
    backLeftLeg,
    backRightLeg,
    breathEmitter,
    mountedRiderGroup,
    setRiderMounted: (mounted: boolean) => {
      if (mountedRiderGroup) {
        mountedRiderGroup.visible = mounted;
      }
    },
    updateMountedRiderCustomization: (opts: Partial<RiderCustomizationOptions>) => {
      if (opts.clothColor) riderClothMat.color.set(opts.clothColor);
      if (opts.armorColor) riderArmorMat.color.set(opts.armorColor);
      if (opts.goldAccentColor) riderGoldMat.color.set(opts.goldAccentColor);
      if (opts.capeColor) riderCapeMat.color.set(opts.capeColor);
      if (opts.visorGlowColor) {
        riderVisorGlowMat.color.set(opts.visorGlowColor);
        riderVisorGlowMat.emissive.set(opts.visorGlowColor);
      }
      if (opts.skinColor) riderSkinMat.color.set(opts.skinColor);

      if (opts.helmetStyle !== undefined) {
        const h = opts.helmetStyle;
        if (mountedHornsGroup) mountedHornsGroup.visible = h === 'horns';
        if (mountedCrownGroup) mountedCrownGroup.visible = h === 'crown';
        if (mountedWingsGroup) mountedWingsGroup.visible = h === 'wings';
        if (mountedHoodGroup) mountedHoodGroup.visible = h === 'hood';
        if (mountedCyberGroup) mountedCyberGroup.visible = h === 'cyber';
        if (mountedHairMesh) mountedHairMesh.visible = h === 'none';
        if (mountedVisorMesh) mountedVisorMesh.visible = h !== 'none' && h !== 'hood';
        if (mountedHelmMesh) mountedHelmMesh.visible = h !== 'none';
      }

      if (opts.capeStyle !== undefined && mountedCapeGroup) {
        mountedCapeGroup.visible = opts.capeStyle !== 'none';
      }
    },
    updateSkin: (newSkin: DragonSkinStyle, newColors?: { primary: string; secondary: string; emissive: string }) => {
      activeSkinStyle = newSkin;
      const def = getSkinDefinition(newSkin);
      const c = newColors || {
        primary: def.primaryColor,
        secondary: def.secondaryColor,
        emissive: def.emissiveColor
      };
      curColors = c;
      const newPbr = createRealisticDragonSkinPBR(newSkin, c.primary, c.secondary, c.emissive);
      const newWing = createRealisticWingMembraneTexture(newSkin, c.primary, c.secondary, c.emissive);
      const newBelly = createRealisticGastrostegesTexture(newSkin, c.secondary, c.primary);
      const newHorn = createRealisticHornTexture(isMecha ? '#0a0f1d' : '#140f12', c.secondary);

      bodyMat.map = newPbr.map;
      bodyMat.bumpMap = newPbr.bumpMap;
      bodyMat.bumpScale = def.bumpScale;
      bodyMat.normalMap = newPbr.normalMap;
      bodyMat.normalScale.set(1.8, 1.8);
      bodyMat.roughnessMap = newPbr.roughnessMap;
      bodyMat.emissiveMap = newPbr.emissiveMap;
      bodyMat.emissive.set(c.emissive);
      bodyMat.emissiveIntensity = def.emissiveIntensity;
      bodyMat.color.set(c.primary);
      bodyMat.roughness = def.roughness;
      bodyMat.metalness = def.metalness;
      bodyMat.needsUpdate = true;

      bellyMat.map = newBelly;
      bellyMat.bumpMap = newBelly;
      bellyMat.color.set(c.secondary);
      bellyMat.needsUpdate = true;

      wingMat.map = newWing;
      wingMat.bumpMap = newWing;
      wingMat.color.set(c.secondary);
      wingMat.needsUpdate = true;

      accentMat.map = newPbr.map;
      accentMat.bumpMap = newPbr.bumpMap;
      accentMat.normalMap = newPbr.normalMap;
      accentMat.normalScale.set(1.5, 1.5);
      accentMat.color.set(c.secondary);
      accentMat.emissive.set(c.emissive);
      accentMat.needsUpdate = true;

      hornMat.map = newHorn;
      hornMat.bumpMap = newHorn;
      hornMat.needsUpdate = true;
    },
    updateAnimation
  };
}
