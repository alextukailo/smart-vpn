import { defineConfig } from 'electron-vite';
import { createRendererConfig } from './config/renderer.config.mts';

export default defineConfig({
  main: {},

  preload: {},

  renderer: createRendererConfig(),
});
