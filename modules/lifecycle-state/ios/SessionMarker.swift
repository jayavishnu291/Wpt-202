import Foundation

final class SessionMarker {
    private static var folder: URL {
        let support = FileManager.default.urls(
            for: .applicationSupportDirectory,
            in: .userDomainMask
        )[0]
        return support
            .appendingPathComponent("wpt-data", isDirectory: true)
            .appendingPathComponent("lifecycle", isDirectory: true)
    }

    private static var marker: URL {
        folder.appendingPathComponent("active-session")
    }

    static func prepareStorage() throws {
        let root = folder.deletingLastPathComponent()
        try FileManager.default.createDirectory(
            at: folder,
            withIntermediateDirectories: true
        )

        var values = URLResourceValues()
        values.isExcludedFromBackup = true
        var mutableRoot = root
        try mutableRoot.setResourceValues(values)
    }

    static func wasPreviousSessionInterrupted() -> Bool {
        FileManager.default.fileExists(atPath: marker.path)
    }

    static func markSessionStarted() throws {
        try prepareStorage()
        try Data("active".utf8).write(
            to: marker,
            options: .atomic
        )
    }

    static func markSessionEnded() throws {
        if FileManager.default.fileExists(atPath: marker.path) {
            try FileManager.default.removeItem(at: marker)
        }
    }

    static func eventsURL() throws -> URL {
        try prepareStorage()
        return folder.appendingPathComponent("events.json")
    }
}