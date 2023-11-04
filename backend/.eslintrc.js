module.exports = {
  root: true,
  env: {
    node: true,  // Set environment to Node.js
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    "@typescript-eslint/no-explicit-any": "off"
    // Add any specific rules for your backend project here
  },
};
