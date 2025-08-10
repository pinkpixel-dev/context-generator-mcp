import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';

export default [
  js.configs.recommended,
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      // Auto-fixable formatting rules
      'indent': ['error', 2],
      'quotes': ['error', 'single'],
      'semi': ['error', 'always'],
      'comma-dangle': ['error', 'always-multiline'],
      'no-trailing-spaces': 'error',
      'eol-last': 'error',
      'no-multiple-empty-lines': ['error', { max: 1 }],
      'object-curly-spacing': ['error', 'always'],
      'array-bracket-spacing': ['error', 'never'],
      
      // TypeScript auto-fixable rules
      '@typescript-eslint/no-unused-vars': 'off', // Don't enforce unused vars in format script
      '@typescript-eslint/no-explicit-any': 'off', // Project uses any extensively
      
      // Disable rules that might conflict with the existing codebase
      'no-console': 'off', // Project uses console.error for logging
      'no-undef': 'off', // TypeScript handles this
      'no-unused-vars': 'off', // Don't enforce unused vars in format script
    },
  },
];
