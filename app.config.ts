import appJson from './app.json';
import type { ConfigContext, ExpoConfig } from 'expo/config';
import { appConfig } from './config/app.ts';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: config.name ?? appJson.expo.name,
  slug: config.slug ?? appJson.expo.slug,
  android: {
    ...(config.android ?? {}),
    ...(process.env.APP_VARIANT === 'dev'
      ? { package: appConfig.developmentAndroidApplicationId }
      : {}),
  },
});
