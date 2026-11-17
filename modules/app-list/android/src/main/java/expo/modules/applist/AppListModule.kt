package expo.modules.applist

import android.content.Context
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

/**
 * AppList (PRD 14.2): "Launcher apps with names and icons" (FR-BL-01).
 * JavaScript name: "AppList".
 */
class AppListModule : Module() {

  private val context: Context
    get() = appContext.reactContext
      ?: throw IllegalStateException("The app context is not available yet")

  override fun definition() = ModuleDefinition {
    Name("AppList")

    // AsyncFunction runs on a background thread, so reading ~100 icons never freezes the screen.
    AsyncFunction("getLauncherApps") { ->
      LauncherAppsReader.read(context)
    }
  }
}
