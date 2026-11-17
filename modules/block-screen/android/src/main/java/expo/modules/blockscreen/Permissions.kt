package expo.modules.blockscreen

import android.app.AppOpsManager
import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import android.os.Process
import android.provider.Settings

/** Checks the two special permissions. Every function is safe: on any problem it answers "no". */
object Permissions {

  fun hasUsageAccess(context: Context): Boolean {
    return try {
      val appOps = context.getSystemService(Context.APP_OPS_SERVICE) as? AppOpsManager
        ?: return false
      val mode = checkUsageMode(appOps, context)
      if (mode == AppOpsManager.MODE_DEFAULT) {
        // Some phones answer "default": then the normal permission check decides.
        context.checkCallingOrSelfPermission(android.Manifest.permission.PACKAGE_USAGE_STATS) ==
          PackageManager.PERMISSION_GRANTED
      } else {
        mode == AppOpsManager.MODE_ALLOWED
      }
    } catch (e: Exception) {
      false
    }
  }

  fun canDrawOverlays(context: Context): Boolean {
    return try {
      Settings.canDrawOverlays(context)
    } catch (e: Exception) {
      false
    }
  }

  private fun checkUsageMode(appOps: AppOpsManager, context: Context): Int {
    return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
      appOps.unsafeCheckOpNoThrow(
        AppOpsManager.OPSTR_GET_USAGE_STATS, Process.myUid(), context.packageName
      )
    } else {
      checkUsageModeLegacy(appOps, context)
    }
  }

  @Suppress("DEPRECATION")
  private fun checkUsageModeLegacy(appOps: AppOpsManager, context: Context): Int =
    appOps.checkOpNoThrow(
      AppOpsManager.OPSTR_GET_USAGE_STATS, Process.myUid(), context.packageName
    )
}
