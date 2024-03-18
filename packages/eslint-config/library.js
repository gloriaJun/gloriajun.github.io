const { resolve } = require('node:path');

const project = resolve(process.cwd(), 'tsconfig.json');

/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: [
    'eslint:recommended',
    'prettier',
    'eslint-config-turbo',
    'plugin:regexp/recommended',
  ],
  plugins: ['only-warn', 'import', 'regexp'],
  globals: {
    React: true,
    JSX: true,
  },
  env: {
    node: true,
    // browser: true,
    // es2021: true,
  },
  settings: {
    'import/resolver': {
      typescript: {
        project,
      },
    },
  },
  ignorePatterns: [
    // Ignore dotfiles
    '.*.js',
    'node_modules/',
    'dist/',
  ],
  rules: {
    // import
    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          ['parent', 'sibling', 'index'],
          'type',
          'unknown',
        ],
        pathGroups: [
          {
            pattern: '{react*,react*/**}',
            group: 'external',
            position: 'before',
          },
          {
            pattern: '{@storybook/**}',
            group: 'external',
            position: 'after',
          },
          {
            pattern: '{@/**}',
            group: 'internal',
          },
          // {
          //   pattern: '{@markup/**}',
          //   group: 'unknown',
          // },
        ],
        pathGroupsExcludedImportTypes: ['react'],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
    'import/newline-after-import': 'error',
    'import/group-exports': 'off',
    'import/no-self-import': 'error',
    'import/no-cycle': 'error',
    'import/no-absolute-path': 'error',
    'import/no-named-as-default-member': 'error',
  },
  overrides: [
    {
      files: ['*.tsx', '*.jsx'],
      extends: ['plugin:react/recommended'],
      plugins: ['react', 'react-hooks'],
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      settings: {
        react: {
          version: 'detect',
        },
      },
      rules: {
        'react/sort-comp': [
          2,
          {
            order: [
              'constructor',
              'static-methods',
              'lifecycle',
              '/^(on|handle).+$/',
              'everything-else',
              'rendering',
            ],
            groups: {
              rendering: ['/^render.+$/', 'render'],
            },
          },
        ],
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'error',
      },
    },
    {
      files: ['*.ts', '*.tsx'],
      extends: [
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
      ],
      plugins: ['@typescript-eslint'],
      parserOptions: {
        // sourceType: 'module',
        // project: ['./tsconfig.json'],
        project: true,
        tsconfigRootDir: __dirname,
      },
      rules: {},
    },
    {
      files: ['*.spec.ts', '*.spec.tsx', '*.spec.js', '*.spec.jsx'],
      env: {
        jest: true,
      },
      rules: {},
    },
    {
      files: ['*.stories.ts', '*.stories.tsx', '*.stories.js', '*.stories.jsx'],
      extends: ['plugin:storybook/recommended'],
      rules: {},
    },
  ],
};
