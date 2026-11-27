import js from '@eslint/js';
import babelParser from '@babel/eslint-parser';
import { defineConfig } from 'eslint/config';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

export default defineConfig([
  {
    ignores: [
      'dist/**',
      'coverage/**',
      'test-results/**',
      'playwright-report/**',
    ],
  },
  {
    files: ['**/*.{js,ts,tsx}'],
    extends: [js.configs.recommended],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          babelrc: false,
          configFile: false,
          parserOpts: {
            plugins: ['typescript', 'jsx'],
          },
        },
      },
    },
    rules: {
      // TypeScript checks names and unused declarations, including JSX references.
      'no-undef': 'off',
      'no-unused-vars': 'off',
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    extends: [reactHooks.configs.flat.recommended],
  },
  {
    files: ['src/features/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              regex: '(^|/)app(/|$)',
              message: 'Features must not import application composition.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/shared/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              regex: '(^|/)(app|features)(/|$)',
              message:
                'Shared code must not import application or feature code.',
            },
          ],
        },
      ],
    },
  },
]);
