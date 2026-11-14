
import Foundation

final class SessionMarker {

    private static let fileManager = FileManager.default

    private static var lifecycleDirectory: URL {
        let support = fileManager.urls(
            for: .applicationSupportDirectory,
            in: .userDomainMask
        )[0]

        return support
            .appendingPathComponent("wpt-data", isDirectory: true)
            .appendingPathComponent("lifecycle", isDirectory: true)
    }

    private static var markerFile: URL {
        lifecycleDirectory.appendingPathComponent("session-active")
    }

    // Create storage and exclude wpt-data from backup
    private static func prepareStorage() throws {
        let support = fileManager.urls(
            for: .applicationSupportDirectory,
            in: .userDomainMask
        )[0]

        let dataFolder = support.appendingPathComponent(
            "wpt-data",
            isDirectory: true
        )

        try fileManager.createDirectory(
            at: lifecycleDirectory,
            withIntermediateDirectories: true
        )

        var folder = dataFolder
        var values = URLResourceValues()
        values.isExcludedFromBackup = true
        try folder.setResourceValues(values)
    }

    // Read previous session marker
    static func wasPreviousSessionInterrupted() -> Bool {
        do {
            try prepareStorage()
            return fileManager.fileExists(atPath: markerFile.path)
        } catch {
            print("WPT202 FC-8 storage error: \(error)")
            return false
        }
    }

    // Start session
    static func markSessionStarted() {
        do {
            try prepareStorage()

            let timestamp = ISO8601DateFormatter()
                .string(from: Date())

            try timestamp.write(
                to: markerFile,
                atomically: true,
                encoding: .utf8
            )
        } catch {
            print("WPT202 FC-8 start error: \(error)")
        }
    }

    // End session normally
    static func markSessionEnded() {
        do {
            try prepareStorage()

            if fileManager.fileExists(atPath: markerFile.path) {
                try fileManager.removeItem(at: markerFile)
            }
        } catch {
            print("WPT202 FC-8 end error: \(error)")
        }
    }
}
