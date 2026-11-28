
import { requireOptionalNativeModule } from 'expo-modules-core';

export type AlarmEngineTexts = {
    title: string;
    body: string;
    stop: string;
    channelName: string;
};

export type AlarmEngineStatus = {
    androidVersion: string;
    sdk: number;
    brand: string;
    model: string;
    exactAlarmsAllowed: boolean;
    notificationsAllowed: boolean;
    fullScreenAllowed: boolean;
    scheduled: { id: number; at: number }[];
};

export type AlarmLogEntry = {
    at: number;
    type: string;
    detail: string;
};

type AlarmEngineNative = {
    configure: (
        texts: AlarmEngineTexts,
        rampStartPercent: number,
        rampEndPercent: number,
        rampSeconds: number,
    ) => boolean;

    canScheduleExactAlarms: () => boolean;
    getStatus: () => AlarmEngineStatus;
    openExactAlarmSettings: () => boolean;
    openFullScreenSettings: () => boolean;

    scheduleTestAlarm: (
        timeMs: number
    ) => Promise<'exact' | 'inexact'>;

    cancelTestAlarm: () => Promise<boolean>;
    readLog: () => string;
    clearLog: () => boolean;
};

const AlarmEngine =
    requireOptionalNativeModule<AlarmEngineNative>('AlarmEngine');

function native(): AlarmEngineNative {
    if (!AlarmEngine) {
        throw new Error(
            'Android native AlarmEngine module unavailable.'
        );
    }

    return AlarmEngine;
}

export function isAvailable(): boolean {
    return AlarmEngine !== null;
}

export function configure(
    texts: AlarmEngineTexts,
    ramp: {
        startPercent: number;
        endPercent: number;
        seconds: number;
    },
): void {
    native().configure(
        texts,
        ramp.startPercent,
        ramp.endPercent,
        ramp.seconds,
    );
}

export function canScheduleExactAlarms(): boolean {
    return AlarmEngine?.canScheduleExactAlarms() ?? false;
}

export function getStatus(): AlarmEngineStatus {
    return native().getStatus();
}

export function openExactAlarmSettings(): void {
    native().openExactAlarmSettings();
}

export function openFullScreenSettings(): void {
    native().openFullScreenSettings();
}

export function scheduleTestAlarm(
    timeMs: number
): Promise<'exact' | 'inexact'> {
    return native().scheduleTestAlarm(timeMs);
}

export function cancelTestAlarm(): Promise<boolean> {
    return native().cancelTestAlarm();
}

export function readLog(): AlarmLogEntry[] {
    return JSON.parse(native().readLog()) as AlarmLogEntry[];
}

export function clearLog(): void {
    native().clearLog();
}
