import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/nunito';

import * as SplashScreen from 'expo-splash-screen';
import ComponentGalleryScreen from './src/dev/ComponentGalleryScreen';

export const SHOW_COMPONENT_GALLERY = true;

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <>
      {__DEV__ && SHOW_COMPONENT_GALLERY ? (
        <ComponentGalleryScreen />
      ) : (
        <View style={styles.container}>
          <Text>WPT 202</Text>
        </View>
      )}
      <StatusBar style="auto" />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F5EF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});