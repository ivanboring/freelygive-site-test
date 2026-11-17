import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  componentCssPlugin,
  componentNameResolver,
  testsIndexer,
} from '@freelygive/canvas-utils/vite-storybook';
import { mergeConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import type { StorybookConfig } from '@storybook/react-vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  stories: [
    '../src/stories/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    '../src/components/**/*.@(stories|tests).@(js|jsx|mjs|ts|tsx)',
  ],
  // Index colocated `<name>.tests.tsx` play-function files alongside stories.
  experimental_indexers: testsIndexer,
  addons: [
    '@storybook/addon-docs',
    {
      name: '@storybook/addon-mcp',
      options: {
        toolsets: {
          dev: true,
          docs: true,
        },
        experimentalFormat: 'markdown',
      },
    },
    '@storybook/addon-vitest',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  features: {
    experimentalComponentsManifest: true,
    experimentalCodeExamples: true,
  },
  async viteFinal(config) {
    config.plugins = config.plugins || [];
    // Resolve `@/components/<name>` to the Canvas named-metadata entry file
    // before vite-tsconfig-paths rewrites the alias.
    config.plugins.push(
      componentNameResolver(),
      tsconfigPaths({
        root: path.resolve(__dirname, '..'),
      }),
    );

    return mergeConfig(config, {
      plugins: [componentCssPlugin()],
      server: {
        watch: {
          ignored: ['**/node_modules/**', '**/.git/**', '**/.ddev/**'],
        },
      },
    });
  },
} satisfies StorybookConfig;
