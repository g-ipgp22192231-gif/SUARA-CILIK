import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { AvatarGender } from '../types/game';
import { createAvatarMesh } from './threeBuilders';

interface ThreeAvatarPreviewProps {
  gender: AvatarGender;
  selected?: boolean;
  reducedMotion?: boolean;
  lowPerformance?: boolean;
  celebrating?: boolean;
  className?: string;
}

export const ThreeAvatarPreview: React.FC<ThreeAvatarPreviewProps> = ({
  gender,
  selected = false,
  reducedMotion = false,
  lowPerformance = false,
  celebrating = false,
  className = 'w-full h-56'
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [webglError, setWebglError] = useState(false);

  useEffect(() => {
    if (lowPerformance) return;
    const container = mountRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer | null = null;
    let animationFrameId = 0;

    try {
      const width = container.clientWidth || 240;
      const height = container.clientHeight || 220;

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(selected ? 0xecfdf5 : 0xf1f5f9);

      const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 50);
      camera.position.set(0, 1.45, 3.6);
      camera.lookAt(0, 1.05, 0);

      renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'default' });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;

      container.innerHTML = '';
      container.appendChild(renderer.domElement);

      const handleContextLost = (e: Event) => {
        e.preventDefault();
        setWebglError(true);
      };
      renderer.domElement.addEventListener('webglcontextlost', handleContextLost);

      // Three-point studio lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
      scene.add(ambientLight);

      const keyLight = new THREE.DirectionalLight(0xfffbeb, 1.15);
      keyLight.position.set(3, 5, 4);
      keyLight.castShadow = true;
      scene.add(keyLight);

      const rimLight = new THREE.DirectionalLight(0xbae6fd, 0.55);
      rimLight.position.set(-3, 3, -3);
      scene.add(rimLight);

      // Pedestal
      const pedestalMat = new THREE.MeshStandardMaterial({
        color: selected ? 0x10b981 : 0xcbd5e1,
        roughness: 0.5
      });
      const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.95, 0.14, 28), pedestalMat);
      pedestal.position.y = -0.07;
      pedestal.receiveShadow = true;
      scene.add(pedestal);

      // Avatar 3D mesh
      const avatarGroup = createAvatarMesh(gender);
      scene.add(avatarGroup);

      const clock = new THREE.Clock();

      const animate = () => {
        animationFrameId = window.requestAnimationFrame(animate);
        const elapsed = clock.getElapsedTime();

        if (!reducedMotion) {
          avatarGroup.rotation.y = Math.sin(elapsed * 1.1) * 0.38;
          const leftArm = avatarGroup.getObjectByName('leftArm');
          const rightArm = avatarGroup.getObjectByName('rightArm');
          if (celebrating) {
            avatarGroup.position.y = Math.abs(Math.sin(elapsed * 4.2)) * 0.16;
            if (rightArm) rightArm.rotation.z = -2.4 + Math.sin(elapsed * 6) * 0.25;
            if (leftArm) leftArm.rotation.z = 2.4 - Math.sin(elapsed * 6) * 0.25;
          } else {
            avatarGroup.position.y = Math.sin(elapsed * 2.2) * 0.03;
            if (rightArm) rightArm.rotation.z = -0.22 + Math.sin(elapsed * 2.5) * 0.08;
          }
        }

        renderer?.render(scene, camera);
      };

      animate();

      const handleResize = () => {
        if (!container || !renderer) return;
        const w = container.clientWidth || 240;
        const h = container.clientHeight || 220;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        window.cancelAnimationFrame(animationFrameId);
        if (renderer) {
          renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
          renderer.dispose();
        }
      };
    } catch {
      setWebglError(true);
    }
  }, [gender, selected, reducedMotion, lowPerformance, celebrating]);

  if (lowPerformance || webglError) {
    return (
      <div
        className={`${className} flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-100 p-4`}
      >
        <svg viewBox="0 0 120 120" className="w-28 h-28" role="img" aria-label={`Avatar ${gender}`}>
          <circle cx="60" cy="60" r="52" fill={selected ? '#D1FAE5' : '#E2E8F0'} />
          <path
            d="M34 102 C34 78 86 78 86 102"
            fill={gender === 'lelaki' ? '#0284C7' : '#059669'}
          />
          {gender === 'perempuan' ? (
            <circle cx="60" cy="50" r="24" fill="#10B981" />
          ) : (
            <path d="M38 48 C38 28 82 28 82 48" fill="#1E293B" />
          )}
          <circle cx="60" cy="52" r="17" fill="#FCD39C" />
          <circle cx="54" cy="50" r="2.5" fill="#0F172A" />
          <circle cx="66" cy="50" r="2.5" fill="#0F172A" />
          <path d="M54 59 Q60 64 66 59" fill="none" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
        <span className="mt-1 text-xs font-medium text-slate-600">
          {gender === 'lelaki' ? 'Wira Cilik Lelaki (Mod Ringkas)' : 'Wira Cilik Perempuan (Mod Ringkas)'}
        </span>
      </div>
    );
  }

  return <div ref={mountRef} className={`${className} overflow-hidden rounded-xl`} />;
};
