/* Полная конфигурация ESLint для React Native + TypeScript */
module.exports = {
  root: true,
  env: {
    es2022: true,
    node: true,
    jest: true
  },
  extends: [
    '@react-native/eslint-config' // профильный конфиг для RN
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    'android/',
    'ios/'
  ],
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint'],
      extends: [
        'plugin:@typescript-eslint/recommended'
      ],
      rules: {
        '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-explicit-any': 'off'
      }
    }
  ]
};
