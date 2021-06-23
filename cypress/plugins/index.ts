import { launch, Page } from 'puppeteer';

const participants: Record<string, Page> = {};

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing).
// `on` is used to hook into various events Cypress emits
// `config` is the resolved Cypress config
const noodlePlugin = (on, config) => {
  const participantFunctions = {
    addParticipant: async ({ name, roomUrl, color }: { name: string; roomUrl: string; color: string }) => {
      const args = ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'];

      if (color) {
        args.push(`--use-file-for-fake-video-capture=cypress/fixtures/${color}.y4m`);
      }

      const browser = await launch({
        headless: true,
        args,
      });
      const page = (participants[name] = await browser.newPage()); // keep track of this participant for future use
      await page.goto(roomUrl);
      await page.waitForSelector('#displayName');
      await page.type('#displayName', name);
      await page.click('[type="submit"]');
      await page.waitForSelector(`[data-test-person="${name}"]`);
      return Promise.resolve(null);
    },
    toggleParticipantAudio: async (name: string) => {
      const page = participants[name];
      await page.click('[data-test-id="toggleAudio"]');
      return Promise.resolve(null);
    },
    shareParticipantScreen: async (name: string) => {
      const page = participants[name];
      await page.click('body');
      await page.click('[data-test-id="toggleShareScreen"]');
      return Promise.resolve(null);
    },
    removeParticipant: async (name: string) => {
      const page = participants[name];
      if (!page) return Promise.resolve(null);
      await page.close({ runBeforeUnload: true });
      delete participants[name];
      return Promise.resolve(null);
    },
    removeAllParticipants: async () => {
      await Promise.all(Object.keys(participants).map((name) => participantFunctions.removeParticipant(name)));
      return null;
    },
    participantCloseBrowser: async (name: string) => {
      const page = participants[name];
      await page.close({ runBeforeUnload: true });
      delete participants[name];
      return Promise.resolve(null);
    },
  };
  on('task', participantFunctions);
};

export default noodlePlugin;
