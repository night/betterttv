import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {fixupConfigRules} from '@eslint/compat';
import {FlatCompat} from '@eslint/eslintrc';
import js from '@eslint/js';
import eslintPlugin from 'eslint-plugin-eslint-plugin';
import globals from 'globals';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  {
    ignores: ['**/build', '**/node_modules'],
    ...eslintPlugin.configs['rules-recommended'],
  },
  ...fixupConfigRules(
    compat.extends('plugin:import/recommended', 'plugin:react/recommended', 'plugin:prettier/recommended')
  ),
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },

      ecmaVersion: 'latest',
      sourceType: 'module',

      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },

    settings: {
      react: {
        version: 'detect',
      },

      // the default node resolver ignores package "exports" maps, so it can't find ESM-only
      // packages like vite/got; this resolver honors them and reads the @/* paths from jsconfig
      'import/resolver': {
        typescript: {
          project: './jsconfig.json',
        },
        node: true,
      },
    },

    rules: {
      'prettier/prettier': ['error'],
      'import/extensions': ['error', 'never', {json: 'always', css: 'always'}],
      'react/prop-types': 'off',
      'react/jsx-props-no-spreading': 'off',
      'no-param-reassign': 'off',
      'no-underscore-dangle': 'off',
      'no-continue': 'off',
      'no-restricted-syntax': 'off',
      'class-methods-use-this': 'off',
      'no-plusplus': 'off',
      'no-empty': 'off',
      'max-classes-per-file': 'off',
      'no-bitwise': 'off',
      'import/no-named-as-default': 'off',

      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          pathGroups: [{pattern: '@/**', group: 'internal'}],
          pathGroupsExcludedImportTypes: ['builtin'],

          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
    },
  },
];
