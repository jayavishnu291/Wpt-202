
import { Platform } from 'react-native';

import { rules } from '../../config/rules';
import { t } from '../text/t';
import * as AlarmEngine from '../../modules/alarm-engine/src';

export function configureAlarmEngine(): void {
    if (
        Platform.OS !== 'android' ||
        !AlarmEngine.isAvailable()
    ) {
        return;
    }

    AlarmEngine.configure(
        {
            title: t('alarmRinging.title'),
            body: t('notifications.n05'),
            stop: t('alarmRinging.iosStop'),
            channelName: t('notifications.channelAlarms'),
        },
        {
            startPercent: rules.alarms.volumeRampStartPercent,
            endPercent: rules.alarms.volumeRampEndPercent,
            seconds: rules.alarms.volumeRampDurationSeconds,
        },
    );
}
