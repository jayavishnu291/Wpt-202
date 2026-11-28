
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Platform,
} from 'react-native';
import { t } from '../../text/t';

const COLORS = {
  background: '#F7F5EF',
  // text-ok: colour token, not on-screen text
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
    titleKey: 'onboarding.howPoint1',
    descriptionKey: 'onboarding.howPoint1Description',
  },
  {
    number: '02',
    symbol: '\u{2B50}',
    titleKey: 'onboarding.howPoint2',
    descriptionKey: 'onboarding.howPoint2Description',
  },
  {
    number: '03',
    symbol: '\u{1F305}',
    titleKey: 'onboarding.howPoint3',
    descriptionKey: 'onboarding.howPoint3Description',
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
          accessibilityLabel={t('onboarding.howBack')}
          onPress={onBack}
          style={styles.backButton}
        >
          <Text style={styles.backText}>‹ {t('common.back')}</Text>
        </Pressable>

        <Text accessibilityRole="header" style={styles.heading}>
          {t('onboarding.howTitle')}
        </Text>

        <Text style={styles.subtitle}>
          {t('onboarding.howSubtitle')}
        </Text>

        {STEPS.map((step) => (
          <View key={step.number} style={styles.card}>
            <View style={styles.cardTop}>
              <View style={styles.symbolBox}>
                <Text style={styles.symbol}>{step.symbol}</Text>
              </View>
              <Text style={styles.number}>{step.number}</Text>
            </View>

            <Text style={styles.cardTitle}>{t(step.titleKey)}</Text>
            <Text style={styles.description}>{t(step.descriptionKey)}</Text>
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
          <Text style={styles.buttonText}>{t('onboarding.continueButton')}</Text>
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