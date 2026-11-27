import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { type UserConfig } from 'vite';

import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const projectRoot = fileURLToPath(
  new URL('../', import.meta.url),
);

export const createRendererConfig = (): UserConfig => ({
  plugins: [
    react(),
    tailwindcss(),
  ],

  resolve: {
    alias: {
      '@renderer': resolve(
        projectRoot,
        'src/renderer/src',
      ),

      '@shared': resolve(
        projectRoot,
        'src/shared',
      ),
    },
  },
});
