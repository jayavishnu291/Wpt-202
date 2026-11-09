import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert, FlatList, SafeAreaView, ScrollView, StyleSheet, Switch,
  Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'wpt202_alarms';
const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function App() {
  const [alarmTime, setAlarmTime] = useState('09:00');
  const [alarms, setAlarms] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [repeatDays, setRepeatDays] = useState([]);
  const [alarmLabel, setAlarmLabel] = useState('');
  const [searchText, setSearchText] = useState('');
  const [alarmFilter, setAlarmFilter] = useState('All');

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (active && saved !== null) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) setAlarms(parsed);
        }
      } catch (error) {
        Alert.alert('Error', 'Could not load alarms');
      } finally {
        if (active) setLoaded(true);
      }
    })();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(alarms)).catch(() => {
      Alert.alert('Error', 'Could not save alarms');
    });
  }, [alarms, loaded]);

  const resetForm = () => {
    setEditingId(null);
    setAlarmTime('09:00');
    setAlarmLabel('');
    setRepeatDays([]);
    setShowTimePicker(false);
  };

  const saveAlarm = () => {
    if (!loaded) return;
    const time = alarmTime.trim();
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
      Alert.alert('Invalid Time', 'Select a valid alarm time');
      return;
    }
    const selectedDays = [...repeatDays].sort();
    const duplicateExists = alarms.some(alarm =>
      alarm.id !== editingId && alarm.time === time &&
      JSON.stringify([...(alarm.repeatDays || [])].sort()) === JSON.stringify(selectedDays)
    );
    if (duplicateExists) {
      Alert.alert('Duplicate Alarm', 'An alarm with the same time and repeat days already exists.');
      return;
    }
    if (editingId !== null) {
      setAlarms(previous => previous.map(alarm =>
        alarm.id === editingId
          ? { ...alarm, time, label: alarmLabel.trim(), repeatDays: [...repeatDays] }
          : alarm
      ));
      Alert.alert('Updated', `Alarm changed to ${time}`);
    } else {
      setAlarms(previous => [...previous, {
        id: `${Date.now()}-${Math.random()}`,
        time,
        label: alarmLabel.trim(),
        repeatDays: [...repeatDays],
        enabled: true,
      }]);
      Alert.alert('Saved', `Demo alarm ${time} saved`);
    }
    resetForm();
  };

  const onTimeChange = (event, selectedDate) => {
    if (event.type === 'dismissed' || !selectedDate) {
      setShowTimePicker(false);
      return;
    }
    const hours = String(selectedDate.getHours()).padStart(2, '0');
    const minutes = String(selectedDate.getMinutes()).padStart(2, '0');
    setAlarmTime(`${hours}:${minutes}`);
    if (event.type === 'set') setShowTimePicker(false);
  };

  const editAlarm = alarm => {
    setAlarmTime(alarm.time);
    setEditingId(alarm.id);
    setRepeatDays(alarm.repeatDays || []);
    setAlarmLabel(alarm.label || '');
  };

  const toggleAlarm = id => {
    if (!loaded) return;
    setAlarms(previous => previous.map(alarm =>
      alarm.id === id ? { ...alarm, enabled: !alarm.enabled } : alarm
    ));
  };

  const deleteAlarm = id => {
    const selected = alarms.find(alarm => alarm.id === id);
    Alert.alert('Delete Alarm', `Delete ${selected?.time || 'this alarm'}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => {
        setAlarms(previous => previous.filter(alarm => alarm.id !== id));
        if (editingId === id) resetForm();
      } },
    ]);
  };

  const clearAllAlarms = () => {
    if (!loaded || alarms.length === 0) return;
    Alert.alert('Delete All Alarms?', 'Are you sure you want to delete all saved alarms?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete All', style: 'destructive', onPress: () => {
        setAlarms([]);
        resetForm();
      } },
    ]);
  };

  const displayedAlarms = useMemo(() => {
    const search = searchText.trim().toLowerCase();
    return [...alarms]
      .filter(alarm => alarmFilter === 'All' ||
        (alarmFilter === 'ON' ? alarm.enabled === true : alarm.enabled !== true))
      .filter(alarm =>
        (alarm.label || '').toLowerCase().includes(search) ||
        (alarm.time || '').toLowerCase().includes(search))
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [alarms, searchText, alarmFilter]);

  const onCount = alarms.filter(alarm => alarm.enabled === true).length;
  const offCount = alarms.length - onCount;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <FlatList
        data={displayedAlarms}
        keyExtractor={item => String(item.id)}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View>
            <Text style={styles.title}>WPT202</Text>
            <Text style={styles.subtitle}>Sprint 1 - Alarm App</Text>

            <Text style={styles.label}>
              {editingId !== null ? 'Edit Alarm Time (HH:MM)' : 'Alarm Time (HH:MM)'}
            </Text>
            <TouchableOpacity style={styles.timeButton} onPress={() => setShowTimePicker(true)}>
              <Text style={styles.timeText}>{alarmTime}  •  Select Time</Text>
            </TouchableOpacity>
            {showTimePicker && (
              <DateTimePicker
                value={(() => {
                  const [hours, minutes] = (alarmTime || '09:00').split(':').map(Number);
                  const date = new Date();
                  date.setHours(hours, minutes, 0, 0);
                  return date;
                })()}
                mode="time"
                display="spinner"
                is24Hour={true}
                onChange={onTimeChange}
              />
            )}

            <Text style={styles.label}>Alarm Label</Text>
            <TextInput
              style={styles.labelInput}
              value={alarmLabel}
              onChangeText={setAlarmLabel}
              placeholder="Example: Wake Up, College, Study"
              maxLength={200}
              multiline={true}
              textAlignVertical="top"
            />

            <Text style={styles.label}>Repeat Days</Text>
            <View style={styles.daysContainer}>
              {WEEK_DAYS.map(day => (
                <TouchableOpacity
                  key={day}
                  style={[styles.dayButton, repeatDays.includes(day) && styles.selectedDay]}
                  onPress={() => setRepeatDays(previous => previous.includes(day)
                    ? previous.filter(item => item !== day) : [...previous, day])}
                >
                  <Text style={[styles.dayText, repeatDays.includes(day) && styles.selectedDayText]}>{day}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={saveAlarm} disabled={!loaded}>
              <Text style={styles.saveText}>{editingId !== null ? 'Update Alarm' : 'Save Alarm'}</Text>
            </TouchableOpacity>
            {editingId !== null && (
              <TouchableOpacity style={styles.cancelButton} onPress={resetForm}>
                <Text style={styles.cancelText}>Cancel Edit</Text>
              </TouchableOpacity>
            )}

            <Text style={styles.heading}>Saved Alarms</Text>
            <View style={styles.searchRow}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search alarm name or time..."
                value={searchText}
                onChangeText={setSearchText}
              />
              {searchText.length > 0 && (
                <TouchableOpacity onPress={() => setSearchText('')} style={styles.clearSearch}>
                  <Text style={styles.clearSearchText}>×</Text>
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.countText}>
              {alarms.length} Total Alarms  |  {displayedAlarms.length} Displayed
            </Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryText}>Total: {alarms.length}</Text>
              <Text style={[styles.summaryText, { color: 'green' }]}>ON: {onCount}</Text>
              <Text style={[styles.summaryText, { color: '#777' }]}>OFF: {offCount}</Text>
            </View>
            <View style={styles.filterRow}>
              {['All', 'ON', 'OFF'].map(filter => (
                <TouchableOpacity
                  key={filter}
                  onPress={() => setAlarmFilter(filter)}
                  style={[styles.filterButton, alarmFilter === filter && styles.activeFilter]}
                >
                  <Text style={{ fontWeight: 'bold', color: alarmFilter === filter ? '#fff' : '#222' }}>
                    {filter}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              onPress={clearAllAlarms}
              disabled={!loaded || alarms.length === 0}
              style={[styles.clearAllButton, (!loaded || alarms.length === 0) && styles.disabledButton]}
            >
              <Text style={styles.clearAllText}>Clear All Alarms</Text>
            </TouchableOpacity>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>
              {alarms.length === 0 ? 'No alarms saved yet' : 'No matching alarms found'}
            </Text>
            <Text style={styles.emptyNote}>
              {alarms.length === 0 ? 'Create your first alarm above.' : 'Try another search or change the filter.'}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.alarmCard}>
            <View style={styles.alarmInfo}>
              <Text style={styles.alarmText}>{item.time}</Text>
              {!!item.label && <Text style={styles.alarmLabel}>{item.label}</Text>}
              <Text style={styles.repeatText}>
            {item.repeatDays?.length
  ? WEEK_DAYS.filter(day => item.repeatDays.includes(day)).join(', ')
  : 'One-time'}
              </Text>
            </View>
            <Switch value={item.enabled === true} onValueChange={() => toggleAlarm(item.id)} />
            <TouchableOpacity style={styles.editButton} onPress={() => editAlarm(item)}>
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteButton} onPress={() => deleteAlarm(item.id)}>
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
        ListFooterComponent={
          <Text style={styles.note}>Demo only - alarms are not scheduled on iPhone</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EEF4FF' },
  content: { padding: 15, paddingTop: 45, paddingBottom: 35 },
  title: { fontSize: 38, fontWeight: 'bold', color: '#1D5FD3', textAlign: 'center' },
  subtitle: { fontSize: 20, color: '#475569', textAlign: 'center', marginBottom: 30 },
  label: { fontSize: 19, fontWeight: 'bold', marginBottom: 12 },
  timeButton: { backgroundColor: '#fff', borderColor: '#94A3B8', borderWidth: 1, borderRadius: 12, padding: 16, marginBottom: 20 },
  timeText: { fontSize: 22, textAlign: 'center', color: '#1D5FD3', fontWeight: 'bold' },
  labelInput: { minHeight: 76, backgroundColor: '#fff', borderWidth: 1, borderColor: '#94A3B8', borderRadius: 12, padding: 14, fontSize: 16, marginBottom: 20 },
  daysContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  dayButton: { backgroundColor: '#E2E8F0', paddingVertical: 12, paddingHorizontal: 9, borderRadius: 10 },
  selectedDay: { backgroundColor: '#1D5FD3' },
  dayText: { color: '#334155', fontSize: 12, fontWeight: 'bold' },
  selectedDayText: { color: '#fff' },
  saveButton: { backgroundColor: '#1D5FD3', padding: 19, borderRadius: 12, alignItems: 'center' },
  saveText: { color: '#fff', fontSize: 21, fontWeight: 'bold' },
  cancelButton: { padding: 12, alignItems: 'center' },
  cancelText: { color: '#B42318', fontWeight: 'bold' },
  heading: { fontSize: 24, fontWeight: 'bold', marginTop: 30, marginBottom: 15 },
  searchRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ccc', borderRadius: 10, marginBottom: 10, backgroundColor: '#fff' },
  searchInput: { flex: 1, padding: 12, color: '#000' },
  clearSearch: { padding: 12 },
  clearSearchText: { fontSize: 22, color: '#666' },
  countText: { fontSize: 15, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#f2f6ff', padding: 15, borderRadius: 12, marginBottom: 12 },
  summaryText: { fontWeight: 'bold', color: '#222' },
  filterRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 12 },
  filterButton: { backgroundColor: '#e5e7eb', paddingVertical: 10, paddingHorizontal: 24, borderRadius: 10 },
  activeFilter: { backgroundColor: '#2563eb' },
  clearAllButton: { backgroundColor: '#dc2626', padding: 12, borderRadius: 10, alignItems: 'center', marginBottom: 12 },
  disabledButton: { backgroundColor: '#ccc' },
  clearAllText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  emptyContainer: { alignItems: 'center', padding: 25, marginTop: 10 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#555', marginBottom: 8 },
  emptyNote: { fontSize: 14, color: '#888', textAlign: 'center' },
  alarmCard: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 12, flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  alarmInfo: { flex: 1, minWidth: 0 },
  alarmText: { fontSize: 21, fontWeight: 'bold', color: '#111827' },
  alarmLabel: { flexShrink: 1, fontSize: 13, fontWeight: 'bold', color: '#334155' },
  repeatText: { fontSize: 11, color: '#64748B' },
  editButton: { backgroundColor: '#DBEAFE', padding: 9, borderRadius: 8 },
  editText: { color: '#1D4ED8', fontWeight: 'bold' },
  deleteButton: { backgroundColor: '#FEE2E2', padding: 9, borderRadius: 8 },
  deleteText: { color: '#B91C1C', fontWeight: 'bold' },
  note: { textAlign: 'center', color: '#64748B', marginTop: 22, fontSize: 12 },
});
