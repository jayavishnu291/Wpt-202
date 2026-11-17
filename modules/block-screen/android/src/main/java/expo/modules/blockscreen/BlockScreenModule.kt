package expo.modules.blockscreen

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.provider.Settings
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

/**
 * BlockScreen (PRD 14.2): "Show S-14". JavaScript name: "BlockScreen".
 * Also holds the permission helpers, the front-app check and the dev test session for FC-4.
 */
class BlockScreenModule : Module() {

  private val context: Context
    get() = appContext.reactContext
      ?: throw IllegalStateException("The app context is not available yet")

  override fun definition() = ModuleDefinition {
    Name("BlockScreen")

    // Are Usage access and Display over other apps granted? Is a test session running?
    Function("getBlockingStatus") { ->
      SessionController.status(context)
    }

    // Opens the system "Usage access" screen (Settings.ACTION_USAGE_ACCESS_SETTINGS).
    // The explainer text (PRD 9.1.1) must be shown BEFORE calling this.
    Function("openUsageAccessSettings") { ->
      openSystemScreen(Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS))
    }

    // Opens the system "Display over other apps" screen for this app
    // (Settings.ACTION_MANAGE_OVERLAY_PERMISSION). Explainer first, as above.
    Function("openOverlaySettings") { ->
      openSystemScreen(
        Intent(
          Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
          Uri.parse("package:" + context.packageName)
        )
      )
    }

    // Start the dev-only test session. Without both permissions nothing starts (fallback, FR-BL-07).
    Function("startTestSession") { blocked: List<String>, allowed: List<String>, mode: String ->
      SessionController.start(context, blocked, allowed, mode)
    }

    Function("stopTestSession") { ->
      SessionController.stop(context)
    }

    // Apps that can never be blocked right now (FR-BL-03), incl. our own app.
    AsyncFunction("getNeverBlockablePackages") { ->
      NeverBlockResolver.resolve(context).all().plus(context.packageName).toList()
    }

    // Event log with classes only (no package names).
    Function("getEventLog") { ->
      BlockingState.snapshot()
    }

    Function("clearEventLog") { ->
      BlockingState.clearLog()
    }
  }

  /** Opens a system settings screen. If that is refused, falls back to the main Settings screen. */
  private fun openSystemScreen(primary: Intent): Boolean {
    return try {
      primary.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      context.startActivity(primary)
      true
    } catch (e: Exception) {
      try {
        val fallback = Intent(Settings.ACTION_SETTINGS)
        fallback.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        context.startActivity(fallback)
        true
      } catch (e2: Exception) {
        false
      }
    }
  }
}
