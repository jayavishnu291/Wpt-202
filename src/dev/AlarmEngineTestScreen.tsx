
import React, { useCallback, useEffect, useState } from 'react';
import {
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import * as AlarmEngine from '../../modules/alarm-engine/src';

import type {
    AlarmEngineStatus,
    AlarmLogEntry,
} from '../../modules/alarm-engine/src';

import { configureAlarmEngine } from '../services/alarmEngine';

/** DEV ONLY screen for FC-5 (card H2). */
export default function AlarmEngineTestScreen() {

    const [status, setStatus] =
        useState<AlarmEngineStatus | null>(null);

    const [log, setLog] =
        useState<AlarmLogEntry[]>([]);

    const [message, setMessage] = useState('');

    const refresh = useCallback(() => {

        if (
            Platform.OS !== 'android' ||
            !AlarmEngine.isAvailable()
        ) {
            setMessage(
                'Android only: the native alarm engine is not available here.'
            );
            return;
        }

        setStatus(AlarmEngine.getStatus());

        setLog(
            AlarmEngine.readLog().slice().reverse()
        );

    }, []);

    useEffect(() => {

        configureAlarmEngine();

        const timer = setTimeout(refresh, 0);

        return () => clearTimeout(timer);

    }, [refresh]);

    const ringIn = async (minutes: number) => {

        try {

            const when = Date.now() + minutes * 60_000;

            const mode =
                await AlarmEngine.scheduleTestAlarm(when);

            setMessage(
                `Scheduled for ${new Date(when).toLocaleTimeString()} (${mode}). Lock the phone now.`
            );

        } catch (error) {

            setMessage(
                `Failed: ${error instanceof Error ? error.message : String(error)}`
            );
        }

        refresh();
    };

    const cancel = async () => {

        await AlarmEngine.cancelTestAlarm();

        setMessage('Test alarm cancelled.');

        refresh();
    };

    return (
        <SafeAreaView style={styles.root}>

            <ScrollView contentContainerStyle={styles.content}>

                <Text style={styles.title}>
                    H2 · Alarm engine test (FC-5)
                </Text>

                {message ? (
                    <Text style={styles.message}>
                        {message}
                    </Text>
                ) : null}

                {status && (
                    <View style={styles.card}>

                        <Text style={styles.line}>
                            {`Phone: ${status.brand} ${status.model}, Android ${status.androidVersion} (API ${status.sdk})`}
                        </Text>

                        <Text style={styles.line}>
                            {`Exact alarms allowed: ${status.exactAlarmsAllowed ? 'YES' : 'NO'}`}
                        </Text>

                        <Text style={styles.line}>
                            {`Notifications allowed: ${status.notificationsAllowed ? 'YES' : 'NO'}`}
                        </Text>

                        <Text style={styles.line}>
                            {`Full-screen alarm allowed: ${status.fullScreenAllowed ? 'YES' : 'NO'}`}
                        </Text>

                        <Text style={styles.line}>
                            {`Scheduled: ${status.scheduled.map((s) => new Date(s.at).toLocaleTimeString()).join(', ') || 'none'}`}
                        </Text>

                    </View>
                )}

                <Button
                    label="Ring in 1 minute"
                    onPress={() => ringIn(1)}
                />

                <Button
                    label="Ring in 2 minutes"
                    onPress={() => ringIn(2)}
                />

                <Button
                    label="Ring in 5 minutes (for the restart test)"
                    onPress={() => ringIn(5)}
                />

                <Button
                    label="Cancel test alarm"
                    onPress={cancel}
                />

                <Button
                    label="Open exact alarm settings"
                    onPress={() =>
                        AlarmEngine.openExactAlarmSettings()
                    }
                />

                <Button
                    label="Open full-screen alarm settings"
                    onPress={() =>
                        AlarmEngine.openFullScreenSettings()
                    }
                />

                <Button
                    label="Refresh"
                    onPress={refresh}
                />

                <Button
                    label="Clear log"
                    onPress={() => {
                        AlarmEngine.clearLog();
                        refresh();
                    }}
                />

                <Text style={styles.subtitle}>
                    Log (newest first)
                </Text>

                {log.map((entry, index) => (

                    <Text
                        key={`${entry.at}-${index}`}
                        style={styles.logLine}
                    >
                        {`${new Date(entry.at).toLocaleTimeString()} ${entry.type} ${entry.detail}`}
                    </Text>

                ))}

            </ScrollView>

        </SafeAreaView>
    );
}

function Button({
    label,
    onPress,
}: {
    label: string;
    onPress: () => void;
}) {
    return (
        <Pressable
            accessibilityRole="button"
            style={styles.button}
            onPress={onPress}
        >
            <Text style={styles.buttonText}>
                {label}
            </Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({

    root: {
        flex: 1,
        backgroundColor: '#F7F5EF',
    },

    content: {
        padding: 20,
        gap: 10,
    },

    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1E2430',
    },

    subtitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1E2430',
        marginTop: 12,
    },

    message: {
        fontSize: 15,
        color: '#3A7D44',
    },

    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        padding: 12,
        gap: 4,
    },

    line: {
        fontSize: 14,
        color: '#1E2430',
    },

    logLine: {
        fontSize: 12,
        color: '#1E2430',
        fontFamily: Platform.OS === 'android'
            ? 'monospace'
            : 'Menlo',
    },

    button: {
        minHeight: 48,
        borderRadius: 10,
        backgroundColor: '#3A7D44',
        justifyContent: 'center',
        paddingHorizontal: 16,
    },

    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
