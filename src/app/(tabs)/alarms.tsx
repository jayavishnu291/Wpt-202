
import React, { useState } from 'react';
import { Alert } from 'react-native';

import AlarmListScreen from '../../ui/alarms/AlarmListScreen';
import AlarmEditScreen from '../../ui/alarms/AlarmEditScreen';

import {
  listAlarms,
  saveAlarm,
  type Alarm,
} from '../../services/data';

import { t } from '../../text/t';
import { rules } from '../../../config/rules';

export default function AlarmsScreen() {
  const [editing, setEditing] = useState(false);
  const [selectedAlarm, setSelectedAlarm] = useState<Alarm | null>(null);

  // Open the new alarm screen
  const handleAdd = () => {
    setSelectedAlarm(null);
    setEditing(true);
  };

  // Open the existing alarm for editing
  const handleEdit = (alarm: Alarm) => {
    setSelectedAlarm(alarm);
    setEditing(true);
  };

  // Save a new alarm or update an existing alarm
  const handleSave = async (alarm: Alarm) => {
    try {
      if (!selectedAlarm) {
        const existingAlarms = await listAlarms();

        if (existingAlarms.length >= rules.alarms.maximumAlarms) {
          Alert.alert(
            t('alarmList.limitReachedTitle'),
            t('alarmList.limitReachedMessage', {
              count: rules.alarms.maximumAlarms,
            }),
          );

          setEditing(false);
          setSelectedAlarm(null);
          return;
        }

        const duplicate = existingAlarms.some((item) =>
          item.time === alarm.time &&
          item.repeat_days.slice().sort().join(',') ===
            alarm.repeat_days.slice().sort().join(','),
        );

        if (duplicate) {
          Alert.alert(
            t('alarmEdit.invalidTimeTitle'),
            t('alarmEdit.duplicateAlarmMessage'),
          );
          return;
        }
      }

      await saveAlarm(alarm);

      setEditing(false);
      setSelectedAlarm(null);
    } catch (error) {
      console.error('Unable to save alarm:', error);
      if (error instanceof Error && error.message === 'Duplicate alarm.') {
        Alert.alert(
          t('alarmEdit.invalidTimeTitle'),
          t('alarmEdit.duplicateAlarmMessage'),
        );
      } else if (
        error instanceof Error &&
        error.message === 'Alarm limit reached.'
      ) {
        Alert.alert(
          t('alarmList.limitReachedTitle'),
          t('alarmList.limitReachedMessage', {
            count: rules.alarms.maximumAlarms,
          }),
        );
      } else if (
        error instanceof Error &&
        error.message === 'Alarm label is too long.'
      ) {
        Alert.alert(
          t('alarmEdit.labelTitle'),
          t('alarmEdit.labelLimitMessage'),
        );
      } else {
        Alert.alert(
          t('common.error'),
          t('alarmEdit.saveFailed'),
        );
      }
    }
  };

  // Cancel adding or editing an alarm
  const handleCancel = () => {
    setEditing(false);
    setSelectedAlarm(null);
  };

  // Show the alarm edit screen
  if (editing) {
    return (
      <AlarmEditScreen
        initialAlarm={selectedAlarm}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    );
  }

  // Show the saved alarm list
  return (
    <AlarmListScreen
      onAdd={handleAdd}
      onEdit={handleEdit}
    />
  );
}
