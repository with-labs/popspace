import { defineConfig } from 'cypress';
import noodlePlugin from './cypress/plugins';

export default defineConfig({
  video: false,
  defaultCommandTimeout: 10000,
  reporter: 'cypress-multi-reporters',
  reporterOptions: {
    configFile: 'cypress/reporter-config.json',
  },
  e2e: {
    baseUrl: 'http://localhost:8888',
    setupNodeEvents(on, config) {
      noodlePlugin(on, config);
    },
  },
});
