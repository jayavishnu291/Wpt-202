// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

const DEV_IMPORT_PATTERN = {
  group: ['**/dev/**'],
  message: 'Production code must not depend on developer tools.',
};

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
    // Skia is installed and TypeScript resolves it fine.
    // ESLint's import resolver can't follow its entry point, so skip only this package.
    rules: {
      'import/no-unresolved': ['error', { ignore: ['^@shopify/react-native-skia$'] }],
    },
  },
  {
    // Layers: data owns persistence, services expose app operations, UI renders domain data,
    // and developer tools may depend on UI. Production code must not depend on developer tools.
    // NOTE: in flat config the last matching `no-restricted-imports` replaces earlier ones,
    // so the generic block comes first and each layer block repeats the dev pattern.
    files: ['**/*.{js,jsx,ts,tsx}'],
    ignores: [
      'src/dev/**',
      'app/dev/**',
      '**/*.test.{js,jsx,ts,tsx}',
      '**/*.spec.{js,jsx,ts,tsx}',
      'tests/**',
      'site/**',
    ],
    rules: {
      'no-restricted-imports': ['error', { patterns: [DEV_IMPORT_PATTERN] }],
    },
  },
  {
    files: ['src/ui/**/*.{js,jsx,ts,tsx}'],
    ignores: ['**/*.test.{js,jsx,ts,tsx}', '**/*.spec.{js,jsx,ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/data/db/**'],
              message: 'UI must use services rather than importing the database layer directly.',
            },
            DEV_IMPORT_PATTERN,
          ],
        },
      ],
    },
  },
  {
    files: ['src/data/**/*.{js,jsx,ts,tsx}'],
    ignores: ['**/*.test.{js,jsx,ts,tsx}', '**/*.spec.{js,jsx,ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/ui/**', '**/services/**'],
              message: 'The data layer must not depend on UI or services.',
            },
            DEV_IMPORT_PATTERN,
          ],
        },
      ],
    },
  },
  {
    files: ['src/services/**/*.{js,jsx,ts,tsx}'],
    ignores: ['**/*.test.{js,jsx,ts,tsx}', '**/*.spec.{js,jsx,ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/ui/**'],
              message: 'Services must not depend on UI.',
            },
            DEV_IMPORT_PATTERN,
          ],
        },
      ],
    },
  },
]);