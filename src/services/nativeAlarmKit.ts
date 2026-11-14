
import { Platform } from 'react-native';

type NativeAlarmKit =
  typeof import('../../modules/alarmkit-bridge/src/index');

function getAlarmKit(): NativeAlarmKit | null {
  if (Platform.OS !== 'ios') return null;

  try {
    return require(
      '../../modules/alarmkit-bridge/src/index'
    ) as NativeAlarmKit;
  } catch {
    return null;
  }
}

export async function scheduleNativeAlarm(
  hour: number,
  minute: number,
  repeatDays: string[] = []
): Promise<boolean> {
  if (
    !Number.isInteger(hour) ||
    !Number.isInteger(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return false;
  }

  const alarmKit = getAlarmKit();

  if (!alarmKit) return false;

  try {
    if (!alarmKit.isAlarmKitAvailable()) {
      return false;
    }

    const permitted =
      await alarmKit.requestAlarmPermission();

    if (!permitted) {
      return false;
    }

    const alarmId = await alarmKit.scheduleAlarm(
      hour,
      minute,
      repeatDays
    );

    return typeof alarmId === 'string' &&
      alarmId.length > 0;

  } catch (error) {
    console.error(
      'WPT202 AlarmKit scheduling failed:',
      error
    );
    return false;
  }
}
