import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  AppState,
  FlatList,
  Image,
  Pressable,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';

import { getLauncherApps } from '../../modules/app-list';
import type { LauncherApp } from '../../modules/app-list';
import {
  clearEventLog,
  getBlockingStatus,
  getEventLog,
  getNeverBlockablePackages,
  openOverlaySettings,
  openUsageAccessSettings,
  startTestSession,
  stopTestSession,
} from '../../modules/block-screen';
import type { BlockLogEntry, BlockingStatus } from '../../modules/block-screen';
import { BLOCKING_TEST_TEXTS as T } from './blockingTestTexts';

const EMPTY_STATUS: BlockingStatus = {
  usageAccess: false,
  overlay: false,
  blockingAvailable: false,
  sessionRunning: false,
  blockingActive: false,
  permissionLostDuringSession: false,
};

/**
 * DEV-ONLY screen for FC-4: pick 2-3 apps to block and start a test session.
 * Only open it in development builds (see README_STEPS.md, step 8).
 */
export default function BlockingTestScreen() {
  const [apps, setApps] = useState<LauncherApp[]>([]);
  const [appsLoaded, setAppsLoaded] = useState(false);
  const [neverBlockable, setNeverBlockable] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [stress, setStress] = useState(false);
  const [status, setStatus] = useState<BlockingStatus>(EMPTY_STATUS);
  const [log, setLog] = useState<BlockLogEntry[]>([]);

  const refresh = useCallback(async () => {
    const [newStatus, newLog] = await Promise.all([getBlockingStatus(), getEventLog()]);
    setStatus(newStatus);
    setLog(newLog.slice(-25).reverse());
  }, []);

  // Load the app list and the never-blockable list once.
  useEffect(() => {
    let cancelled = false;
    getLauncherApps().then((list) => {
      if (!cancelled) {
        setApps(list);
        setAppsLoaded(true);
      }
    });
    getNeverBlockablePackages().then((list) => {
      if (!cancelled) setNeverBlockable(list);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Keep the status fresh: every second, and when we come back from a system settings screen.
  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, 1000);
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh();
    });
    return () => {
      clearInterval(timer);
      subscription.remove();
    };
  }, [refresh]);

  const askForPermission = (kind: 'usage' | 'overlay') => {
    const title = kind === 'usage' ? T.usageTitle : T.overlayTitle;
    const text = kind === 'usage' ? T.usageExplainer : T.overlayExplainer;
    // Explainer FIRST, then the system screen (PRD 9.1.1).
    Alert.alert(title, text, [
      { text: T.notNow, style: 'cancel' },
      {
        text: T.continue,
        onPress: () => {
          if (kind === 'usage') {
            openUsageAccessSettings();
          } else {
            openOverlaySettings();
          }
        },
      },
    ]);
  };

  // The "Fix" button opens whichever permission is still missing.
  const onFix = () => {
    if (!status.usageAccess) {
      askForPermission('usage');
    } else if (!status.overlay) {
      askForPermission('overlay');
    }
  };

  const toggleApp = (packageName: string) => {
    setSelected((current) =>
      current.includes(packageName)
        ? current.filter((name) => name !== packageName)
        : [...current, packageName]
    );
  };

  const onStart = async () => {
    // Stress test: add the never-blockable apps to the block list on purpose.
    // They must still open, because the native code refuses to cover them (FR-BL-03, AC-BL-4).
    const toBlock = stress ? Array.from(new Set([...selected, ...neverBlockable])) : selected;
    const result = await startTestSession(toBlock, [], 'focus');
    setStatus(result);
    refresh();
  };

  const onStop = async () => {
    const result = await stopTestSession();
    setStatus(result);
    refresh();
  };

  const onClearLog = async () => {
    await clearEventLog();
    refresh();
  };

  const neverSet = new Set(neverBlockable);
  const visibleApps = apps.filter((app) => !neverSet.has(app.packageName));
  const showNotice = !status.sessionRunning && status.permissionLostDuringSession;

  const renderApp = ({ item }: { item: LauncherApp }) => (
    <View style={styles.appRow}>
      {item.icon ? (
        <Image source={{ uri: item.icon }} style={styles.icon} />
      ) : (
        <View style={styles.icon} />
      )}
      <Text style={styles.appName} numberOfLines={1}>
        {item.label}
      </Text>
      <Switch
        value={selected.includes(item.packageName)}
        onValueChange={() => toggleApp(item.packageName)}
        disabled={status.sessionRunning}
      />
    </View>
  );

  const header = (
    <View>
      <Text style={styles.title}>{T.screenTitle}</Text>

      <View style={styles.row}>
        <Text style={styles.label}>{T.usageAccessLabel}</Text>
        {status.usageAccess ? (
          <Text style={styles.ok}>{T.granted}</Text>
        ) : (
          <Pressable style={styles.smallButton} onPress={() => askForPermission('usage')}>
            <Text style={styles.smallButtonText}>{T.grant}</Text>
          </Pressable>
        )}
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>{T.overlayLabel}</Text>
        {status.overlay ? (
          <Text style={styles.ok}>{T.granted}</Text>
        ) : (
          <Pressable style={styles.smallButton} onPress={() => askForPermission('overlay')}>
            <Text style={styles.smallButtonText}>{T.grant}</Text>
          </Pressable>
        )}
      </View>

      {!status.blockingAvailable && (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>{T.blockingOff}</Text>
          <Pressable style={styles.smallButton} onPress={onFix}>
            <Text style={styles.smallButtonText}>{T.fix}</Text>
          </Pressable>
        </View>
      )}
      {showNotice && (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>{T.permissionLostNotice}</Text>
        </View>
      )}

      <Text style={styles.hint}>{T.pickApps}</Text>
      <Text style={styles.small}>{T.hiddenNote}</Text>
      {!appsLoaded && <Text style={styles.small}>{T.loadingApps}</Text>}
    </View>
  );

  const footer = (
    <View style={styles.footer}>
      <View style={styles.row}>
        <Text style={[styles.label, styles.flex]}>{T.stressLabel}</Text>
        <Switch value={stress} onValueChange={setStress} disabled={status.sessionRunning} />
      </View>

      <Text style={styles.status}>
        {status.sessionRunning
          ? status.blockingActive
            ? `${T.sessionRunning} ${T.blockingIsOn}`
            : `${T.sessionRunning} ${T.blockingOff}`
          : T.sessionStopped}
      </Text>

      {status.sessionRunning ? (
        <Pressable style={styles.button} onPress={onStop}>
          <Text style={styles.buttonText}>{T.stopSession}</Text>
        </Pressable>
      ) : (
        <Pressable style={styles.button} onPress={onStart}>
          <Text style={styles.buttonText}>{T.startSession}</Text>
        </Pressable>
      )}

      <Text style={styles.sectionTitle}>{T.eventLog}</Text>
      <View style={styles.row}>
        <Pressable style={styles.smallButton} onPress={refresh}>
          <Text style={styles.smallButtonText}>{T.refresh}</Text>
        </Pressable>
        <Pressable style={styles.smallButton} onPress={onClearLog}>
          <Text style={styles.smallButtonText}>{T.clearLog}</Text>
        </Pressable>
      </View>
      {log.length === 0 && <Text style={styles.small}>{T.noEvents}</Text>}
      {log.map((entry, index) => (
        <Text key={`${entry.timeMs}-${index}`} style={styles.logLine}>
          {new Date(entry.timeMs).toLocaleTimeString()} {entry.event}
          {entry.appClass ? ` [${entry.appClass}]` : ''}
          {entry.delayMs >= 0 ? ` ${Math.round(entry.delayMs)} ms` : ''}
        </Text>
      ))}
    </View>
  );

  return (
    <View style={styles.screen}>
      <FlatList
        data={visibleApps}
        keyExtractor={(item) => item.packageName}
        renderItem={renderApp}
        ListHeaderComponent={header}
        ListFooterComponent={footer}
        contentContainerStyle={styles.content}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F7F5EF', paddingTop: (StatusBar.currentHeight ?? 24) + 8 },
  content: { paddingHorizontal: 16, paddingBottom: 48 },
  title: { fontSize: 22, fontWeight: '600', color: '#1E2430', marginBottom: 16 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 },
  flex: { flex: 1, paddingRight: 12 },
  label: { fontSize: 16, color: '#1E2430' },
  ok: { fontSize: 16, color: '#3A7D44', fontWeight: '600' },
  hint: { fontSize: 16, color: '#1E2430', marginTop: 16 },
  small: { fontSize: 13, color: '#5A6272', marginTop: 4, marginBottom: 8 },
  banner: {
    backgroundColor: '#FDECC8',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerText: { flex: 1, fontSize: 15, color: '#1E2430', paddingRight: 12 },
  smallButton: {
    minHeight: 48,
    minWidth: 72,
    paddingHorizontal: 16,
    borderRadius: 24,
    backgroundColor: '#3A7D44',
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
  appRow: { flexDirection: 'row', alignItems: 'center', minHeight: 56 },
  icon: { width: 40, height: 40, marginRight: 12, borderRadius: 8 },
  appName: { flex: 1, fontSize: 16, color: '#1E2430' },
  footer: { marginTop: 16 },
  status: { fontSize: 15, color: '#1E2430', marginVertical: 12 },
  button: {
    minHeight: 52,
    borderRadius: 26,
    backgroundColor: '#3A7D44',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '600' },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#1E2430', marginTop: 24 },
  logLine: { fontSize: 13, color: '#1E2430', paddingVertical: 2 },
});
