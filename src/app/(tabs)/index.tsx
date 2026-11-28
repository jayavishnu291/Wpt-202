import React from 'react';
import { useRouter } from 'expo-router';
import { HomeScreen } from '../../ui/screens/HomeScreen';

export default function HomeRoute() {
  const router = useRouter();

  return (
    <HomeScreen
      onOpenGardenTest={() => router.push('/dev/garden-test')}
      onStartFocus={() => router.push('/focus/setup')}
    />
  );
}
