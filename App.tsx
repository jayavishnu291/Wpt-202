
import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { rules } from './config/rules';
import {
  listAlarms,
  saveAlarm,
} from './src/services/data';
import type { Alarm } from './src/services/data';

import AlarmListScreen from './src/ui/alarms/AlarmListScreen';
import AlarmEditScreen from './src/ui/alarms/AlarmEditScreen';

export default function App() {
  const [screen, setScreen] = useState<'list' | 'edit'>('list');
  const [selectedAlarm, setSelectedAlarm] = useState<Alarm | null>(null);

  const handleAdd = async () => {
    try {
      const alarms = await listAlarms();

      if (alarms.length >= rules.alarms.maximumAlarms) {
        Alert.alert(
          'Alarm limit reached',
          `You can create a maximum of ${rules.alarms.maximumAlarms} alarms.`,
        );
        return;
      }

      setSelectedAlarm(null);
      setScreen('edit');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Could not check your alarms.');
    }
  };

  const handleEdit = (alarm: Alarm) => {
    setSelectedAlarm(alarm);
    setScreen('edit');
  };

  const handleSave = async (alarm: Alarm) => {
    try {
      const existingAlarms = await listAlarms();

      const isNewAlarm = !selectedAlarm;

      if (
        isNewAlarm &&
        existingAlarms.length >= rules.alarms.maximumAlarms
      ) {
        Alert.alert(
          'Alarm limit reached',
          `You can create a maximum of ${rules.alarms.maximumAlarms} alarms.`,
        );
        return;
      }

      await saveAlarm(alarm);

      setSelectedAlarm(null);
      setScreen('list');

      Alert.alert('Success', 'Your alarm has been saved.');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Could not save your alarm.');
      throw error;
    }
  };

  const handleCancel = () => {
    setSelectedAlarm(null);
    setScreen('list');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {screen === 'list' ? (
        <AlarmListScreen
          onAdd={handleAdd}
          onEdit={handleEdit}
        />
      ) : (
        <AlarmEditScreen
          initialAlarm={selectedAlarm}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}
    </View>
  );
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1020',
  },
});
