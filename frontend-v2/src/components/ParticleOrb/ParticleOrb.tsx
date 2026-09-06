import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { vertexShader, fragmentShader } from '@/shaders/shaders';
import gsap from 'gsap';

interface ParticleOrbProps {
  audioAmplitude: number;
  aiState: number;
  isTextVisible?: boolean;
}

const PARTICLE_COUNT = 80000;

export default function ParticleOrb({ audioAmplitude, aiState, isTextVisible = false }: ParticleOrbProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  
  // GSAP animation targets
  const scaleTarget = useRef({ scale: 1.0 });
  const splitTarget = useRef({ split: 0.0 });
  // Ref to track actual rotation speed so we can smoothly slow it down
  const rotationSpeedRef = useRef(1.0);

  useEffect(() => {
    // Scale down when paused (state 3) or idle (state 0)
    const targetScale = (aiState === 3 || aiState === 0) ? 0.5 : 1.0;
    gsap.killTweensOf(scaleTarget.current);
    gsap.to(scaleTarget.current, {
      scale: targetScale,
      duration: 1.2,
      ease: "power2.inOut"
    });

    // Split open when analyzing multiple topics (state 2)
    const targetSplit = aiState === 2 ? 1.0 : 0.0;
    gsap.killTweensOf(splitTarget.current);
    gsap.to(splitTarget.current, {
      split: targetSplit,
      duration: 1.5,
      ease: "power2.inOut"
    });
  }, [aiState]);

  // Smoothly slow down rotation when text appears, speed back up when gone
  useEffect(() => {
    gsap.to(rotationSpeedRef, {
      current: isTextVisible ? 0.0 : 1.0,
      duration: 1.5,
      ease: "power2.inOut"
    });
  }, [isTextVisible]);

  const { positions, sizes, randoms } = useMemo(() => {
    const count = PARTICLE_COUNT;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const randoms = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      // Hollow spherical shell distribution (Earth-like)
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      const r = 2.5;

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      // Mixed sizes for texture
      sizes[i] = Math.random() * 0.15 + 0.05;

      randoms[i * 3] = Math.random() * 100;
      randoms[i * 3 + 1] = Math.random() * 100;
      randoms[i * 3 + 2] = Math.random() * 100;
    }

    return { positions, sizes, randoms };
  }, []);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uAmplitude: { value: 0 },
    uState: { value: 0 },
    uScale: { value: 1.0 },
    uSplit: { value: 0.0 },
    uColorStart: { value: new THREE.Color('#3b82f6') }, // Deep AI Blue
    uColorEnd: { value: new THREE.Color('#10b981') }    // Matrix Green
  }), []);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      
      // Smooth audio lerping
      materialRef.current.uniforms.uAmplitude.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.uAmplitude.value,
        audioAmplitude,
        0.1
      );
      
      materialRef.current.uniforms.uState.value = aiState;
      
      // Apply GSAP animation values
      materialRef.current.uniforms.uScale.value = scaleTarget.current.scale;
      materialRef.current.uniforms.uSplit.value = splitTarget.current.split;
    }

    if (pointsRef.current) {
      // Rotation controlled by rotationSpeed multiplier
      const speed = rotationSpeedRef.current;
      pointsRef.current.rotation.y += 0.001 * speed;
      pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1 * speed;
    }
  });

  return (
    <group>
      <mesh>
        <sphereGeometry args={[2.45, 32, 32]} />
        <meshBasicMaterial color="#3b82f6" wireframe={true} transparent={true} opacity={0.08} />
      </mesh>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={PARTICLE_COUNT} array={positions} itemSize={3} />
          <bufferAttribute attach="attributes-aSize" count={PARTICLE_COUNT} array={sizes} itemSize={1} />
          <bufferAttribute attach="attributes-aRandom" count={PARTICLE_COUNT} array={randoms} itemSize={3} />
        </bufferGeometry>
        <shaderMaterial
          ref={materialRef}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          transparent={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}
