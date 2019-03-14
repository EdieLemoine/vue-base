module.exports = {
  env: {
    node: true,
    browser: true,
  },
  parserOptions: {
    ecmaVersion: 2019,
    sourceType: 'module',
  },
  plugins: [
    'vue',
  ],
  extends: [
    'eslint:recommended',
    'plugin:vue/recommended',
    // '../../myparcel/myparcel-core/dmp-standards/eslint/.eslintrc.vue.js',
  ],
  rules: {
    'vue/html-closing-bracket-newline': ['error', {
      'singleline': 'never',
      'multiline': 'never',
    }],
    'vue/html-closing-bracket-spacing': ['error', {
      'startTag': 'never',
      'endTag': 'never',
      'selfClosingTag': 'always',
    }],
  },
};
