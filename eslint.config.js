// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

const productionDevPattern = {
  group: ['**/dev/**'],
  message: 'Production code must not import developer-only modules.',
};

const noRestrictedImports = (patterns = []) => [
  'error',
  {
    patterns: [productionDevPattern, ...patterns],
  },
];

const layerPattern = (folders, message) => ({
  group: folders.map((folder) => `**/${folder}/**`),
  message,
});

module.exports = defineConfig([
  expoConfig,
  {
    ignores: [
      'dist/*',
      'android/**',
      'ios/**',
      '.expo/**',
      'coverage/**',
      'node_modules/**',
    ],
  },
  {
    // ESLint's import resolver cannot follow Skia's entry point.
    rules: {
      'import/no-unresolved': [
        'error',
        { ignore: ['^@shopify/react-native-skia$'] },
      ],
    },
  },
  {
    // Flat config uses the last matching rule configuration, so every layer
    // override includes the production-only dev-import restriction as well.
    files: ['**/*.{js,jsx,ts,tsx}'],
    ignores: [
      '**/dev/**',
      '**/*.test.{js,jsx,ts,tsx}',
      '**/*.spec.{js,jsx,ts,tsx}',
      '**/__tests__/**',
      'tests/**',
      'site/**',
    ],
    rules: {
      'no-restricted-imports': noRestrictedImports(),
    },
  },
  {
    files: ['src/domain/**/*.{js,jsx,ts,tsx}'],
    rules: {
      'no-restricted-imports': noRestrictedImports([
        {
          group: [
            'react',
            'react/**',
            'react-native',
            'react-native/**',
            'expo*',
            'expo*/**',
          ],
          message: 'The domain layer must remain independent of React and Expo.',
        },
        layerPattern(
          ['data', 'native', 'services'],
          'The domain layer must not depend on data, native, or services.',
        ),
      ]),
    },
  },
  {
    files: ['src/data/**/*.{js,jsx,ts,tsx}'],
    rules: {
      'no-restricted-imports': noRestrictedImports([
        layerPattern(
          ['ui', 'app', 'state', 'native'],
          'The data layer must not depend on UI, app, state, or native layers.',
        ),
      ]),
    },
  },
  {
    files: ['src/native/**/*.{js,jsx,ts,tsx}'],
    rules: {
      'no-restricted-imports': noRestrictedImports([
        layerPattern(
          ['ui', 'app', 'state', 'data'],
          'The native layer must not depend on UI, app, state, or data layers.',
        ),
      ]),
    },
  },
  {
    files: ['src/services/**/*.{js,jsx,ts,tsx}'],
    rules: {
      'no-restricted-imports': noRestrictedImports([
        layerPattern(
          ['ui', 'app', 'state'],
          'The services layer must not depend on UI, app, or state layers.',
        ),
      ]),
    },
  },
  {
    files: [
      'src/state/**/*.{js,jsx,ts,tsx}',
      'src/ui/**/*.{js,jsx,ts,tsx}',
      'src/app/**/*.{js,jsx,ts,tsx}',
    ],
    rules: {
      'no-restricted-imports': noRestrictedImports([
        layerPattern(
          ['data', 'native'],
          'State, UI, and app layers must use services rather than importing data or native layers.',
        ),
      ]),
    },
  },
]);
