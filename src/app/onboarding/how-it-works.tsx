
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Platform,
} from 'react-native';

const COLORS = {
  background: '#F7F5EF',
  text: '#1E2430',
  textSoft: '#4A5160',
  accent: '#3A7D44',
  accentPressed: '#2F6638',
  white: '#FFFFFF',
  flower: '#E8607A',
  gold: '#F5D76E',
  sky: '#0B1020',
};

const STEPS = [
  {
    number: '01',
    symbol: '\u{1F331}',
    title: 'Focus to grow flowers',
    description:
      'Stay focused on what matters. Each completed focus session helps your garden grow.',
  },
  {
    number: '02',
    symbol: '\u{2B50}',
    title: 'Put your phone down at night to collect stars',
    description:
      'Give yourself a break from your phone at night and collect stars for your garden.',
  },
  {
    number: '03',
    symbol: '\u{1F305}',
    title: 'Wake up with a small mission',
    description:
      'Begin your morning with a gentle reminder and enjoy the garden you have grown.',
  },
] as const;

const TOP_SPACE =
  Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 16 : 56;

interface HowItWorksScreenProps {
  onContinue: () => void;
  onBack: () => void;
}

export default function HowItWorksScreen({
  onContinue,
  onBack,
}: HowItWorksScreenProps) {
  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: TOP_SPACE }]}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={onBack}
          style={styles.backButton}
        >
          <Text style={styles.backText}>‹ Back</Text>
        </Pressable>

        <Text accessibilityRole="header" style={styles.heading}>
          How it works
        </Text>

        <Text style={styles.subtitle}>
          Small steps during the day and night help your garden grow.
        </Text>

        {STEPS.map((step) => (
          <View key={step.number} style={styles.card}>
            <View style={styles.cardTop}>
              <View style={styles.symbolBox}>
                <Text style={styles.symbol}>{step.symbol}</Text>
              </View>
              <Text style={styles.number}>{step.number}</Text>
            </View>

            <Text style={styles.cardTitle}>{step.title}</Text>
            <Text style={styles.description}>{step.description}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          accessibilityRole="button"
          onPress={onContinue}
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingRight: 20,
    marginBottom: 18,
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.accent,
  },
  heading: {
    fontSize: 30,
    lineHeight: 38,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.textSoft,
    marginBottom: 24,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E6E4DC',
    padding: 20,
    marginBottom: 16,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  symbolBox: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: '#F0F2E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  symbol: {
    fontSize: 28,
  },
  number: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.accent,
  },
  cardTitle: {
    fontSize: 19,
    lineHeight: 26,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    lineHeight: 23,
    color: COLORS.textSoft,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
  },
  button: {
    minHeight: 56,
    borderRadius: 16,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    backgroundColor: COLORS.accentPressed,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
  },
});