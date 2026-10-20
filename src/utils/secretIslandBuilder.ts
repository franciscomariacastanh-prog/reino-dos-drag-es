import * as THREE from 'three';
import { SECRET_ISLAND_CONFIG } from '../data/secretIslandData';

export interface SecretIsland3DBuildResult {
  group: THREE.Group;
  returnPortalVortex: THREE.Mesh;
  voidFlames: THREE.Mesh[];
  animList: { mesh: THREE.Object3D; speedY?: number; rotSpeed?: number }[];
}

export interface SnowPortal3DBuildResult {
  group: THREE.Group;
  portalVortex: THREE.Mesh;
  animList: { mesh: THREE.Object3D; speedY?: number; rotSpeed?: number }[];
}

/**
 * Creates floating 3D text bill-board sprite for portals and sacred landmarks
 */
export function createSecretPortalSpriteLabel(
  title: string, 
  subtitle: string, 
  accentColor: string = '#38bdf8'
): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 140;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, 512, 140);

  // Background plaque
  ctx.fillStyle = 'rgba(8, 10, 20, 0.88)';
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.roundRect(16, 16, 480, 108, 22);
  ctx.fill();
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Title
  ctx.font = 'bold 30px sans-serif';
  ctx.fillStyle = accentColor;
  ctx.shadowColor = accentColor;
  ctx.shadowBlur = 14;
  ctx.fillText(title, 256, 48);

  // Subtitle
  ctx.shadowBlur = 0;
  ctx.font = 'bold 19px monospace';
  ctx.fillStyle = '#f1f5f9';
  ctx.fillText(subtitle, 256, 92);

  const texture = new THREE.CanvasTexture(canvas);
  const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.scale.set(10.5, 2.8, 1);
  return sprite;
}

/**
 * 1. Builds the Secret Cavern Passage Portal on the Snow Mountain
 */
export function buildSnowMountainSecretPortal(customY?: number): SnowPortal3DBuildResult {
  const { x, z } = SECRET_ISLAND_CONFIG.snowMountainPassage;
  const y = customY !== undefined ? customY : SECRET_ISLAND_CONFIG.snowMountainPassage.y;
  const group = new THREE.Group();
  group.position.set(x, y, z);

  const animList: { mesh: THREE.Object3D; rotSpeed?: number }[] = [];

  // Glacier Ice Rock Cave Archway
  const iceRockMat = new THREE.MeshStandardMaterial({
    color: '#8ecae6',
    roughness: 0.35,
    metalness: 0.4
  });

  const runicPillarMat = new THREE.MeshStandardMaterial({
    color: '#1e293b',
    emissive: '#0284c7',
    emissiveIntensity: 0.6,
    metalness: 0.8,
    roughness: 0.25
  });

  // Left & Right glacial pillars
  const leftPillar = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 2.6, 16, 8), runicPillarMat);
  leftPillar.position.set(-5.5, 8, 0);
  group.add(leftPillar);

  const rightPillar = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 2.6, 16, 8), runicPillarMat);
  rightPillar.position.set(5.5, 8, 0);
  group.add(rightPillar);

  // Top Runic Keystone Arch
  const arch = new THREE.Mesh(new THREE.BoxGeometry(15, 2.8, 3.5), runicPillarMat);
  arch.position.set(0, 16, 0);
  group.add(arch);

  // Hanging Ice Crystals & Stalactites
  for (let i = 0; i < 7; i++) {
    const spike = new THREE.Mesh(new THREE.ConeGeometry(0.55, 3.2 + (i % 3), 5), iceRockMat);
    spike.position.set(-4.5 + i * 1.5, 14.2, 0);
    spike.rotation.x = Math.PI;
    group.add(spike);
  }

  // Mystical Outer Torus Ring
  const ringGeo = new THREE.TorusGeometry(5.2, 0.45, 16, 32);
  const ringMat = new THREE.MeshStandardMaterial({
    color: '#38bdf8',
    emissive: '#0284c7',
    emissiveIntensity: 0.9,
    metalness: 0.9
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.position.set(0, 8, 0);
  group.add(ring);
  animList.push({ mesh: ring, rotSpeed: 0.8 });

  // Rotating Arcane Runes Disk
  const runeDiskGeo = new THREE.RingGeometry(3.2, 5.0, 32);
  const runeDiskMat = new THREE.MeshBasicMaterial({
    color: '#7dd3fc',
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.75
  });
  const runeDisk = new THREE.Mesh(runeDiskGeo, runeDiskMat);
  runeDisk.position.set(0, 8, 0.05);
  group.add(runeDisk);
  animList.push({ mesh: runeDisk, rotSpeed: -1.2 });

  // The Active Teleport Portal Vortex Core
  const vortexGeo = new THREE.CircleGeometry(4.8, 32);
  const vortexMat = new THREE.MeshBasicMaterial({
    color: '#0284c7',
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.85
  });
  const portalVortex = new THREE.Mesh(vortexGeo, vortexMat);
  portalVortex.position.set(0, 8, 0);
  group.add(portalVortex);
  animList.push({ mesh: portalVortex, rotSpeed: 2.2 });

  // Vertical Celestial Beacon (Visible across the entire sky)
  const beaconGeo = new THREE.CylinderGeometry(0.8, 1.6, 260, 12);
  const beaconMat = new THREE.MeshBasicMaterial({
    color: '#38bdf8',
    transparent: true,
    opacity: 0.45
  });
  const beacon = new THREE.Mesh(beaconGeo, beaconMat);
  beacon.position.set(0, 130, 0);
  group.add(beacon);

  // Point Light for dramatic ice cavern illumination
  const light = new THREE.PointLight('#38bdf8', 3.5, 45);
  light.position.set(0, 8, 2.5);
  group.add(light);

  // 3D Floating Name/Marker Billboard
  const labelSprite = createSecretPortalSpriteLabel(
    '🌀 PASSAGEM SECRETA DA GELEIRA',
    '[Portal para a Ilha Secreta: Vila Ancestral & Bioma Negro]',
    '#38bdf8'
  );
  labelSprite.position.set(0, 19.5, 0);
  group.add(labelSprite);

  return { group, portalVortex, animList };
}

/**
 * 2. Builds the Grand Secret Island (Vila Ancestral & Bioma Negro)
 */
export function buildSecretIslandRealm(): SecretIsland3DBuildResult {
  const { islandCenter, ancestralVillage, darkVoidBiome, electricBiome } = SECRET_ISLAND_CONFIG;
  const group = new THREE.Group();
  group.position.set(islandCenter.x, islandCenter.y, islandCenter.z);

  const voidFlames: THREE.Mesh[] = [];
  const animList: { mesh: THREE.Object3D; speedY?: number; rotSpeed?: number }[] = [];

  // ================= 1. FLOATING ISLAND BASE GEOMETRY =================
  // Main Island Surface Disk (y: 0 relative to group)
  const islandSurfaceMat = new THREE.MeshStandardMaterial({
    color: '#1f2937',
    roughness: 0.85,
    metalness: 0.15
  });
  const islandSurface = new THREE.Mesh(new THREE.CylinderGeometry(230, 205, 9, 36), islandSurfaceMat);
  islandSurface.position.y = -4.5;
  islandSurface.receiveShadow = true;
  group.add(islandSurface);

  // Underside Floating Island Cone (Rock stalactites pointing downwards)
  const rockUnderMat = new THREE.MeshStandardMaterial({
    color: '#111827',
    roughness: 0.95,
    metalness: 0.1
  });
  const underCone = new THREE.Mesh(new THREE.ConeGeometry(205, 115, 18), rockUnderMat);
  underCone.position.y = -66.5;
  underCone.rotation.x = Math.PI;
  group.add(underCone);

  // Clear skies without clouds around the floating island ("tira as nuvens")

  // ================= 2. METADE OESTE: VILA ANCESTRAL =================
  const relAncX = ancestralVillage.x - islandCenter.x; // ~ -85
  const relAncZ = ancestralVillage.z - islandCenter.z; // ~ -30
  const ancVillageGroup = new THREE.Group();
  ancVillageGroup.position.set(relAncX, 0, relAncZ);
  group.add(ancVillageGroup);

  // Ancestral Sandstone Ground Disc
  const ancGroundMat = new THREE.MeshStandardMaterial({
    color: '#ca8a04',
    roughness: 0.78,
    metalness: 0.1
  });
  const ancGround = new THREE.Mesh(new THREE.CircleGeometry(85, 32), ancGroundMat);
  ancGround.rotation.x = -Math.PI / 2;
  ancGround.position.y = 0.05;
  ancGround.receiveShadow = true;
  ancVillageGroup.add(ancGround);

  // Central Ancestral Altar (Where the sacred egg nest is placed!)
  const altarBaseMat = new THREE.MeshStandardMaterial({
    color: '#78350f',
    roughness: 0.6,
    metalness: 0.3
  });
  const altarDais = new THREE.Mesh(new THREE.CylinderGeometry(7.5, 9.2, 2.4, 16), altarBaseMat);
  altarDais.position.y = 1.2;
  ancVillageGroup.add(altarDais);

  // 6 Stone Columns forming a Sacred Shrine Circle
  const shrineColMat = new THREE.MeshStandardMaterial({
    color: '#fef3c7',
    emissive: '#d97706',
    emissiveIntensity: 0.3,
    roughness: 0.4
  });
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 1.15, 12, 10), shrineColMat);
    col.position.set(Math.cos(angle) * 12, 6, Math.sin(angle) * 12);
    ancVillageGroup.add(col);

    // Golden capital ornament
    const cap = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.8, 2.4), shrineColMat);
    cap.position.set(Math.cos(angle) * 12, 12.4, Math.sin(angle) * 12);
    ancVillageGroup.add(cap);
  }

  // Golden Ancient Rune Halo above the altar
  const ancHaloGeo = new THREE.TorusGeometry(5.8, 0.28, 8, 24);
  const ancHaloMat = new THREE.MeshBasicMaterial({ color: '#facc15' });
  const ancHalo = new THREE.Mesh(ancHaloGeo, ancHaloMat);
  ancHalo.position.set(0, 10, 0);
  ancHalo.rotation.x = Math.PI / 2;
  ancVillageGroup.add(ancHalo);
  animList.push({ mesh: ancHalo, rotSpeed: 0.9 });

  // 4 Ancient Village Thatched/Runic Huts around the perimeter
  const hutAngles = [0.8, 2.2, 3.8, 5.1];
  hutAngles.forEach((ang, idx) => {
    const hx = Math.cos(ang) * 48;
    const hz = Math.sin(ang) * 48;

    const hutWalls = new THREE.Mesh(
      new THREE.CylinderGeometry(5.2, 5.6, 6.5, 8),
      new THREE.MeshStandardMaterial({ color: '#451a03', roughness: 0.9 })
    );
    hutWalls.position.set(hx, 3.25, hz);
    ancVillageGroup.add(hutWalls);

    const hutRoof = new THREE.Mesh(
      new THREE.ConeGeometry(7.5, 6.0, 8),
      new THREE.MeshStandardMaterial({ color: '#d97706', roughness: 0.85 })
    );
    hutRoof.position.set(hx, 9.2, hz);
    ancVillageGroup.add(hutRoof);

    // Warm lantern hanging at hut entrance
    const lantern = new THREE.Mesh(
      new THREE.SphereGeometry(0.75, 8, 8),
      new THREE.MeshBasicMaterial({ color: '#fbbf24' })
    );
    lantern.position.set(hx + 3.8, 4.5, hz);
    ancVillageGroup.add(lantern);
  });

  // Mystical Ancient Sakura & Celestial Flowering Trees in the Village
  const treeWoodMat = new THREE.MeshStandardMaterial({ color: '#3e2723', roughness: 0.9 });
  const treeFoliageMat = new THREE.MeshStandardMaterial({ 
    color: '#f472b6', 
    emissive: '#db2777', 
    emissiveIntensity: 0.25, 
    roughness: 0.5 
  });
  const goldFoliageMat = new THREE.MeshStandardMaterial({ 
    color: '#facc15', 
    emissive: '#d97706', 
    emissiveIntensity: 0.35, 
    roughness: 0.4 
  });

  const treePositions = [
    { x: -28, z: -25, gold: false },
    { x: -32, z: 28, gold: true },
    { x: 26, z: -32, gold: true },
    { x: 30, z: 24, gold: false },
    { x: -62, z: -10, gold: false },
    { x: -15, z: 55, gold: true },
  ];

  treePositions.forEach(tp => {
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.6, 9, 8), treeWoodMat);
    trunk.position.set(tp.x, 4.5, tp.z);
    ancVillageGroup.add(trunk);

    const foliage = new THREE.Mesh(
      new THREE.DodecahedronGeometry(5.2),
      tp.gold ? goldFoliageMat : treeFoliageMat
    );
    foliage.position.set(tp.x, 10.5, tp.z);
    ancVillageGroup.add(foliage);
  });

  // 3D Billboard for Ancestral Village
  const ancLabel = createSecretPortalSpriteLabel(
    '🏛️ VILA ANCESTRAL SAGRADA',
    '[Ninho do Ovo Titã Sagrado Ancestral • Exclusivo desta Ilha]',
    '#fbbf24'
  );
  ancLabel.position.set(0, 15, 0);
  ancVillageGroup.add(ancLabel);

  // ================= 3. METADE LESTE: BIOMA NEGRO =================
  const relNegX = darkVoidBiome.x - islandCenter.x; // ~ +85
  const relNegZ = darkVoidBiome.z - islandCenter.z; // ~ +30
  const darkBiomeGroup = new THREE.Group();
  darkBiomeGroup.position.set(relNegX, 0, relNegZ);
  group.add(darkBiomeGroup);

  // Pitch-Black Obsidian Ground Disc
  const darkGroundMat = new THREE.MeshStandardMaterial({
    color: '#09080e',
    roughness: 0.45,
    metalness: 0.85
  });
  const darkGround = new THREE.Mesh(new THREE.CircleGeometry(85, 32), darkGroundMat);
  darkGround.rotation.x = -Math.PI / 2;
  darkGround.position.y = 0.05;
  darkGround.receiveShadow = true;
  darkBiomeGroup.add(darkGround);

  // Dark Void Stepped Crypt (Where the shadow egg nest is placed!)
  const cryptMat = new THREE.MeshStandardMaterial({
    color: '#1a102a',
    emissive: '#581c87',
    emissiveIntensity: 0.4,
    roughness: 0.3,
    metalness: 0.9
  });
  const cryptDais = new THREE.Mesh(new THREE.CylinderGeometry(7.5, 9.2, 2.4, 8), cryptMat);
  cryptDais.position.y = 1.2;
  darkBiomeGroup.add(cryptDais);

  // 8 Jagged Obsidian & Void Crystal Monoliths
  const spireMat = new THREE.MeshStandardMaterial({
    color: '#030206',
    emissive: '#3b0764',
    emissiveIntensity: 0.65,
    roughness: 0.2,
    metalness: 0.95
  });
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const spireHeight = 14 + (i % 3) * 6;
    const spire = new THREE.Mesh(new THREE.ConeGeometry(2.4, spireHeight, 4), spireMat);
    spire.position.set(Math.cos(angle) * 14, spireHeight / 2, Math.sin(angle) * 14);
    spire.rotation.y = angle;
    spire.rotation.z = (i % 2 === 0 ? 1 : -1) * 0.12;
    darkBiomeGroup.add(spire);
  }

  // 4 Dark Void Braziers burning with violet/purple void fire
  const brazierAngles = [0.7, 2.1, 3.6, 5.2];
  brazierAngles.forEach((ang) => {
    const bx = Math.cos(ang) * 44;
    const bz = Math.sin(ang) * 44;

    const brazierStand = new THREE.Mesh(
      new THREE.CylinderGeometry(1.6, 2.2, 4.5, 6),
      spireMat
    );
    brazierStand.position.set(bx, 2.25, bz);
    darkBiomeGroup.add(brazierStand);

    const flame = new THREE.Mesh(
      new THREE.SphereGeometry(1.4, 8, 8),
      new THREE.MeshBasicMaterial({ color: '#c084fc' })
    );
    flame.position.set(bx, 5.4, bz);
    darkBiomeGroup.add(flame);
    voidFlames.push(flame);

    const pLight = new THREE.PointLight('#a855f7', 2.8, 30);
    pLight.position.set(bx, 5.5, bz);
    darkBiomeGroup.add(pLight);
  });

  // Dark Void Portal Ring floating above the Crypt
  const voidRing = new THREE.Mesh(
    new THREE.TorusGeometry(5.6, 0.35, 8, 24),
    new THREE.MeshBasicMaterial({ color: '#a855f7' })
  );
  voidRing.position.set(0, 10, 0);
  voidRing.rotation.x = Math.PI / 2;
  darkBiomeGroup.add(voidRing);
  animList.push({ mesh: voidRing, rotSpeed: -1.1 });

  // 3D Billboard for Dark Void Biome
  const darkLabel = createSecretPortalSpriteLabel(
    '🌑 BIOMA NEGRO DO ABISMO',
    '[Ninho do Ovo Titã Obscuro das Trevas • Exclusivo desta Ilha]',
    '#c084fc'
  );
  darkLabel.position.set(0, 15, 0);
  darkBiomeGroup.add(darkLabel);

  // ================= 3.5. SETOR NORTE: BIOMA ELÉTRICO DOS TITÃS DA TEMPESTADE =================
  const relElecX = electricBiome.x - islandCenter.x; // 0
  const relElecZ = electricBiome.z - islandCenter.z; // ~ +125
  const elecBiomeGroup = new THREE.Group();
  elecBiomeGroup.position.set(relElecX, 0, relElecZ);
  group.add(elecBiomeGroup);

  // High-Voltage Circuit Ground Disc
  const elecGroundMat = new THREE.MeshStandardMaterial({
    color: '#082f49',
    emissive: '#0284c7',
    emissiveIntensity: 0.35,
    roughness: 0.25,
    metalness: 0.85
  });
  const elecGround = new THREE.Mesh(new THREE.CircleGeometry(85, 32), elecGroundMat);
  elecGround.rotation.x = -Math.PI / 2;
  elecGround.position.y = 0.05;
  elecGround.receiveShadow = true;
  elecBiomeGroup.add(elecGround);

  // Concentric Neon Circuit Ring
  const neonRingGeo = new THREE.RingGeometry(38, 44, 32);
  const neonRingMat = new THREE.MeshBasicMaterial({
    color: '#00f0ff',
    side: THREE.DoubleSide
  });
  const neonRing = new THREE.Mesh(neonRingGeo, neonRingMat);
  neonRing.rotation.x = -Math.PI / 2;
  neonRing.position.y = 0.08;
  elecBiomeGroup.add(neonRing);

  // Central Generator Dais (Where nest-secret-eletrico is placed!)
  const genDaisMat = new THREE.MeshStandardMaterial({
    color: '#0f172a',
    emissive: '#facc15',
    emissiveIntensity: 0.5,
    roughness: 0.3,
    metalness: 0.95
  });
  const genDais = new THREE.Mesh(new THREE.CylinderGeometry(7.5, 9.2, 2.4, 16), genDaisMat);
  genDais.position.y = 1.2;
  elecBiomeGroup.add(genDais);

  // 4 Massive Tesla Lightning Pylons surrounding the generator
  const pylonMat = new THREE.MeshStandardMaterial({
    color: '#1e293b',
    emissive: '#0284c7',
    emissiveIntensity: 0.45,
    metalness: 0.9,
    roughness: 0.2
  });
  const pylonAngles = [Math.PI / 4, 3 * Math.PI / 4, 5 * Math.PI / 4, 7 * Math.PI / 4];
  pylonAngles.forEach((pAng) => {
    const px = Math.cos(pAng) * 22;
    const pz = Math.sin(pAng) * 22;

    // Stepped Pylon Mast
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 2.2, 18, 8), pylonMat);
    mast.position.set(px, 9, pz);
    elecBiomeGroup.add(mast);

    // Tesla Coil Rings
    for (let r = 0; r < 4; r++) {
      const coil = new THREE.Mesh(
        new THREE.TorusGeometry(2.4 - r * 0.3, 0.25, 8, 20),
        new THREE.MeshBasicMaterial({ color: '#facc15' })
      );
      coil.rotation.x = Math.PI / 2;
      coil.position.set(px, 12 + r * 2.2, pz);
      elecBiomeGroup.add(coil);
    }

    // Plasma Terminal Sphere
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(1.6, 12, 12),
      new THREE.MeshBasicMaterial({ color: '#00f0ff' })
    );
    sphere.position.set(px, 20, pz);
    elecBiomeGroup.add(sphere);

    const light = new THREE.PointLight('#00f0ff', 3.5, 35);
    light.position.set(px, 20.5, pz);
    elecBiomeGroup.add(light);
  });

  // Fast Rotating Arc Torus above the Generator Dais
  const arcRing1 = new THREE.Mesh(
    new THREE.TorusGeometry(5.8, 0.28, 8, 32),
    new THREE.MeshBasicMaterial({ color: '#facc15' })
  );
  arcRing1.position.set(0, 8.5, 0);
  arcRing1.rotation.x = Math.PI / 2.5;
  elecBiomeGroup.add(arcRing1);
  animList.push({ mesh: arcRing1, rotSpeed: 2.2 });

  const arcRing2 = new THREE.Mesh(
    new THREE.TorusGeometry(4.6, 0.25, 8, 28),
    new THREE.MeshBasicMaterial({ color: '#00f0ff' })
  );
  arcRing2.position.set(0, 9.5, 0);
  arcRing2.rotation.x = -Math.PI / 2.8;
  elecBiomeGroup.add(arcRing2);
  animList.push({ mesh: arcRing2, rotSpeed: -1.8 });

  // 3D Billboard for Electric Biome
  const elecLabel = createSecretPortalSpriteLabel(
    '⚡ BIOMA ELÉTRICO DA TEMPESTADE',
    '[Ninho do Ovo Titã Voltaico Cósmico • Exclusivo da Ilha Secreta]',
    '#00f0ff'
  );
  elecLabel.position.set(0, 15, 0);
  elecBiomeGroup.add(elecLabel);

  // ================= 4. CENTRO DA ILHA: PORTAL DE RETORNO =================
  const returnGroup = new THREE.Group();
  returnGroup.position.set(0, 0, 0); // At islandCenter
  group.add(returnGroup);

  // Return Dais / Platform
  const returnDais = new THREE.Mesh(
    new THREE.CylinderGeometry(7.0, 8.5, 1.8, 16),
    new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.5, metalness: 0.5 })
  );
  returnDais.position.y = 0.9;
  returnGroup.add(returnDais);

  // Dual Return Obelisks
  const obeliskMat = new THREE.MeshStandardMaterial({
    color: '#0f172a',
    emissive: '#38bdf8',
    emissiveIntensity: 0.5,
    roughness: 0.3
  });
  const leftOb = new THREE.Mesh(new THREE.BoxGeometry(1.6, 12, 1.6), obeliskMat);
  leftOb.position.set(-5, 6, 0);
  returnGroup.add(leftOb);

  const rightOb = new THREE.Mesh(new THREE.BoxGeometry(1.6, 12, 1.6), obeliskMat);
  rightOb.position.set(5, 6, 0);
  returnGroup.add(rightOb);

  // Return Portal Vortex
  const returnVortexGeo = new THREE.CircleGeometry(4.2, 32);
  const returnVortexMat = new THREE.MeshBasicMaterial({
    color: '#38bdf8',
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.85
  });
  const returnPortalVortex = new THREE.Mesh(returnVortexGeo, returnVortexMat);
  returnPortalVortex.position.set(0, 6.2, 0);
  returnGroup.add(returnPortalVortex);
  animList.push({ mesh: returnPortalVortex, rotSpeed: 1.8 });

  // Return Beacon Beam upward into the clouds
  const returnBeacon = new THREE.Mesh(
    new THREE.CylinderGeometry(0.7, 1.5, 200, 12),
    new THREE.MeshBasicMaterial({ color: '#7dd3fc', transparent: true, opacity: 0.4 })
  );
  returnBeacon.position.set(0, 100, 0);
  returnGroup.add(returnBeacon);

  // 3D Billboard for Return Portal
  const returnLabel = createSecretPortalSpriteLabel(
    '🌀 PORTAL DE RETORNO',
    '[Pressione E para voltar à Montanha de Neve do Continente]',
    '#38bdf8'
  );
  returnLabel.position.set(0, 15, 0);
  returnGroup.add(returnLabel);

  return { group, returnPortalVortex, voidFlames, animList };
}
