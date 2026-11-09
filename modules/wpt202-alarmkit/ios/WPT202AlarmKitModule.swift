
import ExpoModulesCore
import AlarmKit

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
  }
}
