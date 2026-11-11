
import ExpoModulesCore
import AlarmKit
import SwiftUI

public class WPT202AlarmKitModule: Module {

  public func definition() -> ModuleDefinition {

    Name("WPT202AlarmKit")

    Function("isAlarmKitAvailable") {
      if #available(iOS 26.0, *) {
        return true
      } else {
        return false
      }
    }

    AsyncFunction("requestAlarmPermission") { () async throws -> Bool in
      if #available(iOS 26.0, *) {
        let manager = AlarmManager.shared
        let state = try await manager.requestAuthorization()
        return state == .authorized
      } else {
        return false
      }
    }

    AsyncFunction("scheduleAlarm") {
      (hour: Int, minute: Int, repeatDays: [String]) async throws -> Bool in

      guard #available(iOS 26.0, *) else {
        return false
      }

      guard (0...23).contains(hour),
            (0...59).contains(minute) else {
        return false
      }

      let manager = AlarmManager.shared

      let authorization = try await manager.requestAuthorization()
      guard authorization == .authorized else {
        return false
      }

      

let dayMap: [String: Locale.Weekday] = [
  "Sun": .sunday,
  "Mon": .monday,
  "Tue": .tuesday,
  "Wed": .wednesday,
  "Thu": .thursday,
  "Fri": .friday,
  "Sat": .saturday
]

let weekdays = repeatDays.compactMap { dayMap[$0] }

guard weekdays.count == repeatDays.count else {
  return false
}

let recurrence: Alarm.Schedule.Relative.Recurrence =
  weekdays.isEmpty ? .never : .weekly(weekdays)

let schedule = Alarm.Schedule.relative(
  .init(
    time: .init(hour: hour, minute: minute),
    repeats: recurrence
  )
)

let attributes = AlarmAttributes<EmptyAlarmMetadata>(
  presentation: AlarmPresentation(
    alert: AlarmPresentation.Alert(
      title: "WPT202 Alarm",
      stopButton: AlarmButton(
        text: "Stop",
        textColor: .white,
        systemImageName: "stop.circle"
      )
    )
  ),
  tintColor: .orange
)

let configuration = AlarmManager.AlarmConfiguration.alarm(
  schedule: schedule,
  attributes: attributes,
  stopIntent: nil
)

_ = try await manager.schedule(
  id: UUID(),
  configuration: configuration
)
return true
    }
  }
}
