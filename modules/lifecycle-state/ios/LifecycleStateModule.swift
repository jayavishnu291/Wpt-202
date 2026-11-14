
import ExpoModulesCore
import UIKit

public class LifecycleStateModule: Module {

  private var observers: [NSObjectProtocol] = []
  private var lastEvent = "none"
  private var previousSessionInterrupted = false
  private var leaveTime: TimeInterval = 0
  private var lockSignalDelay: TimeInterval = 0

  public func definition() -> ModuleDefinition {

    Name("LifecycleState")

    OnCreate {

        self.previousSessionInterrupted =
    SessionMarker.wasPreviousSessionInterrupted()

let previousSessionInterrupted =
    SessionMarker.wasPreviousSessionInterrupted()

print(
    "WPT202 FC-8: Previous session interrupted = \(previousSessionInterrupted)"
)

SessionMarker.markSessionStarted()

      let center = NotificationCenter.default

      // App becomes inactive
      let inactive = center.addObserver(
        forName: UIApplication.willResignActiveNotification,
        object: nil,
        queue: .main
      ) { [weak self] _ in
        self?.lastEvent = "inactive"
        self?.leaveTime =
          ProcessInfo.processInfo.systemUptime

        print("WPT202: App became inactive")
      }

      // iPhone lock signal
      let lockSignal = center.addObserver(
        forName: UIApplication.protectedDataWillBecomeUnavailableNotification,
        object: nil,
        queue: .main
      ) { [weak self] _ in

        guard let self = self else { return }

        self.lastEvent = "lock"

        if self.leaveTime > 0 {
          self.lockSignalDelay =
            ProcessInfo.processInfo.systemUptime
            - self.leaveTime

          print(
            "WPT202 FC-2: Lock delay = \(self.lockSignalDelay) seconds"
          )
        }

        print("WPT202 FC-2: Lock signal detected")
      }

      // App enters background
      let background = center.addObserver(
        forName: UIApplication.didEnterBackgroundNotification,
        object: nil,
        queue: .main
      ) { [weak self] _ in
        self?.lastEvent = "background"
        print("WPT202: App entered background")
      }

      // App becomes active again
      let active = center.addObserver(
        forName: UIApplication.didBecomeActiveNotification,
        object: nil,
        queue: .main
      ) { [weak self] _ in
        self?.lastEvent = "active"
        print("WPT202: App became active")
      }

      self.observers = [
        inactive,
        lockSignal,
        background,
        active
      ]
    }

    OnDestroy {
      for observer in self.observers {
        NotificationCenter.default.removeObserver(observer)
      }
      self.observers.removeAll()
    }

    
Function("getPreviousSessionInterrupted") {
    return self.previousSessionInterrupted
}

Function("getPreviousSessionInterrupted") {
    return SessionMarker.wasPreviousSessionInterrupted()
}

    Function("getLastEvent") {
      return self.lastEvent
    }

    Function("getLockSignalDelay") {
      return self.lockSignalDelay
    }
  }
}
