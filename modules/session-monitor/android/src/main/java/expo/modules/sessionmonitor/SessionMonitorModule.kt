package expo.modules.sessionmonitor

import android.content.pm.ApplicationInfo
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class SessionMonitorModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("SessionMonitor")

    Constant("serviceType") { "specialUse" }

    AsyncFunction("startTestSession") { kind: String, plannedEndMs: Double ->
      require(kind == "focus" || kind == "night" || kind == "nap") {
        "Session kind must be focus, night, or nap."
      }
      require(plannedEndMs.isFinite()) { "Planned end must be a finite timestamp." }
      val now = System.currentTimeMillis()
      require(plannedEndMs > now) { "Planned end must be in the future." }

      val maximumDurationMs = when (kind) {
        "night" -> 14 * 60 * 60_000L
        "nap" -> 4 * 60 * 60_000L
        else -> Long.MAX_VALUE
      }
      val endMs = minOf(plannedEndMs.toLong(), now + maximumDurationMs)
      val context = SessionMonitorStore.protectedContext(appContext.reactContext
        ?: error("React context is unavailable."))
      val session = SessionMonitorStore.startSession(context, kind, endMs)
      SessionMonitorService.start(context)
    }

    AsyncFunction("stopSession") {
      val context = SessionMonitorStore.protectedContext(appContext.reactContext
        ?: error("React context is unavailable."))
      SessionMonitorStore.activeSession(context)?.let { session ->
        SessionMonitorStore.endSession(context, session)
      }
      SessionMonitorAlarmScheduler.cancel(context)
      SessionMonitorService.stop(context)
    }

    AsyncFunction("stopServiceForTest") {
      val context = SessionMonitorStore.protectedContext(appContext.reactContext
        ?: error("React context is unavailable."))
      check(context.applicationInfo.flags and ApplicationInfo.FLAG_DEBUGGABLE != 0) {
        "Stopping the service without ending the session is only available in debug builds."
      }
      SessionMonitorService.stop(context)
    }

    AsyncFunction("readEvents") {
      val context = SessionMonitorStore.protectedContext(appContext.reactContext
        ?: error("React context is unavailable."))
      SessionMonitorStore.readEvents(context).map { it.toMap() }
    }
  }
}
