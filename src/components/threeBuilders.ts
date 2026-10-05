import * as THREE from 'three';
import { AvatarGender } from '../types/game';

export function createAvatarMesh(gender: AvatarGender, shirtColorOverride?: number): THREE.Group {
  const group = new THREE.Group();
  group.name = `avatar_${gender}`;

  const skinMat = new THREE.MeshStandardMaterial({ color: 0xfcd39c, roughness: 0.55 });
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2 });
  const shoeMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 });
  const backpackMat = new THREE.MeshStandardMaterial({
    color: gender === 'lelaki' ? 0xd97706 : 0xe11d48,
    roughness: 0.5
  });

  const primaryShirtColor =
    shirtColorOverride ?? (gender === 'lelaki' ? 0x0284c7 : 0x059669);
  const shirtMat = new THREE.MeshStandardMaterial({ color: primaryShirtColor, roughness: 0.5 });
  const pantsMat = new THREE.MeshStandardMaterial({
    color: gender === 'lelaki' ? 0x1e3a8a : 0x065f46,
    roughness: 0.6
  });

  // Legs
  const leftLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.12, 0.55, 12), pantsMat);
  leftLeg.position.set(-0.16, 0.32, 0);
  leftLeg.castShadow = true;
  leftLeg.name = 'leftLeg';
  group.add(leftLeg);

  const rightLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.12, 0.55, 12), pantsMat);
  rightLeg.position.set(0.16, 0.32, 0);
  rightLeg.castShadow = true;
  rightLeg.name = 'rightLeg';
  group.add(rightLeg);

  // Shoes
  const leftShoe = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.14, 0.34), shoeMat);
  leftShoe.position.set(-0.16, 0.08, 0.05);
  leftShoe.castShadow = true;
  group.add(leftShoe);

  const rightShoe = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.14, 0.34), shoeMat);
  rightShoe.position.set(0.16, 0.08, 0.05);
  rightShoe.castShadow = true;
  group.add(rightShoe);

  // Torso
  if (gender === 'perempuan') {
    const bajuKurung = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.42, 0.85, 16), shirtMat);
    bajuKurung.position.set(0, 0.92, 0);
    bajuKurung.castShadow = true;
    group.add(bajuKurung);
  } else {
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.3, 0.78, 16), shirtMat);
    torso.position.set(0, 0.95, 0);
    torso.castShadow = true;
    group.add(torso);
  }

  // Backpack
  const backpack = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.5, 0.24), backpackMat);
  backpack.position.set(0, 0.98, -0.32);
  backpack.castShadow = true;
  group.add(backpack);

  // Arms
  const leftArm = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.09, 0.58, 12), shirtMat);
  leftArm.position.set(-0.44, 0.95, 0);
  leftArm.rotation.z = 0.18;
  leftArm.castShadow = true;
  leftArm.name = 'leftArm';
  group.add(leftArm);

  const rightArm = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.09, 0.58, 12), shirtMat);
  rightArm.position.set(0.44, 0.95, 0);
  rightArm.rotation.z = -0.18;
  rightArm.castShadow = true;
  rightArm.name = 'rightArm';
  group.add(rightArm);

  // Hands
  const leftHand = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 12), skinMat);
  leftHand.position.set(-0.5, 0.65, 0);
  group.add(leftHand);

  const rightHand = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 12), skinMat);
  rightHand.position.set(0.5, 0.65, 0);
  group.add(rightHand);

  // Head
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.38, 24, 24), skinMat);
  head.position.set(0, 1.68, 0);
  head.castShadow = true;
  group.add(head);

  // Hair or Tudung
  if (gender === 'perempuan') {
    const tudungMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.45 });
    const tudungHood = new THREE.Mesh(new THREE.SphereGeometry(0.41, 24, 24), tudungMat);
    tudungHood.position.set(0, 1.7, -0.04);
    tudungHood.scale.set(1.02, 1.04, 1.02);
    group.add(tudungHood);

    const tudungShoulder = new THREE.Mesh(new THREE.ConeGeometry(0.46, 0.45, 16), tudungMat);
    tudungShoulder.position.set(0, 1.36, 0);
    group.add(tudungShoulder);
  } else {
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 });
    const hairCap = new THREE.Mesh(
      new THREE.SphereGeometry(0.4, 20, 20, 0, Math.PI * 2, 0, Math.PI * 0.55),
      hairMat
    );
    hairCap.position.set(0, 1.72, -0.02);
    group.add(hairCap);

    const capVisorMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4 });
    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.06, 0.25), capVisorMat);
    visor.position.set(0, 1.88, 0.28);
    group.add(visor);
  }

  // Eyes
  const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.048, 10, 10), eyeMat);
  leftEye.position.set(-0.13, 1.7, 0.35);
  group.add(leftEye);

  const rightEye = new THREE.Mesh(new THREE.SphereGeometry(0.048, 10, 10), eyeMat);
  rightEye.position.set(0.13, 1.7, 0.35);
  group.add(rightEye);

  // Smile
  const smileGeo = new THREE.TorusGeometry(0.08, 0.018, 8, 16, Math.PI);
  const smile = new THREE.Mesh(smileGeo, eyeMat);
  smile.position.set(0, 1.58, 0.36);
  smile.rotation.x = Math.PI;
  group.add(smile);

  // Held object anchor
  const carryAnchor = new THREE.Group();
  carryAnchor.name = 'carryAnchor';
  carryAnchor.position.set(0, 0.95, 0.52);
  group.add(carryAnchor);

  return group;
}

export function createBook3D(): THREE.Group {
  const g = new THREE.Group();
  const coverMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.4 });
  const pagesMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 });
  const spineMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.4 });

  const cover = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.12, 0.72), coverMat);
  cover.castShadow = true;
  g.add(cover);

  const pages = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.09, 0.68), pagesMat);
  pages.position.set(0.02, 0, 0);
  g.add(pages);

  const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.13, 0.72), spineMat);
  stripe.position.set(-0.21, 0, 0);
  g.add(stripe);

  return g;
}

export function createBall3D(): THREE.Group {
  const g = new THREE.Group();
  const ballMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.35 });
  const stripeMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 });

  const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.32, 20, 20), ballMat);
  sphere.castShadow = true;
  g.add(sphere);

  const band = new THREE.Mesh(new THREE.TorusGeometry(0.315, 0.025, 8, 24), stripeMat);
  band.rotation.x = Math.PI / 2;
  g.add(band);

  return g;
}

export function createPencil3D(): THREE.Group {
  const g = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.4 });
  const tipWoodMat = new THREE.MeshStandardMaterial({ color: 0xfde68a, roughness: 0.6 });
  const leadMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 });
  const eraserMat = new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.5 });

  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.7, 6), bodyMat);
  shaft.rotation.z = Math.PI / 2;
  shaft.castShadow = true;
  g.add(shaft);

  const woodTip = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.18, 6), tipWoodMat);
  woodTip.rotation.z = -Math.PI / 2;
  woodTip.position.set(0.44, 0, 0);
  g.add(woodTip);

  const lead = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.07, 6), leadMat);
  lead.rotation.z = -Math.PI / 2;
  lead.position.set(0.5, 0, 0);
  g.add(lead);

  const eraser = new THREE.Mesh(new THREE.CylinderGeometry(0.072, 0.072, 0.12, 12), eraserMat);
  eraser.rotation.z = Math.PI / 2;
  eraser.position.set(-0.4, 0, 0);
  g.add(eraser);

  return g;
}

export function createBoxParcel3D(): THREE.Group {
  const g = new THREE.Group();
  const cardboardMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.7 });
  const tapeMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.4 });
  const labelMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });

  const box = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.62, 0.75), cardboardMat);
  box.position.y = 0.31;
  box.castShadow = true;
  g.add(box);

  const tape = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.64, 0.77), tapeMat);
  tape.position.y = 0.31;
  g.add(tape);

  const label = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.18, 0.77), labelMat);
  label.position.set(0.18, 0.36, 0);
  g.add(label);

  return g;
}

export function createBroom3D(): THREE.Group {
  const g = new THREE.Group();
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.65 });
  const bristleMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.75 });
  const capMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.45 });

  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 1.35, 10), woodMat);
  handle.position.y = 0.95;
  handle.castShadow = true;
  g.add(handle);

  const cap = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.1, 0.16), capMat);
  cap.position.y = 0.35;
  g.add(cap);

  const bristles = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.42, 8), bristleMat);
  bristles.position.y = 0.18;
  bristles.scale.set(1.2, 1, 0.5);
  bristles.castShadow = true;
  g.add(bristles);

  return g;
}

export function createPlasticBottle3D(): THREE.Group {
  const g = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    roughness: 0.2,
    transparent: true,
    opacity: 0.85
  });
  const labelMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4 });
  const capMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.3 });

  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.48, 14), bodyMat);
  body.position.y = 0.24;
  body.castShadow = true;
  g.add(body);

  const label = new THREE.Mesh(new THREE.CylinderGeometry(0.155, 0.155, 0.16, 14), labelMat);
  label.position.y = 0.24;
  g.add(label);

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.12, 0.12, 12), bodyMat);
  neck.position.y = 0.54;
  g.add(neck);

  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.06, 12), capMat);
  cap.position.y = 0.62;
  g.add(cap);

  return g;
}

export function createRecycleBin3D(): THREE.Group {
  const g = new THREE.Group();
  const binMat = new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.5 });
  const lidMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.4 });
  const badgeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });

  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.36, 1.05, 16), binMat);
  body.position.y = 0.52;
  body.castShadow = true;
  g.add(body);

  const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.12, 16), lidMat);
  lid.position.y = 1.08;
  g.add(lid);

  const emblem = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.035, 8, 18), badgeMat);
  emblem.position.set(0, 0.58, 0.4);
  g.add(emblem);

  return g;
}

export function createTree3D(): THREE.Group {
  const g = new THREE.Group();
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 });
  const leavesMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.65 });

  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.26, 1.3, 10), trunkMat);
  trunk.position.y = 0.65;
  trunk.castShadow = true;
  g.add(trunk);

  const foliage1 = new THREE.Mesh(new THREE.SphereGeometry(0.85, 16, 16), leavesMat);
  foliage1.position.y = 1.8;
  foliage1.castShadow = true;
  g.add(foliage1);

  const foliage2 = new THREE.Mesh(new THREE.SphereGeometry(0.65, 14, 14), leavesMat);
  foliage2.position.set(0.4, 2.2, 0.2);
  g.add(foliage2);

  return g;
}

export function createBuilding3D(roofColor: number, wallColor: number, width = 3.4, height = 2.2, depth = 2.4): THREE.Group {
  const g = new THREE.Group();
  const wallMat = new THREE.MeshStandardMaterial({ color: wallColor, roughness: 0.65 });
  const roofMat = new THREE.MeshStandardMaterial({ color: roofColor, roughness: 0.55 });
  const doorMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.6 });
  const winMat = new THREE.MeshStandardMaterial({ color: 0xbae6fd, roughness: 0.25 });

  const base = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), wallMat);
  base.position.y = height / 2;
  base.castShadow = true;
  base.receiveShadow = true;
  g.add(base);

  const roof = new THREE.Mesh(new THREE.ConeGeometry(width * 0.78, 1.25, 4), roofMat);
  roof.position.y = height + 0.62;
  roof.rotation.y = Math.PI / 4;
  roof.castShadow = true;
  g.add(roof);

  const door = new THREE.Mesh(new THREE.BoxGeometry(0.75, 1.35, 0.1), doorMat);
  door.position.set(0, 0.68, depth / 2 + 0.02);
  g.add(door);

  const winL = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.65, 0.1), winMat);
  winL.position.set(-width * 0.28, 1.2, depth / 2 + 0.02);
  g.add(winL);

  const winR = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.65, 0.1), winMat);
  winR.position.set(width * 0.28, 1.2, depth / 2 + 0.02);
  g.add(winR);

  return g;
}

export function createCloud3D(): THREE.Group {
  const g = new THREE.Group();
  const cloudMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 });
  const p1 = new THREE.Mesh(new THREE.SphereGeometry(0.7, 12, 12), cloudMat);
  const p2 = new THREE.Mesh(new THREE.SphereGeometry(0.55, 12, 12), cloudMat);
  p2.position.set(-0.6, -0.1, 0.1);
  const p3 = new THREE.Mesh(new THREE.SphereGeometry(0.5, 12, 12), cloudMat);
  p3.position.set(0.6, -0.12, -0.1);
  g.add(p1, p2, p3);
  return g;
}

export function createFlowerCluster3D(petalColor = 0xf43f5e): THREE.Group {
  const g = new THREE.Group();
  const stemMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.7 });
  const petalMat = new THREE.MeshStandardMaterial({ color: petalColor, roughness: 0.4 });
  const centerMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.4 });

  [
    [-0.22, 0],
    [0.2, 0.18],
    [0, -0.2]
  ].forEach(([fx, fz]) => {
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.28, 6), stemMat);
    stem.position.set(fx, 0.14, fz);
    g.add(stem);

    const blossom = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.08, 0.06, 8), petalMat);
    blossom.position.set(fx, 0.29, fz);
    g.add(blossom);

    const core = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), centerMat);
    core.position.set(fx, 0.32, fz);
    g.add(core);
  });

  return g;
}

