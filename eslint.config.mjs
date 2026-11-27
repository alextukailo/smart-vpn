
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import stylistic from '@stylistic/eslint-plugin';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import importPlugin from 'eslint-plugin-import';
import globals from 'globals';

export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/out/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/cypress/screenshots/**',
      '**/cypress/videos/**',
      '**/cypress/downloads/**',
    ],
  },

  js.configs.recommended,

  ...tseslint.configs.recommended,

  {
    files: ['**/*.{js,mjs,cjs,ts,tsx,jsx}'],

    plugins: {
      '@stylistic': stylistic,
      import: importPlugin,
    },

    languageOptions: {
      ecmaVersion: 'latest',
    },

    linterOptions: {
      reportUnusedDisableDirectives: 'warn',
    },

    rules: {
      '@stylistic/no-multiple-empty-lines': [
        'error',
        { max: 2 },
      ],

      '@stylistic/semi': ['error', 'always'],

      '@stylistic/member-delimiter-style': [
        'error',
        {
          multiline: {
            delimiter: 'semi',
            requireLast: true,
          },
          singleline: {
            delimiter: 'semi',
            requireLast: false,
          },
        },
      ],

      '@stylistic/comma-dangle': [
        'error',
        'always-multiline',
      ],

      '@stylistic/max-len': [
        'error',
        {
          code: 150,
          ignoreStrings: true,
          ignorePattern: '^\\s*// eslint-disable',
        },
      ],

      '@stylistic/indent': ['error', 2],
      '@stylistic/quotes': ['error', 'single'],
      '@stylistic/multiline-ternary': 'off',
      '@stylistic/eol-last': ['error', 'always'],
      '@stylistic/no-trailing-spaces': 'error',
      '@stylistic/object-curly-spacing': ['error', 'always'],
      '@stylistic/arrow-spacing': 'error',

      'no-console': 'warn',
      'no-debugger': 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      'eqeqeq': ['error', 'always'],
      'import/no-duplicates': 'error',
    },
  },

  // TypeScript
  {
    files: ['**/*.{ts,tsx}'],

    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',

      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],

      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'inline-type-imports',
        },
      ],
    },
  },

  // Electron main process and configuration files
  {
    files: [
      'src/main/**/*.{js,ts}',
      '**/*.config.{js,mjs,cjs,ts}',
    ],

    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },

  // Electron preload process
  {
    files: ['src/preload/**/*.{js,ts}'],

    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
  },

  // React renderer
  {
    files: ['src/renderer/**/*.{js,jsx,ts,tsx}'],

    languageOptions: {
      globals: {
        ...globals.browser,
      },

      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },

    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'jsx-a11y': jsxA11y,
    },

    settings: {
      react: {
        version: 'detect',
      },
    },

    rules: {
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...jsxA11y.configs.recommended.rules,

      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      'react-refresh/only-export-components': [
        'warn',
        {
          allowConstantExport: true,
        },
      ],

      'react/prop-types': 'off',

      '@stylistic/jsx-closing-bracket-location': 'error',
      '@stylistic/jsx-child-element-spacing': 'error',
      '@stylistic/jsx-closing-tag-location': 'error',

      '@stylistic/jsx-indent': [
        'error',
        2,
        {
          indentLogicalExpressions: true,
        },
      ],

      '@stylistic/jsx-indent-props': ['error', 2],

      '@stylistic/jsx-curly-spacing': [
        'error',
        {
          when: 'never',
        },
      ],

      'react/jsx-boolean-value': ['error', 'never'],
      'react/self-closing-comp': 'error',

      '@stylistic/jsx-tag-spacing': [
        'error',
        {
          closingSlash: 'never',
          beforeSelfClosing: 'always',
          afterOpening: 'never',
          beforeClosing: 'never',
        },
      ],

      'react/jsx-curly-brace-presence': [
        'error',
        {
          props: 'never',
          children: 'never',
          propElementValues: 'always',
        },
      ],

      '@stylistic/jsx-quotes': [
        'error',
        'prefer-double',
      ],
    },
  },

  // TypeScript declaration files
  {
    files: ['**/*.d.ts'],

    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
];
