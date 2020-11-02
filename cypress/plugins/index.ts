import { launch, Page } from 'puppeteer';

const participants: Record<string, Page> = {};

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing).
// `on` is used to hook into various events Cypress emits
// `config` is the resolved Cypress config
export default (on, config) => {
  const participantFunctions = {
    addParticipant: async ({
      name,
      roomName = 'integrationtestroomdonotdelete',
      password = 'pnBBZ6XJdDUXxgnMdGtQUfjY',
      color,
    }: {
      name: string;
      roomName?: 'integrationtestroomdonotdelete';
      password?: string;
      color: string;
    }) => {
      const args = ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'];

      if (color) {
        args.push(`--use-file-for-fake-video-capture=cypress/fixtures/${color}.y4m`);
      }

      const browser = await launch({
        headless: true,
        args,
      });
      const page = (participants[name] = await browser.newPage()); // keep track of this participant for future use
      await page.goto(config.baseUrl + '/' + roomName);
      await page.type('#joinRoom-username', name);
      await page.type('#joinRoom-password', password);
      await page.click('[type="submit"]');
      await page.waitForSelector(`[data-test-person="${name}"]`);
      return Promise.resolve(null);
    },
    toggleParticipantAudio: async (name: string) => {
      const page = participants[name];
      await page.click('[data-test-button="toggleAudio"]');
      return Promise.resolve(null);
    },
    shareParticipantScreen: async (name: string) => {
      const page = participants[name];
      await page.click('body');
      await page.click('[title="Share Screen"]');
      return Promise.resolve(null);
    },
    removeParticipant: async (name: string) => {
      const page = participants[name];
      await page.close({ runBeforeUnload: true });
      delete participants[name];
      return Promise.resolve(null);
    },
    removeAllParticipants: () => {
      return Promise.all(Object.keys(participants).map((name) => participantFunctions.removeParticipant(name))).then(
        () => null
      );
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
