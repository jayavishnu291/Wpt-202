
import {
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { t, type TextKey } from '../../text/t';

const COLORS = {
  background: '#F7F5EF',
  white: '#FFFFFF',
  // text-ok: colour token, not on-screen text
  text: '#1E2430',
  textSoft: '#4A5160',
  accent: '#3A7D44',
  accentPressed: '#2F6638',
  border: '#E6E4DC',
};

const GUIDES = [
  { id: 'xiaomi' },
  { id: 'samsung' },
  { id: 'oneplus' },
  { id: 'vivo' },
  { id: 'huawei' },
  { id: 'pixel' },
] as const;

const TOP_SPACE =
  Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 16 : 56;

interface OemGuideScreenProps {
  onContinue: () => void;
  onBack: () => void;
}

export default function OemGuideScreen({
  onContinue,
  onBack,
}: OemGuideScreenProps) {
  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: TOP_SPACE }]}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          accessibilityRole="button"
          onPress={onBack}
          style={styles.backButton}
        >
          <Text style={styles.backText}>‹ {t('common.back')}</Text>
        </Pressable>

        <Text accessibilityRole="header" style={styles.heading}>
          {t('onboarding.oemGuide.title')}
        </Text>

        <Text style={styles.subtitle}>
          {t('onboarding.oemGuide.subtitle')}
        </Text>

        {GUIDES.map((guide) => (
          <View key={guide.id} style={styles.card}>
            <Text style={styles.brand}>
              {t(`onboarding.oemGuide.${guide.id}.brand`)}
            </Text>

            {[1, 2, 3, 4].map((stepNumber) => (
              <View key={stepNumber} style={styles.step}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{stepNumber}</Text>
                </View>
                <Text style={styles.stepText}>
                  {t(`onboarding.oemGuide.${guide.id}.step${stepNumber}` as TextKey)}
                </Text>
              </View>
            ))}
          </View>
        ))}

        <Text style={styles.disclaimer}>
          {t('onboarding.oemGuide.disclaimer')}
        </Text>
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
          <Text style={styles.buttonText}>{t('onboarding.oemGuide.continueToGarden')}</Text>
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
    fontSize: 29,
    lineHeight: 37,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 23,
    color: COLORS.textSoft,
    marginBottom: 22,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
    marginBottom: 14,
  },
  brand: {
    fontSize: 18,
    lineHeight: 25,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  stepNumber: {
    width: 25,
    height: 25,
    borderRadius: 13,
    backgroundColor: '#E9F0E5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  stepNumberText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.accent,
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 21,
    color: COLORS.textSoft,
  },
  disclaimer: {
    fontSize: 13,
    lineHeight: 20,
    color: COLORS.textSoft,
    marginTop: 4,
    marginBottom: 12,
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
