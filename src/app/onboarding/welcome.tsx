/**
 * src/app/onboarding/welcome.tsx
 *
 * WPT 202 - S-01 Welcome screen (PRD FR-ON-01, FR-ON-02).
 * Heading, a placeholder day-and-night illustration, a short friendly line and
 * one big "Get started" button.
 *
 * SELF-CONTAINED: imports only from 'react' and 'react-native'.
 * - NAVIGATION IS NOT CONNECTED. The button calls the optional `onGetStarted`
 *   prop. When nothing is passed, it only logs in development.
 * - Text is kept in one TEXT object below, ready to move into the shared text
 *   file and be replaced by the shared t() function (see the notes at the end).
 */
import { Platform, Pressable, ScrollView, StatusBar, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

// ---------------------------------------------------------------------------
// Text (move to the shared text file and use t() when it exists)
// ---------------------------------------------------------------------------
const TEXT = {
  title: 'Grow flowers by day. Collect stars by night.',
  message: 'Put your phone down and watch your garden and night sky grow. Free, with no account needed.',
  button: 'Get started',
  buttonHint: 'Goes to the next screen, How it works',
} as const;

// ---------------------------------------------------------------------------
// Look (Day theme from PRD 8.1; the illustration colours are placeholders)
// ---------------------------------------------------------------------------
const COLORS = {
  background: '#F7F5EF',
  text: '#1E2430',
  textSoft: '#4A5160', // softer text, still above 4.5:1 contrast on the background
  accent: '#3A7D44',
  accentPressed: '#2F6638',
  buttonText: '#FFFFFF',
  sky: '#0B1020',
  star: '#F5D76E',
  moon: '#E8ECF5',
  ground: '#DCEBD3',
} as const;

const FLOWER_HEAD_COLORS = ['#E8607A', '#F5B642', '#9A7FE0', '#5BB5C9', '#E58AB8'] as const;

const SIDE_PADDING = 24;
const BUTTON_MIN_HEIGHT = 56; // PRD: touch targets at least 48 dp
const ILLUSTRATION_MAX_WIDTH = 320;

// Space for the phone's status bar and bottom edge without extra packages.
// TODO: replace with safe-area insets if the team adds react-native-safe-area-context.
const TOP_SPACE = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 16 : 56;
const BOTTOM_SPACE = Platform.OS === 'ios' ? 28 : 16;

// ---------------------------------------------------------------------------
// Placeholder illustration (plain Views, no images, no animation)
// ---------------------------------------------------------------------------

/** A small four-point sparkle made from two thin bars. */
function Sparkle({ size, left, top }: { size: number; left: `${number}%`; top: `${number}%` }) {
  const bar = Math.max(2, size * 0.22);
  return (
    <View style={[styles.sparkle, { width: size, height: size, left, top }]}>
      <View style={[styles.sparkleBar, { width: size, height: bar, top: (size - bar) / 2 }]} />
      <View style={[styles.sparkleBar, { width: bar, height: size, left: (size - bar) / 2 }]} />
    </View>
  );
}

/** A simple flower: round head, gold centre, thin stem. */
function SimpleFlower({ headSize, stemHeight, color }: { headSize: number; stemHeight: number; color: string }) {
  return (
    <View style={styles.flower}>
      <View
        style={{
          width: headSize,
          height: headSize,
          borderRadius: headSize / 2,
          backgroundColor: color,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View
          style={{
            width: headSize * 0.38,
            height: headSize * 0.38,
            borderRadius: headSize * 0.19,
            backgroundColor: COLORS.star,
          }}
        />
      </View>
      <View style={{ width: Math.max(2, headSize * 0.12), height: stemHeight, backgroundColor: COLORS.accent }} />
    </View>
  );
}

function Illustration({ width, height }: { width: number; height: number }) {
  const unit = width;
  const headSize = unit * 0.1;
  // Decorative picture: hidden from screen readers.
  return (
    <View
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
      style={[styles.illustration, { width, height }]}
    >
      <View style={styles.sky}>
        <View style={[styles.moon, { width: unit * 0.13, height: unit * 0.13, borderRadius: unit * 0.065 }]} />
        <Sparkle size={unit * 0.07} left="12%" top="22%" />
        <Sparkle size={unit * 0.05} left="30%" top="52%" />
        <Sparkle size={unit * 0.08} left="48%" top="18%" />
        <Sparkle size={unit * 0.05} left="66%" top="48%" />
        <Sparkle size={unit * 0.06} left="84%" top="62%" />
      </View>
      <View style={styles.ground}>
        {FLOWER_HEAD_COLORS.map((color, index) => (
          <SimpleFlower
            key={color}
            color={color}
            headSize={headSize * (index % 2 === 0 ? 1 : 1.25)}
            stemHeight={unit * (index % 2 === 0 ? 0.1 : 0.14)}
          />
        ))}
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------
export interface WelcomeScreenProps {
  /** Called when "Get started" is pressed. Navigation to S-02 should be connected here later. */
  onGetStarted?: () => void;
}

export default function WelcomeScreen({ onGetStarted }: WelcomeScreenProps) {
  const { width, height } = useWindowDimensions();

  const illustrationWidth = Math.min(width - SIDE_PADDING * 2, ILLUSTRATION_MAX_WIDTH);
  const illustrationHeight = Math.min(illustrationWidth * 0.85, height * 0.34);

  // PLACEHOLDER: no navigation system is connected yet.
  // TODO: go to S-02 (How it works) here once routing exists.
  const handleGetStarted = (): void => {
    if (onGetStarted !== undefined) {
      onGetStarted();
      return;
    }
    if (__DEV__) {
      console.log('[S-01] Get started pressed. Navigation is not connected yet.');
    }
  };

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: TOP_SPACE }]}
        showsVerticalScrollIndicator={false}
      >
        <Illustration width={illustrationWidth} height={illustrationHeight} />
        <Text accessibilityRole="header" style={styles.title}>
          {TEXT.title}
        </Text>
        <Text style={styles.message}>{TEXT.message}</Text>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: BOTTOM_SPACE }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={TEXT.button}
          accessibilityHint={TEXT.buttonHint}
          onPress={handleGetStarted}
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        >
          <Text style={styles.buttonText}>{TEXT.button}</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SIDE_PADDING,
    paddingBottom: 16,
  },
  illustration: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 32,
  },
  sky: {
    flex: 55,
    backgroundColor: COLORS.sky,
  },
  moon: {
    position: 'absolute',
    right: '10%',
    top: '14%',
    backgroundColor: COLORS.moon,
  },
  sparkle: {
    position: 'absolute',
  },
  sparkleBar: {
    position: 'absolute',
    borderRadius: 2,
    backgroundColor: COLORS.star,
  },
  ground: {
    flex: 45,
    backgroundColor: COLORS.ground,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingHorizontal: 12,
  },
  flower: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.textSoft,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: SIDE_PADDING,
    paddingTop: 8,
  },
  button: {
    minHeight: BUTTON_MIN_HEIGHT,
    borderRadius: 16,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  buttonPressed: {
    backgroundColor: COLORS.accentPressed,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.buttonText,
  },
});