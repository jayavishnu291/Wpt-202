package expo.modules.applist

import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.content.pm.ResolveInfo
import android.graphics.Bitmap
import android.graphics.Canvas
import android.os.Build
import android.util.Base64
import java.io.ByteArrayOutputStream

/**
 * Reads the apps that have a home-screen icon.
 *
 * Method: ask Android "which activities answer ACTION_MAIN + CATEGORY_LAUNCHER?".
 * This works without the QUERY_ALL_PACKAGES permission because the same intent is declared in the
 * manifest <queries> section (added by plugins/withBlockingQueries.js).
 */
object LauncherAppsReader {

  private const val ICON_SIZE_PX = 96

  fun read(context: Context): List<Map<String, Any>> {
    val pm = context.packageManager
    val launcherIntent = Intent(Intent.ACTION_MAIN).addCategory(Intent.CATEGORY_LAUNCHER)

    val seen = HashSet<String>()
    val result = ArrayList<Map<String, Any>>()

    for (info in queryLauncherActivities(pm, launcherIntent)) {
      val packageName = info.activityInfo?.packageName ?: continue
      // Some apps have several launcher icons; we list each app once.
      if (!seen.add(packageName)) continue

      val label = try {
        info.loadLabel(pm).toString()
      } catch (e: Exception) {
        packageName
      }

      result.add(
        mapOf(
          "packageName" to packageName,
          "label" to label,
          "icon" to iconToDataUri(info, pm)
        )
      )
    }

    return result.sortedBy { (it["label"] as String).lowercase() }
  }

  private fun queryLauncherActivities(pm: PackageManager, intent: Intent): List<ResolveInfo> {
    return try {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
        pm.queryIntentActivities(intent, PackageManager.ResolveInfoFlags.of(0L))
      } else {
        queryLegacy(pm, intent)
      }
    } catch (e: Exception) {
      emptyList()
    }
  }

  @Suppress("DEPRECATION")
  private fun queryLegacy(pm: PackageManager, intent: Intent): List<ResolveInfo> =
    pm.queryIntentActivities(intent, 0)

  /** Draws the app icon into a small bitmap and returns it as a PNG data URI. Never throws. */
  private fun iconToDataUri(info: ResolveInfo, pm: PackageManager): String {
    return try {
      val drawable = info.loadIcon(pm)
      val bitmap = Bitmap.createBitmap(ICON_SIZE_PX, ICON_SIZE_PX, Bitmap.Config.ARGB_8888)
      val canvas = Canvas(bitmap)
      drawable.setBounds(0, 0, ICON_SIZE_PX, ICON_SIZE_PX)
      drawable.draw(canvas)
      val stream = ByteArrayOutputStream()
      bitmap.compress(Bitmap.CompressFormat.PNG, 100, stream)
      bitmap.recycle()
      "data:image/png;base64," + Base64.encodeToString(stream.toByteArray(), Base64.NO_WRAP)
    } catch (e: Throwable) {
      ""
    }
  }
}
