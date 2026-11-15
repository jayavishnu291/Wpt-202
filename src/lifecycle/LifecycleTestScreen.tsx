import React, { useState } from "react";
import {
  View,
  Text,
  Button,
  ScrollView,
  StyleSheet,
} from "react-native";

import {
  startSession,
  endSession,
  wasClosedDuringSession,
  getLastLeaveType,
  getLastEvent,
  getLockSignalDelay,
  isCallActive,
  readEvents,
  type LifecycleEvent,
} from '../../modules/lifecycle-state/src'

export default function LifecycleTestScreen() {
  const [events, setEvents] = useState<LifecycleEvent[]>([]);
  const [status, setStatus] = useState("Not checked");

  const refresh = () => {
    try {
      setEvents(readEvents());
      setStatus(
        `Last event: ${getLastEvent()}\n` +
        `Leave type: ${getLastLeaveType()}\n` +
        `Lock delay: ${getLockSignalDelay()} sec\n` +
        `Call active: ${isCallActive()}\n` +
        `Previous session interrupted: ${wasClosedDuringSession()}`
      );
    } catch (error) {
      setStatus(String(error));
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>WPT202 Lifecycle Test</Text>

      <Button
        title="Start Session"
        onPress={() => {
          startSession();
          refresh();
        }}
      />

      <Button
        title="End Session"
        onPress={() => {
          endSession();
          refresh();
        }}
      />

      <Button title="Refresh Events" onPress={refresh} />

      <Text style={styles.status}>{status}</Text>

      {events.slice(-20).map((event) => (
        <Text key={event.seq} style={styles.event}>
          {event.seq} | {event.action} | {event.type}
          {"\n"}{event.at}
        </Text>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
  },
  status: {
    fontSize: 15,
    lineHeight: 24,
  },
  event: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#cccccc",
    borderRadius: 8,
  },
});