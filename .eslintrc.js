module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module'
  },
  extends: '@salsify/eslint-config',
  env: {
    'browser': true,
    'es6': true,
  },
  rules: {
    'no-undef': 'error'
  }
};
