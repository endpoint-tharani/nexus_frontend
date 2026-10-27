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
      globals: globals.browser,
    },
  },
  {
    // Module-registry files deliberately co-locate a module's lazy page imports,
    // dashboard widgets and its `ModuleDefinition` data export in one file. That
    // mixes component declarations with a non-component export, which the React
    // Fast Refresh rule flags — but these registry files are consumed by the
    // module registry, not hot-reloaded as standalone component modules, so the
    // rule does not apply here.
    files: ['src/modules/**/*.tsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
])
