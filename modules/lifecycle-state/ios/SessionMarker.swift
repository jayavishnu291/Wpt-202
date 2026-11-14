
import Foundation

final class SessionMarker {

    private static let markerKey = "WPT202_FC8_SessionActive"
    private static let launchKey = "WPT202_FC8_LastLaunch"

    // Previous session normal-aa finish aagala-nu check
    static func wasPreviousSessionInterrupted() -> Bool {
        return UserDefaults.standard.bool(forKey: markerKey)
    }

    // New session start
    static func markSessionStarted() {
        UserDefaults.standard.set(true, forKey: markerKey)
        UserDefaults.standard.set(
            Date().timeIntervalSince1970,
            forKey: launchKey
        )
    }

    // Normal session end
    static func markSessionEnded() {
        UserDefaults.standard.set(false, forKey: markerKey)
    }

    // Last launch timestamp
    static func getLastLaunchTime() -> Double {
        return UserDefaults.standard.double(forKey: launchKey)
    }
}
