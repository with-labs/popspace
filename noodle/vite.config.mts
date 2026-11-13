/// <reference types="vitest/config" />
import { execSync } from 'child_process';
import path from 'path';
import { build, defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';

const root = import.meta.dirname;
const src = (dir: string) => path.resolve(root, 'src', dir);

const gitVersion = () => {
  try {
    return execSync('git rev-parse --short HEAD', { cwd: root }).toString().trim();
  } catch (err) {
    return 'unknown';
  }
};

/**
 * Builds src/service-worker.ts on its own into build/service-worker.js. It has
 * to be a single classic script, so it can't share chunks with the app bundle.
 */
const serviceWorker = (mode: string): Plugin => ({
  name: 'popspace-service-worker',
  apply: 'build',
  async closeBundle() {
    await build({
      configFile: false,
      mode,
      logLevel: 'warn',
      define: { 'process.env.NODE_ENV': JSON.stringify(mode) },
      build: {
        outDir: path.resolve(root, 'build'),
        emptyOutDir: false,
        copyPublicDir: false,
        lib: {
          entry: src('service-worker.ts'),
          formats: ['iife'],
          name: 'serviceWorker',
          fileName: () => 'service-worker.js',
        },
      },
    });
  },
});

export default defineConfig(({ mode }) => {
  // keep the REACT_APP_ names the Dockerfile, .env and deploy docs already use
  const env = { ...loadEnv(mode, path.resolve(root, '..'), 'REACT_APP_'), ...loadEnv(mode, root, 'REACT_APP_') };
  for (const [key, value] of Object.entries(process.env)) {
    if (key.startsWith('REACT_APP_') && value !== undefined) env[key] = value;
  }

  return {
    plugins: [
      react(),
      // `import Icon from './icon.svg?react'` gives a component, a plain import the URL
      svgr(),
      serviceWorker(mode),
    ],
    resolve: {
      // @withso/unicorn lives under unicorn/, whose Next.js app installs a newer
      // React; resolve React from here so the bundle has one copy
      dedupe: ['react', 'react-dom'],
      alias: {
        '@components': src('components'),
        '@features': src('features'),
        '@hooks': src('hooks'),
        '@providers': src('providers'),
        '@utils': src('utils'),
        '@roomState': src('roomState'),
        '@constants': src('constants'),
        '@analytics': src('analytics'),
        '@layouts': src('Layouts'),
        '@images': src('images'),
        '@api': src('api'),
        '@src': src('.'),
      },
    },
    define: {
      VERSION: JSON.stringify(gitVersion()),
      // the app reads its settings from process.env, as it did under create-react-app;
      // tests run in Node and keep the real one
      ...(mode === 'test'
        ? {}
        : {
            'process.env': JSON.stringify({
              ...env,
              NODE_ENV: mode === 'production' ? 'production' : 'development',
              PUBLIC_URL: '',
            }),
          }),
    },
    optimizeDeps: {
      // linked workspace packages aren't pre-bundled by default, but this one is
      // compiled to CommonJS and has to be converted for the dev server
      include: ['@withso/unicorn'],
    },
    server: {
      port: 8888,
    },
    preview: {
      port: 8888,
    },
    build: {
      outDir: 'build',
      sourcemap: true,
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['src/setupTests.ts'],
      include: ['src/**/*.test.{ts,tsx}'],
      clearMocks: true,
      reporters: ['default', 'junit'],
      outputFile: { junit: 'junit.xml' },
    },
  };
});
