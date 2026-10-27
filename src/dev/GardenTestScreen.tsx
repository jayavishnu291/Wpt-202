/**
 * src/dev/GardenTestScreen.tsx
 *
 * DEV ONLY - WPT 202 FC-6 Garden Drawing Test.
 * Shows the full garden (150 flowers + 31 stars) on one screen so it can be
 * tested on a real Android phone (PRD FC-6, NFR-07, AC-GA-3).
 *
 * Standalone: it only imports the layout and the scene. It is not connected to
 * App.tsx, navigation or Expo Router. Do not import it from production screens.
 */
import { useMemo } from 'react';
import { StatusBar, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { createGardenLayout } from '../domain/gardenLayout';
import { GardenScene } from '../ui/garden/GardenScene';

const BACKGROUND_COLOR = '#0B1020'; // same as the sky, so there is no flash while drawing
const LABEL_TEXT_COLOR = '#E8ECF5';

export function GardenTestScreen() {
  const { width, height } = useWindowDimensions();

  // Created once per screen size. It is NOT rebuilt on normal re-renders.
  const layout = useMemo(
    () => (width > 0 && height > 0 ? createGardenLayout(width, height) : null),
    [width, height],
  );

  const labelStyle = useMemo(
    () => [styles.label, { top: (StatusBar.currentHeight ?? 0) + 8 }],
    [],
  );

  return (
    <View style={[styles.root, { width, height }]}>
      {layout !== null && <GardenScene layout={layout} reduceMotion={true} />}
      {layout !== null && (
        <View pointerEvents="none" style={labelStyle}>
          <Text style={styles.labelText}>
            Flowers: {layout.flowers.length} | Stars: {layout.stars.length}
          </Text>
          <Text style={styles.labelSubText}>
            {__DEV__ ? 'DEV build (not valid for FC-6 timing)' : 'Release build'}
          </Text>
        </View>
      )}
    </View>
  );
}

export default GardenTestScreen;

const styles = StyleSheet.create({
  root: {
    backgroundColor: BACKGROUND_COLOR,
    overflow: 'hidden',
  },
  label: {
    position: 'absolute',
    left: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  labelText: {
    color: LABEL_TEXT_COLOR,
    fontSize: 13,
  },
  labelSubText: {
    color: LABEL_TEXT_COLOR,
    fontSize: 11,
    opacity: 0.75,
  },
});