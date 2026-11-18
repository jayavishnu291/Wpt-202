
import {
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const COLORS = {
  background: '#F7F5EF',
  white: '#FFFFFF',
  text: '#1E2430',
  textSoft: '#4A5160',
  accent: '#3A7D44',
  accentPressed: '#2F6638',
  border: '#E6E4DC',
};

const GUIDES = [
  {
    brand: 'Xiaomi / Redmi / POCO',
    steps: [
      'Open Settings and select Apps.',
      'Find your app under Manage apps.',
      'Open Battery saver and choose No restrictions, if available.',
      'Check Autostart and allow it if your device provides that option.',
    ],
  },
  {
    brand: 'Samsung',
    steps: [
      'Open Settings and select Battery.',
      'Open Background usage limits.',
      'Check Sleeping apps and Deep sleeping apps.',
      'If needed, add your app to Never sleeping apps.',
    ],
  },
  {
    brand: 'OnePlus / OPPO / realme',
    steps: [
      'Open Settings and find Battery settings.',
      'Look for App battery management or Background activity.',
      'Allow background activity for your app, if available.',
      'Check Auto launch or Startup manager if your device provides it.',
    ],
  },
  {
    brand: 'Vivo / iQOO',
    steps: [
      'Open Settings and find Battery.',
      'Look for Background power consumption management.',
      'Allow background activity for your app, if available.',
      'Check Autostart settings if your device provides them.',
    ],
  },
  {
    brand: 'Huawei / HONOR',
    steps: [
      'Open Settings and select Apps.',
      'Find your app and open App launch settings.',
      'If available, manage automatic launch and background activity manually.',
      'Allow the background activity needed by your app.',
    ],
  },
  {
    brand: 'Pixel / Stock Android',
    steps: [
      'Open Settings and select Apps.',
      'Choose your app and open App battery usage.',
      'Review the background usage setting.',
      'Allow background usage if required by your device.',
    ],
  },
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
          <Text style={styles.backText}>‹ Back</Text>
        </Pressable>

        <Text accessibilityRole="header" style={styles.heading}>
          Phone settings guide
        </Text>

        <Text style={styles.subtitle}>
          Some Android phones limit background activity to save battery.
          Choose your phone brand to see where these settings may be found.
        </Text>

        {GUIDES.map((guide) => (
          <View key={guide.brand} style={styles.card}>
            <Text style={styles.brand}>{guide.brand}</Text>

            {guide.steps.map((step, index) => (
              <View key={index} style={styles.step}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </View>
        ))}

        <Text style={styles.disclaimer}>
          Settings names and availability vary by phone model and Android
          version. You can skip these steps and review them later.
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
          <Text style={styles.buttonText}>Continue to garden</Text>
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
