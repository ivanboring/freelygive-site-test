import { recommended as drupalCanvasRecommended } from '@drupal-canvas/eslint-config';
import storybook from 'eslint-plugin-storybook';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  {
    ignores: [
      'dist',
      'node_modules',
      'storybook-static',
      '.ddev',
      'src/components/*/dist',
      // Declaration files aren't linted (they're type-only).
      '**/*.d.ts',
    ],
  },
  ...drupalCanvasRecommended,
  ...storybook.configs['flat/recommended'],
]);
