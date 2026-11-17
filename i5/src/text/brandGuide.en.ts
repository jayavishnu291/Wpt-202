// I5 - [India] Brand guide content
// Merge this `brandGuide` block into src/text/en.ts.
// Rules: no app name ("the app"), 2-4 steps/brand, each step < 15 words, starts with a verb.
// Status: all brands are "public" (from public source, not checked yet).
// After a real-device check, change status to "device" and fix any menu name that differs.

export const brandGuide = {
  xiaomi: {
    brands: 'Xiaomi / Redmi / POCO',
    status: 'public',
    version: 'MIUI 14 / HyperOS 1.0 (Android 13-14)',
    step1: 'Open Settings → Apps → Manage apps → the app, then turn on Autostart.',
    step2: 'Open Battery saver for the app and choose "No restrictions".',
    step3: 'Allow "Display pop-up windows while running in the background" under Other permissions.',
    step4: 'Lock the app in Recent apps by pulling its card down.',
  },
  oppo: {
    brands: 'Oppo',
    status: 'public',
    version: 'ColorOS 13-14 (Android 13-14)',
    step1: 'Open Settings → Apps → App management → the app → Battery usage.',
    step2: 'Turn on "Allow auto launch" and "Allow background activity".',
    step3: 'Choose "Don\'t optimise" if battery optimisation is shown.',
    step4: 'Lock the app in Recent apps by tapping its lock icon.',
  },
  realme: {
    brands: 'Realme',
    status: 'public',
    version: 'Realme UI 4.0-5.0 (Android 13-14)',
    step1: 'Open Settings → App management → App list → the app → Battery usage.',
    step2: 'Turn on "Allow auto launch" and "Allow background activity".',
    step3: 'Choose "Don\'t optimise" if battery optimisation is shown.',
    step4: 'Lock the app in Recent apps by tapping its lock icon.',
  },
  oneplus: {
    brands: 'OnePlus',
    status: 'public',
    version: 'OxygenOS 13-14 (Android 13-14)',
    step1: 'Open Settings → Apps → App management → the app → Battery usage.',
    step2: 'Turn on "Allow background activity" and "Allow auto launch".',
    step3: 'Choose "Don\'t optimise" under Settings → Battery → Battery optimisation.',
    step4: 'Lock the app in Recent apps from the menu on its card.',
  },
  vivo: {
    brands: 'Vivo',
    status: 'public',
    version: 'Funtouch OS 13-14 (Android 13-14)',
    step1: 'Open Settings → Apps → Autostart, then allow the app.',
    step2: 'Open Settings → Battery → Background power consumption management → the app.',
    step3: 'Choose "Allow high background power consumption".',
    step4: 'Lock the app in Recent apps by pulling its card down.',
  },
  samsung: {
    brands: 'Samsung',
    status: 'public',
    version: 'One UI 5.1-6.1 (Android 13-14)',
    step1: 'Open Settings → Apps → the app → Battery, then choose "Unrestricted".',
    step2: 'Open Settings → Battery → Background usage limits → Never auto sleeping apps.',
    step3: 'Add the app to "Never auto sleeping apps".',
    step4: 'Tap the app icon in Recent apps and choose "Keep open".',
  },
  huawei: {
    brands: 'Huawei / Honor',
    status: 'public',
    version: 'EMUI 12 / HarmonyOS 3 / MagicOS 7-8 (Android 12-14)',
    step1: 'Open Settings → Battery → App launch → the app.',
    step2: 'Turn off "Manage automatically".',
    step3: 'Turn on "Auto-launch", "Secondary launch" and "Run in background".',
    step4: 'Lock the app in Recent apps by tapping its lock icon.',
  },
  tecno: {
    brands: 'Tecno',
    status: 'public',
    version: 'HiOS 13-14 (Android 13-14)',
    step1: 'Open Settings → Apps → the app → Battery, then choose "No restrictions".',
    step2: 'Allow the app in Autostart management under Settings → App management.',
    step3: 'Lock the app in Recent apps by tapping its lock icon.',
  },
  infinix: {
    brands: 'Infinix',
    status: 'public',
    version: 'XOS 13-14 (Android 13-14)',
    step1: 'Open Settings → Apps → the app → Battery, then choose "No restrictions".',
    step2: 'Allow the app in Autostart management under Settings → App management.',
    step3: 'Lock the app in Recent apps by tapping its lock icon.',
  },
} as const;
