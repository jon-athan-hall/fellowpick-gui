import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
  {
    // Block deep cross-feature imports — outside a feature, only the barrel is public.
    // Internal feature files use plain relative paths (e.g. `../types`) and are unaffected.
    files: ['src/**/*.{ts,tsx}'],
    ignores: [
      'src/**/__tests__/**',
      'src/**/*.test.{ts,tsx}',
      'src/test/**',
    ],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{
          regex: '^(\\.{1,2}/)+features/[^/]+/(?!index($|\\.|/))',
          message: 'Import from the feature barrel (e.g. `../features/auth`), not from feature internals.',
        }],
      }],
    },
  },
])
