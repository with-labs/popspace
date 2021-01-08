# With

A spatial workspace for remote teams.

This repo contains the code that powers the main web app experience and the serverless functions that handle authentication, joining rooms, and some advanced accessory behaviors.
## Pre-requisites

You must have the following installed:

- [Node.js v10+](https://nodejs.org/en/download/)
- NPM v6+ (comes installed with newer Node versions)
- Netlify CLI - [docs](https://docs.netlify.com/cli/get-started/)
  - Install the CLI (see below)
  - Authenticate with Netlify (see below)
  - Connect your local repo (see below)

## Installation and setup details

### NPM Install the project

From the root of the project, run `npm install`.

### Install Netlify CLI

The app is deployed to Netlify using the Netlify CLI. Install netlify-cli with

    $ npm install -g netlify-cli

### Authenticate with our Netlify Account

Contact Brent to get an invite into our team. That will enable you to [login to Netlify via the CLI](https://docs.netlify.com/cli/get-started/#authentication):

`netlify login`

### Connect your local repo to Netlify

You'll need to [connect your local code to our app that is registered inside Netlify](https://docs.netlify.com/cli/get-started/#automated-setup). Here's the command:

`netlify init`

### Development locally

With Netlify CLI installed globally, you only need to run one command to develop locally. It will activate the Netlify development environment, which will run a server to host the React app with hot-reload, PLUS a server for token serverless function.

1. Activate Netlify dev environment: `netlify dev`

_There is a convenience npm script as well: `npm run dev`_

### Deploy the app and token serverless function to Netlify

There is no need to do manual deploys to Netlify. When code is merged into the `dev` or `master` branches. Netlify will make a build and deploy to the associated branch's environment (dev->dev, master->production).

- Production: https://app.with.so
- Development: https://dev.app.with.so

You can do manual deploys directly from your local repo without merging code to a remote branch. The command below will create a "draft" URL. That means that is a testable, shareable, non-production deploy.

`netlify deploy`

Here are the [docs](https://docs.netlify.com/cli/get-started/#manual-deploys).

### Building

Build the React app with

    $ npm run build

This script will build the static assets for the application in the `build/` directory.

### Tests

This application has unit tests (using [Jest](https://jestjs.io/)) and E2E tests (using [Cypress](https://www.cypress.io/)). You can run the tests with the following scripts.

#### Unit Tests

Run unit tests with

    $ npm test

This will run all unit tests with Jest and output the results to the console.

#### E2E Tests

Run end to end tests with

    $ npm run cypress:open

This will open the Cypress test runner. When it's open, select a test file to run.

Note: Be sure to complete the 'Getting Started' section before running these tests. These Cypress tests will connect to real Twilio rooms, so you may be billed for any time that is used.

## Editor Setup

VS Code is recommended as an editor for its TypeScript integration and various useful extensions.

Some additional setup may be useful for a better development experience:

### i18n completion and preview

Install the [i18n-ally](https://marketplace.visualstudio.com/items?itemName=antfu.i18n-ally) plugin to see previews of i18n strings and get autocompletion for our i18n definitions. This plugin will require some setup to use. Open User Settings (`Cmd/Ctrl+Shift+K`, search "User Settings"), then change:

* Global Default Namespace: `translation`
* Enabled Frameworks: `react`, `i18next`
* Locales Paths: `"src/i18n"`
* Path Matcher: `"{locale}.{ext}"`
* Namespace: `true`

You can change these just for the Workspace, or globally.

If the config is correct, you should see calls to `t('key.path')` replaced with translated text, and when you begin typing `t('` the key paths should autocomplete. Missing translation strings should also be visible. Other features of the extension may work, but I haven't used them.

### Prettier

Installing the [Prettier Code Formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) plugin is highly recommended. It will format your files for you, so you don't have to worry about code style anymore.

### ESLint

[ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) is also recommended, especially since it notifies and fixes problems with the [Rules of Hooks](https://reactjs.org/docs/hooks-rules.html) which can cause very tricky bugs.