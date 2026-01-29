import { fixupConfigRules } from '@eslint/compat'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import js from '@eslint/js'
import { FlatCompat } from '@eslint/eslintrc'
import prettier from 'eslint-plugin-prettier'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const compat = new FlatCompat({
  baseDirectory: dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
})

export default [
  {
    ignores: ['/node_modules/', '/dist/', '**/env.d.ts'],
  },
  ...fixupConfigRules(
    compat.extends(
      'eslint:recommended',
      'plugin:react/recommended',
      'plugin:react-hooks/recommended',
      'plugin:import/recommended',
      'plugin:jsx-a11y/recommended',
      'plugin:@typescript-eslint/recommended',
      'eslint-config-prettier'
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ) as any
  ),
  {
    settings: {
      react: {
        version: 'detect',
      },

      'import/resolver': {
        node: {
          paths: [dirname],
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
      },
    },

    plugins: {
      prettier,
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react-hooks/exhaustive-deps': 'off',
      'prettier/prettier': 'error',

      'import/no-unresolved': [
        'error',
        {
          ignore: ['.svg?react$'],
        },
      ],

      'import/no-named-as-default': 'off',

      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          vars: 'all',
          args: 'after-used',
          ignoreRestSiblings: true,
          argsIgnorePattern: '^_',
        },
      ],

      'import/named': 'off',
    },
  },
]
