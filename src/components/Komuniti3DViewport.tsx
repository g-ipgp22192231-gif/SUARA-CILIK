import React, { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  AvatarGender,
  LearningRoute,
  MissionId,
  MovementPace
} from '../types/game';
import {
  createAvatarMesh,
  createBall3D,
  createBook3D,
  createBoxParcel3D,
  createBroom3D,
  createBuilding3D,
  createCloud3D,
  createFlowerCluster3D,
  createPencil3D,
  createPlasticBottle3D,
  createRecycleBin3D,
  createTree3D
} from './threeBuilders';

export interface SceneHotspot {
  id: string;
  label: string;
  position: [number, number, number];
  completed?: boolean;
  activeHighlight?: boolean;
}

interface Komuniti3DViewportProps {
  avatar: AvatarGender;
  missionId: MissionId;
  route: LearningRoute;
  isTravelling: boolean;
  targetRunStars: number;
  onStartTravelRun: () => void;
  onFinishTravel: () => void;
  pace: MovementPace;
  onChangePace: (pace: MovementPace) => void;
  runnerStarsCollected: number;
  onCollectRunnerStar: (amount: number) => void;
  reducedMotion: boolean;
  lowPerformance: boolean;
  heldItem: 'tiada' | 'buku' | 'kotak' | 'bungkusan' | 'penyapu' | 'botol';
  hotspots: SceneHotspot[];
  onInteractHotspot: (hotspotId: string) => void;
  statusBannerText: string;
  destinationName: string;
  children?: React.ReactNode;
}

const SENARAI_KATA_MOTIVASI = [
  'Buku',
  'Kotak',
  'Penyapu',
  'Botol',
  'Rumah',
  'Kedai',
  'Taman',
  'Syabas!',
  'Hebat!',
  'Teruskan!'
];

// Musical chime sound effect for star collection (Web Audio API tone, zero speech)
function playStarCollectChime(isBonus = false) {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = isBonus ? 'triangle' : 'sine';
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(isBonus ? 659.25 : 523.25, now);
    osc.frequency.exponentialRampToValueAtTime(isBonus ? 1046.5 : 783.99, now + 0.14);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.23);
    window.setTimeout(() => {
      ctx.close().catch(() => {});
    }, 300);
  } catch {
    // ignore audio context restriction
  }
}

// Celebratory fanfare when target stars are reached and checkpoint unlocks automatically
function playCheckpointUnlockedFanfare() {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      const startTime = ctx.currentTime + idx * 0.11;
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.14, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.28);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.3);
    });
    window.setTimeout(() => {
      ctx.close().catch(() => {});
    }, 1000);
  } catch {
    // ignore
  }
}

export const Komuniti3DViewport: React.FC<Komuniti3DViewportProps> = ({
  avatar,
  missionId,
  isTravelling,
  targetRunStars,
  onStartTravelRun,
  onFinishTravel,
  pace,
  onChangePace,
  runnerStarsCollected,
  onCollectRunnerStar,
  reducedMotion,
  lowPerformance,
  heldItem,
  hotspots,
  onInteractHotspot,
  statusBannerText,
  destinationName,
  children
}) => {
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const [webglUnavailable, setWebglUnavailable] = useState(false);
  const [laneIndex, setLaneIndex] = useState<number>(1);
  const [autoWalk, setAutoWalk] = useState<boolean>(true);
  const [sessionStars, setSessionStars] = useState<number>(0);
  const [isUnlockingCheckpoint, setIsUnlockingCheckpoint] = useState<boolean>(false);
  const [recentPickupToast, setRecentPickupToast] = useState<string | null>(null);
  const [avatarTargetPos, setAvatarTargetPos] = useState<[number, number, number]>([0, 0, 2.6]);
  const [nearestHotspot, setNearestHotspot] = useState<SceneHotspot | null>(null);

  const laneXValues = [-1.95, 0, 1.95];
  const avatarPosRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 2.6));
  const targetPosRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 2.6));
  const laneRef = useRef<number>(1);
  const jumpVelocityRef = useRef<number>(0);
  const jumpHeightRef = useRef<number>(0);
  const isJumpingRef = useRef<boolean>(false);
  const autoWalkRef = useRef<boolean>(true);
  const sessionStarsRef = useRef<number>(0);
  const targetStarsRef = useRef<number>(targetRunStars);
  const unlockTriggeredRef = useRef<boolean>(false);
  const heldItemRef = useRef(heldItem);
  const onInteractRef = useRef(onInteractHotspot);
  const onCollectStarRef = useRef(onCollectRunnerStar);
  const onFinishTravelRef = useRef(onFinishTravel);
  const hotspotsRef = useRef(hotspots);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    laneRef.current = laneIndex;
  }, [laneIndex]);

  useEffect(() => {
    autoWalkRef.current = autoWalk;
  }, [autoWalk]);

  useEffect(() => {
    targetStarsRef.current = targetRunStars;
  }, [targetRunStars]);

  useEffect(() => {
    heldItemRef.current = heldItem;
  }, [heldItem]);

  useEffect(() => {
    onInteractRef.current = onInteractHotspot;
  }, [onInteractHotspot]);

  useEffect(() => {
    onCollectStarRef.current = onCollectRunnerStar;
  }, [onCollectRunnerStar]);

  useEffect(() => {
    onFinishTravelRef.current = onFinishTravel;
  }, [onFinishTravel]);

  useEffect(() => {
    hotspotsRef.current = hotspots;
  }, [hotspots]);

  const triggerJump = useCallback(() => {
    if (!isJumpingRef.current) {
      isJumpingRef.current = true;
      jumpVelocityRef.current = 7.2;
    }
  }, []);

  useEffect(() => {
    const startPos: [number, number, number] = [0, 0, 2.8];
    setAvatarTargetPos(startPos);
    avatarPosRef.current.set(startPos[0], startPos[1], startPos[2]);
    targetPosRef.current.set(startPos[0], startPos[1], startPos[2]);
    setLaneIndex(1);
    jumpHeightRef.current = 0;
    jumpVelocityRef.current = 0;
    isJumpingRef.current = false;
    if (isTravelling) {
      setSessionStars(0);
      sessionStarsRef.current = 0;
      unlockTriggeredRef.current = false;
      setIsUnlockingCheckpoint(false);
      setRecentPickupToast(null);
      setAutoWalk(true);
    }
  }, [missionId, isTravelling]);

  const handleAddSessionStars = useCallback((value: number, isBonus: boolean) => {
    if (unlockTriggeredRef.current) return;

    playStarCollectChime(isBonus);
    onCollectStarRef.current(value);

    const nextCount = sessionStarsRef.current + value;
    sessionStarsRef.current = nextCount;
    setSessionStars(nextCount);

    const randomWord =
      SENARAI_KATA_MOTIVASI[nextCount % SENARAI_KATA_MOTIVASI.length];
    setRecentPickupToast(
      isBonus ? `+${value} 🌟 ${randomWord}` : `+${value} ⭐`
    );

    if (nextCount >= targetStarsRef.current && !unlockTriggeredRef.current) {
      unlockTriggeredRef.current = true;
      setIsUnlockingCheckpoint(true);
      playCheckpointUnlockedFanfare();
      window.setTimeout(() => {
        onFinishTravelRef.current();
      }, 1400);
    }
  }, []);

  const handleAddSessionStarsRef = useRef(handleAddSessionStars);
  useEffect(() => {
    handleAddSessionStarsRef.current = handleAddSessionStars;
  }, [handleAddSessionStars]);

  const paceSpeed = pace === 'perlahan' ? 0.62 : pace === 'pantas' ? 1.35 : 0.95;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) return;

      if (isTravelling) {
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
          e.preventDefault();
          setLaneIndex((prev) => Math.max(0, prev - 1));
        } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
          e.preventDefault();
          setLaneIndex((prev) => Math.min(2, prev + 1));
        } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === ' ') {
          e.preventDefault();
          triggerJump();
        }
      } else {
        const step = 0.75;
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
          e.preventDefault();
          moveAvatarBy(-step, 0);
        } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
          e.preventDefault();
          moveAvatarBy(step, 0);
        } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
          e.preventDefault();
          moveAvatarBy(0, -step);
        } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
          e.preventDefault();
          moveAvatarBy(0, step);
        } else if (e.key === ' ' || e.key === 'Enter') {
          if (nearestHotspot) {
            e.preventDefault();
            onInteractRef.current(nearestHotspot.id);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTravelling, nearestHotspot, triggerJump]);

  const moveAvatarBy = (dx: number, dz: number) => {
    const nx = Math.max(-4.2, Math.min(4.2, targetPosRef.current.x + dx));
    const nz = Math.max(-3.2, Math.min(3.5, targetPosRef.current.z + dz));
    targetPosRef.current.set(nx, 0, nz);
    setAvatarTargetPos([nx, 0, nz]);
  };

  const moveAvatarToHotspot = (hotspot: SceneHotspot) => {
    const [hx, , hz] = hotspot.position;
    const stopZ = hz + 0.85;
    targetPosRef.current.set(hx, 0, stopZ);
    setAvatarTargetPos([hx, 0, stopZ]);
    onInteractHotspot(hotspot.id);
  };

  useEffect(() => {
    if (isTravelling || hotspots.length === 0) {
      setNearestHotspot(null);
      return;
    }
    let best: SceneHotspot | null = null;
    let minDist = Infinity;
    for (const h of hotspots) {
      const dx = h.position[0] - avatarTargetPos[0];
      const dz = h.position[2] - avatarTargetPos[2];
      const d = Math.hypot(dx, dz);
      if (d < minDist) {
        minDist = d;
        best = h;
      }
    }
    setNearestHotspot(best);
  }, [avatarTargetPos, hotspots, isTravelling]);

  // Main Three.js Scene Effect
  useEffect(() => {
    if (lowPerformance) return;
    const container = canvasContainerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer | null = null;
    let animId = 0;

    try {
      const width = container.clientWidth || 960;
      const height = container.clientHeight || 580;

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xbae6fd);
      scene.fog = new THREE.FogExp2(0xbae6fd, 0.018);

      const camera = new THREE.PerspectiveCamera(46, width / height, 0.1, 120);
      camera.position.set(0, 4.3, 7.8);
      camera.lookAt(0, 1.0, 0);

      renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'default' });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;

      container.innerHTML = '';
      container.appendChild(renderer.domElement);

      const onContextLost = (event: Event) => {
        event.preventDefault();
        setWebglUnavailable(true);
      };
      renderer.domElement.addEventListener('webglcontextlost', onContextLost);

      const ambient = new THREE.AmbientLight(0xffffff, 0.84);
      scene.add(ambient);

      const sun = new THREE.DirectionalLight(0xfffbeb, 1.25);
      sun.position.set(6, 12, 8);
      sun.castShadow = true;
      sun.shadow.mapSize.width = 1024;
      sun.shadow.mapSize.height = 1024;
      scene.add(sun);

      const fill = new THREE.DirectionalLight(0xbae6fd, 0.45);
      fill.position.set(-6, 5, -4);
      scene.add(fill);

      const grassMat = new THREE.MeshStandardMaterial({ color: 0x4ade80, roughness: 0.85 });
      const ground = new THREE.Mesh(new THREE.PlaneGeometry(90, 90), grassMat);
      ground.rotation.x = -Math.PI / 2;
      ground.receiveShadow = true;
      scene.add(ground);

      [
        [-5.5, 4.8, -10],
        [0.5, 5.4, -14],
        [5.8, 4.6, -9]
      ].forEach(([cx, cy, cz]) => {
        const cloud = createCloud3D();
        cloud.position.set(cx, cy, cz);
        scene.add(cloud);
      });

      const flowerPalette = [0xf43f5e, 0xf59e0b, 0xa855f7, 0xec4899];
      [
        [-4.5, 1.2],
        [-4.8, -1.8],
        [4.5, 1.2],
        [4.8, -1.8]
      ].forEach(([fx, fz], idx) => {
        const flowers = createFlowerCluster3D(flowerPalette[idx % flowerPalette.length]);
        flowers.position.set(fx, 0, fz);
        scene.add(flowers);
      });

      const playerAvatar = createAvatarMesh(avatar);
      playerAvatar.position.copy(avatarPosRef.current);
      scene.add(playerAvatar);

      const carryAnchor = playerAvatar.getObjectByName('carryAnchor');
      if (carryAnchor) {
        carryAnchor.clear();
        if (heldItem === 'buku') {
          const b = createBook3D();
          b.scale.setScalar(0.75);
          carryAnchor.add(b);
        } else if (heldItem === 'kotak' || heldItem === 'bungkusan') {
          const box = createBoxParcel3D();
          box.scale.setScalar(0.68);
          box.position.y = -0.2;
          carryAnchor.add(box);
        } else if (heldItem === 'penyapu') {
          const br = createBroom3D();
          br.scale.setScalar(0.75);
          br.position.set(0.25, -0.35, 0);
          carryAnchor.add(br);
        } else if (heldItem === 'botol') {
          const bt = createPlasticBottle3D();
          bt.scale.setScalar(0.8);
          bt.position.y = -0.15;
          carryAnchor.add(bt);
        }
      }

      const clickableMeshes: { mesh: THREE.Object3D; hotspotId: string }[] = [];
      const registerClickable = (obj: THREE.Object3D, hotspotId: string) => {
        obj.userData.hotspotId = hotspotId;
        clickableMeshes.push({ mesh: obj, hotspotId });
      };

      const movingSceneryGroup = new THREE.Group();
      scene.add(movingSceneryGroup);

      interface CollectibleToken {
        mesh: THREE.Group;
        lane: number;
        z: number;
        baseY: number;
        isBonus: boolean;
        collected: boolean;
      }
      const collectibles: CollectibleToken[] = [];

      if (isTravelling) {
        const roadMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.78 });
        const road = new THREE.Mesh(new THREE.PlaneGeometry(6.5, 90), roadMat);
        road.rotation.x = -Math.PI / 2;
        road.position.set(0, 0.02, -28);
        road.receiveShadow = true;
        scene.add(road);

        const laneColors = [0x38bdf8, 0x34d399, 0xfbbf24];
        laneXValues.forEach((lx, idx) => {
          const guideMat = new THREE.MeshStandardMaterial({
            color: laneColors[idx],
            roughness: 0.6,
            transparent: true,
            opacity: 0.2
          });
          const guideStrip = new THREE.Mesh(new THREE.PlaneGeometry(1.55, 90), guideMat);
          guideStrip.rotation.x = -Math.PI / 2;
          guideStrip.position.set(lx, 0.025, -28);
          scene.add(guideStrip);
        });

        const walkMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.7 });
        const leftWalk = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.14, 90), walkMat);
        leftWalk.position.set(-3.9, 0.07, -28);
        scene.add(leftWalk);

        const rightWalk = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.14, 90), walkMat);
        rightWalk.position.set(3.9, 0.07, -28);
        scene.add(rightWalk);

        const stripeMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.5 });

        for (let i = 0; i < 18; i++) {
          const zPos = 4 - i * 4.2;
          const s1 = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 1.8), stripeMat);
          s1.rotation.x = -Math.PI / 2;
          s1.position.set(-0.98, 0.03, zPos);
          movingSceneryGroup.add(s1);

          const s2 = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 1.8), stripeMat);
          s2.rotation.x = -Math.PI / 2;
          s2.position.set(0.98, 0.03, zPos);
          movingSceneryGroup.add(s2);

          if (i % 2 === 0) {
            const treeL = createTree3D();
            treeL.position.set(-5.6, 0, zPos);
            movingSceneryGroup.add(treeL);

            const treeR = createTree3D();
            treeR.position.set(5.6, 0, zPos);
            movingSceneryGroup.add(treeR);
          }
        }

        const goldMat = new THREE.MeshStandardMaterial({
          color: 0xfacc15,
          roughness: 0.2,
          metalness: 0.55,
          emissive: 0xca8a04,
          emissiveIntensity: 0.3
        });
        const ringMat = new THREE.MeshStandardMaterial({
          color: 0xfef08a,
          roughness: 0.3
        });
        const bonusMat = new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          roughness: 0.15,
          metalness: 0.65,
          emissive: 0x0284c7,
          emissiveIntensity: 0.4
        });
        const hurdleMat = new THREE.MeshStandardMaterial({
          color: 0xf97316,
          roughness: 0.4
        });

        for (let i = 0; i < 24; i++) {
          const streakGroupIndex = Math.floor(i / 3);
          const lane = streakGroupIndex % 3;
          const isBonus = i % 6 === 5;
          const baseY = isBonus ? 1.75 : 0.85;
          const zStart = -2.5 - i * 2.45;

          const tokenGroup = new THREE.Group();
          const core = new THREE.Mesh(
            new THREE.OctahedronGeometry(isBonus ? 0.42 : 0.33, 0),
            isBonus ? bonusMat : goldMat
          );
          core.castShadow = true;
          tokenGroup.add(core);

          const halo = new THREE.Mesh(
            new THREE.TorusGeometry(isBonus ? 0.48 : 0.39, 0.045, 8, 20),
            ringMat
          );
          tokenGroup.add(halo);

          if (isBonus) {
            const bar = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.26, 0.22), hurdleMat);
            bar.position.y = -1.35;
            tokenGroup.add(bar);
          }

          tokenGroup.position.set(laneXValues[lane], baseY, zStart);
          scene.add(tokenGroup);

          collectibles.push({
            mesh: tokenGroup,
            lane,
            z: zStart,
            baseY,
            isBonus,
            collected: false
          });
        }

        const destBuilding = createBuilding3D(0x059669, 0xfef3c7, 4.8, 2.8, 2.8);
        destBuilding.name = 'destBuilding';
        destBuilding.position.set(0, 0, -48);
        scene.add(destBuilding);

        playerAvatar.position.set(laneXValues[laneRef.current], 0, 2.5);
        playerAvatar.rotation.y = Math.PI;
      } else {
        const pathMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.75 });
        const courtyard = new THREE.Mesh(new THREE.PlaneGeometry(11, 8.5), pathMat);
        courtyard.rotation.x = -Math.PI / 2;
        courtyard.position.set(0, 0.02, 0.2);
        courtyard.receiveShadow = true;
        scene.add(courtyard);

        const bgTreeL = createTree3D();
        bgTreeL.position.set(-5.2, 0, -3.2);
        scene.add(bgTreeL);

        const bgTreeR = createTree3D();
        bgTreeR.position.set(5.2, 0, -3.2);
        scene.add(bgTreeR);

        if (missionId === 'percubaan') {
          const tableMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.65 });
          const tableTop = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.14, 1.3), tableMat);
          tableTop.position.set(-1.3, 0.82, -0.8);
          tableTop.castShadow = true;
          scene.add(tableTop);

          const legGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.82, 8);
          [
            [-2.7, 0.41, -1.3],
            [0.1, 0.41, -1.3],
            [-2.7, 0.41, -0.3],
            [0.1, 0.41, -0.3]
          ].forEach(([lx, ly, lz]) => {
            const leg = new THREE.Mesh(legGeo, tableMat);
            leg.position.set(lx, ly, lz);
            scene.add(leg);
          });

          if (heldItem !== 'buku') {
            const book = createBook3D();
            book.position.set(-2.3, 0.96, -0.8);
            scene.add(book);
            registerClickable(book, 'buku');
          }

          const ball = createBall3D();
          ball.position.set(-1.3, 1.18, -0.8);
          scene.add(ball);
          registerClickable(ball, 'bola');

          const pencil = createPencil3D();
          pencil.position.set(-0.3, 0.96, -0.8);
          scene.add(pencil);
          registerClickable(pencil, 'pensel');

          const cikguSara = createAvatarMesh('perempuan', 0x059669);
          cikguSara.position.set(2.4, 0, -1.1);
          scene.add(cikguSara);
          registerClickable(cikguSara, 'cikgu_sara');
        } else if (missionId === 'misi1') {
          const rumahJiran = createBuilding3D(0xdc2626, 0xfef3c7, 3.8, 2.3, 2.4);
          rumahJiran.position.set(2.1, 0, -2.2);
          scene.add(rumahJiran);
          registerClickable(rumahJiran, 'rumah_jiran');

          const puanSalmah = createAvatarMesh('perempuan', 0xdb2777);
          puanSalmah.position.set(-0.6, 0, -1.4);
          scene.add(puanSalmah);
          registerClickable(puanSalmah, 'puan_salmah');

          if (heldItem !== 'kotak') {
            const kotak = createBoxParcel3D();
            kotak.position.set(-2.3, 0, -0.4);
            scene.add(kotak);
            registerClickable(kotak, 'kotak');
          }
        } else if (missionId === 'misi2') {
          const kedai = createBuilding3D(0x0284c7, 0xffffff, 3.2, 2.2, 2.2);
          kedai.position.set(-2.6, 0, -2.2);
          scene.add(kedai);

          const encikChong = createAvatarMesh('lelaki', 0x0284c7);
          encikChong.position.set(-2.4, 0, -0.6);
          scene.add(encikChong);
          registerClickable(encikChong, 'encik_chong');

          const bungkusan = createBoxParcel3D();
          bungkusan.position.set(-1.3, 0, -0.7);
          scene.add(bungkusan);
          registerClickable(bungkusan, 'bungkusan');

          const rumahAisyah = createBuilding3D(0x7c3aed, 0xf5f3ff, 3.0, 2.1, 2.2);
          rumahAisyah.position.set(2.6, 0, -2.2);
          scene.add(rumahAisyah);

          const puanAisyah = createAvatarMesh('perempuan', 0x7c3aed);
          puanAisyah.position.set(2.4, 0, -0.6);
          scene.add(puanAisyah);
          registerClickable(puanAisyah, 'puan_aisyah');
        } else if (missionId === 'misi3') {
          const aiman = createAvatarMesh('lelaki', 0x16a34a);
          aiman.position.set(0, 0, -1.5);
          scene.add(aiman);
          registerClickable(aiman, 'aiman');

          if (heldItem !== 'penyapu') {
            const penyapu = createBroom3D();
            penyapu.position.set(-2.4, 0, -0.5);
            scene.add(penyapu);
            registerClickable(penyapu, 'penyapu');
          }

          const bola = createBall3D();
          bola.position.set(0, 0.32, 0.2);
          scene.add(bola);
          registerClickable(bola, 'bola');

          const buku = createBook3D();
          buku.position.set(2.3, 0.1, -0.5);
          scene.add(buku);
          registerClickable(buku, 'buku');
        } else if (missionId === 'misi4') {
          const pondok = createBuilding3D(0xb45309, 0xfef3c7, 2.0, 1.6, 1.8);
          pondok.position.set(-3.1, 0, -2.1);
          scene.add(pondok);

          const penyapuPondok = createBroom3D();
          penyapuPondok.position.set(-2.3, 0, -0.9);
          scene.add(penyapuPondok);
          registerClickable(penyapuPondok, 'pondok_penyapu');

          const playArchMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.4 });
          const playGroup = new THREE.Group();
          const pLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1.8, 10), playArchMat);
          pLeft.position.set(-0.6, 0.9, 0);
          const pRight = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1.8, 10), playArchMat);
          pRight.position.set(0.6, 0.9, 0);
          const pTop = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.2, 0.2), playArchMat);
          pTop.position.set(0, 1.8, 0);
          playGroup.add(pLeft, pRight, pTop);
          playGroup.position.set(-0.6, 0, -1.6);
          scene.add(playGroup);
          registerClickable(playGroup, 'taman_permainan');

          const benchMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.6 });
          const bench = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.45, 0.55), benchMat);
          bench.position.set(1.3, 0.23, -1.3);
          scene.add(bench);

          const bottle = createPlasticBottle3D();
          bottle.position.set(1.3, 0, -0.5);
          scene.add(bottle);
          registerClickable(bottle, 'bangku_botol');

          const bin = createRecycleBin3D();
          bin.position.set(3.1, 0, -1.0);
          scene.add(bin);
          registerClickable(bin, 'tong_kitar_semula');
        } else if (missionId === 'misi5') {
          const balai = createBuilding3D(0x0f766e, 0xffffff, 4.8, 2.5, 2.4);
          balai.position.set(0, 0, -2.6);
          scene.add(balai);

          const tokRazak = createAvatarMesh('lelaki', 0x0f766e);
          tokRazak.position.set(0, 0, -0.9);
          scene.add(tokRazak);
          registerClickable(tokRazak, 'tok_razak');

          const boardColors = [0xd97706, 0x0284c7, 0x16a34a, 0x9333ea];
          [-3.2, -1.5, 1.5, 3.2].forEach((bx, idx) => {
            const boardMat = new THREE.MeshStandardMaterial({ color: boardColors[idx], roughness: 0.4 });
            const board = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.2, 0.15), boardMat);
            board.position.set(bx, 0.9, -0.8);
            board.castShadow = true;
            scene.add(board);
            registerClickable(board, `stesen_${idx + 1}`);
          });
        }
      }

      const raycaster = new THREE.Raycaster();
      const pointer = new THREE.Vector2();

      const handlePointerDown = (e: MouseEvent) => {
        if (isTravelling || !renderer) return;
        const rect = renderer.domElement.getBoundingClientRect();
        pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(pointer, camera);
        const roots = clickableMeshes.map((c) => c.mesh);
        const intersects = raycaster.intersectObjects(roots, true);
        if (intersects.length > 0) {
          let obj: THREE.Object3D | null = intersects[0].object;
          while (obj) {
            if (obj.userData && obj.userData.hotspotId) {
              const foundId = obj.userData.hotspotId as string;
              const hs = hotspotsRef.current.find((h) => h.id === foundId);
              if (hs) {
                targetPosRef.current.set(hs.position[0], 0, hs.position[2] + 0.85);
                setAvatarTargetPos([hs.position[0], 0, hs.position[2] + 0.85]);
              }
              onInteractRef.current(foundId);
              break;
            }
            obj = obj.parent;
          }
        }
      };

      renderer.domElement.addEventListener('click', handlePointerDown);

      const clock = new THREE.Clock();

      const animate = () => {
        animId = window.requestAnimationFrame(animate);
        const dt = Math.min(clock.getDelta(), 0.1);
        const elapsed = clock.getElapsedTime();

        if (isTravelling) {
          const desiredX = laneXValues[laneRef.current] ?? 0;
          playerAvatar.position.x = THREE.MathUtils.lerp(playerAvatar.position.x, desiredX, dt * 10);
          camera.position.x = THREE.MathUtils.lerp(camera.position.x, playerAvatar.position.x * 0.45, dt * 5);

          if (isJumpingRef.current) {
            jumpHeightRef.current += jumpVelocityRef.current * dt;
            jumpVelocityRef.current -= 16.5 * dt;
            if (jumpHeightRef.current <= 0) {
              jumpHeightRef.current = 0;
              jumpVelocityRef.current = 0;
              isJumpingRef.current = false;
            }
          }

          const isMovingNow = autoWalkRef.current && !unlockTriggeredRef.current;
          const forwardSpeed = isMovingNow ? 8.2 * paceSpeed : 0;

          if (!reducedMotion) {
            const walkPhase = elapsed * 9 * paceSpeed;
            const bounceY = isMovingNow ? Math.abs(Math.sin(walkPhase)) * 0.13 : 0;
            playerAvatar.position.y = jumpHeightRef.current + bounceY;

            const lLeg = playerAvatar.getObjectByName('leftLeg');
            const rLeg = playerAvatar.getObjectByName('rightLeg');
            const lArm = playerAvatar.getObjectByName('leftArm');
            const rArm = playerAvatar.getObjectByName('rightArm');
            if (lLeg) lLeg.rotation.x = isMovingNow ? Math.sin(walkPhase) * 0.68 : 0;
            if (rLeg) rLeg.rotation.x = isMovingNow ? -Math.sin(walkPhase) * 0.68 : 0;
            if (lArm) lArm.rotation.x = isMovingNow ? -Math.sin(walkPhase) * 0.58 : 0;
            if (rArm) rArm.rotation.x = isMovingNow ? Math.sin(walkPhase) * 0.58 : 0;

            if (isMovingNow) {
              movingSceneryGroup.position.z = (movingSceneryGroup.position.z + forwardSpeed * dt) % 8.4;
            }
          } else {
            playerAvatar.position.y = jumpHeightRef.current;
          }

          for (const item of collectibles) {
            item.mesh.rotation.y += dt * 3.0;
            if (isMovingNow) {
              item.z += forwardSpeed * dt;
            }
            item.mesh.position.z = item.z;

            if (!item.collected && !unlockTriggeredRef.current) {
              const dz = Math.abs(item.z - 2.5);
              const dx = Math.abs(laneXValues[item.lane] - playerAvatar.position.x);
              const avatarReachY = playerAvatar.position.y + 1.0;
              const dy = Math.abs(item.baseY - avatarReachY);

              if (dz < 0.8 && dx < 0.78 && dy < 1.1) {
                item.collected = true;
                item.mesh.visible = false;
                const value = item.isBonus ? 3 : 1;
                handleAddSessionStarsRef.current(value, item.isBonus);
              }
            }

            if (item.z > 5.5) {
              item.z = -54 - Math.random() * 6;
              item.lane = Math.floor(Math.random() * 3);
              item.collected = false;
              item.mesh.visible = true;
              item.mesh.position.set(laneXValues[item.lane], item.baseY, item.z);
            }
          }

          const destB = scene.getObjectByName('destBuilding');
          if (destB) {
            const starRatio = Math.min(
              1,
              sessionStarsRef.current / Math.max(1, targetStarsRef.current)
            );
            destB.position.z = -46 + starRatio * 39;
          }
        } else {
          const currentPos = avatarPosRef.current;
          const target = targetPosRef.current;
          const dist = currentPos.distanceTo(target);

          if (dist > 0.05) {
            currentPos.lerp(target, Math.min(1, dt * 4.5 * paceSpeed));
            playerAvatar.position.copy(currentPos);

            const angle = Math.atan2(target.x - currentPos.x, target.z - currentPos.z);
            playerAvatar.rotation.y = angle;

            if (!reducedMotion) {
              const walkPhase = elapsed * 8;
              playerAvatar.position.y = Math.abs(Math.sin(walkPhase)) * 0.09;
            }
          } else {
            playerAvatar.position.y = reducedMotion ? 0 : Math.sin(elapsed * 2) * 0.025;
            playerAvatar.rotation.y = THREE.MathUtils.lerp(playerAvatar.rotation.y, 0, dt * 4);
          }
        }

        renderer?.render(scene, camera);
      };

      animate();

      const handleResize = () => {
        if (!container || !renderer) return;
        const w = container.clientWidth || 960;
        const h = container.clientHeight || 580;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        window.cancelAnimationFrame(animId);
        if (renderer) {
          renderer.domElement.removeEventListener('click', handlePointerDown);
          renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
          renderer.dispose();
        }
      };
    } catch {
      setWebglUnavailable(true);
    }
  }, [avatar, missionId, isTravelling, lowPerformance, reducedMotion, heldItem, paceSpeed]);

  const remainingStars = Math.max(0, targetRunStars - sessionStars);
  const starProgressPercent = Math.min(
    100,
    Math.round((sessionStars / Math.max(1, targetRunStars)) * 100)
  );

  return (
    <div className="relative flex flex-col rounded-3xl border-2 border-slate-300/80 bg-slate-900 overflow-hidden shadow-xl">
      {/* Compact Top Game HUD Strip */}
      <div className="z-20 flex flex-wrap items-center justify-between gap-2 bg-slate-900/95 px-4 py-2.5 text-white border-b border-white/10">
        <div className="flex flex-wrap items-center gap-2 text-sm font-bold">
          <span className="inline-block h-3 w-3 rounded-full bg-emerald-400" aria-hidden="true" />
          <span>📍 {destinationName}</span>
          <span aria-hidden="true" className="text-slate-500">·</span>
          <span className="text-emerald-300">{statusBannerText}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <span className="font-mono-tabular text-xs sm:text-sm font-bold text-amber-300">
            ⭐ {runnerStarsCollected}
          </span>
          {!isTravelling ? (
            <button
              type="button"
              onClick={onStartTravelRun}
              className="min-h-8 rounded-lg bg-amber-400 px-3 py-1 text-xs font-bold text-slate-950 hover:bg-amber-300 transition-colors whitespace-nowrap"
            >
              🏃 Lari Kutip Bintang
            </button>
          ) : (
            <button
              type="button"
              onClick={onFinishTravel}
              className="min-h-7 rounded-md border border-slate-600 bg-slate-800/80 px-2.5 py-0.5 text-[11px] font-medium text-slate-300 hover:bg-slate-700 whitespace-nowrap"
              title="Pintasan Guru"
            >
              Pintasan Guru ➔
            </button>
          )}
          {heldItem !== 'tiada' && (
            <span className="rounded-lg bg-sky-900/80 border border-sky-400/50 px-2.5 py-0.5 text-xs font-bold text-sky-200">
              🎒 {heldItem.toUpperCase()}
            </span>
          )}
        </div>
      </div>

      {/* LARGE FULL-SCREEN 3D GAME VIEWPORT */}
      <div
        className="relative w-full h-[560px] sm:h-[630px] lg:h-[690px] bg-sky-100 select-none overflow-hidden"
        onTouchStart={(e) => {
          if (!isTravelling || e.touches.length === 0) return;
          touchStartRef.current = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY
          };
        }}
        onTouchEnd={(e) => {
          if (!isTravelling || !touchStartRef.current || e.changedTouches.length === 0) return;
          const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
          const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
          if (Math.abs(dx) > 30 && Math.abs(dx) > Math.abs(dy)) {
            if (dx < 0) setLaneIndex((prev) => Math.max(0, prev - 1));
            else setLaneIndex((prev) => Math.min(2, prev + 1));
          } else if (dy < -30) {
            triggerJump();
          }
          touchStartRef.current = null;
        }}
      >
        {lowPerformance || webglUnavailable ? (
          <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-b from-sky-200 to-emerald-200 p-6 text-center">
            <p className="text-lg font-bold text-slate-900">
              📍 {destinationName}
            </p>
            {isTravelling && (
              <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => handleAddSessionStars(1, false)}
                  className="min-h-12 rounded-xl bg-amber-400 px-5 py-2.5 text-sm font-bold text-slate-950 hover:bg-amber-300"
                >
                  ⭐ +1 Bintang
                </button>
                <button
                  type="button"
                  onClick={() => handleAddSessionStars(3, true)}
                  className="min-h-12 rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-sky-400"
                >
                  🌟 +3 Permata
                </button>
              </div>
            )}
          </div>
        ) : (
          <div
            ref={canvasContainerRef}
            className="h-full w-full cursor-pointer"
            aria-label={`Pentas 3D Komuniti Harmoni di ${destinationName}`}
          />
        )}

        {/* Celebratory Banner when Target Stars Reached */}
        {isTravelling && isUnlockingCheckpoint && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-6 text-center">
            <div className="max-w-md rounded-3xl border-4 border-amber-300 bg-emerald-800 p-6 text-white shadow-2xl space-y-2">
              <p className="text-sm font-bold text-amber-300">🎉 TAHNIAH!</p>
              <h3 className="text-2xl font-bold">
                ⭐ {targetRunStars} / {targetRunStars} Cukup!
              </h3>
              <p className="text-sm font-semibold text-emerald-100">
                Masuk ke {destinationName}...
              </p>
            </div>
          </div>
        )}

        {/* RUNNER MODE HUD (Minimal Words, Big Icons!) */}
        {isTravelling && (
          <>
            <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
              <div className="rounded-2xl bg-slate-900/90 backdrop-blur-xs px-4 py-2 text-white border-2 border-amber-400/60 pointer-events-auto flex items-center gap-3 shadow-lg">
                <span className="font-mono-tabular text-base sm:text-lg font-bold text-amber-300">
                  ⭐ {sessionStars} / {targetRunStars}
                </span>
                {recentPickupToast && (
                  <span className="text-xs sm:text-sm font-bold text-emerald-300">
                    {recentPickupToast}
                  </span>
                )}
              </div>

              <div className="rounded-2xl bg-slate-900/90 backdrop-blur-xs px-3 py-1.5 text-white border border-white/15 pointer-events-auto flex items-center gap-1.5 shadow-lg">
                {(['perlahan', 'sederhana', 'pantas'] as MovementPace[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => onChangePace(p)}
                    className={`rounded-xl px-3 py-1 text-xs font-bold transition-colors ${
                      pace === p
                        ? 'bg-emerald-400 text-slate-950'
                        : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                    }`}
                  >
                    {p === 'perlahan' ? '🐢 Perlahan' : p === 'sederhana' ? '🚶 Sederhana' : '🚀 Laju'}
                  </button>
                ))}
              </div>
            </div>

            <div className="absolute inset-x-3 bottom-3 z-20 rounded-2xl bg-slate-900/92 backdrop-blur-md p-3.5 text-white border border-white/15 space-y-3 shadow-xl">
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs sm:text-sm font-bold text-amber-300">
                    {remainingStars > 0
                      ? `🏃 Kumpul ${remainingStars} ⭐ lagi ke ${destinationName}!`
                      : `🏁 Cukup! Masuk ke ${destinationName}...`}
                  </span>
                  <span className="font-mono-tabular text-xs font-bold text-emerald-300">
                    {starProgressPercent}%
                  </span>
                </div>
                <div className="h-3.5 w-full overflow-hidden rounded-full bg-slate-700 p-0.5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-200"
                    style={{ width: `${starProgressPercent}%` }}
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setLaneIndex((prev) => Math.max(0, prev - 1))}
                    className="min-h-12 rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-sky-500 active:scale-95 transition-all whitespace-nowrap"
                  >
                    ◀ Kiri
                  </button>
                  <button
                    type="button"
                    onClick={triggerJump}
                    className="min-h-12 rounded-xl bg-amber-400 px-5 py-2.5 text-sm font-bold text-slate-950 hover:bg-amber-300 active:scale-95 transition-all whitespace-nowrap"
                  >
                    ▲ Lompat (+3 🌟)
                  </button>
                  <button
                    type="button"
                    onClick={() => setLaneIndex((prev) => Math.min(2, prev + 1))}
                    className="min-h-12 rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-sky-500 active:scale-95 transition-all whitespace-nowrap"
                  >
                    Kanan ▶
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setAutoWalk((v) => !v)}
                  className="min-h-12 rounded-xl border border-slate-500 bg-slate-800 px-4 py-2 text-xs font-bold text-slate-100 hover:bg-slate-700 whitespace-nowrap"
                >
                  {autoWalk ? '⏸ Jeda' : '▶ Lari'}
                </button>
              </div>
            </div>
          </>
        )}

        {/* IN-LOCATION INTEGRATED MISSION HUD OVERLAY (Children rendered right inside the 3D screen!) */}
        {!isTravelling && children && (
          <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-between p-3 sm:p-4 overflow-y-auto">
            {children}
          </div>
        )}
      </div>

      {/* Bottom Compact 3D Movement & Object Quick-Click Bar inside Mission Location */}
      {!isTravelling && (
        <div className="z-20 bg-slate-900 px-4 py-2.5 text-white border-t border-white/10">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => moveAvatarBy(-0.85, 0)}
                className="min-h-9 rounded-lg bg-slate-800 px-3 py-1 text-xs font-bold text-white hover:bg-slate-700 whitespace-nowrap"
              >
                ◀ Kiri
              </button>
              <button
                type="button"
                onClick={() => moveAvatarBy(0, -0.85)}
                className="min-h-9 rounded-lg bg-slate-800 px-3 py-1 text-xs font-bold text-white hover:bg-slate-700 whitespace-nowrap"
              >
                ▲ Maju
              </button>
              <button
                type="button"
                onClick={() => moveAvatarBy(0, 0.85)}
                className="min-h-9 rounded-lg bg-slate-800 px-3 py-1 text-xs font-bold text-white hover:bg-slate-700 whitespace-nowrap"
              >
                ▼ Undur
              </button>
              <button
                type="button"
                onClick={() => moveAvatarBy(0.85, 0)}
                className="min-h-9 rounded-lg bg-slate-800 px-3 py-1 text-xs font-bold text-white hover:bg-slate-700 whitespace-nowrap"
              >
                Kanan ▶
              </button>
            </div>

            {hotspots.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                {hotspots.map((hs) => (
                  <button
                    key={hs.id}
                    type="button"
                    onClick={() => moveAvatarToHotspot(hs)}
                    className={`min-h-9 rounded-lg px-3 py-1 text-xs font-bold transition-colors whitespace-nowrap ${
                      hs.completed
                        ? 'bg-emerald-800/80 text-emerald-200 border border-emerald-500/50'
                        : hs.activeHighlight
                        ? 'bg-amber-400 text-slate-950 hover:bg-amber-300'
                        : 'bg-emerald-600 text-white hover:bg-emerald-500'
                    }`}
                  >
                    {hs.completed ? `✓ ${hs.label}` : `👆 ${hs.label}`}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
