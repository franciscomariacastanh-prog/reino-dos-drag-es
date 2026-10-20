import * as THREE from 'three';

interface MountainMaterials {
  stoneMat: THREE.Material;
  iceMat: THREE.Material;
  magmaRockMat: THREE.Material;
  lavaMat: THREE.Material;
  cyberMat: THREE.Material;
  cyanNeonMat: THREE.Material;
  goldMat: THREE.Material;
  goldGrassMat: THREE.Material;
  swampMat: THREE.Material;
  forestGrassMat: THREE.Material;
  grassMat: THREE.Material;
}

/**
 * Builds the monumental 3D procedural mountain ranges across the 10,000% expanded continent
 */
export function buildContinentMountainRanges(
  parentGroup: THREE.Group,
  mats: MountainMaterials,
  surfaceY: number = 2.5
): THREE.Group {
  const mountainsGroup = new THREE.Group();
  mountainsGroup.name = 'ContinentMountains';
  parentGroup.add(mountainsGroup);

  // Reusable materials
  const snowCapMat = mats.iceMat;
  const darkRockMat = mats.stoneMat;

  // --------------------------------------------------------------------------
  // 1. COLOSSAL OUTER MOUNTAIN WALL RING (52 Monumental Border Peaks)
  // Encircles the entire continent between radius 1100m and 1450m
  // --------------------------------------------------------------------------
  const outerPeakCount = 52;
  for (let i = 0; i < outerPeakCount; i++) {
    const angle = (i / outerPeakCount) * Math.PI * 2 + (i % 3) * 0.04;
    const radius = 1180 + ((i * 37) % 240);
    const px = Math.cos(angle) * radius;
    const pz = Math.sin(angle) * radius;

    const peakHeight = 150 + ((i * 47) % 110); // 150m to 260m height!
    const baseRadius = 120 + ((i * 29) % 80);  // 120m to 200m base!

    // Rocky Mountain Body (faceted cone for realistic jagged mountain crags)
    const mountainGeo = new THREE.ConeGeometry(baseRadius, peakHeight, 7, 3);
    const mountainMesh = new THREE.Mesh(mountainGeo, darkRockMat);
    mountainMesh.position.set(px, surfaceY + peakHeight / 2 - 4, pz);
    mountainMesh.rotation.y = (i * 1.7);
    mountainMesh.castShadow = true;
    mountainMesh.receiveShadow = true;
    mountainsGroup.add(mountainMesh);

    // Snow-Capped Summit Cap
    const snowCapHeight = peakHeight * 0.38;
    const snowCapRadius = baseRadius * 0.38;
    const snowCapGeo = new THREE.ConeGeometry(snowCapRadius, snowCapHeight, 7);
    const snowCapMesh = new THREE.Mesh(snowCapGeo, snowCapMat);
    snowCapMesh.position.set(px, surfaceY + peakHeight - snowCapHeight / 2 - 2, pz);
    snowCapMesh.rotation.y = mountainMesh.rotation.y;
    mountainsGroup.add(snowCapMesh);

    // Secondary Shoulder Ridge / Subsidiary Peak
    if (i % 2 === 0) {
      const subOffset = baseRadius * 0.65;
      const subAngle = angle + 0.07;
      const subX = Math.cos(subAngle) * (radius - 40);
      const subZ = Math.sin(subAngle) * (radius - 40);
      const subHeight = peakHeight * 0.68;
      const subRadius = baseRadius * 0.6;

      const subPeak = new THREE.Mesh(
        new THREE.ConeGeometry(subRadius, subHeight, 6),
        darkRockMat
      );
      subPeak.position.set(subX, surfaceY + subHeight / 2 - 2, subZ);
      subPeak.rotation.y = i * 2.1;
      mountainsGroup.add(subPeak);
    }
  }

  // --------------------------------------------------------------------------
  // 2. CORDILHEIRA VULCÂNICA DE MAGMA (Norte: x: 0, z: -540)
  // Colossal Volcano with Caldera Depression and Lava Crater Lake
  // --------------------------------------------------------------------------
  const volcanoGroup = new THREE.Group();
  volcanoGroup.position.set(0, surfaceY, -540);
  mountainsGroup.add(volcanoGroup);

  // Main Volcanic Cone (Outer slopes)
  const volcanoOuterGeo = new THREE.CylinderGeometry(85, 260, 140, 16, 4);
  const volcanoOuterMesh = new THREE.Mesh(volcanoOuterGeo, mats.magmaRockMat);
  volcanoOuterMesh.position.y = 70;
  volcanoOuterMesh.castShadow = true;
  volcanoOuterMesh.receiveShadow = true;
  volcanoGroup.add(volcanoOuterMesh);

  // Caldera Lava Lake inside the crater summit
  const lavaLakeGeo = new THREE.CircleGeometry(78, 24);
  const lavaLakeMesh = new THREE.Mesh(lavaLakeGeo, mats.lavaMat);
  lavaLakeMesh.rotation.x = -Math.PI / 2;
  lavaLakeMesh.position.y = 132;
  volcanoGroup.add(lavaLakeMesh);

  // Glowing Magma Chamber Light
  const volcanoLight = new THREE.PointLight('#f97316', 4.0, 320);
  volcanoLight.position.set(0, 150, 0);
  volcanoGroup.add(volcanoLight);

  // 8 Volcanic Crags & Basalt Spire Horns around the Caldera Rim
  for (let c = 0; c < 8; c++) {
    const cAngle = (c / 8) * Math.PI * 2;
    const cx = Math.cos(cAngle) * 86;
    const cz = Math.sin(cAngle) * 86;
    const rimSpireGeo = new THREE.ConeGeometry(18, 42 + (c % 3) * 12, 5);
    const rimSpire = new THREE.Mesh(rimSpireGeo, mats.magmaRockMat);
    rimSpire.position.set(cx, 145, cz);
    rimSpire.rotation.z = (Math.random() - 0.5) * 0.2;
    rimSpire.castShadow = true;
    volcanoGroup.add(rimSpire);
  }

  // Flank Volcanic Ridges & Parasitic Cones
  for (let f = 0; f < 6; f++) {
    const fAngle = (f / 6) * Math.PI * 2 + 0.3;
    const fDist = 180 + (f % 2) * 45;
    const fx = Math.cos(fAngle) * fDist;
    const fz = Math.sin(fAngle) * fDist;

    const flankCone = new THREE.Mesh(
      new THREE.ConeGeometry(65, 85, 6),
      mats.magmaRockMat
    );
    flankCone.position.set(fx, 42.5, fz);
    volcanoGroup.add(flankCone);
  }

  // --------------------------------------------------------------------------
  // 3. PICOS GLACIAIS DE PERMAFROST (Sul: x: 0, z: 640)
  // Razor-sharp Frozen Mountain Spires and Ice Pinnacles
  // --------------------------------------------------------------------------
  const iceMountainGroup = new THREE.Group();
  iceMountainGroup.position.set(0, surfaceY, 640);
  mountainsGroup.add(iceMountainGroup);

  // Apex Ice Glacier Peak (160m)
  const mainIcePeak = new THREE.Mesh(
    new THREE.ConeGeometry(210, 160, 8, 3),
    mats.iceMat
  );
  mainIcePeak.position.y = 80;
  mainIcePeak.castShadow = true;
  iceMountainGroup.add(mainIcePeak);

  // Frosted Summit Needle
  const summitNeedle = new THREE.Mesh(
    new THREE.ConeGeometry(38, 70, 5),
    mats.iceMat
  );
  summitNeedle.position.y = 175;
  iceMountainGroup.add(summitNeedle);

  // 7 Surrounding Jagged Ice Needle Spines
  for (let i = 0; i < 7; i++) {
    const iAngle = (i / 7) * Math.PI * 2 + 0.2;
    const iDist = 145 + (i % 3) * 35;
    const ix = Math.cos(iAngle) * iDist;
    const iz = Math.sin(iAngle) * iDist;
    const iHeight = 95 + (i % 4) * 25;

    const needle = new THREE.Mesh(
      new THREE.ConeGeometry(42, iHeight, 5),
      mats.iceMat
    );
    needle.position.set(ix, iHeight / 2, iz);
    needle.rotation.z = ((i % 2 === 0 ? 1 : -1) * 0.12);
    iceMountainGroup.add(needle);
  }

  // --------------------------------------------------------------------------
  // 4. MACIÇO MECÂNICO APEX ROBÓTICO (Leste: x: 580, z: 130)
  // Stepped Cybernetic Mountain Pyramids with Neon Lines
  // --------------------------------------------------------------------------
  const cyberMountainGroup = new THREE.Group();
  cyberMountainGroup.position.set(580, surfaceY, 130);
  mountainsGroup.add(cyberMountainGroup);

  // Tiered Cyber Mountain Tiers
  for (let t = 0; t < 5; t++) {
    const tierSize = 220 - t * 40;
    const tierHeight = 24;
    const tierMesh = new THREE.Mesh(
      new THREE.BoxGeometry(tierSize, tierHeight, tierSize),
      mats.cyberMat
    );
    tierMesh.position.y = t * tierHeight + tierHeight / 2;
    tierMesh.castShadow = true;
    tierMesh.receiveShadow = true;
    cyberMountainGroup.add(tierMesh);

    // Glowing Neon Perimeter Conduit on each tier
    const conduitMesh = new THREE.Mesh(
      new THREE.RingGeometry(tierSize * 0.48, tierSize * 0.51, 4),
      mats.cyanNeonMat
    );
    conduitMesh.rotation.x = -Math.PI / 2;
    conduitMesh.rotation.z = Math.PI / 4;
    conduitMesh.position.y = (t + 1) * tierHeight + 0.2;
    cyberMountainGroup.add(conduitMesh);
  }

  // Apex Cyber Monolith Tower at Mountain Summit
  const apexMonolith = new THREE.Mesh(
    new THREE.BoxGeometry(22, 58, 22),
    mats.cyberMat
  );
  apexMonolith.position.y = 5 * 24 + 29;
  cyberMountainGroup.add(apexMonolith);

  const apexBeacon = new THREE.Mesh(
    new THREE.OctahedronGeometry(9),
    mats.cyanNeonMat
  );
  apexBeacon.position.y = 5 * 24 + 68;
  cyberMountainGroup.add(apexBeacon);

  // --------------------------------------------------------------------------
  // 5. SERRA ANCESTRAL DAS FLORESTAS (Oeste: x: -540, z: -200)
  // Granite Massifs, Pine Spires, and Sacred Druid High Arches
  // --------------------------------------------------------------------------
  const forestMountainGroup = new THREE.Group();
  forestMountainGroup.position.set(-540, surfaceY, -200);
  mountainsGroup.add(forestMountainGroup);

  // Main Granite Mountain Body
  const forestPeakMesh = new THREE.Mesh(
    new THREE.ConeGeometry(210, 135, 7, 3),
    mats.forestGrassMat
  );
  forestPeakMesh.position.y = 67.5;
  forestPeakMesh.castShadow = true;
  forestMountainGroup.add(forestPeakMesh);

  // Granite Rocky Summit Crown
  const graniteCap = new THREE.Mesh(
    new THREE.ConeGeometry(75, 55, 6),
    darkRockMat
  );
  graniteCap.position.y = 135;
  forestMountainGroup.add(graniteCap);

  // Giant Mountain Pines climbing the lower ridges
  for (let p = 0; p < 18; p++) {
    const pAngle = (p / 18) * Math.PI * 2;
    const pDist = 120 + (p % 4) * 22;
    const px = Math.cos(pAngle) * pDist;
    const pz = Math.sin(pAngle) * pDist;

    const pineTrunk = new THREE.Mesh(
      new THREE.CylinderGeometry(2.5, 4, 28, 6),
      new THREE.MeshStandardMaterial({ color: '#2d1a0f', roughness: 0.9 })
    );
    pineTrunk.position.set(px, 14, pz);

    const pineFoliage = new THREE.Mesh(
      new THREE.ConeGeometry(14, 38, 6),
      new THREE.MeshStandardMaterial({ color: '#0f381e', roughness: 0.8 })
    );
    pineFoliage.position.y = 20;
    pineTrunk.add(pineFoliage);
    forestMountainGroup.add(pineTrunk);
  }

  // --------------------------------------------------------------------------
  // 6. AGULHAS DO PÂNTANO SOMBRIO (Sudoeste: x: -490, z: 440)
  // Twisted Basalt Pinnacles, Spires, and Cavernous Gorges
  // --------------------------------------------------------------------------
  const swampMountainGroup = new THREE.Group();
  swampMountainGroup.position.set(-490, surfaceY, 440);
  mountainsGroup.add(swampMountainGroup);

  for (let s = 0; s < 10; s++) {
    const sAngle = (s / 10) * Math.PI * 2 + 0.15;
    const sDist = 60 + (s % 3) * 55;
    const sx = Math.cos(sAngle) * sDist;
    const sz = Math.sin(sAngle) * sDist;
    const sHeight = 80 + (s % 5) * 22;

    const spire = new THREE.Mesh(
      new THREE.ConeGeometry(28 + (s % 3) * 8, sHeight, 5),
      mats.swampMat
    );
    spire.position.set(sx, sHeight / 2, sz);
    spire.rotation.x = ((s % 2 === 0 ? 1 : -1) * 0.08);
    spire.rotation.z = ((s % 3 === 0 ? 1 : -1) * 0.1);
    swampMountainGroup.add(spire);
  }

  // --------------------------------------------------------------------------
  // 7. LAGOA DOS PICOS ABISSAIS (Nordeste: x: 430, z: -430)
  // Oceanic Sea-Stacks and Giant Coastal Cliffs
  // --------------------------------------------------------------------------
  const aquaticMountainGroup = new THREE.Group();
  aquaticMountainGroup.position.set(430, surfaceY, -430);
  mountainsGroup.add(aquaticMountainGroup);

  // Crescent Cliff Wall encircling the lagoon
  for (let a = 0; a < 8; a++) {
    const aAngle = (a / 8) * Math.PI * 1.5 - 0.4;
    const ax = Math.cos(aAngle) * 160;
    const az = Math.sin(aAngle) * 160;
    const cliffHeight = 85 + (a % 3) * 18;

    const cliff = new THREE.Mesh(
      new THREE.BoxGeometry(45, cliffHeight, 55),
      darkRockMat
    );
    cliff.position.set(ax, cliffHeight / 2, az);
    cliff.rotation.y = -aAngle;
    aquaticMountainGroup.add(cliff);
  }

  // --------------------------------------------------------------------------
  // 8. MACIÇO DOURADO DAS PLANÍCIES CELESTES (Sudeste: x: 440, z: 530)
  // Terraced Sandstone Mesas and Sun Temples
  // --------------------------------------------------------------------------
  const plainsMountainGroup = new THREE.Group();
  plainsMountainGroup.position.set(440, surfaceY, 530);
  mountainsGroup.add(plainsMountainGroup);

  // Terraced Sandstone Mesa Plateau
  const mesaBase = new THREE.Mesh(
    new THREE.CylinderGeometry(150, 190, 48, 12),
    mats.goldGrassMat
  );
  mesaBase.position.y = 24;
  plainsMountainGroup.add(mesaBase);

  const mesaTop = new THREE.Mesh(
    new THREE.CylinderGeometry(95, 130, 52, 10),
    mats.goldGrassMat
  );
  mesaTop.position.y = 48 + 26;
  plainsMountainGroup.add(mesaTop);

  // Golden Summit Monolith
  const goldSpire = new THREE.Mesh(
    new THREE.ConeGeometry(12, 45, 4),
    mats.goldMat
  );
  goldSpire.position.y = 48 + 52 + 22.5;
  plainsMountainGroup.add(goldSpire);

  // --------------------------------------------------------------------------
  // 9. FLOATING SKY ISLANDS & MOUNTAIN ISLETS (36 Sky Atolls across the skies)
  // Hovering high above the continent between y = 140m and 1200m
  // --------------------------------------------------------------------------
  for (let k = 0; k < 36; k++) {
    const kAngle = (k / 36) * Math.PI * 2 + 0.35;
    const kDist = 380 + ((k * 430) % 6500);
    const kx = Math.cos(kAngle) * kDist;
    const kz = Math.sin(kAngle) * kDist;
    const ky = 140 + ((k * 65) % 650);
    const kRadius = 38 + (k % 4) * 22;

    const skyIsle = new THREE.Group();
    skyIsle.position.set(kx, ky, kz);

    // Flat grass top
    const skyTop = new THREE.Mesh(
      new THREE.CylinderGeometry(kRadius, kRadius - 2, 4, 16),
      mats.grassMat
    );
    skyTop.position.y = 2;
    skyIsle.add(skyTop);

    // Inverted rocky cone underside
    const skyUnder = new THREE.Mesh(
      new THREE.ConeGeometry(kRadius - 2, 45 + (k % 3) * 18, 10),
      darkRockMat
    );
    skyUnder.rotation.x = Math.PI;
    skyUnder.position.y = -22;
    skyIsle.add(skyUnder);

    // Floating Crystal Beacon atop the sky isle
    const skyCrystal = new THREE.Mesh(
      new THREE.OctahedronGeometry(4.2),
      new THREE.MeshBasicMaterial({ color: k % 3 === 0 ? '#38bdf8' : (k % 3 === 1 ? '#fbbf24' : '#a855f7') })
    );
    skyCrystal.position.y = 12;
    skyIsle.add(skyCrystal);

    mountainsGroup.add(skyIsle);
  }

  // --------------------------------------------------------------------------
  // 10. CORDILEIRA FRONTEIRIÇA DOS TITÃS SUPREMOS (+999999999999999999% EXPANDIDA)
  // 80 Monumental Horizon Peaks stretching into the stratosphere (radius 16,000m - 52,000m)
  // --------------------------------------------------------------------------
  const titanRimPeaks = 80;
  for (let i = 0; i < titanRimPeaks; i++) {
    const angle = (i / titanRimPeaks) * Math.PI * 2 + (i % 5) * 0.05;
    const radius = 16000 + ((i * 1237) % 36000);
    const px = Math.cos(angle) * radius;
    const pz = Math.sin(angle) * radius;

    const peakHeight = 450 + ((i * 97) % 850); // 450m to 1300m height!
    const baseRadius = 350 + ((i * 73) % 450);  // 350m to 800m base!

    const mountainGeo = new THREE.ConeGeometry(baseRadius, peakHeight, 8, 3);
    const mountainMesh = new THREE.Mesh(mountainGeo, darkRockMat);
    mountainMesh.position.set(px, surfaceY + peakHeight / 2 - 10, pz);
    mountainMesh.rotation.y = (i * 1.9);
    mountainsGroup.add(mountainMesh);

    // Colossal Snow / Ice Cap
    const snowCapHeight = peakHeight * 0.42;
    const snowCapRadius = baseRadius * 0.42;
    const snowCapGeo = new THREE.ConeGeometry(snowCapRadius, snowCapHeight, 8);
    const snowCapMesh = new THREE.Mesh(snowCapGeo, snowCapMat);
    snowCapMesh.position.set(px, surfaceY + peakHeight - snowCapHeight / 2 - 4, pz);
    snowCapMesh.rotation.y = mountainMesh.rotation.y;
    mountainsGroup.add(snowCapMesh);

    // Apex Luminous Beacon atop every 4th mega peak
    if (i % 4 === 0) {
      const beacon = new THREE.Mesh(
        new THREE.OctahedronGeometry(22),
        new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? '#38bdf8' : '#f59e0b' })
      );
      beacon.position.set(px, surfaceY + peakHeight + 15, pz);
      mountainsGroup.add(beacon);
    }
  }

  // --------------------------------------------------------------------------
  // 11. CORDILHEIRA CENTRAL ESPINHA DO DRAGÃO (38 Picos Alpinos entre os Biomas)
  // Montanhas colossais que dividem os vales e criam desfiladeiros dramáticos
  // --------------------------------------------------------------------------
  const spineCount = 38;
  for (let s = 0; s < spineCount; s++) {
    const angle = (s / spineCount) * Math.PI * 2 + 0.15;
    const radius = 320 + ((s * 43) % 480);
    const sx = Math.cos(angle) * radius;
    const sz = Math.sin(angle) * radius;

    const sHeight = 110 + ((s * 31) % 95);
    const sBase = 75 + ((s * 23) % 55);

    // Jagged Alpine Peak body
    const sGeo = new THREE.ConeGeometry(sBase, sHeight, 6, 2);
    const sMat = (s % 3 === 0) ? mats.magmaRockMat : (s % 3 === 1 ? mats.stoneMat : mats.swampMat);
    const sMesh = new THREE.Mesh(sGeo, sMat);
    sMesh.position.set(sx, surfaceY + sHeight / 2 - 2, sz);
    sMesh.rotation.y = s * 1.3;
    sMesh.castShadow = true;
    sMesh.receiveShadow = true;
    mountainsGroup.add(sMesh);

    // Snow Cap
    const capHeight = sHeight * 0.35;
    const capGeo = new THREE.ConeGeometry(sBase * 0.35, capHeight, 6);
    const capMesh = new THREE.Mesh(capGeo, snowCapMat);
    capMesh.position.set(sx, surfaceY + sHeight - capHeight / 2 - 1, sz);
    capMesh.rotation.y = sMesh.rotation.y;
    mountainsGroup.add(capMesh);

    // Mountain Ridge Spur
    if (s % 2 === 0) {
      const ridgeGeo = new THREE.CylinderGeometry(sBase * 0.25, sBase * 0.55, sHeight * 0.6, 5);
      const ridgeMesh = new THREE.Mesh(ridgeGeo, darkRockMat);
      ridgeMesh.position.set(sx + 28, surfaceY + (sHeight * 0.3) - 2, sz - 20);
      ridgeMesh.rotation.z = 0.35;
      ridgeMesh.rotation.y = s * 0.7;
      mountainsGroup.add(ridgeMesh);
    }
  }

  // --------------------------------------------------------------------------
  // 12. AGULHAS CELESTIAIS DOS TITÃS (28 Agulhas e Espetos Rochosos de Alta Altitude)
  // Needle spires reaching high above the mist
  // --------------------------------------------------------------------------
  const needleCount = 28;
  for (let n = 0; n < needleCount; n++) {
    const angle = (n / needleCount) * Math.PI * 2 + 0.42;
    const dist = 750 + ((n * 67) % 650);
    const nx = Math.cos(angle) * dist;
    const nz = Math.sin(angle) * dist;
    const nHeight = 160 + ((n * 41) % 140);
    const nBase = 28 + ((n * 19) % 24);

    const needleGeo = new THREE.CylinderGeometry(4, nBase, nHeight, 7);
    const needleMesh = new THREE.Mesh(needleGeo, darkRockMat);
    needleMesh.position.set(nx, surfaceY + nHeight / 2 - 4, nz);
    needleMesh.rotation.y = n * 2.3;
    needleMesh.castShadow = true;
    mountainsGroup.add(needleMesh);

    // Sharp Needle Summit
    const tipGeo = new THREE.ConeGeometry(4.5, 32, 6);
    const tipMesh = new THREE.Mesh(tipGeo, snowCapMat);
    tipMesh.position.set(nx, surfaceY + nHeight + 14, nz);
    mountainsGroup.add(tipMesh);
  }

  // --------------------------------------------------------------------------
  // 13. CORDILHEIRAS INTERMEDIÁRIAS DOS CONTINENTES EXTERNOS (64 Grandes Maciços)
  // Dispersos entre radius 1800m e 9000m
  // --------------------------------------------------------------------------
  const outerMassifCount = 64;
  for (let m = 0; m < outerMassifCount; m++) {
    const angle = (m / outerMassifCount) * Math.PI * 2 + 0.18;
    const dist = 2200 + ((m * 347) % 6800);
    const mx = Math.cos(angle) * dist;
    const mz = Math.sin(angle) * dist;

    const mHeight = 220 + ((m * 59) % 260); // 220m to 480m!
    const mBase = 180 + ((m * 47) % 160);

    const massifGeo = new THREE.ConeGeometry(mBase, mHeight, 7, 3);
    const massifMesh = new THREE.Mesh(massifGeo, darkRockMat);
    massifMesh.position.set(mx, surfaceY + mHeight / 2 - 5, mz);
    massifMesh.rotation.y = m * 1.6;
    massifMesh.castShadow = true;
    mountainsGroup.add(massifMesh);

    // Snow Cap
    const capGeo = new THREE.ConeGeometry(mBase * 0.4, mHeight * 0.4, 7);
    const capMesh = new THREE.Mesh(capGeo, snowCapMat);
    capMesh.position.set(mx, surfaceY + mHeight - (mHeight * 0.2), mz);
    mountainsGroup.add(capMesh);
  }

  // --------------------------------------------------------------------------
  // 14. CORDILHEIRAS TRANSVERSAIS DIVISÓRIAS & ARCOS NATURAIS (49 Picos Intermediários)
  // Montanhas de transição entre biomas com arcos colossais de pedra para voo rasante
  // --------------------------------------------------------------------------
  for (let b = 0; b < 7; b++) {
    const ridgeAngle = (b / 7) * Math.PI * 2 + Math.PI / 7;
    for (let r = 0; r < 7; r++) {
      const dist = 320 + r * 65;
      const rx = Math.cos(ridgeAngle) * dist + (Math.sin(r * 2) * 20);
      const rz = Math.sin(ridgeAngle) * dist + (Math.cos(r * 2) * 20);
      const rHeight = 85 + ((r * 17) % 65);
      const rBase = 55 + ((r * 13) % 25);

      const ridgePeak = new THREE.Mesh(
        new THREE.ConeGeometry(rBase, rHeight, 6, 2),
        darkRockMat
      );
      ridgePeak.position.set(rx, surfaceY + rHeight / 2 - 2, rz);
      ridgePeak.rotation.y = r * 0.9;
      ridgePeak.castShadow = true;
      ridgePeak.receiveShadow = true;
      mountainsGroup.add(ridgePeak);

      // Arco Natural de Rocha atravessando a montanha
      if (r === 3) {
        const archGeo = new THREE.TorusGeometry(28, 5.5, 8, 18, Math.PI);
        const naturalArch = new THREE.Mesh(archGeo, darkRockMat);
        naturalArch.position.set(rx, surfaceY + 24, rz);
        naturalArch.rotation.y = ridgeAngle + Math.PI / 2;
        naturalArch.castShadow = true;
        mountainsGroup.add(naturalArch);
      }
    }
  }

  // --------------------------------------------------------------------------
  // 15. PILARES E MESAS ROCHOSAS DOS DESFILADEIROS (36 Monumentos Rochosos Verticais)
  // --------------------------------------------------------------------------
  for (let p = 0; p < 36; p++) {
    const pAngle = (p / 36) * Math.PI * 2 + 0.22;
    const pDist = 480 + ((p * 233) % 2800);
    const px = Math.cos(pAngle) * pDist;
    const pz = Math.sin(pAngle) * pDist;
    const pH = 70 + ((p * 29) % 80);
    const pR = 18 + (p % 3) * 8;

    const pillar = new THREE.Mesh(
      new THREE.CylinderGeometry(pR * 0.7, pR, pH, 8),
      darkRockMat
    );
    pillar.position.set(px, surfaceY + pH / 2 - 2, pz);
    pillar.castShadow = true;
    pillar.receiveShadow = true;
    mountainsGroup.add(pillar);

    // Platô no topo do pilar rochoso
    const plateau = new THREE.Mesh(
      new THREE.CylinderGeometry(pR * 0.9, pR * 0.7, 4, 8),
      mats.grassMat
    );
    plateau.position.set(px, surfaceY + pH + 1, pz);
    mountainsGroup.add(plateau);
  }

  return mountainsGroup;
}
