import prettier from 'eslint-config-prettier';
// nestforge:feature:language:typescript
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
// nestforge:feature:language:typescript:end

export default [
  {
    ignores: ['dist/', 'coverage/', 'node_modules/'],
  },
  // nestforge:feature:language:typescript
  {
    files: ['src/**/*.ts', 'test/**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'commonjs',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
    },
  },
  // nestforge:feature:language:typescript:end
  // nestforge:feature:language:javascript
  {
    files: ['src/**/*.js', 'test/**/*.js'],
    languageOptions: {
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'commonjs',
      },
    },
  },
  // nestforge:feature:language:javascript:end
  prettier,
];