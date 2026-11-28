import React from 'react';
import { useRouter } from 'expo-router';
import { GardenTestScreen } from '../../dev/GardenTestScreen';

export default function GardenTestRoute() {
  const router = useRouter();

  return <GardenTestScreen onBack={() => router.back()} />;
}
