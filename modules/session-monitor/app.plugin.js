const { withAndroidManifest } = require('@expo/config-plugins');

const PERMISSIONS = [
  'android.permission.FOREGROUND_SERVICE',
  'android.permission.FOREGROUND_SERVICE_SPECIAL_USE',
  'android.permission.POST_NOTIFICATIONS',
  'android.permission.RECEIVE_BOOT_COMPLETED',
  'android.permission.SCHEDULE_EXACT_ALARM',
];

function addPermission(manifest, name) {
  const permissions = manifest['uses-permission'] ?? (manifest['uses-permission'] = []);
  if (!permissions.some((permission) => permission.$['android:name'] === name)) {
    permissions.push({ $: { 'android:name': name } });
  }
}

function addComponent(components, name, attributes, intentFilters = []) {
  let component = components.find((entry) => entry.$['android:name'] === name);
  if (!component) {
    component = { $: { 'android:name': name } };
    components.push(component);
  }
  Object.assign(component.$, attributes);

  const existingFilters = component['intent-filter'] ?? (component['intent-filter'] = []);
  const existingActions = new Set(
    existingFilters.flatMap((filter) => (filter.action ?? []).map((action) => action.$['android:name'])),
  );
  for (const filter of intentFilters) {
    const missingActions = (filter.action ?? []).filter(
      (action) => !existingActions.has(action.$['android:name']),
    );
    if (missingActions.length > 0) {
      existingFilters.push({ action: missingActions });
      missingActions.forEach((action) => existingActions.add(action.$['android:name']));
    }
  }
}

function withSessionMonitor(config) {
  return withAndroidManifest(config, (modConfig) => {
    const manifest = modConfig.modResults.manifest;
    PERMISSIONS.forEach((permission) => addPermission(manifest, permission));

    const application = manifest.application?.[0];
    if (!application) throw new Error('Android manifest is missing its application element.');
    const services = application.service ?? (application.service = []);
    const receivers = application.receiver ?? (application.receiver = []);

    const serviceName = 'expo.modules.sessionmonitor.SessionMonitorService';
    const serviceAttributes = {
      'android:exported': 'false',
      'android:foregroundServiceType': 'specialUse',
      'android:stopWithTask': 'false',
      'android:directBootAware': 'true',
    };
    let service = services.find((entry) => entry.$['android:name'] === serviceName);
    if (!service) {
      service = { $: { 'android:name': serviceName } };
      services.push(service);
    }
    Object.assign(service.$, serviceAttributes);
    const properties = service.property ?? (service.property = []);
    const subtype = properties.find(
      (property) => property.$['android:name'] === 'android.app.PROPERTY_SPECIAL_USE_FGS_SUBTYPE',
    );
    if (subtype) {
      subtype.$['android:value'] =
        'Session monitoring with periodic heartbeat and session-end recording';
    } else {
      properties.push({
        $: {
          'android:name': 'android.app.PROPERTY_SPECIAL_USE_FGS_SUBTYPE',
          'android:value': 'Session monitoring with periodic heartbeat and session-end recording',
        },
      });
    }

    addComponent(
      receivers,
      'expo.modules.sessionmonitor.SessionMonitorAlarmReceiver',
      {
        'android:enabled': 'true',
        'android:exported': 'false',
        'android:directBootAware': 'true',
      },
    );
    addComponent(
      receivers,
      'expo.modules.sessionmonitor.SessionMonitorBootReceiver',
      {
        'android:enabled': 'true',
        'android:exported': 'true',
        'android:directBootAware': 'true',
      },
      [
        {
          action: [
            { $: { 'android:name': 'android.intent.action.BOOT_COMPLETED' } },
            { $: { 'android:name': 'android.intent.action.LOCKED_BOOT_COMPLETED' } },
          ],
        },
      ],
    );
    return modConfig;
  });
}

module.exports = withSessionMonitor;
