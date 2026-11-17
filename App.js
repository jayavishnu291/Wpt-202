
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Alert,
  Platform,
  PermissionsAndroid,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { StatusBar } from "expo-status-bar";
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  requestAlarmPermission,
  scheduleAlarm,
  cancelAlarm,
} from "./modules/wpt202-alarmkit/src";

import {
  isAvailable as isAndroidAlarmAvailable,
  canScheduleExactAlarms,
  scheduleTestAlarm,
} from "./modules/alarm-engine/src";

const STORAGE_KEY = "wpt202_alarms";

const WEEK_DAYS = [
  "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
];

// ============================================
// ANDROID NATIVE ALARM TEST - FC-5
// ============================================

async function testAndroidNativeAlarm() {
  if (Platform.OS !== "android") {
    Alert.alert("Android Only", "This test is for Android.");
    return;
  }

  try {
    // Request notification permission on Android 13+
    if (Number(Platform.Version) >= 33) {
      const permission = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        {
          title: "WPT202 Alarm Notifications",
          message:
            "Allow notifications to display alarm alerts and STOP controls.",
          buttonPositive: "Allow",
          buttonNegative: "Cancel",
        }
      );

      if (permission !== PermissionsAndroid.RESULTS.GRANTED) {
        Alert.alert(
          "Notification Permission Required",
          "Enable WPT202 notifications in Android Settings."
        );
        return;
      }
    }

    if (!isAndroidAlarmAvailable()) {
      Alert.alert(
        "Module Unavailable",
        "Android AlarmEngine is not included in this build."
      );
      return;
    }

    if (!canScheduleExactAlarms()) {
      Alert.alert(
        "Exact Alarm Permission Required",
        "Open Settings > Apps > Special access > Alarms & reminders and allow WPT202."
      );
      return;
    }

    const timeMs = Date.now() + 2 * 60 * 1000;
    const success = await scheduleTestAlarm(timeMs);

    Alert.alert(
      success ? "Test Alarm Scheduled" : "Scheduling Failed",
      success
        ? "Alarm scheduled for 2 minutes from now. Lock your phone and test the ringing screen and STOP control."
        : "Android native scheduling failed."
    );
  } catch (error) {
    Alert.alert(
      "Android Alarm Error",
      String(error?.message || error)
    );
  }
}

// ============================================
// MAIN APPLICATION
// ============================================

export default function App() {
  const [alarmTime, setAlarmTime] = useState("09:00");
  const [alarmLabel, setAlarmLabel] = useState("");
  const [repeatDays, setRepeatDays] = useState([]);
  const [alarms, setAlarms] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [alarmFilter, setAlarmFilter] = useState("All");
  const [busy, setBusy] = useState(false);

  const operationLock = useRef(false);

  // Load stored alarms
  useEffect(() => {
    let active = true;

    const loadAlarms = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);

        if (active && saved) {
          const parsed = JSON.parse(saved);

          if (Array.isArray(parsed)) {
            setAlarms(parsed);
          }
        }
      } catch (error) {
        Alert.alert("Error", "Could not load saved alarms.");
      } finally {
        if (active) setLoaded(true);
      }
    };

    loadAlarms();

    return () => {
      active = false;
    };
  }, []);

  // Persist alarms
  useEffect(() => {
    if (!loaded) return;

    AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(alarms)
    ).catch(() => {
      Alert.alert("Storage Error", "Could not save alarms.");
    });
  }, [alarms, loaded]);

  const startOperation = () => {
    if (!loaded || operationLock.current) return false;

    operationLock.current = true;
    setBusy(true);
    return true;
  };

  const finishOperation = () => {
    operationLock.current = false;
    setBusy(false);
  };

  const resetForm = () => {
    setEditingId(null);
    setAlarmTime("09:00");
    setAlarmLabel("");
    setRepeatDays([]);
    setShowTimePicker(false);
  };

  // ============================================
  // IOS ALARMKIT PERMISSION
  // ============================================

  const handleAlarmPermission = async () => {
    if (Platform.OS !== "ios") {
      Alert.alert(
        "Android",
        "Use the Test Android Alarm button to check the Android native engine."
      );
      return;
    }

    try {
      const granted = await requestAlarmPermission();

      Alert.alert(
        "AlarmKit Permission",
        granted
          ? "Alarm permission granted."
          : "Alarm permission not granted."
      );
    } catch (error) {
      Alert.alert(
        "AlarmKit Unavailable",
        "A native iOS development build is required."
      );
    }
  };

  // ============================================
  // SAVE OR UPDATE ALARM
  // ============================================

  const saveAlarm = async () => {
    if (!startOperation()) return;

    try {
      // Android FC-5 currently uses isolated test alarm.
      if (Platform.OS === "android") {
        Alert.alert(
          "Android Test Mode",
          "Use Test Android Alarm (2 Minutes). Regular Android alarm saving is not connected yet."
        );
        return;
      }

      const time = alarmTime.trim();

      if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
        Alert.alert("Invalid Time", "Select a valid time.");
        return;
      }

      const selectedDays = [...repeatDays].sort();

      const duplicate = alarms.some(
        (alarm) =>
          alarm.id !== editingId &&
          alarm.time === time &&
          JSON.stringify(
            [...(alarm.repeatDays || [])].sort()
          ) === JSON.stringify(selectedDays)
      );

      if (duplicate) {
        Alert.alert(
          "Duplicate Alarm",
          "Same time and repeat days already exist."
        );
        return;
      }

      const oldAlarm =
        editingId !== null
          ? alarms.find((alarm) => alarm.id === editingId)
          : null;

      if (editingId !== null && !oldAlarm) {
        Alert.alert("Error", "Alarm not found.");
        return;
      }

      const [hour, minute] = time.split(":").map(Number);

      let newNativeId = null;

      const shouldSchedule = !oldAlarm || oldAlarm.enabled;

      if (shouldSchedule) {
        newNativeId = await scheduleAlarm(
          hour,
          minute,
          repeatDays
        );

        if (!newNativeId) {
          Alert.alert(
            "Scheduling Failed",
            "Native alarm could not be scheduled."
          );
          return;
        }
      }

      if (oldAlarm?.nativeAlarmId) {
        let cancelled = false;

        try {
          cancelled = await cancelAlarm(
            oldAlarm.nativeAlarmId
          );
        } catch (error) {
          cancelled = false;
        }

        if (!cancelled) {
          let cleanupSucceeded = true;

          if (newNativeId) {
            try {
              cleanupSucceeded = await cancelAlarm(
                newNativeId
              );
            } catch (error) {
              cleanupSucceeded = false;
            }
          }

          Alert.alert(
            "Update Failed",
            cleanupSucceeded
              ? "Previous alarm could not be cancelled. Original alarm was kept."
              : "Previous alarm could not be cancelled, and the new alarm may still be active."
          );
          return;
        }
      }

      if (oldAlarm) {
        setAlarms((previous) =>
          previous.map((alarm) =>
            alarm.id === editingId
              ? {
                  ...alarm,
                  time,
                  label: alarmLabel.trim(),
                  repeatDays: [...repeatDays],
                  nativeAlarmId: newNativeId,
                }
              : alarm
          )
        );

        Alert.alert("Updated", "Alarm updated.");
      } else {
        setAlarms((previous) => [
          ...previous,
          {
            id: `${Date.now()}-${Math.random()}`,
            time,
            label: alarmLabel.trim(),
            repeatDays: [...repeatDays],
            nativeAlarmId: newNativeId,
            enabled: true,
          },
        ]);

        Alert.alert(
          "Scheduled",
          "Native alarm scheduling request succeeded."
        );
      }

      resetForm();
    } catch (error) {
      Alert.alert(
        "AlarmKit Error",
        String(error?.message || error)
      );
    } finally {
      finishOperation();
    }
  };

  // ============================================
  // EDIT ALARM
  // ============================================

  const editAlarm = (alarm) => {
    if (busy) return;

    setEditingId(alarm.id);
    setAlarmTime(alarm.time);
    setAlarmLabel(alarm.label || "");
    setRepeatDays([...(alarm.repeatDays || [])]);
  };

  // ============================================
  // ENABLE / DISABLE ALARM
  // ============================================

  const toggleAlarm = async (id) => {
    if (!startOperation()) return;

    try {
      if (Platform.OS === "android") {
        Alert.alert(
          "Android Test Mode",
          "Regular Android alarm toggling is not connected yet."
        );
        return;
      }

      const selected = alarms.find(
        (alarm) => alarm.id === id
      );

      if (!selected) return;

      if (selected.enabled) {
        if (!selected.nativeAlarmId) {
          Alert.alert(
            "Unknown Native Status",
            "This alarm has no native ID."
          );
          return;
        }

        const cancelled = await cancelAlarm(
          selected.nativeAlarmId
        );

        if (!cancelled) {
          Alert.alert(
            "Error",
            "Native cancellation failed."
          );
          return;
        }

        setAlarms((previous) =>
          previous.map((alarm) =>
            alarm.id === id
              ? {
                  ...alarm,
                  enabled: false,
                  nativeAlarmId: null,
                }
              : alarm
          )
        );
      } else {
        const [hour, minute] =
          selected.time.split(":").map(Number);

        const newId = await scheduleAlarm(
          hour,
          minute,
          selected.repeatDays || []
        );

        if (!newId) {
          Alert.alert(
            "Error",
            "Native scheduling failed."
          );
          return;
        }

        setAlarms((previous) =>
          previous.map((alarm) =>
            alarm.id === id
              ? {
                  ...alarm,
                  enabled: true,
                  nativeAlarmId: newId,
                }
              : alarm
          )
        );
      }
    } catch (error) {
      Alert.alert(
        "Alarm Error",
        String(error?.message || error)
      );
    } finally {
      finishOperation();
    }
  };

  // ============================================
  // DELETE ALARM
  // ============================================

  const deleteAlarm = (id) => {
    if (busy) return;

    const selected = alarms.find(
      (alarm) => alarm.id === id
    );

    if (!selected) return;

    Alert.alert(
      "Delete Alarm",
      `Delete alarm at ${selected.time}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            if (!startOperation()) return;

            try {
              if (selected.nativeAlarmId) {
                if (Platform.OS === "android") {
                  Alert.alert(
                    "Android Test Mode",
                    "Regular Android alarm deletion is not connected yet."
                  );
                  return;
                }

                const cancelled = await cancelAlarm(
                  selected.nativeAlarmId
                );

                if (!cancelled) {
                  Alert.alert(
                    "Error",
                    "Native alarm cancellation failed."
                  );
                  return;
                }
              }

              setAlarms((previous) =>
                previous.filter(
                  (alarm) => alarm.id !== id
                )
              );

              if (editingId === id) resetForm();

              Alert.alert("Deleted", "Alarm deleted.");
            } catch (error) {
              Alert.alert(
                "Delete Error",
                String(error?.message || error)
              );
            } finally {
              finishOperation();
            }
          },
        },
      ]
    );
  };

  // ============================================
  // CLEAR ALL ALARMS
  // ============================================

  const clearAllAlarms = () => {
    if (!loaded || busy || alarms.length === 0) return;

    Alert.alert(
      "Clear All Alarms",
      "Delete all saved alarms?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete All",
          style: "destructive",
          onPress: async () => {
            if (!startOperation()) return;

            try {
              const failed = [];
              const cancelled = [];

              for (const alarm of alarms) {
                if (!alarm.nativeAlarmId) continue;

                try {
                  const success =
                    Platform.OS === "ios"
                      ? await cancelAlarm(
                          alarm.nativeAlarmId
                        )
                      : false;

                  if (success) {
                    cancelled.push(alarm.id);
                  } else {
                    failed.push(alarm.id);
                  }
                } catch (error) {
                  failed.push(alarm.id);
                }
              }

              if (failed.length > 0) {
                setAlarms((previous) =>
                  previous.map((alarm) =>
                    cancelled.includes(alarm.id)
                      ? {
                          ...alarm,
                          enabled: false,
                          nativeAlarmId: null,
                        }
                      : alarm
                  )
                );

                Alert.alert(
                  "Partial Cancellation",
                  `${failed.length} alarm(s) could not be cancelled.`
                );
                return;
              }

              setAlarms([]);
              resetForm();

              Alert.alert(
                "Cleared",
                "All alarms deleted."
              );
            } catch (error) {
              Alert.alert(
                "Clear All Error",
                String(error?.message || error)
              );
            } finally {
              finishOperation();
            }
          },
        },
      ]
    );
  };

  // ============================================
  // TIME PICKER
  // ============================================

  const onTimeChange = (event, selectedDate) => {
    if (event.type === "dismissed" || !selectedDate) {
      setShowTimePicker(false);
      return;
    }

    const hours = String(
      selectedDate.getHours()
    ).padStart(2, "0");

    const minutes = String(
      selectedDate.getMinutes()
    ).padStart(2, "0");

    setAlarmTime(`${hours}:${minutes}`);

    if (event.type === "set") {
      setShowTimePicker(false);
    }
  };

  // ============================================
  // SEARCH, FILTER AND COUNTS
  // ============================================

  const displayedAlarms = useMemo(() => {
    const search = searchText.trim().toLowerCase();

    return [...alarms]
      .filter(
        (alarm) =>
          alarmFilter === "All" ||
          (alarmFilter === "ON"
            ? alarm.enabled === true
            : alarm.enabled !== true)
      )
      .filter(
        (alarm) =>
          (alarm.label || "")
            .toLowerCase()
            .includes(search) ||
          (alarm.time || "").includes(search)
      )
      .sort((a, b) =>
        a.time.localeCompare(b.time)
      );
  }, [alarms, searchText, alarmFilter]);

  const onCount = alarms.filter(
    (alarm) => alarm.enabled === true
  ).length;

  const offCount = alarms.length - onCount;

  // ============================================
  // USER INTERFACE
  // ============================================

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <FlatList
        data={displayedAlarms}
        keyExtractor={(item) => String(item.id)}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}

        ListHeaderComponent={
          <View>
            <Text style={styles.title}>WPT202</Text>

            <Text style={styles.subtitle}>
              Sprint 1 - Alarm App
            </Text>

            {Platform.OS === "ios" && (
              <TouchableOpacity
                style={styles.permissionButton}
                onPress={handleAlarmPermission}
                disabled={busy}
              >
                <Text style={styles.permissionText}>
                  Enable AlarmKit Permission
                </Text>
              </TouchableOpacity>
            )}

            {Platform.OS === "android" && (
              <TouchableOpacity
                style={styles.androidTestButton}
                onPress={testAndroidNativeAlarm}
                disabled={busy}
              >
                <Text style={styles.permissionText}>
                  Test Android Alarm (2 Minutes)
                </Text>
              </TouchableOpacity>
            )}

            <Text style={styles.label}>
              {editingId !== null
                ? "Edit Alarm Time"
                : "Alarm Time"}
            </Text>

            <TouchableOpacity
              style={styles.timeButton}
              onPress={() => setShowTimePicker(true)}
              disabled={busy}
            >
              <Text style={styles.timeText}>
                {alarmTime} • Select Time
              </Text>
            </TouchableOpacity>

            {showTimePicker && (
              <DateTimePicker
                value={(() => {
                  const [hour, minute] =
                    alarmTime.split(":").map(Number);

                  const date = new Date();
                  date.setHours(hour, minute, 0, 0);
                  return date;
                })()}
                mode="time"
                display="spinner"
                is24Hour={true}
                onChange={onTimeChange}
              />
            )}

            <Text style={styles.label}>
              Alarm Label
            </Text>

            <TextInput
              style={styles.labelInput}
              value={alarmLabel}
              onChangeText={setAlarmLabel}
              placeholder="Example: Wake Up"
              maxLength={200}
              multiline={true}
              editable={!busy}
            />

            <Text style={styles.label}>
              Repeat Days
            </Text>

            <View style={styles.daysContainer}>
              {WEEK_DAYS.map((day) => (
                <TouchableOpacity
                  key={day}
                  disabled={busy}
                  style={[
                    styles.dayButton,
                    repeatDays.includes(day) &&
                      styles.selectedDay,
                  ]}
                  onPress={() =>
                    setRepeatDays((previous) =>
                      previous.includes(day)
                        ? previous.filter(
                            (d) => d !== day
                          )
                        : [...previous, day]
                    )
                  }
                >
                  <Text
                    style={[
                      styles.dayText,
                      repeatDays.includes(day) &&
                        styles.selectedDayText,
                    ]}
                  >
                    {day}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[
                styles.saveButton,
                busy && styles.disabledButton,
              ]}
              onPress={saveAlarm}
              disabled={!loaded || busy}
            >
              <Text style={styles.saveText}>
                {busy
                  ? "Please Wait..."
                  : editingId !== null
                    ? "Update Alarm"
                    : "Save Alarm"}
              </Text>
            </TouchableOpacity>

            {editingId !== null && (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={resetForm}
                disabled={busy}
              >
                <Text style={styles.cancelText}>
                  Cancel Edit
                </Text>
              </TouchableOpacity>
            )}

            <Text style={styles.heading}>
              Saved Alarms
            </Text>

            <View style={styles.searchRow}>
              <TextInput
                style={styles.searchInput}
                value={searchText}
                onChangeText={setSearchText}
                placeholder="Search alarm name or time..."
              />

              {searchText.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchText("")}
                  style={styles.clearSearch}
                >
                  <Text style={styles.clearSearchText}>
                    ×
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <Text style={styles.countText}>
              {alarms.length} Total Alarms |{" "}
              {displayedAlarms.length} Displayed
            </Text>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryText}>
                Total: {alarms.length}
              </Text>

              <Text style={styles.summaryText}>
                ON: {onCount}
              </Text>

              <Text style={styles.summaryText}>
                OFF: {offCount}
              </Text>
            </View>

            <View style={styles.filterRow}>
              {["All", "ON", "OFF"].map((filter) => (
                <TouchableOpacity
                  key={filter}
                  style={[
                    styles.filterButton,
                    alarmFilter === filter &&
                      styles.activeFilter,
                  ]}
                  onPress={() =>
                    setAlarmFilter(filter)
                  }
                >
                  <Text
                    style={{
                      fontWeight: "bold",
                      color:
                        alarmFilter === filter
                          ? "#fff"
                          : "#222",
                    }}
                  >
                    {filter}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[
                styles.clearAllButton,
                (busy || alarms.length === 0) &&
                  styles.disabledButton,
              ]}
              onPress={clearAllAlarms}
              disabled={
                busy || alarms.length === 0
              }
            >
              <Text style={styles.clearAllText}>
                Clear All Alarms
              </Text>
            </TouchableOpacity>
          </View>
        }

        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>
              {alarms.length === 0
                ? "No alarms saved yet"
                : "No matching alarms found"}
            </Text>
          </View>
        }

        renderItem={({ item }) => (
          <View style={styles.alarmCard}>
            <View style={styles.alarmInfo}>
              <Text style={styles.alarmText}>
                {item.time}
              </Text>

              {!!item.label && (
                <Text style={styles.alarmLabel}>
                  {item.label}
                </Text>
              )}

              <Text style={styles.repeatText}>
                {item.repeatDays?.length
                  ? WEEK_DAYS.filter((day) =>
                      item.repeatDays.includes(day)
                    ).join(", ")
                  : "One-time"}
              </Text>
            </View>

            <Switch
              value={item.enabled === true}
              onValueChange={() =>
                toggleAlarm(item.id)
              }
              disabled={busy}
            />

            <TouchableOpacity
              style={styles.editButton}
              onPress={() => editAlarm(item)}
              disabled={busy}
            >
              <Text style={styles.editText}>
                Edit
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() =>
                deleteAlarm(item.id)
              }
              disabled={busy}
            >
              <Text style={styles.deleteText}>
                Delete
              </Text>
            </TouchableOpacity>
          </View>
        )}

        ListFooterComponent={
          <Text style={styles.note}>
            {Platform.OS === "android"
              ? "Android native alarm engine - FC-5 testing"
              : "Native AlarmKit integration - iOS device testing pending"}
          </Text>
        }
      />
    </SafeAreaView>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EEF4FF",
  },

  content: {
    padding: 15,
    paddingTop: 45,
    paddingBottom: 35,
  },

  title: {
    fontSize: 38,
    fontWeight: "bold",
    color: "#1D5FD3",
    textAlign: "center",
  },

  subtitle: {
    fontSize: 20,
    color: "#475569",
    textAlign: "center",
    marginBottom: 30,
  },

  permissionButton: {
    backgroundColor: "#16A34A",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },

  androidTestButton: {
    backgroundColor: "#7C3AED",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },

  permissionText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
  },

  label: {
    fontSize: 19,
    fontWeight: "bold",
    marginBottom: 12,
  },

  timeButton: {
    backgroundColor: "#fff",
    borderColor: "#94A3B8",
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },

  timeText: {
    fontSize: 22,
    textAlign: "center",
    color: "#1D5FD3",
    fontWeight: "bold",
  },

  labelInput: {
    minHeight: 76,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#94A3B8",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    marginBottom: 20,
  },

  daysContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  dayButton: {
    backgroundColor: "#E2E8F0",
    paddingVertical: 12,
    paddingHorizontal: 9,
    borderRadius: 10,
  },

  selectedDay: {
    backgroundColor: "#1D5FD3",
  },

  dayText: {
    color: "#334155",
    fontSize: 12,
    fontWeight: "bold",
  },

  selectedDayText: {
    color: "#fff",
  },

  saveButton: {
    backgroundColor: "#1D5FD3",
    padding: 19,
    borderRadius: 12,
    alignItems: "center",
  },

  saveText: {
    color: "#fff",
    fontSize: 21,
    fontWeight: "bold",
  },

  cancelButton: {
    padding: 12,
    alignItems: "center",
  },

  cancelText: {
    color: "#B42318",
    fontWeight: "bold",
  },

  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 30,
    marginBottom: 15,
  },

  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
  },

  searchInput: {
    flex: 1,
    padding: 12,
    color: "#000",
  },

  clearSearch: {
    padding: 12,
  },

  clearSearchText: {
    fontSize: 22,
    color: "#666",
  },

  countText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#F2F6FF",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
  },

  summaryText: {
    fontWeight: "bold",
    color: "#222",
  },

  filterRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 12,
  },

  filterButton: {
    backgroundColor: "#E5E7EB",
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 10,
  },

  activeFilter: {
    backgroundColor: "#2563EB",
  },

  clearAllButton: {
    backgroundColor: "#DC2626",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 12,
  },

  disabledButton: {
    backgroundColor: "#ccc",
  },

  clearAllText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },

  emptyContainer: {
    alignItems: "center",
    padding: 25,
    marginTop: 10,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#555",
  },

  alarmCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },

  alarmInfo: {
    flex: 1,
    minWidth: 0,
  },

  alarmText: {
    fontSize: 21,
    fontWeight: "bold",
    color: "#111827",
  },

  alarmLabel: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#334155",
  },

  repeatText: {
    fontSize: 11,
    color: "#64748B",
  },

  editButton: {
    backgroundColor: "#DBEAFE",
    padding: 9,
    borderRadius: 8,
  },

  editText: {
    color: "#1D4ED8",
    fontWeight: "bold",
  },

  deleteButton: {
    backgroundColor: "#FEE2E2",
    padding: 9,
    borderRadius: 8,
  },

  deleteText: {
    color: "#B91C1C",
    fontWeight: "bold",
  },

  note: {
    textAlign: "center",
    color: "#64748B",
    marginTop: 22,
    fontSize: 12,
  },
});
