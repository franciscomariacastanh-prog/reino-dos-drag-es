import * as THREE from 'three';
import { DragonElement, RiderCustomizationOptions } from '../types';

export interface RealisticRiderInstance {
  group: THREE.Group;
  hips: THREE.Group;
  torso: THREE.Group;
  head: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  cape: THREE.Group;
  applyCustomization: (opts: Partial<RiderCustomizationOptions>) => void;
  updateAnimation: (
    dt: number,
    currentTime: number,
    opts: {
      isMoving: boolean;
      speed: number;
      isSprinting: boolean;
      isJumping: boolean;
      stamina?: number;
    }
  ) => void;
}

const ELEMENT_GLOW_COLORS: Record<DragonElement, string> = {
  magma: '#f97316',
  aquatico: '#38bdf8',
  floresta: '#4ade80',
  robotico: '#22d3ee',
  neve: '#93c5fd',
  pantano: '#c084fc',
  planicie: '#fde047',
  ancestral: '#fbbf24',
  negro: '#a855f7',
  eletrico: '#00f0ff'
};

const ELEMENT_CAPE_COLORS: Record<DragonElement, string> = {
  magma: '#7c2d12',
  aquatico: '#0c4a6e',
  floresta: '#14532d',
  robotico: '#1e293b',
  neve: '#1e3a8a',
  pantano: '#4c1d95',
  planicie: '#713f12',
  ancestral: '#78350f',
  negro: '#2e1065',
  eletrico: '#082f49'
};

/**
 * Builds an articulated, photorealistic Dragon Rider humanoid character
 * with walking, running, jumping, and breathing kinematics.
 */
export function buildHumanoidRiderModel(options?: {
  element?: DragonElement;
  scale?: number;
  customization?: Partial<RiderCustomizationOptions>;
}): RealisticRiderInstance {
  const element = options?.element || 'magma';
  const scale = options?.scale ?? 1.0;
  const initialCustom = options?.customization;

  const glowColor = initialCustom?.visorGlowColor || ELEMENT_GLOW_COLORS[element] || '#f97316';
  const capeColor = initialCustom?.capeColor || ELEMENT_CAPE_COLORS[element] || '#7c2d12';
  const armorColor = initialCustom?.armorColor || '#27272a';
  const goldColor = initialCustom?.goldAccentColor || '#eab308';
  const clothColor = initialCustom?.clothColor || '#18181b';
  const skinColor = initialCustom?.skinColor || '#d4a373';

  const rootGroup = new THREE.Group();
  rootGroup.scale.set(scale, scale, scale);

  // Materials
  const skinMat = new THREE.MeshStandardMaterial({
    color: skinColor,
    roughness: 0.65
  });

  const armorMat = new THREE.MeshStandardMaterial({
    color: armorColor,
    metalness: 0.82,
    roughness: 0.28
  });

  const goldAccentMat = new THREE.MeshStandardMaterial({
    color: goldColor,
    metalness: 0.88,
    roughness: 0.22
  });

  const clothMat = new THREE.MeshStandardMaterial({
    color: clothColor,
    roughness: 0.85
  });

  const visorGlowMat = new THREE.MeshBasicMaterial({
    color: glowColor
  });

  const capeMat = new THREE.MeshStandardMaterial({
    color: capeColor,
    roughness: 0.72,
    side: THREE.DoubleSide
  });

  // 1. Root / Hips Pivot (base Y around 0.9m)
  const baseHipsY = 0.95;
  const hips = new THREE.Group();
  hips.position.y = baseHipsY;
  rootGroup.add(hips);

  // Pelvis / Belt mesh
  const beltGeo = new THREE.CylinderGeometry(0.32, 0.28, 0.22, 10);
  const beltMesh = new THREE.Mesh(beltGeo, armorMat);
  beltMesh.castShadow = true;
  hips.add(beltMesh);

  // Dragon-Eye Buckle
  const buckleGeo = new THREE.SphereGeometry(0.08, 8, 8);
  buckleGeo.scale(1, 0.6, 0.6);
  const buckleMesh = new THREE.Mesh(buckleGeo, goldAccentMat);
  buckleMesh.position.set(0, 0, 0.3);
  hips.add(buckleMesh);

  // 2. Torso & Upper Body
  const torso = new THREE.Group();
  torso.position.y = 0.12;
  hips.add(torso);

  // Armored Cuirass
  const chestGeo = new THREE.CylinderGeometry(0.4, 0.32, 0.58, 10);
  chestGeo.scale(1.15, 1, 0.8);
  const chestMesh = new THREE.Mesh(chestGeo, armorMat);
  chestMesh.position.y = 0.28;
  chestMesh.castShadow = true;
  torso.add(chestMesh);

  // Elemental Crest Plate on Chest
  const crestGeo = new THREE.BoxGeometry(0.24, 0.26, 0.06);
  const crestMesh = new THREE.Mesh(crestGeo, goldAccentMat);
  crestMesh.position.set(0, 0.35, 0.24);
  torso.add(crestMesh);

  const crestRune = new THREE.Mesh(new THREE.OctahedronGeometry(0.06), visorGlowMat);
  crestRune.position.set(0, 0.35, 0.28);
  torso.add(crestRune);

  // Pauldrons (Shoulder Guards)
  const pauldronGeo = new THREE.SphereGeometry(0.18, 8, 8);
  pauldronGeo.scale(1.3, 0.9, 1.2);

  const leftPauldron = new THREE.Mesh(pauldronGeo, armorMat);
  leftPauldron.position.set(0.44, 0.54, 0);
  leftPauldron.castShadow = true;
  torso.add(leftPauldron);

  const rightPauldron = leftPauldron.clone();
  rightPauldron.position.x = -0.44;
  torso.add(rightPauldron);

  // 3. Head & Dragon-Rider Helmet
  const head = new THREE.Group();
  head.position.y = 0.62;
  torso.add(head);

  // Neck
  const neckMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 0.14, 8), skinMat);
  neckMesh.position.y = 0.05;
  head.add(neckMesh);

  // Base Face Head (Skin)
  const baseHeadMesh = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 10), skinMat);
  baseHeadMesh.position.y = 0.27;
  head.add(baseHeadMesh);

  // Helmet Head
  const helmGeo = new THREE.SphereGeometry(0.27, 12, 10);
  helmGeo.scale(0.95, 1.1, 1.05);
  const helmMesh = new THREE.Mesh(helmGeo, armorMat);
  helmMesh.position.y = 0.28;
  helmMesh.castShadow = true;
  head.add(helmMesh);

  // Visor Eye-slit with glowing elemental hue
  const visorGeo = new THREE.BoxGeometry(0.32, 0.06, 0.08);
  const visorMesh = new THREE.Mesh(visorGeo, visorGlowMat);
  visorMesh.position.set(0, 0.3, 0.24);
  head.add(visorMesh);

  // --- HEADWEAR ACCESSORY VARIATIONS ---
  // A. Micro Dragon Horns on Helmet
  const hornsGroup = new THREE.Group();
  head.add(hornsGroup);
  const hornGeo = new THREE.ConeGeometry(0.045, 0.22, 5);
  const leftHorn = new THREE.Mesh(hornGeo, goldAccentMat);
  leftHorn.position.set(0.16, 0.48, -0.04);
  leftHorn.rotation.z = -0.4;
  leftHorn.rotation.x = -0.3;
  const rightHorn = leftHorn.clone();
  rightHorn.position.x = -0.16;
  rightHorn.rotation.z = 0.4;
  hornsGroup.add(leftHorn, rightHorn);

  // B. Imperial Crown Group
  const crownGroup = new THREE.Group();
  crownGroup.visible = false;
  head.add(crownGroup);
  const crownCirc = new THREE.Mesh(
    new THREE.CylinderGeometry(0.28, 0.26, 0.08, 12, 1, true),
    goldAccentMat
  );
  crownCirc.position.set(0, 0.46, 0);
  crownGroup.add(crownCirc);
  for (let k = 0; k < 5; k++) {
    const kAngle = (k / 5) * Math.PI * 2;
    const peak = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.14, 4), goldAccentMat);
    peak.position.set(Math.cos(kAngle) * 0.27, 0.54, Math.sin(kAngle) * 0.27);
    crownGroup.add(peak);
    const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.025), visorGlowMat);
    gem.position.set(Math.cos(kAngle) * 0.28, 0.48, Math.sin(kAngle) * 0.28);
    crownGroup.add(gem);
  }

  // C. Valkyrie Wings Group
  const wingsGroup = new THREE.Group();
  wingsGroup.visible = false;
  head.add(wingsGroup);
  for (let s = -1; s <= 1; s += 2) {
    const wWing = new THREE.Group();
    wWing.position.set(s * 0.27, 0.38, -0.02);
    for (let f = 0; f < 3; f++) {
      const feather = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.18 - f * 0.03, 0.08 + f * 0.02), goldAccentMat);
      feather.position.set(s * 0.05 * f, 0.08 + f * 0.06, -0.06 * f);
      feather.rotation.z = s * (0.35 + f * 0.15);
      wWing.add(feather);
    }
    wingsGroup.add(wWing);
  }

  // D. Assassin Hood Group
  const hoodGroup = new THREE.Group();
  hoodGroup.visible = false;
  head.add(hoodGroup);
  const hoodGeo = new THREE.ConeGeometry(0.34, 0.45, 8);
  hoodGeo.rotateX(-0.15);
  const hoodMesh = new THREE.Mesh(hoodGeo, clothMat);
  hoodMesh.position.set(0, 0.42, -0.06);
  hoodGroup.add(hoodMesh);

  // E. Cyber Goggles / Visor Group
  const cyberGroup = new THREE.Group();
  cyberGroup.visible = false;
  head.add(cyberGroup);
  const cybBand = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.09, 0.12), armorMat);
  cybBand.position.set(0, 0.32, 0.22);
  cyberGroup.add(cybBand);
  const cybLens = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.04, 0.05), visorGlowMat);
  cybLens.position.set(0, 0.32, 0.28);
  cyberGroup.add(cybLens);
  // Side Cyber Antenna
  const cybAnt = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.28), goldAccentMat);
  cybAnt.position.set(0.28, 0.44, 0.05);
  cybAnt.rotation.z = -0.3;
  cyberGroup.add(cybAnt);

  // F. Hair Mesh (when helmet is disabled / 'none')
  const hairMesh = new THREE.Mesh(
    new THREE.ConeGeometry(0.28, 0.22, 7),
    new THREE.MeshStandardMaterial({ color: '#451a03', roughness: 0.9 })
  );
  hairMesh.position.set(0, 0.46, -0.02);
  hairMesh.visible = false;
  head.add(hairMesh);

  // 4. Flowing Dragon Rider Cape
  const cape = new THREE.Group();
  cape.position.set(0, 0.54, -0.18);
  torso.add(cape);

  const capeSegments: THREE.Mesh[] = [];
  const capeWidth = 0.52;
  const capeSegHeight = 0.32;
  for (let i = 0; i < 3; i++) {
    const cGeo = new THREE.PlaneGeometry(capeWidth + i * 0.06, capeSegHeight, 4, 1);
    const cMesh = new THREE.Mesh(cGeo, capeMat);
    cMesh.position.set(0, -capeSegHeight * (i + 0.5), 0);
    cMesh.castShadow = true;
    cape.add(cMesh);
    capeSegments.push(cMesh);
  }

  // 5. Articulated Left Arm (Pivot at shoulder)
  const leftArm = new THREE.Group();
  leftArm.position.set(0.44, 0.5, 0);
  torso.add(leftArm);

  const upperArmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.32, 6), clothMat);
  upperArmMesh.position.y = -0.16;
  upperArmMesh.castShadow = true;
  leftArm.add(upperArmMesh);

  const leftForearm = new THREE.Group();
  leftForearm.position.y = -0.32;
  leftArm.add(leftForearm);

  const forearmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.32, 6), armorMat);
  forearmMesh.position.y = -0.16;
  forearmMesh.castShadow = true;
  leftForearm.add(forearmMesh);

  // Gauntlet / Hand
  const handMesh = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.12, 0.08), goldAccentMat);
  handMesh.position.y = -0.36;
  leftForearm.add(handMesh);

  // 6. Articulated Right Arm
  const rightArm = new THREE.Group();
  rightArm.position.set(-0.44, 0.5, 0);
  torso.add(rightArm);

  const rightUpperArmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.32, 6), clothMat);
  rightUpperArmMesh.position.y = -0.16;
  rightUpperArmMesh.castShadow = true;
  rightArm.add(rightUpperArmMesh);

  const rightForearm = new THREE.Group();
  rightForearm.position.y = -0.32;
  rightArm.add(rightForearm);

  const rightForearmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.32, 6), armorMat);
  rightForearmMesh.position.y = -0.16;
  rightForearmMesh.castShadow = true;
  rightForearm.add(rightForearmMesh);

  const rightHandMesh = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.12, 0.08), goldAccentMat);
  rightHandMesh.position.y = -0.36;
  rightForearm.add(rightHandMesh);

  // 7. Articulated Left Leg (Pivot at hip)
  const leftLeg = new THREE.Group();
  leftLeg.position.set(0.2, 0, 0);
  hips.add(leftLeg);

  const leftThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.44, 7), clothMat);
  leftThigh.position.y = -0.22;
  leftThigh.castShadow = true;
  leftLeg.add(leftThigh);

  const leftShinGroup = new THREE.Group();
  leftShinGroup.position.y = -0.44;
  leftLeg.add(leftShinGroup);

  const leftShin = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.09, 0.44, 7), armorMat);
  leftShin.position.y = -0.22;
  leftShin.castShadow = true;
  leftShinGroup.add(leftShin);

  // Armored Boot
  const leftBoot = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.14, 0.28), goldAccentMat);
  leftBoot.position.set(0, -0.42, 0.05);
  leftBoot.castShadow = true;
  leftShinGroup.add(leftBoot);

  // 8. Articulated Right Leg (Pivot at hip)
  const rightLeg = new THREE.Group();
  rightLeg.position.set(-0.2, 0, 0);
  hips.add(rightLeg);

  const rightThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.44, 7), clothMat);
  rightThigh.position.y = -0.22;
  rightThigh.castShadow = true;
  rightLeg.add(rightThigh);

  const rightShinGroup = new THREE.Group();
  rightShinGroup.position.y = -0.44;
  rightLeg.add(rightShinGroup);

  const rightShin = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.09, 0.44, 7), armorMat);
  rightShin.position.y = -0.22;
  rightShin.castShadow = true;
  rightShinGroup.add(rightShin);

  const rightBoot = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.14, 0.28), goldAccentMat);
  rightBoot.position.set(0, -0.42, 0.05);
  rightBoot.castShadow = true;
  rightShinGroup.add(rightBoot);

  // Animation cycle internal time
  let walkCycle = 0;

  const updateAnimation = (
    dt: number,
    currentTime: number,
    opts: {
      isMoving: boolean;
      speed: number;
      isSprinting: boolean;
      isJumping: boolean;
      stamina?: number;
    }
  ) => {
    if (opts.isJumping) {
      // JUMP KINEMATICS
      leftLeg.rotation.x = THREE.MathUtils.lerp(leftLeg.rotation.x, -0.5, 0.2);
      rightLeg.rotation.x = THREE.MathUtils.lerp(rightLeg.rotation.x, -0.4, 0.2);
      leftShinGroup.rotation.x = THREE.MathUtils.lerp(leftShinGroup.rotation.x, 0.7, 0.2);
      rightShinGroup.rotation.x = THREE.MathUtils.lerp(rightShinGroup.rotation.x, 0.6, 0.2);

      leftArm.rotation.x = THREE.MathUtils.lerp(leftArm.rotation.x, -0.8, 0.2);
      leftArm.rotation.z = THREE.MathUtils.lerp(leftArm.rotation.z, 0.4, 0.2);
      rightArm.rotation.x = THREE.MathUtils.lerp(rightArm.rotation.x, -0.8, 0.2);
      rightArm.rotation.z = THREE.MathUtils.lerp(rightArm.rotation.z, -0.4, 0.2);

      hips.position.y = THREE.MathUtils.lerp(hips.position.y, baseHipsY + 0.1, 0.2);
      cape.rotation.x = THREE.MathUtils.lerp(cape.rotation.x, -0.65, 0.2);
      torso.rotation.x = THREE.MathUtils.lerp(torso.rotation.x, 0.15, 0.2);
    } else if (opts.isMoving && opts.speed > 0.4) {
      // WALK / RUN STRIDE KINEMATICS
      const strideFreq = opts.isSprinting ? 15 : 9.5;
      walkCycle += dt * strideFreq;

      const legAmplitude = opts.isSprinting ? 0.75 : 0.48;
      const armAmplitude = opts.isSprinting ? 0.65 : 0.40;

      // Leg stride (alternating)
      const legSwing = Math.sin(walkCycle) * legAmplitude;
      leftLeg.rotation.x = legSwing;
      rightLeg.rotation.x = -legSwing;

      // Knee bending on back-stride for realistic human gait
      leftShinGroup.rotation.x = legSwing < 0 ? Math.abs(legSwing) * 1.1 : 0.05;
      rightShinGroup.rotation.x = -legSwing < 0 ? Math.abs(-legSwing) * 1.1 : 0.05;

      // Opposing Arm swing
      leftArm.rotation.x = -legSwing * (armAmplitude / legAmplitude);
      rightArm.rotation.x = legSwing * (armAmplitude / legAmplitude);
      leftArm.rotation.z = 0.08;
      rightArm.rotation.z = -0.08;

      // Hips natural bounce and torso lean
      const bounce = Math.abs(Math.sin(walkCycle)) * (opts.isSprinting ? 0.09 : 0.04);
      hips.position.y = baseHipsY + bounce;

      const forwardLean = opts.isSprinting ? 0.22 : 0.08;
      torso.rotation.x = THREE.MathUtils.lerp(torso.rotation.x, forwardLean, 0.15);
      torso.rotation.y = Math.sin(walkCycle) * 0.08;

      // Dynamic Cape billowing backwards with aerodynamic wave
      const capeSpeedFactor = Math.min(1.0, opts.speed / 18.0);
      const capeBaseAngle = -0.2 - capeSpeedFactor * 0.55;
      cape.rotation.x = capeBaseAngle + Math.sin(currentTime * 12) * 0.1;
      capeSegments.forEach((seg, i) => {
        seg.rotation.x = Math.sin(currentTime * 10 + i * 1.2) * (0.08 + capeSpeedFactor * 0.15);
      });
    } else {
      // IDLE KINEMATICS
      leftLeg.rotation.x = THREE.MathUtils.lerp(leftLeg.rotation.x, 0, 0.15);
      rightLeg.rotation.x = THREE.MathUtils.lerp(rightLeg.rotation.x, 0, 0.15);
      leftShinGroup.rotation.x = THREE.MathUtils.lerp(leftShinGroup.rotation.x, 0, 0.15);
      rightShinGroup.rotation.x = THREE.MathUtils.lerp(rightShinGroup.rotation.x, 0, 0.15);

      leftArm.rotation.x = THREE.MathUtils.lerp(leftArm.rotation.x, 0.05 + Math.sin(currentTime * 2.2) * 0.03, 0.1);
      leftArm.rotation.z = THREE.MathUtils.lerp(leftArm.rotation.z, 0.08, 0.1);
      rightArm.rotation.x = THREE.MathUtils.lerp(rightArm.rotation.x, 0.05 - Math.sin(currentTime * 2.2) * 0.03, 0.1);
      rightArm.rotation.z = THREE.MathUtils.lerp(rightArm.rotation.z, -0.08, 0.1);

      // Subtle breathing motion
      hips.position.y = THREE.MathUtils.lerp(hips.position.y, baseHipsY, 0.1);
      torso.rotation.x = THREE.MathUtils.lerp(torso.rotation.x, 0, 0.1);
      torso.rotation.y = THREE.MathUtils.lerp(torso.rotation.y, 0, 0.1);
      torso.position.y = 0.12 + Math.sin(currentTime * 2.5) * 0.012;

      // Cape gently swaying in the breeze
      cape.rotation.x = THREE.MathUtils.lerp(cape.rotation.x, -0.15 + Math.sin(currentTime * 2.5) * 0.06, 0.1);
      capeSegments.forEach((seg, i) => {
        seg.rotation.x = Math.sin(currentTime * 2.2 + i * 0.8) * 0.05;
      });
    }
  };

  const applyCustomization = (opts: Partial<RiderCustomizationOptions>) => {
    if (opts.armorColor) {
      armorMat.color.set(opts.armorColor);
    }
    if (opts.goldAccentColor) {
      goldAccentMat.color.set(opts.goldAccentColor);
    }
    if (opts.clothColor) {
      clothMat.color.set(opts.clothColor);
    }
    if (opts.capeColor) {
      capeMat.color.set(opts.capeColor);
    }
    if (opts.visorGlowColor) {
      visorGlowMat.color.set(opts.visorGlowColor);
    }
    if (opts.skinColor) {
      skinMat.color.set(opts.skinColor);
    }

    if (opts.helmetStyle !== undefined) {
      const hStyle = opts.helmetStyle;
      hornsGroup.visible = hStyle === 'horns';
      crownGroup.visible = hStyle === 'crown';
      wingsGroup.visible = hStyle === 'wings';
      hoodGroup.visible = hStyle === 'hood';
      cyberGroup.visible = hStyle === 'cyber';
      hairMesh.visible = hStyle === 'none';
      visorMesh.visible = hStyle !== 'none' && hStyle !== 'hood';
      helmMesh.visible = hStyle !== 'none';
    }

    if (opts.capeStyle !== undefined) {
      cape.visible = opts.capeStyle !== 'none';
    }
  };

  if (initialCustom) {
    applyCustomization(initialCustom);
  }

  return {
    group: rootGroup,
    hips,
    torso,
    head,
    leftArm,
    rightArm,
    leftLeg,
    rightLeg,
    cape,
    applyCustomization,
    updateAnimation
  };
}
