import { defineConfig } from 'vite';
import { createRendererConfig } from './config/renderer.config.mts';

export default defineConfig(
  createRendererConfig(),
);
