import path from 'node:path';
import {fileURLToPath} from 'node:url';
import babelParser from '@babel/eslint-parser';
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

      parser: babelParser,
      ecmaVersion: 6,
      sourceType: 'module',

      parserOptions: {
        requireConfigFile: false,
        allowImportExportEverywhere: true,

        babelOptions: {
          presets: ['@babel/preset-react'],
        },
      },
    },

    settings: {
      react: {
        version: 'detect',
      },
    },

    rules: {
      'prettier/prettier': ['error'],
      'import/extensions': ['error', 'ignorePackages'],
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
          groups: ['builtin', 'external', 'parent', 'sibling', 'index'],

          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
    },
  },
];
