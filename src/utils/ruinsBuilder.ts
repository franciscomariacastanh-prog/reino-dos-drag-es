import * as THREE from 'three';

/**
 * Procedural Ancient Ruins Builder for Dragon World 3D
 * Constructs authentic, non-repetitive ancient dragon ruins across all biomes
 */

export interface RuinsBuilderMaterials {
  stoneMat: THREE.Material;
  ruinStoneMat: THREE.Material;
  magmaRockMat: THREE.Material;
  lavaMat: THREE.Material;
  cyberMat: THREE.Material;
  cyanNeonMat: THREE.Material;
  iceMat: THREE.Material;
  goldMat: THREE.Material;
  goldStoneMat: THREE.Material;
  swampStoneMat: THREE.Material;
  mossyStoneMat: THREE.Material;
}

/**
 * Creates a fluted or weathered ancient column.
 * If isBroken is true, the column is fractured mid-way with a fallen drum nearby.
 */
export function createAncientColumn(
  x: number,
  z: number,
  baseY: number,
  height: number,
  radius: number,
  material: THREE.Material,
  isBroken: boolean = false,
  breakHeightFraction: number = 0.55
): THREE.Group {
  const colGroup = new THREE.Group();
  colGroup.position.set(x, baseY, z);

  // Plinth (Square base)
  const plinthSize = radius * 2.8;
  const plinthH = radius * 0.7;
  const plinth = new THREE.Mesh(
    new THREE.BoxGeometry(plinthSize, plinthH, plinthSize),
    material
  );
  plinth.position.y = plinthH / 2;
  plinth.receiveShadow = true;
  plinth.castShadow = true;
  colGroup.add(plinth);

  // Torus base ring
  const torusBase = new THREE.Mesh(
    new THREE.TorusGeometry(radius * 1.15, radius * 0.25, 8, 16),
    material
  );
  torusBase.rotation.x = Math.PI / 2;
  torusBase.position.y = plinthH + radius * 0.2;
  colGroup.add(torusBase);

  const effectiveH = isBroken ? height * breakHeightFraction : height;

  // Fluted column shaft (Cylinder with 10 segments for fluted look)
  const shaft = new THREE.Mesh(
    new THREE.CylinderGeometry(radius * 0.88, radius, effectiveH, 12),
    material
  );
  shaft.position.y = plinthH + effectiveH / 2;
  shaft.castShadow = true;
  shaft.receiveShadow = true;
  colGroup.add(shaft);

  if (!isBroken) {
    // Intact Capital (Header)
    const capBottom = new THREE.Mesh(
      new THREE.CylinderGeometry(radius * 1.25, radius * 0.88, radius * 0.5, 12),
      material
    );
    capBottom.position.y = plinthH + effectiveH + radius * 0.25;
    colGroup.add(capBottom);

    const abacus = new THREE.Mesh(
      new THREE.BoxGeometry(plinthSize * 0.95, radius * 0.45, plinthSize * 0.95),
      material
    );
    abacus.position.y = plinthH + effectiveH + radius * 0.65;
    abacus.castShadow = true;
    colGroup.add(abacus);
  } else {
    // Jagged broken top
    const jagged = new THREE.Mesh(
      new THREE.ConeGeometry(radius * 0.85, radius * 0.8, 6),
      material
    );
    jagged.position.y = plinthH + effectiveH + radius * 0.3;
    jagged.rotation.z = 0.2;
    colGroup.add(jagged);

    // Fallen column drum resting on ground nearby
    const fallen = new THREE.Mesh(
      new THREE.CylinderGeometry(radius * 0.85, radius * 0.85, height * (1 - breakHeightFraction) * 0.8, 10),
      material
    );
    fallen.rotation.z = Math.PI / 2;
    fallen.rotation.y = Math.random() * Math.PI;
    fallen.position.set(radius * 2.2, radius * 0.9, radius * 1.5);
    fallen.castShadow = true;
    fallen.receiveShadow = true;
    colGroup.add(fallen);
  }

  return colGroup;
}

/**
 * Creates a stone lintel or broken arch spanning between two points
 */
export function createRuinArch(
  x1: number,
  z1: number,
  x2: number,
  z2: number,
  height: number,
  material: THREE.Material
): THREE.Group {
  const archGroup = new THREE.Group();
  const midX = (x1 + x2) / 2;
  const midZ = (z1 + z2) / 2;
  const dist = Math.hypot(x2 - x1, z2 - z1);
  const angle = Math.atan2(z2 - z1, x2 - x1);

  archGroup.position.set(midX, height, midZ);
  archGroup.rotation.y = -angle;

  // Main beam
  const beam = new THREE.Mesh(
    new THREE.BoxGeometry(dist + 1.2, 1.1, 1.4),
    material
  );
  beam.castShadow = true;
  archGroup.add(beam);

  // Keystone / Relief pediment in center
  const keystone = new THREE.Mesh(
    new THREE.ConeGeometry(0.8, 1.2, 4),
    material
  );
  keystone.position.y = 0.9;
  keystone.rotation.y = Math.PI / 4;
  archGroup.add(keystone);

  return archGroup;
}

/**
 * Builds the Central Sanctuary Grand Pantheon Ruins
 */
export function buildSanctuaryPantheonRuins(
  surfaceY: number,
  mats: RuinsBuilderMaterials
): THREE.Group {
  const group = new THREE.Group();

  // Grand Colonnade Ring around Central Sanctuary
  const columnCount = 14;
  const colonnadeRadius = 26;

  for (let i = 0; i < columnCount; i++) {
    const angle = (i / columnCount) * Math.PI * 2;
    // Skip 2 slots for grand entry pathways
    if (i === 0 || i === 7) continue;

    const cx = Math.cos(angle) * colonnadeRadius;
    const cz = Math.sin(angle) * colonnadeRadius;
    const isBroken = i % 3 === 0;
    const col = createAncientColumn(cx, cz, surfaceY, 9.5, 0.8, mats.ruinStoneMat, isBroken, 0.45 + (i % 3) * 0.15);
    group.add(col);

    // If next column is intact, add horizontal architrave lintel between them
    const nextIdx = (i + 1) % columnCount;
    if (!isBroken && nextIdx % 3 !== 0 && nextIdx !== 0 && nextIdx !== 7) {
      const nAngle = (nextIdx / columnCount) * Math.PI * 2;
      const nx = Math.cos(nAngle) * colonnadeRadius;
      const nz = Math.sin(nAngle) * colonnadeRadius;
      const arch = createRuinArch(cx, cz, nx, nz, surfaceY + 9.5 + 0.6, mats.ruinStoneMat);
      group.add(arch);
    }
  }

  // 4 Grand Triumphal Gateway Pillars flanking the South and North Entries
  const gateOffsets = [
    [-6, 26], [6, 26], // South Gate
    [-6, -26], [6, -26] // North Gate
  ];
  gateOffsets.forEach(([gx, gz]) => {
    const pylon = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 11, 2.4),
      mats.ruinStoneMat
    );
    pylon.position.set(gx, surfaceY + 5.5, gz);
    pylon.castShadow = true;
    pylon.receiveShadow = true;
    group.add(pylon);

    // Weathered dragon statue carving on top
    const capRune = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.9),
      new THREE.MeshStandardMaterial({ color: '#f59e0b', emissive: '#d97706', emissiveIntensity: 0.6 })
    );
    capRune.position.set(gx, surfaceY + 11.8, gz);
    group.add(capRune);
  });

  // Ancient Stepped Altar Dais in the inner sanctuary
  for (let s = 0; s < 3; s++) {
    const stepSize = 14 - s * 3.5;
    const step = new THREE.Mesh(
      new THREE.CylinderGeometry(stepSize, stepSize + 0.8, 0.5, 16),
      mats.ruinStoneMat
    );
    step.position.set(0, surfaceY + 0.25 + s * 0.45, 0);
    step.receiveShadow = true;
    group.add(step);
  }

  return group;
}

/**
 * Builds the Volcanic Magma Citadel Ruins (North: x: 0, z: -100)
 */
export function buildVolcanoMagmaRuins(
  centerX: number,
  centerZ: number,
  surfaceY: number,
  mats: RuinsBuilderMaterials
): THREE.Group {
  const group = new THREE.Group();

  // Scorched Basalt Colosseum / Ruined Fortress Walls
  const wallSegments = 8;
  const wallRad = 34;
  for (let i = 0; i < wallSegments; i++) {
    const angle = (i / wallSegments) * Math.PI * 2;
    // Leave front opening
    if (i === 2 || i === 3) continue;

    const wx = centerX + Math.cos(angle) * wallRad;
    const wz = centerZ + Math.sin(angle) * wallRad;
    const wallH = 6 + (i % 3) * 3;

    const wall = new THREE.Mesh(
      new THREE.BoxGeometry(7, wallH, 3.2),
      mats.magmaRockMat
    );
    wall.position.set(wx, surfaceY + wallH / 2, wz);
    wall.rotation.y = -angle + Math.PI / 2;
    wall.castShadow = true;
    wall.receiveShadow = true;
    group.add(wall);

    // Glowing magma fissures in the wall
    const fissure = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, wallH * 0.7, 3.3),
      mats.lavaMat
    );
    fissure.position.set(wx, surfaceY + wallH / 2, wz);
    fissure.rotation.y = -angle + Math.PI / 2;
    group.add(fissure);
  }

  // Giant Ruined Dragon Skull Gateway
  const gateX = centerX;
  const gateZ = centerZ - 20;

  // Two massive monolithic horn pillars
  [-6, 6].forEach(offset => {
    const hornPillar = new THREE.Mesh(
      new THREE.ConeGeometry(2.2, 16, 5),
      mats.magmaRockMat
    );
    hornPillar.position.set(gateX + offset, surfaceY + 8, gateZ);
    hornPillar.rotation.z = offset > 0 ? -0.2 : 0.2;
    hornPillar.castShadow = true;
    group.add(hornPillar);
  });

  // Broken Dragon Skull Arch
  const skullArch = new THREE.Mesh(
    new THREE.BoxGeometry(14, 2.5, 3.5),
    mats.magmaRockMat
  );
  skullArch.position.set(gateX, surfaceY + 14, gateZ);
  group.add(skullArch);

  // Flaming brazier pedestals
  [[-12, -10], [12, -10], [-12, 14], [12, 14]].forEach(([bx, bz]) => {
    const brazier = new THREE.Mesh(
      new THREE.CylinderGeometry(1.6, 2.2, 3.5, 6),
      mats.magmaRockMat
    );
    brazier.position.set(centerX + bx, surfaceY + 1.75, centerZ + bz);
    group.add(brazier);

    const flame = new THREE.Mesh(
      new THREE.ConeGeometry(1.1, 2.8, 5),
      mats.lavaMat
    );
    flame.position.set(centerX + bx, surfaceY + 4.5, centerZ + bz);
    group.add(flame);
  });

  // Toppled fallen basalt obelisk
  const fallenObelisk = new THREE.Mesh(
    new THREE.ConeGeometry(1.8, 14, 4),
    mats.magmaRockMat
  );
  fallenObelisk.rotation.z = Math.PI / 2 - 0.15;
  fallenObelisk.rotation.y = 0.6;
  fallenObelisk.position.set(centerX + 16, surfaceY + 1.2, centerZ - 8);
  fallenObelisk.castShadow = true;
  group.add(fallenObelisk);

  return group;
}

/**
 * Builds the Sunken Atlantis Aquatic Ruins (Nordeste: x: 78, z: -78)
 */
export function buildAquaticLagoonRuins(
  centerX: number,
  centerZ: number,
  surfaceY: number,
  mats: RuinsBuilderMaterials
): THREE.Group {
  const group = new THREE.Group();

  // Semi-submerged Sunken Temple Colonnade (Weathered Marble Columns in water)
  const colCount = 10;
  const rad = 22;
  for (let i = 0; i < colCount; i++) {
    const angle = (i / colCount) * Math.PI * 2;
    const cx = centerX + Math.cos(angle) * rad;
    const cz = centerZ + Math.sin(angle) * rad;
    const isBroken = i % 2 === 0;

    const col = createAncientColumn(cx, cz, surfaceY - 0.5, 7.5, 0.7, mats.ruinStoneMat, isBroken, 0.5);
    group.add(col);

    // Glowing abyssal pearl on top of intact columns
    if (!isBroken) {
      const pearl = new THREE.Mesh(
        new THREE.SphereGeometry(0.5, 12, 12),
        new THREE.MeshStandardMaterial({
          color: '#38bdf8',
          emissive: '#0284c7',
          emissiveIntensity: 0.85,
          roughness: 0.1
        })
      );
      pearl.position.set(cx, surfaceY + 7.8, cz);
      group.add(pearl);
    }
  }

  // Sunken Rotunda Centerpiece: half-collapsed ancient dome
  const domeRadius = 9;
  const domeMesh = new THREE.Mesh(
    new THREE.SphereGeometry(domeRadius, 16, 12, 0, Math.PI * 1.35, 0, Math.PI / 2),
    mats.ruinStoneMat
  );
  domeMesh.position.set(centerX, surfaceY + 3.2, centerZ);
  domeMesh.material.side = THREE.DoubleSide;
  group.add(domeMesh);

  // Submerged ceremonial staircase descending into lagoon
  for (let s = 0; s < 5; s++) {
    const stair = new THREE.Mesh(
      new THREE.BoxGeometry(10 - s * 1.2, 0.45, 2.2),
      mats.ruinStoneMat
    );
    stair.position.set(centerX - 16 - s * 1.5, surfaceY + 0.8 - s * 0.4, centerZ);
    stair.receiveShadow = true;
    group.add(stair);
  }

  // Ancient Sea-Dragon Monoliths
  [[-12, 16], [14, -14]].forEach(([mx, mz]) => {
    const mono = new THREE.Mesh(
      new THREE.CylinderGeometry(1.2, 1.8, 8.5, 5),
      mats.ruinStoneMat
    );
    mono.position.set(centerX + mx, surfaceY + 4.25, centerZ + mz);
    mono.rotation.z = (mx > 0 ? 0.15 : -0.15);
    group.add(mono);
  });

  return group;
}

/**
 * Builds the Derelict Apex Cybernetic Ruins (Leste: x: 104, z: 18)
 */
export function buildRoboticApexRuins(
  centerX: number,
  centerZ: number,
  surfaceY: number,
  mats: RuinsBuilderMaterials
): THREE.Group {
  const group = new THREE.Group();

  // Colossal Leaning Mech Pylons with exposed wiring
  const pylonCount = 5;
  for (let i = 0; i < pylonCount; i++) {
    const angle = (i / pylonCount) * Math.PI * 2;
    const px = centerX + Math.cos(angle) * 26;
    const pz = centerZ + Math.sin(angle) * 26;
    const isLeaning = i % 2 === 1;

    const pylon = new THREE.Mesh(
      new THREE.BoxGeometry(2.8, 16 + (i % 3) * 4, 2.8),
      mats.cyberMat
    );
    pylon.position.set(px, surfaceY + 8 + (i % 3) * 2, pz);
    if (isLeaning) {
      pylon.rotation.z = 0.25;
      pylon.rotation.x = 0.15;
    }
    pylon.castShadow = true;
    group.add(pylon);

    // Glowing cyan conduit strip embedded in pylon
    const strip = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 14, 2.9),
      mats.cyanNeonMat
    );
    strip.position.set(px, surfaceY + 8, pz);
    if (isLeaning) {
      strip.rotation.z = 0.25;
      strip.rotation.x = 0.15;
    }
    group.add(strip);
  }

  // Fractured Cybernetic Ring / Generator Portal
  const brokenRing = new THREE.Mesh(
    new THREE.TorusGeometry(14, 1.2, 8, 24, Math.PI * 1.4),
    mats.cyberMat
  );
  brokenRing.position.set(centerX, surfaceY + 12, centerZ);
  brokenRing.rotation.y = 0.4;
  group.add(brokenRing);

  // Derelict Titan Arm / Wing Structural Truss half buried
  const truss = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 22, 1.4),
    mats.cyberMat
  );
  truss.position.set(centerX + 12, surfaceY + 6, centerZ - 12);
  truss.rotation.z = Math.PI / 3;
  truss.rotation.y = 0.8;
  group.add(truss);

  // Fallen Reactor Core with pulsating cyan energy
  const coreHul = new THREE.Mesh(
    new THREE.DodecahedronGeometry(3.2),
    mats.cyberMat
  );
  coreHul.position.set(centerX - 8, surfaceY + 2.5, centerZ + 8);
  group.add(coreHul);

  const coreGlow = new THREE.Mesh(
    new THREE.SphereGeometry(2.4, 12, 12),
    mats.cyanNeonMat
  );
  coreGlow.position.set(centerX - 8, surfaceY + 2.5, centerZ + 8);
  group.add(coreGlow);

  return group;
}

/**
 * Builds the Sun Coliseum Ruins in the Plains (Sudeste: x: 74, z: 92)
 */
export function buildPlainsColiseumRuins(
  centerX: number,
  centerZ: number,
  surfaceY: number,
  mats: RuinsBuilderMaterials
): THREE.Group {
  const group = new THREE.Group();

  // Stepped Semicircular Amphitheater (Curved Tiered Stone Seats)
  const tiers = 4;
  for (let t = 0; t < tiers; t++) {
    const tierR = 20 + t * 4.2;
    const tierH = 1.2;
    const tierMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(tierR, tierR, tierH, 24, 1, false, 0, Math.PI * 1.1),
      mats.goldStoneMat
    );
    tierMesh.position.set(centerX, surfaceY + (t + 0.5) * tierH, centerZ);
    tierMesh.rotation.y = Math.PI * 0.45;
    tierMesh.receiveShadow = true;
    group.add(tierMesh);
  }

  // Grand Triumphal Arch of the Sun (Golden Dragon Arch)
  const archX = centerX - 12;
  const archZ = centerZ - 14;

  const leftPillar = new THREE.Mesh(new THREE.BoxGeometry(3.2, 14, 3.2), mats.goldStoneMat);
  leftPillar.position.set(archX - 6, surfaceY + 7, archZ);
  leftPillar.castShadow = true;
  group.add(leftPillar);

  const rightPillar = new THREE.Mesh(new THREE.BoxGeometry(3.2, 14, 3.2), mats.goldStoneMat);
  rightPillar.position.set(archX + 6, surfaceY + 7, archZ);
  rightPillar.castShadow = true;
  group.add(rightPillar);

  const lintel = new THREE.Mesh(new THREE.BoxGeometry(17, 3, 4.2), mats.goldStoneMat);
  lintel.position.set(archX, surfaceY + 15, archZ);
  lintel.castShadow = true;
  group.add(lintel);

  // Golden Sun Disc Emblem atop the Arch
  const sunDisc = new THREE.Mesh(
    new THREE.CylinderGeometry(2.4, 2.4, 0.4, 16),
    mats.goldMat
  );
  sunDisc.rotation.x = Math.PI / 2;
  sunDisc.position.set(archX, surfaceY + 18, archZ);
  group.add(sunDisc);

  // Ancient Fallen Sundial Disc on the arena floor
  const sundial = new THREE.Mesh(
    new THREE.CylinderGeometry(4.5, 4.5, 0.6, 16),
    mats.goldStoneMat
  );
  sundial.position.set(centerX + 6, surfaceY + 0.3, centerZ + 4);
  sundial.rotation.z = 0.08;
  group.add(sundial);

  const gnomon = new THREE.Mesh(
    new THREE.ConeGeometry(0.6, 3.8, 4),
    mats.goldMat
  );
  gnomon.position.set(centerX + 6, surfaceY + 2.0, centerZ + 4);
  gnomon.rotation.x = 0.4;
  group.add(gnomon);

  return group;
}

/**
 * Builds the Frozen Glacial Permafrost Necropolis Ruins (Sul: x: 0, z: 108)
 */
export function buildIcePermafrostRuins(
  centerX: number,
  centerZ: number,
  surfaceY: number,
  mats: RuinsBuilderMaterials
): THREE.Group {
  const group = new THREE.Group();

  // Frozen Megalithic Dolmen (Stone slab balanced on upright glacial pillars)
  [[-16, -10], [16, 12]].forEach(([dx, dz]) => {
    const dGroup = new THREE.Group();
    dGroup.position.set(centerX + dx, surfaceY, centerZ + dz);

    const leg1 = new THREE.Mesh(new THREE.BoxGeometry(1.6, 7, 1.8), mats.ruinStoneMat);
    leg1.position.set(-3, 3.5, 0);
    const leg2 = new THREE.Mesh(new THREE.BoxGeometry(1.6, 7, 1.8), mats.ruinStoneMat);
    leg2.position.set(3, 3.5, 0);

    const capstone = new THREE.Mesh(new THREE.BoxGeometry(9.5, 1.5, 5), mats.ruinStoneMat);
    capstone.position.set(0, 7.5, 0);
    capstone.rotation.z = 0.06;

    // Translucent ice coating over capstone
    const iceCover = new THREE.Mesh(new THREE.BoxGeometry(9.8, 0.6, 5.2), mats.iceMat);
    iceCover.position.set(0, 8.3, 0);

    dGroup.add(leg1, leg2, capstone, iceCover);
    group.add(dGroup);
  });

  // Circle of 8 Ancient Frost-Dragon Runestones embedded in glacial ice
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const rx = centerX + Math.cos(angle) * 25;
    const rz = centerZ + Math.sin(angle) * 25;

    const rStone = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 8 + (i % 2) * 3, 1.4),
      mats.ruinStoneMat
    );
    rStone.position.set(rx, surfaceY + 4 + (i % 2) * 1.5, rz);
    rStone.rotation.y = angle;
    rStone.rotation.z = (i % 2 === 0 ? 0.12 : -0.12);
    group.add(rStone);

    // Icicles / frost spike hugging the stone
    const iceSpike = new THREE.Mesh(
      new THREE.ConeGeometry(0.8, 5.5, 5),
      mats.iceMat
    );
    iceSpike.position.set(rx + 0.8, surfaceY + 2.75, rz + 0.5);
    group.add(iceSpike);
  }

  // Ruined Frosted Tower Stump
  const tower = new THREE.Mesh(
    new THREE.CylinderGeometry(5.2, 6.5, 8.5, 8),
    mats.ruinStoneMat
  );
  tower.position.set(centerX, surfaceY + 4.25, centerZ + 16);
  group.add(tower);

  return group;
}

/**
 * Builds the Sunken Swamp Crypt Ruins (Sudoeste: x: -92, z: 74)
 */
export function buildSwampBogRuins(
  centerX: number,
  centerZ: number,
  surfaceY: number,
  mats: RuinsBuilderMaterials
): THREE.Group {
  const group = new THREE.Group();

  // Tilted Sinking Mausoleum Portal
  const cryptX = centerX - 6;
  const cryptZ = centerZ + 8;

  const cryptFacade = new THREE.Mesh(
    new THREE.BoxGeometry(12, 9, 3.5),
    mats.swampStoneMat
  );
  cryptFacade.position.set(cryptX, surfaceY + 3.8, cryptZ);
  cryptFacade.rotation.z = -0.18; // sinking into the bog
  cryptFacade.rotation.x = 0.1;
  group.add(cryptFacade);

  // Sunk Pediment with sinister carved crest
  const pediment = new THREE.Mesh(
    new THREE.ConeGeometry(7, 3.5, 4),
    mats.swampStoneMat
  );
  pediment.position.set(cryptX, surfaceY + 9.5, cryptZ);
  pediment.rotation.y = Math.PI / 4;
  pediment.rotation.z = -0.18;
  group.add(pediment);

  // Ancient Stone Sarcophagi of Wyrms resting in mud
  [[-14, -8], [12, -12], [8, 14]].forEach(([sx, sz], idx) => {
    const sarcophagus = new THREE.Mesh(
      new THREE.BoxGeometry(4.5, 1.8, 2.4),
      mats.swampStoneMat
    );
    sarcophagus.position.set(centerX + sx, surfaceY + 0.9, centerZ + sz);
    sarcophagus.rotation.y = idx * 0.7;
    sarcophagus.rotation.z = 0.12;
    group.add(sarcophagus);

    // Glowing toxic purple rune in the lid
    const rune = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.1, 1.2),
      new THREE.MeshBasicMaterial({ color: '#c084fc' })
    );
    rune.position.set(centerX + sx, surfaceY + 1.85, centerZ + sz);
    rune.rotation.y = idx * 0.7;
    group.add(rune);
  });

  // Leaning Broken Pillars covered in moss
  for (let p = 0; p < 4; p++) {
    const angle = (p / 4) * Math.PI * 2;
    const col = createAncientColumn(
      centerX + Math.cos(angle) * 20,
      centerZ + Math.sin(angle) * 20,
      surfaceY,
      8,
      0.75,
      mats.swampStoneMat,
      true,
      0.6
    );
    col.rotation.z = 0.18 * (p % 2 === 0 ? 1 : -1);
    group.add(col);
  }

  return group;
}

/**
 * Builds the Overgrown Druidic Grove Ruins in the Forest (Noroeste: x: -102, z: -32)
 */
export function buildForestGroveRuins(
  centerX: number,
  centerZ: number,
  surfaceY: number,
  mats: RuinsBuilderMaterials
): THREE.Group {
  const group = new THREE.Group();

  // Ancient Stonehenge / Megalith Trilithon Circle
  const stones = 8;
  const rad = 24;
  for (let i = 0; i < stones; i++) {
    const angle = (i / stones) * Math.PI * 2;
    const sx = centerX + Math.cos(angle) * rad;
    const sz = centerZ + Math.sin(angle) * rad;

    const megalith = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 9 + (i % 2) * 2, 1.8),
      mats.mossyStoneMat
    );
    megalith.position.set(sx, surfaceY + 4.5 + (i % 2), sz);
    megalith.rotation.y = angle;
    megalith.castShadow = true;
    group.add(megalith);

    // Lintels spanning pairs of stones (Trilithons)
    if (i % 2 === 0) {
      const nextAngle = ((i + 1) / stones) * Math.PI * 2;
      const nx = centerX + Math.cos(nextAngle) * rad;
      const nz = centerZ + Math.sin(nextAngle) * rad;
      const lintel = createRuinArch(sx, sz, nx, nz, surfaceY + 10, mats.mossyStoneMat);
      group.add(lintel);
    }
  }

  // Ancient Overgrown Watchtower Ruin
  const towerGeo = new THREE.CylinderGeometry(4.5, 5.8, 14, 8);
  const tower = new THREE.Mesh(towerGeo, mats.mossyStoneMat);
  tower.position.set(centerX + 14, surfaceY + 7, centerZ - 12);
  tower.castShadow = true;
  group.add(tower);

  // Broken battlements on top of tower
  for (let b = 0; b < 6; b++) {
    if (b === 2 || b === 4) continue; // broken gaps
    const bAngle = (b / 6) * Math.PI * 2;
    const battlement = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.6, 1.2), mats.mossyStoneMat);
    battlement.position.set(
      centerX + 14 + Math.cos(bAngle) * 4.2,
      surfaceY + 14.8,
      centerZ - 12 + Math.sin(bAngle) * 4.2
    );
    group.add(battlement);
  }

  // Ancient Carved Stone Dragon Incubation Basin in center
  const basin = new THREE.Mesh(
    new THREE.TorusGeometry(3.6, 1.1, 8, 16),
    mats.mossyStoneMat
  );
  basin.rotation.x = Math.PI / 2;
  basin.position.set(centerX, surfaceY + 1.1, centerZ);
  group.add(basin);

  return group;
}

/**
 * Builds Scenic Cliff Watchtowers and Waypoint Arches across the Expanded Island
 */
export function buildCrossroadsWatchtowers(
  surfaceY: number,
  islandRadius: number,
  mats: RuinsBuilderMaterials
): THREE.Group {
  const group = new THREE.Group();

  // 6 Majestic Cliff Edge Lookout Ruins overlooking the cloud sea
  const lookoutCount = 6;
  for (let i = 0; i < lookoutCount; i++) {
    const angle = (i / lookoutCount) * Math.PI * 2 + 0.35;
    const lx = Math.cos(angle) * (islandRadius - 14);
    const lz = Math.sin(angle) * (islandRadius - 14);

    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(4.2, 5.2, 5, 8),
      mats.ruinStoneMat
    );
    base.position.set(lx, surfaceY + 2.5, lz);
    base.receiveShadow = true;
    group.add(base);

    // Weathered arch overlooking the precipice
    const arch = new THREE.Mesh(
      new THREE.TorusGeometry(3.5, 0.7, 8, 16, Math.PI),
      mats.ruinStoneMat
    );
    arch.position.set(lx, surfaceY + 6.5, lz);
    arch.rotation.y = angle + Math.PI / 2;
    group.add(arch);

    // Ancient brazier with eternal beacon glow
    const beacon = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.8),
      new THREE.MeshStandardMaterial({
        color: '#38bdf8',
        emissive: '#0284c7',
        emissiveIntensity: 0.9
      })
    );
    beacon.position.set(lx, surfaceY + 6.8, lz);
    group.add(beacon);
  }

  return group;
}

/**
 * Builds the Grand Dragon Acropolis (Acópole Sagrada dos Dragões Ancestrais)
 * Located on a prominent plateau with monumental stairs, double colonnade, and dragon altar
 */
export function buildGrandDragonAcropolis(
  centerX: number,
  centerZ: number,
  surfaceY: number,
  mats: RuinsBuilderMaterials
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'GrandDragonAcropolis';

  // 1. Triple-tiered Stepped Platform (Stylobate)
  for (let s = 0; s < 3; s++) {
    const stepW = 54 - s * 4;
    const stepL = 72 - s * 4;
    const stepH = 1.4;
    const step = new THREE.Mesh(
      new THREE.BoxGeometry(stepW, stepH, stepL),
      mats.ruinStoneMat
    );
    step.position.set(centerX, surfaceY + s * stepH + stepH / 2, centerZ);
    step.receiveShadow = true;
    group.add(step);
  }

  const baseTopY = surfaceY + 4.2;

  // 2. Grand Peristyle Colonnade (18 towering columns, some fractured)
  const colsX = 6;
  const colsZ = 8;
  const colSpacingX = 8.5;
  const colSpacingZ = 8.2;

  for (let ix = 0; ix < colsX; ix++) {
    for (let iz = 0; iz < colsZ; iz++) {
      // Only perimeter columns (hollow interior cella)
      const isPerimeter = ix === 0 || ix === colsX - 1 || iz === 0 || iz === colsZ - 1;
      if (!isPerimeter) continue;

      const px = centerX - ((colsX - 1) * colSpacingX) / 2 + ix * colSpacingX;
      const pz = centerZ - ((colsZ - 1) * colSpacingZ) / 2 + iz * colSpacingZ;

      const isBroken = (ix + iz) % 5 === 0;
      const col = createAncientColumn(
        px,
        pz,
        baseTopY,
        14,
        1.25,
        mats.ruinStoneMat,
        isBroken,
        0.45 + ((ix * iz) % 3) * 0.18
      );
      group.add(col);
    }
  }

  // 3. Ancient Entablature & Pediment (Roof Beam Fragments)
  const beamLeft = new THREE.Mesh(
    new THREE.BoxGeometry(4.2, 1.8, 56),
    mats.ruinStoneMat
  );
  beamLeft.position.set(centerX - 21.2, baseTopY + 14.9, centerZ);
  beamLeft.castShadow = true;
  group.add(beamLeft);

  const beamRight = new THREE.Mesh(
    new THREE.BoxGeometry(4.2, 1.8, 48),
    mats.ruinStoneMat
  );
  beamRight.position.set(centerX + 21.2, baseTopY + 14.9, centerZ - 4);
  beamRight.castShadow = true;
  group.add(beamRight);

  // Triangular Pediment over front entrance
  const pediment = new THREE.Mesh(
    new THREE.ConeGeometry(24, 7, 3),
    mats.ruinStoneMat
  );
  pediment.rotation.z = Math.PI / 2;
  pediment.rotation.y = Math.PI / 2;
  pediment.position.set(centerX, baseTopY + 17.5, centerZ - 28.5);
  pediment.castShadow = true;
  group.add(pediment);

  // 4. Central Dragon Altar with Primordial Flame Brazier
  const altarBase = new THREE.Mesh(
    new THREE.CylinderGeometry(5.2, 6.4, 3.2, 8),
    mats.stoneMat
  );
  altarBase.position.set(centerX, baseTopY + 1.6, centerZ);
  altarBase.receiveShadow = true;
  group.add(altarBase);

  const eternalFlame = new THREE.Mesh(
    new THREE.OctahedronGeometry(2.4),
    new THREE.MeshStandardMaterial({
      color: '#f97316',
      emissive: '#ea580c',
      emissiveIntensity: 1.2
    })
  );
  eternalFlame.position.set(centerX, baseTopY + 4.8, centerZ);
  group.add(eternalFlame);

  return group;
}

/**
 * Builds the Colossus of the Fallen Ancient Wyrm
 * Half-buried gargantuan petrified dragon skeleton forming a fly-through ribcage tunnel
 */
export function buildColossusOfTheFallenWyrm(
  centerX: number,
  centerZ: number,
  surfaceY: number,
  mats: RuinsBuilderMaterials
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'ColossusOfTheFallenWyrm';

  // 1. Giant Petrified Dragon Skull protruding from the terrain
  const skullGeo = new THREE.ConeGeometry(6.8, 15, 6);
  const skull = new THREE.Mesh(skullGeo, mats.ruinStoneMat);
  skull.position.set(centerX, surfaceY + 4.8, centerZ - 24);
  skull.rotation.x = Math.PI / 2.3;
  skull.castShadow = true;
  skull.receiveShadow = true;
  group.add(skull);

  // Glowing runic dragon eye sockets
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(1.2, 8, 8), new THREE.MeshBasicMaterial({ color: '#f59e0b' }));
  eyeL.position.set(centerX - 2.8, surfaceY + 7.2, centerZ - 20);
  group.add(eyeL);

  const eyeR = new THREE.Mesh(new THREE.SphereGeometry(1.2, 8, 8), new THREE.MeshBasicMaterial({ color: '#f59e0b' }));
  eyeR.position.set(centerX + 2.8, surfaceY + 7.2, centerZ - 20);
  group.add(eyeR);

  // 2. Colossal Stone Ribcage Arches (Players can fly through!)
  const ribCount = 8;
  for (let r = 0; r < ribCount; r++) {
    const rZ = centerZ - 14 + r * 7.5;
    const rScale = 1.0 - (r / ribCount) * 0.35;
    const ribW = 18 * rScale;
    const ribH = 14 * rScale;

    // Torus arc rib (Half-torus arching across sky)
    const ribGeo = new THREE.TorusGeometry(ribW / 2, 1.4, 8, 16, Math.PI);
    const ribMesh = new THREE.Mesh(ribGeo, mats.ruinStoneMat);
    ribMesh.position.set(centerX, surfaceY + 1.2, rZ);
    ribMesh.rotation.y = Math.PI / 2;
    ribMesh.rotation.z = Math.sin(r * 0.4) * 0.15; // Natural weathered tilt
    ribMesh.castShadow = true;
    group.add(ribMesh);
  }

  // 3. Shattered Petrified Wing Armatures
  const wingBoneL = new THREE.Mesh(
    new THREE.CylinderGeometry(1.2, 2.4, 26, 6),
    mats.ruinStoneMat
  );
  wingBoneL.position.set(centerX - 22, surfaceY + 9, centerZ + 6);
  wingBoneL.rotation.z = -Math.PI / 3.2;
  wingBoneL.rotation.y = 0.4;
  wingBoneL.castShadow = true;
  group.add(wingBoneL);

  const wingBoneR = new THREE.Mesh(
    new THREE.CylinderGeometry(1.0, 2.2, 22, 6),
    mats.ruinStoneMat
  );
  wingBoneR.position.set(centerX + 20, surfaceY + 8, centerZ + 8);
  wingBoneR.rotation.z = Math.PI / 3.4;
  wingBoneR.rotation.y = -0.3;
  wingBoneR.castShadow = true;
  group.add(wingBoneR);

  // 4. Ancient Dragon Soul Crystal floating in the center of the ribcage
  const soulCrystal = new THREE.Mesh(
    new THREE.OctahedronGeometry(2.8),
    new THREE.MeshStandardMaterial({
      color: '#38bdf8',
      emissive: '#0284c7',
      emissiveIntensity: 0.95
    })
  );
  soulCrystal.position.set(centerX, surfaceY + 6.5, centerZ + 10);
  group.add(soulCrystal);

  return group;
}

/**
 * Builds the Great Mountain Aqueduct & Ruined Viaduct
 * A monumental Roman-style multi-tiered arched aqueduct spanning 200m
 */
export function buildGreatMountainAqueduct(
  startX: number,
  startZ: number,
  endX: number,
  endZ: number,
  surfaceY: number,
  mats: RuinsBuilderMaterials
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'GreatMountainAqueduct';

  const dx = endX - startX;
  const dz = endZ - startZ;
  const length = Math.hypot(dx, dz);
  const angle = Math.atan2(dz, dx);

  const spanCount = Math.floor(length / 28);
  const pierHeight = 26;

  for (let i = 0; i <= spanCount; i++) {
    const t = i / spanCount;
    const px = startX + dx * t;
    const pz = startZ + dz * t;

    // Massive Stone Pier
    const pierGeo = new THREE.BoxGeometry(4.8, pierHeight, 4.8);
    const pier = new THREE.Mesh(pierGeo, mats.ruinStoneMat);
    pier.position.set(px, surfaceY + pierHeight / 2, pz);
    pier.rotation.y = angle;
    pier.castShadow = true;
    pier.receiveShadow = true;
    group.add(pier);

    // Arch spanning to next pier
    if (i < spanCount) {
      const nextT = (i + 1) / spanCount;
      const nX = startX + dx * nextT;
      const nZ = startZ + dz * nextT;
      const midX = (px + nX) / 2;
      const midZ = (pz + nZ) / 2;

      // Skip one arch to represent ancient collapse
      if (i !== 2) {
        const archGeo = new THREE.TorusGeometry(12, 1.8, 8, 16, Math.PI);
        const arch = new THREE.Mesh(archGeo, mats.ruinStoneMat);
        arch.position.set(midX, surfaceY + pierHeight - 2, midZ);
        arch.rotation.y = angle + Math.PI / 2;
        arch.castShadow = true;
        group.add(arch);

        // Waterway trough on top
        const troughGeo = new THREE.BoxGeometry(26, 2.2, 5.2);
        const trough = new THREE.Mesh(troughGeo, mats.ruinStoneMat);
        trough.position.set(midX, surfaceY + pierHeight + 11, midZ);
        trough.rotation.y = angle;
        trough.castShadow = true;
        group.add(trough);
      }
    }
  }

  return group;
}

/**
 * Builds monumental ancient ruins across the Outer Continents (+999999999999999999% Expanded)
 */
export function buildOuterContinentAncientRuins(
  surfaceY: number,
  mats: RuinsBuilderMaterials
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'OuterContinentRuins';

  // 1. Forja Vulcânica dos Titãs Ancestrais (x: -1250, z: -4350)
  const forgeGroup = new THREE.Group();
  forgeGroup.position.set(-1250, surfaceY, -4350);
  for (let c = 0; c < 6; c++) {
    const fAngle = (c / 6) * Math.PI * 2;
    const col = createAncientColumn(
      Math.cos(fAngle) * 36,
      Math.sin(fAngle) * 36,
      0,
      18,
      2.2,
      mats.magmaRockMat,
      c % 2 === 0,
      0.6
    );
    forgeGroup.add(col);
  }
  const forgeAnvil = new THREE.Mesh(
    new THREE.BoxGeometry(12, 8, 8),
    mats.magmaRockMat
  );
  forgeAnvil.position.y = 4;
  forgeGroup.add(forgeAnvil);
  group.add(forgeGroup);

  // 2. Cidadela Submersa da Fossa dos Titãs (x: 4700, z: -4650)
  const sunkenCity = new THREE.Group();
  sunkenCity.position.set(4700, surfaceY, -4650);
  for (let a = 0; a < 8; a++) {
    const sAngle = (a / 8) * Math.PI * 2;
    const pillar = new THREE.Mesh(
      new THREE.CylinderGeometry(2.4, 3.2, 22, 10),
      mats.ruinStoneMat
    );
    pillar.position.set(Math.cos(sAngle) * 45, 11, Math.sin(sAngle) * 45);
    pillar.rotation.z = (a % 3 === 0 ? 0.2 : -0.15);
    sunkenCity.add(pillar);
  }
  group.add(sunkenCity);

  // 3. Megapirâmide Apex dos Antigos (x: 5100, z: 2400)
  const pyramidGroup = new THREE.Group();
  pyramidGroup.position.set(5100, surfaceY, 2400);
  const tiers = 5;
  for (let t = 0; t < tiers; t++) {
    const tW = 85 - t * 14;
    const tH = 6;
    const tierMesh = new THREE.Mesh(
      new THREE.BoxGeometry(tW, tH, tW),
      mats.cyberMat
    );
    tierMesh.position.y = t * tH + tH / 2;
    pyramidGroup.add(tierMesh);
  }
  // Floating Apex Monolith
  const apexMonolith = new THREE.Mesh(
    new THREE.OctahedronGeometry(8.5),
    mats.cyanNeonMat
  );
  apexMonolith.position.y = tiers * 6 + 12;
  pyramidGroup.add(apexMonolith);
  group.add(pyramidGroup);

  // 4. Criptas Mortuárias do Gelo Hiperbóreo (x: 950, z: 5350)
  const frostCrypt = new THREE.Group();
  frostCrypt.position.set(950, surfaceY, 5350);
  for (let d = 0; d < 6; d++) {
    const dAngle = (d / 6) * Math.PI * 2;
    const dx = Math.cos(dAngle) * 32;
    const dz = Math.sin(dAngle) * 32;
    const dolmenBase1 = new THREE.Mesh(new THREE.BoxGeometry(2.5, 12, 2.5), mats.iceMat);
    dolmenBase1.position.set(dx - 3, 6, dz);
    frostCrypt.add(dolmenBase1);

    const dolmenBase2 = new THREE.Mesh(new THREE.BoxGeometry(2.5, 12, 2.5), mats.iceMat);
    dolmenBase2.position.set(dx + 3, 6, dz);
    frostCrypt.add(dolmenBase2);

    const lintel = new THREE.Mesh(new THREE.BoxGeometry(10, 2.2, 3.5), mats.iceMat);
    lintel.position.set(dx, 13.1, dz);
    frostCrypt.add(lintel);
  }
  group.add(frostCrypt);

  // 5. Megalitos Druídicos do Megabosque (x: -5350, z: -3050)
  const forestMegalith = new THREE.Group();
  forestMegalith.position.set(-5350, surfaceY, -3050);
  for (let m = 0; m < 12; m++) {
    const mAngle = (m / 12) * Math.PI * 2;
    const mx = Math.cos(mAngle) * 42;
    const mz = Math.sin(mAngle) * 42;
    const stone = new THREE.Mesh(new THREE.BoxGeometry(3.5, 16, 2.5), mats.mossyStoneMat);
    stone.position.set(mx, 8, mz);
    stone.rotation.y = mAngle;
    forestMegalith.add(stone);
  }
  group.add(forestMegalith);

  return group;
}

/**
 * Builds Temple of the Sun Plateau Ruins
 * Massive golden sun disk, radiating ceremonial pillars and sun altar
 */
export function buildTempleOfTheSunPlateau(
  centerX: number,
  centerZ: number,
  surfaceY: number,
  mats: RuinsBuilderMaterials
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'TempleOfTheSunPlateau';

  // Octagonal Grand Sun Plaza
  const plaza = new THREE.Mesh(
    new THREE.CylinderGeometry(28, 32, 2.4, 8),
    mats.goldStoneMat
  );
  plaza.position.set(centerX, surfaceY + 1.2, centerZ);
  plaza.receiveShadow = true;
  group.add(plaza);

  // 12 Sun Pillar Obelisks
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const px = centerX + Math.cos(angle) * 22;
    const pz = centerZ + Math.sin(angle) * 22;
    const obelisk = new THREE.Mesh(
      new THREE.ConeGeometry(1.6, 12, 4),
      mats.goldStoneMat
    );
    obelisk.position.set(px, surfaceY + 8.4, pz);
    obelisk.castShadow = true;
    group.add(obelisk);
  }

  // Giant Golden Sun Disk Altar in center
  const sunDisk = new THREE.Mesh(
    new THREE.CylinderGeometry(5.5, 5.5, 1.2, 24),
    mats.goldMat
  );
  sunDisk.position.set(centerX, surfaceY + 3.0, centerZ);
  group.add(sunDisk);

  const sunFlame = new THREE.Mesh(
    new THREE.OctahedronGeometry(2.4),
    new THREE.MeshBasicMaterial({ color: '#facc15' })
  );
  sunFlame.position.set(centerX, surfaceY + 5.5, centerZ);
  group.add(sunFlame);

  return group;
}

/**
 * Builds Ancient Necropolis Dragon Tombs
 * Sarcophagi, tomb facades, and broken obelisks
 */
export function buildAncientNecropolisTombs(
  centerX: number,
  centerZ: number,
  surfaceY: number,
  mats: RuinsBuilderMaterials
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'AncientNecropolisTombs';

  // 8 Royal Dragon Sarcophagi
  for (let s = 0; s < 8; s++) {
    const angle = (s / 8) * Math.PI * 2;
    const sx = centerX + Math.cos(angle) * 35;
    const sz = centerZ + Math.sin(angle) * 35;

    // Sarcophagus base
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(7, 2.5, 3.5),
      mats.ruinStoneMat
    );
    base.position.set(sx, surfaceY + 1.25, sz);
    base.rotation.y = angle + Math.PI / 2;
    base.castShadow = true;
    group.add(base);

    // Carved effigy lid
    const lid = new THREE.Mesh(
      new THREE.CylinderGeometry(1.4, 1.6, 6.8, 6),
      mats.ruinStoneMat
    );
    lid.rotation.z = Math.PI / 2;
    lid.rotation.y = angle + Math.PI / 2;
    lid.position.set(sx, surfaceY + 3.0, sz);
    group.add(lid);
  }

  // Broken Central Necropolis Obelisk (Split in half)
  const obeliskBase = new THREE.Mesh(
    new THREE.BoxGeometry(4, 9, 4),
    mats.ruinStoneMat
  );
  obeliskBase.position.set(centerX, surfaceY + 4.5, centerZ);
  obeliskBase.castShadow = true;
  group.add(obeliskBase);

  const obeliskFallen = new THREE.Mesh(
    new THREE.ConeGeometry(2.5, 12, 4),
    mats.ruinStoneMat
  );
  obeliskFallen.position.set(centerX + 6, surfaceY + 1.5, centerZ + 4);
  obeliskFallen.rotation.z = Math.PI / 2.2;
  group.add(obeliskFallen);

  return group;
}

/**
 * Builds the Skyway Ruins of the Fallen Titans
 * Shattered high-altitude bridge with broken arches across mountain valleys
 */
export function buildFallenTitanSkywayRuins(
  surfaceY: number,
  mats: RuinsBuilderMaterials
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'FallenTitanSkywayRuins';

  // 6 Grand Skyway Arch Ruins elevated 35m in the air between mountains
  const waypoints = [
    { x: -180, z: -380, h: 32 },
    { x: -280, z: -290, h: 38 },
    { x: -360, z: -110, h: 35 },
    { x: 260, z: 280, h: 36 },
    { x: 340, z: 360, h: 42 },
    { x: 180, z: 420, h: 34 }
  ];

  waypoints.forEach((wp, idx) => {
    // Massive support pillar
    const pMesh = new THREE.Mesh(
      new THREE.BoxGeometry(6, wp.h, 6),
      mats.ruinStoneMat
    );
    pMesh.position.set(wp.x, surfaceY + wp.h / 2, wp.z);
    pMesh.castShadow = true;
    group.add(pMesh);

    // Shattered road deck on top
    const deck = new THREE.Mesh(
      new THREE.BoxGeometry(18, 2.5, 10),
      mats.ruinStoneMat
    );
    deck.position.set(wp.x, surfaceY + wp.h + 1.25, wp.z);
    deck.rotation.y = (idx * 0.7);
    deck.castShadow = true;
    group.add(deck);

    // Broken gateway arch
    const arch = new THREE.Mesh(
      new THREE.TorusGeometry(4.2, 0.9, 8, 16, Math.PI),
      mats.ruinStoneMat
    );
    arch.position.set(wp.x, surfaceY + wp.h + 6, wp.z);
    arch.rotation.y = (idx * 0.7) + Math.PI / 2;
    group.add(arch);
  });

  return group;
}
