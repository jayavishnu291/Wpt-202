import ExpoModulesCore
import UIKit
import Foundation

public class LifecycleStateModule: Module {

    private var observers: [NSObjectProtocol] = []
    private let callState = CallStateObserver()

    private var previousInterrupted = false
    private var sessionActive = false
    private var lastLeaveType = "unknown"
    private var lastEvent = "none"
    private var lockSignalDelay: Double = 0

    private var leaveUptime: TimeInterval = 0
    private var leaveDate: Date?
    private var sequence = 0

    private var backgroundTask: UIBackgroundTaskIdentifier = .invalid
    private var classificationWorkItem: DispatchWorkItem?
    private let waitSeconds: TimeInterval = 5

    private var events: [[String: Any]] = []

    private func timestamp(_ date: Date) -> String {
        ISO8601DateFormatter().string(from: date)
    }

    private func record(
        _ action: String,
        type: String,
        at date: Date = Date()
    ) {
        sequence += 1

        let event: [String: Any] = [
            "seq": sequence,
            "action": action,
            "at": timestamp(date),
            "elapsed": ProcessInfo.processInfo.systemUptime,
            "type": type
        ]

        events.append(event)

        do {
            let url = try SessionMarker.eventsURL()
            let data = try JSONSerialization.data(
                withJSONObject: events,
                options: [.prettyPrinted]
            )
            try data.write(to: url, options: .atomic)
        } catch {
            print("WPT202 event write failed: \(error)")
        }
    }

    private func loadEvents() {
        do {
            let url = try SessionMarker.eventsURL()
            guard FileManager.default.fileExists(atPath: url.path) else {
                return
            }
            let data = try Data(contentsOf: url)
            events = (try JSONSerialization.jsonObject(
                with: data
            )) as? [[String: Any]] ?? []

            sequence = events.compactMap {
                $0["seq"] as? Int
            }.max() ?? 0
        } catch {
            print("WPT202 event read failed: \(error)")
        }
    }

    private func endBackgroundTask() {
        if backgroundTask != .invalid {
            UIApplication.shared.endBackgroundTask(backgroundTask)
            backgroundTask = .invalid
        }
    }

    private func classify(_ type: String) {
        classificationWorkItem?.cancel()
        classificationWorkItem = nil

        lastLeaveType = type
        lastEvent = type

        if sessionActive {
            record("leave", type: type, at: leaveDate ?? Date())
        }

        endBackgroundTask()
    }

    private func onInactive() {
        guard sessionActive else { return }

        classificationWorkItem?.cancel()
        classificationWorkItem = nil

        leaveDate = Date()
        leaveUptime = ProcessInfo.processInfo.systemUptime
        lockSignalDelay = 0
        lastLeaveType = "unknown"
        lastEvent = "inactive"

        if callState.isCallActive {
            classify("call")
        }
    }

    private func onBackground() {
        guard sessionActive else { return }
        guard lastLeaveType != "call" else { return }

        lastEvent = "background"

        backgroundTask = UIApplication.shared.beginBackgroundTask(
            withName: "WPT202-FC2"
        ) { [weak self] in
            DispatchQueue.main.async {
                guard let self = self else { return }
                self.classificationWorkItem?.cancel()
                self.classificationWorkItem = nil
                self.classify("unknown")
            }
        }

        let item = DispatchWorkItem { [weak self] in
            guard let self = self else { return }
            guard self.lastLeaveType == "unknown" else { return }

            // Provisional result only: real iPhone validation required.
            self.classify("switch")
        }

        classificationWorkItem = item
        DispatchQueue.main.asyncAfter(
            deadline: .now() + waitSeconds,
            execute: item
        )
    }

    private func onLockSignal() {
        guard sessionActive else { return }
        guard leaveUptime > 0 else { return }

        lockSignalDelay = max(
            0,
            ProcessInfo.processInfo.systemUptime - leaveUptime
        )

        classify("lock")
    }

    private func onActive() {
        guard sessionActive else { return }

        classificationWorkItem?.cancel()
        classificationWorkItem = nil

        if lastLeaveType == "unknown" && leaveDate != nil {
            // Foreground return without a confirmed lock signal.
            classify("unknown")
        }

        if leaveDate != nil {
            record("return", type: lastLeaveType)
            leaveDate = nil
        }

        endBackgroundTask()
        lastEvent = "active"
    }

    public func definition() -> ModuleDefinition {
        Name("LifecycleState")

        OnCreate {
            do {
                try SessionMarker.prepareStorage()
                self.previousInterrupted =
                    SessionMarker.wasPreviousSessionInterrupted()
                self.loadEvents()
            } catch {
                print("WPT202 storage setup failed: \(error)")
            }

            let center = NotificationCenter.default

            self.observers = [
                center.addObserver(
                    forName: UIApplication.willResignActiveNotification,
                    object: nil,
                    queue: .main
                ) { [weak self] _ in
                    self?.onInactive()
                },

                center.addObserver(
                    forName: UIApplication.didEnterBackgroundNotification,
                    object: nil,
                    queue: .main
                ) { [weak self] _ in
                    self?.onBackground()
                },

                center.addObserver(
                    forName: UIApplication.protectedDataWillBecomeUnavailableNotification,
                    object: nil,
                    queue: .main
                ) { [weak self] _ in
                    self?.onLockSignal()
                },

                center.addObserver(
                    forName: UIApplication.didBecomeActiveNotification,
                    object: nil,
                    queue: .main
                ) { [weak self] _ in
                    self?.onActive()
                }
            ]
        }

        OnDestroy {
            for observer in self.observers {
                NotificationCenter.default.removeObserver(observer)
            }
            self.observers.removeAll()
            self.classificationWorkItem?.cancel()
            self.endBackgroundTask()
        }

        Function("isAvailable") {
            return true
        }

        Function("startSession") {
            try SessionMarker.markSessionStarted()
            self.sessionActive = true
            self.leaveDate = nil
            self.lastLeaveType = "unknown"
        }

        Function("endSession") {
            try SessionMarker.markSessionEnded()
            self.sessionActive = false
            self.leaveDate = nil
            self.classificationWorkItem?.cancel()
            self.classificationWorkItem = nil
            self.endBackgroundTask()
        }

        Function("wasClosedDuringSession") {
            return self.previousInterrupted
        }

        Function("getPreviousSessionInterrupted") {
            return self.previousInterrupted
        }

        Function("getLastLeaveType") {
            return self.lastLeaveType
        }

        Function("getLastEvent") {
            return self.lastEvent
        }

        Function("getLockSignalDelay") {
            return self.lockSignalDelay
        }

        Function("isCallActive") {
            return self.callState.isCallActive
        }

        Function("readEvents") {
            return self.events
        }
    }
}