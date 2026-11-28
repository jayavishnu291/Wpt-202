import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { t, type TextKey } from '../../text/t';

const COLORS = {
  overlay: 'rgba(11, 16, 32, 0.55)',
  background: '#F7F5EF',
  white: '#FFFFFF',
  // text-ok: colour token, not on-screen text
  text: '#1E2430',
  textSoft: '#4A5160',
  accent: '#3A7D44',
  accentPressed: '#2F6638',
};

export type PermissionType =
  | 'notifications'
  | 'alarms'
  | 'exactAlarms'
  | 'fullScreenAlarm'
  | 'usageAccess'
  | 'displayOverApps';

const PERMISSION_CONTENT: Record<
  PermissionType,
  { titleKey: TextKey; messageKey: TextKey; icon: string }
> = {
  notifications: {
    titleKey: 'onboarding.permissionContent.notifications.title',
    messageKey: 'onboarding.permissionContent.notifications.message',
    icon: '\u{1F514}',
  },
  alarms: {
    titleKey: 'onboarding.permissionContent.alarms.title',
    messageKey: 'onboarding.permissionContent.alarms.message',
    icon: '\u{23F0}',
  },
  exactAlarms: {
    titleKey: 'onboarding.permissionContent.exactAlarms.title',
    messageKey: 'onboarding.permissionContent.exactAlarms.message',
    icon: '\u{23F0}',
  },
  fullScreenAlarm: {
    titleKey: 'onboarding.permissionContent.fullScreenAlarm.title',
    messageKey: 'onboarding.permissionContent.fullScreenAlarm.message',
    icon: '\u{1F305}',
  },
  usageAccess: {
    titleKey: 'onboarding.permissionContent.usageAccess.title',
    messageKey: 'onboarding.permissionContent.usageAccess.message',
    icon: '\u{1F4F1}',
  },
  displayOverApps: {
    titleKey: 'onboarding.permissionContent.displayOverApps.title',
    messageKey: 'onboarding.permissionContent.displayOverApps.message',
    icon: '\u{1F4AC}',
  },
};

export interface PermissionSheetProps {
  visible: boolean;
  permissionType?: PermissionType;
  title?: string;
  message?: string;
  continueLabel?: string;
  notNowLabel?: string;
  onContinue: () => void;
  onNotNow: () => void;
}

export default function PermissionSheet({
  visible,
  permissionType = 'notifications',
  title,
  message,
  continueLabel = t('onboarding.permissionContinue'),
  notNowLabel = t('onboarding.permissionNotNow'),
  onContinue,
  onNotNow,
}: PermissionSheetProps) {
  const content = PERMISSION_CONTENT[permissionType];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onNotNow}
    >
      <View style={styles.overlay}>
        <View accessibilityViewIsModal style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.iconContainer}>
            <Text style={styles.icon}>{content.icon}</Text>
          </View>

          <Text accessibilityRole="header" style={styles.title}>
            {title ?? t(content.titleKey)}
          </Text>

          <Text style={styles.message}>
            {message ?? t(content.messageKey)}
          </Text>

          <Text style={styles.note}>
            {t('onboarding.permissionNote')}
          </Text>

          <Pressable
            accessibilityRole="button"
            onPress={onContinue}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.primaryButtonPressed,
            ]}
          >
            <Text style={styles.primaryButtonText}>
              {continueLabel}
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={onNotNow}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonText}>
              {notNowLabel}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    alignItems: 'center',
  },
  handle: {
    width: 42,
    height: 5,
    borderRadius: 4,
    backgroundColor: '#C9C9C9',
    marginBottom: 26,
  },
  iconContainer: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: '#E9F0E5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  icon: {
    fontSize: 32,
  },
  title: {
    fontSize: 23,
    lineHeight: 30,
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
    marginBottom: 12,
  },
  note: {
    fontSize: 13,
    lineHeight: 20,
    color: COLORS.textSoft,
    textAlign: 'center',
    marginBottom: 24,
  },
  primaryButton: {
    width: '100%',
    minHeight: 56,
    borderRadius: 16,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonPressed: {
    backgroundColor: COLORS.accentPressed,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
  },
  secondaryButton: {
    width: '100%',
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSoft,
  },
});