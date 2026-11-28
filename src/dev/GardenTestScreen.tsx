
/**
 * src/dev/GardenTestScreen.tsx
 *
 * DEV ONLY - WPT 202 FC-6 Garden Drawing Test.
 * Shows the full garden (150 flowers + 31 stars) on one screen.
 */
import { useMemo } from 'react';
import {
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

import { createGardenLayout } from '../domain/gardenLayout';
import { GardenScene } from '../ui/garden/GardenScene';

const BACKGROUND_COLOR = '#0B1020';
const LABEL_TEXT_COLOR = '#E8ECF5';

interface GardenTestScreenProps {
  onBack: () => void;
}

export function GardenTestScreen({ onBack }: GardenTestScreenProps) {
  const { width, height } = useWindowDimensions();

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

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Back to Home"
        onPress={onBack}
        style={({ pressed }) => [
          styles.backButton,
          { top: (StatusBar.currentHeight ?? 0) + 8 },
          pressed && styles.backButtonPressed,
        ]}
      >
        <Text style={styles.backButtonText}>Back to Home</Text>
      </Pressable>
    </View>
  );
}

export default GardenTestScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
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
  backButton: {
    position: 'absolute',
    right: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  backButtonPressed: {
    opacity: 0.7,
  },
  backButtonText: {
    color: LABEL_TEXT_COLOR,
    fontSize: 13,
    fontWeight: '600',
  },
});
