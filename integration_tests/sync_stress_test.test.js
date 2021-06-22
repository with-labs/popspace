const puppeteer = require('puppeteer');
const begin = require('./startTestServer');
const axios = require('axios');
const https = require('https');

const EDITOR_SELECTOR = '[contenteditable="true"]';

function waitForServer() {
  return new Promise(async (resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Server timeout')), 30000);
    while (true) {
      try {
        await axios.get('https://localhost:3000', {
          httpsAgent: new https.Agent({
            rejectUnauthorized: false
          })
        });
        resolve();
      } catch (err) {
        // no-op
      }
    }
  })
}

function waitForEditorText(expectedText) {
  // can't use constant here as this function is serialized to
  // run inside the browser window
  const editor = document.querySelector('[contenteditable="true"]');
  // the output innerText seems to have a lot of extra newlines - normalize for both
  const editorText = editor.innerText.replace(/\n+/g, '\n').trim();
  expectedText = expectedText.replace(/\n+/g, '\n').trim();
  return editorText === expectedText;
}

describe('sync stress tests', () => {
  jest.setTimeout(30000);

  let stopServer;
  let browser1;
  let browser2;
  beforeEach(async () => {
    stopServer = await begin();
    await waitForServer();
    browser1 = await puppeteer.launch({ headless: false, devtools: true });
    browser2 = await puppeteer.launch({ headless: false, devtools: true });
  });
  afterEach(async () => {
    stopServer();
    await browser1.close();
    await browser2.close();
  });

  test('two clients can edit different locations simultaneously with a coherent typing experience', async () => {
    const docId = `${Math.floor(Math.random() * 1000000)}`

    const page1 = (await browser1.pages())[0];
    const page2 = (await browser2.pages())[0];

    await page1.goto(`https://localhost:3000?docId=${docId}`);
    await page2.goto(`https://localhost:3000?docId=${docId}`);

    // enable debug logs
    await page1.evaluate(() => {
      window.DEBUG = true;
    })
    await page2.evaluate(() => {
      window.DEBUG = true;
    })

    await page1.waitForSelector('#editor', {
      visible: true
    });
    await page2.waitForSelector('#editor', {
      visible: true
    });

    const editor1 = await page1.$(EDITOR_SELECTOR);
    const editor2 = await page2.$(EDITOR_SELECTOR);

    // initialize editor with some content
    const initialText = `Hello world,

    this is some collaborative text.

    let's see how fast we can type.`;
    await page1.type(EDITOR_SELECTOR, initialText);

    await page1.screenshot({
      path: './screenshots/initial_editor_state.jpg'
    });

    await page1.waitForFunction(waitForEditorText, {}, initialText);
    await page2.waitForFunction(waitForEditorText, {}, initialText);

    // move client 1's cursor to the second line
    await page1.keyboard.press('ArrowUp');
    await page1.keyboard.press('ArrowUp');
    await page1.keyboard.press('ArrowUp');

    await page1.screenshot({
      path: './screenshots/client1_line2.jpg'
    })

    // move client 2's cursor to the fourth line
    await page2.focus(EDITOR_SELECTOR);
    await page2.keyboard.press('ArrowDown');
    await page2.keyboard.press('ArrowDown');
    await page2.keyboard.press('ArrowDown');

    await page2.screenshot({
      path: './screenshots/client2_line4.jpg'
    });

    // now, type simultaneously!
    await Promise.all([
      page1.type(EDITOR_SELECTOR, 'I\'m client 1'),
      page2.type(EDITOR_SELECTOR, 'I\'m client 2')
    ])

    // expect the text to be the same expected string in both
    // editors
    const expectedText = `Hello world,
I'm client 1
    this is some collaborative text.
I'm client 2
    let's see how fast we can type.`;

    await page1.screenshot({
      path: './screenshots/client1_afterTyping.jpg'
    })
    await page2.screenshot({
      path: './screenshots/client2_afterTyping.jpg'
    })

    await page1.waitForFunction(waitForEditorText, {}, expectedText);
    await page2.waitForFunction(waitForEditorText, {}, expectedText);

    await page1.screenshot({
      path: './screenshots/client1_final.jpg'
    })
    await page2.screenshot({
      path: './screenshots/client2_final.jpg'
    })

    // test success!
    expect(true).toBe(true);
    console.log('Test complete.')
  })
})
