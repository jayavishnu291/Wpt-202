const appJson = require('./app.json');

module.exports = ({ config }) => {
  const expoConfig = { ...appJson.expo, ...config };

  return {
    ...expoConfig,
    android: {
      ...appJson.expo.android,
      ...config.android,
      ...(process.env.APP_VARIANT === 'dev'
        ? { package: 'in.whitepixeltechnologies.wpt202a.dev' }
        : {}),
    },
  };
};
