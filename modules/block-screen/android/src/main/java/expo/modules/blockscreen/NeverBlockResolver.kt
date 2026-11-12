package expo.modules.blockscreen

import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.content.pm.ResolveInfo
import android.net.Uri
import android.os.Build
import android.provider.AlarmClock
import android.provider.Settings
import android.telecom.TelecomManager

/** The apps that can never be blocked (FR-BL-03), worked out at session start. */
data class NeverBlockSet(
  /** The home screen app (class "home"). */
  val home: Set<String>,
  /** Dialler, emergency calling pieces, clock, Settings (class "never-blockable"). */
  val others: Set<String>
) {
  fun all(): Set<String> = home + others
}

/**
 * Works out the default home app, default dialler, clock and Settings WITHOUT any extra permission:
 * it only asks Android "who answers this intent?". Those intents are declared in <queries>
 * by plugins/withBlockingQueries.js (Tech Architecture 8.12). The app itself is added by the caller.
 */
object NeverBlockResolver {

  fun resolve(context: Context): NeverBlockSet {
    val pm = context.packageManager
    val home = HashSet<String>()
    val others = HashSet<String>()

    // 1. Home screen app
    addDefaultOrAll(
      pm,
      Intent(Intent.ACTION_MAIN).addCategory(Intent.CATEGORY_HOME),
      home
    )

    // 2. Phone / dialler. The telecom service names the default dialler directly (no permission).
    try {
      val telecom = context.getSystemService(Context.TELECOM_SERVICE) as? TelecomManager
      val dialer = telecom?.defaultDialerPackage
      if (!dialer.isNullOrEmpty()) {
        others.add(dialer)
      }
    } catch (e: Exception) {
      // Ignore: the DIAL intent below is the backup.
    }
    addDefaultOrAll(pm, Intent(Intent.ACTION_DIAL, Uri.parse("tel:")), others)

    // 3. Clock
    addDefaultOrAll(pm, Intent(AlarmClock.ACTION_SHOW_ALARMS), others)

    // 4. Settings
    addDefaultOrAll(pm, Intent(Settings.ACTION_SETTINGS), others)

    // 5. Emergency / system safety net
    others.addAll(BlockingConfig.SAFETY_NET_PACKAGES)

    return NeverBlockSet(home, others)
  }

  /**
   * If the user chose a default app for this intent, use it. If there is no default (Android shows
   * its "choose an app" box, whose package is "android"), protect every app that could answer.
   */
  private fun addDefaultOrAll(pm: PackageManager, intent: Intent, target: MutableSet<String>) {
    val defaultPackage = resolveDefault(pm, intent)?.activityInfo?.packageName
    if (!defaultPackage.isNullOrEmpty() && defaultPackage != "android") {
      target.add(defaultPackage)
      return
    }
    for (info in queryAll(pm, intent)) {
      val name = info.activityInfo?.packageName
      if (!name.isNullOrEmpty()) {
        target.add(name)
      }
    }
  }

  private fun resolveDefault(pm: PackageManager, intent: Intent): ResolveInfo? {
    return try {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
        pm.resolveActivity(
          intent,
          PackageManager.ResolveInfoFlags.of(PackageManager.MATCH_DEFAULT_ONLY.toLong())
        )
      } else {
        resolveLegacy(pm, intent)
      }
    } catch (e: Exception) {
      null
    }
  }

  @Suppress("DEPRECATION")
  private fun resolveLegacy(pm: PackageManager, intent: Intent): ResolveInfo? =
    pm.resolveActivity(intent, PackageManager.MATCH_DEFAULT_ONLY)

  private fun queryAll(pm: PackageManager, intent: Intent): List<ResolveInfo> {
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
}
