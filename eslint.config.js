// eslint.config.mjs
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

dotenv.config();

import { defineConfig, globalIgnores } from 'eslint/config';
import importPlugin from 'eslint-plugin-import';
import pluginChecker from 'eslint-plugin-plugin-checker';
import prettier from 'eslint-plugin-prettier';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import unusedImports from 'eslint-plugin-unused-imports';
import { fixupConfigRules, fixupPluginRules } from '@eslint/compat';
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import kalimahAppsTailwind from '@kalimahapps/eslint-plugin-tailwind';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
});

export default defineConfig([
  globalIgnores(['**/node_modules/**', '**/*.xml']),
  {
    extends: fixupConfigRules(
      compat.extends(
        'prettier',
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
        'plugin:import/warnings',
        'plugin:import/errors',
        'plugin:@typescript-eslint/recommended',
        'plugin:prettier/recommended'
      )
    ),

    plugins: {
      react: fixupPluginRules(react),
      prettier: fixupPluginRules(prettier),
      'react-hooks': fixupPluginRules(reactHooks),
      import: fixupPluginRules(importPlugin),
      '@typescript-eslint': fixupPluginRules(typescriptEslint),
      'simple-import-sort': simpleImportSort,
      'plugin-checker': pluginChecker,
      'unused-imports': unusedImports,
      kalimahAppsTailwind: fixupPluginRules(kalimahAppsTailwind)
    },

    languageOptions: {
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        AudioWorkletGlobalScope: 'readonly'
      }
    },

    settings: {
      react: {
        version: 'detect'
      },
      'import/resolver': {
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx', '.d.ts']
        },
        typescript: {}
      }
    },

    rules: {
      'kalimahAppsTailwind/sort': 'warn',
      'kalimahAppsTailwind/multiline': [
        'warn',
        {
          maxLen: 100,
          quotesOnNewLine: true
        }
      ],
      'linebreak-style': ['warn', 'unix'],
      quotes: ['warn', 'single'],
      semi: ['warn', 'always'],
      'no-console': 'warn',
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/jsx-filename-extension': [
        1,
        {
          extensions: ['.js', '.jsx', '.ts', '.tsx']
        }
      ],
      'no-extra-boolean-cast': 0,
      'react/display-name': 'off',
      'simple-import-sort/exports': 'warn',
      'simple-import-sort/imports': 'warn',
      '@typescript-eslint/no-empty-interface': [
        'error',
        {
          allowSingleExtends: true
        }
      ],
      'no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_'
        }
      ],
      'react/jsx-key': 'error',
      '@typescript-eslint/no-namespace': 'off',
      'react/jsx-max-props-per-line': [
        'error',
        {
          maximum: 3
        }
      ],
      '@typescript-eslint/no-explicit-any': 'off',
      'no-duplicate-imports': 'off',
      'react-hooks/rules-of-hooks': 'off',
      'plugin-checker/path-checker': 'off',
      'react/jsx-newline': ['error', { prevent: true }]
    }
  },
  {
    files: [
      '**/*.js',
      '**/*.jsx',
      '**/*.ts',
      '**/*.tsx',
      '**/src/**/*.test.{js,jsx,ts,tsx}'
    ],
    rules: {
      'react/react-in-jsx-scope': 'off',
      'simple-import-sort/imports': [
        'warn',
        {
          groups: [
            ['^react(.*)$', '^next', '^[a-z]', '^@?\\w'],
            ['^'],
            ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
            ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
            ['^.+\\.(gif|png|svg|jpg)$'],
            ['^.+\\.s?css$'],
            ['^\\u0000']
          ]
        }
      ]
    }
  }
]);
