module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
  },
  extends: ['eslint:recommended', 'plugin:vue/vue3-essential'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'vue/multi-word-component-names': 'off',
  },
  overrides: [
    {
      files: ['public/simulator.js'],
      parserOptions: {
        sourceType: 'script',
      },
      rules: {
        'no-undef': 'off',
        'no-unused-vars': 'off',
      },
    },
    {
      files: ['vite.config.js', '.eslintrc.cjs'],
      env: {
        node: true,
      },
    },
  ],
}
