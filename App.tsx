
import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { withBlockingTestGate } from './src/dev/DevBlockingGate';

function App() {
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
export default withBlockingTestGate(App);