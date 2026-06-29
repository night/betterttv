import eslintReact from '@eslint-react/eslint-plugin';
import importX from 'eslint-plugin-import-x';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';

export default [
  {
    ignores: ['**/build', '**/node_modules'],
  },
  importX.flatConfigs.recommended,
  eslintReact.configs.recommended,
  prettierRecommended,
  {
    files: ['**/*.{js,mjs,cjs,jsx}'],

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
      // the default node resolver ignores package "exports" maps, so it can't find ESM-only
      // packages like vite/got; this resolver honors them and reads the @/* paths from jsconfig
      'import-x/resolver': {
        typescript: {
          project: './jsconfig.json',
        },
        node: true,
      },
    },

    rules: {
      'prettier/prettier': ['error'],
      'import-x/extensions': ['error', 'never', {json: 'always', css: 'always'}],
      'no-param-reassign': 'off',
      'no-underscore-dangle': 'off',
      'no-continue': 'off',
      'no-restricted-syntax': 'off',
      'class-methods-use-this': 'off',
      'no-plusplus': 'off',
      'no-empty': 'off',
      'max-classes-per-file': 'off',
      'no-bitwise': 'off',
      'import-x/no-named-as-default': 'off',

      'import-x/order': [
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
