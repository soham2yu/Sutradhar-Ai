"use client";

import { Canvas } from '@react-three/fiber';
import ParticleOrb from './ParticleOrb';

type Props = {
  audioAmplitude: number;
  aiState: number;
  isTextVisible?: boolean;
};

export default function OrbScene({ audioAmplitude, aiState, isTextVisible = false }: Props) {
  return (
    <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 8], fov: 45 }}>
      <ambientLight intensity={0.5} />
      <ParticleOrb audioAmplitude={audioAmplitude} aiState={aiState} isTextVisible={isTextVisible} />
    </Canvas>
  );
}
