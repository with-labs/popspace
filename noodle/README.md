# PopSpace

A spatial workspace for remote teams.

This repo contains the code that powers the main web app experience and the landing page.

## Pre-requisites

You must have the following installed:

- [Node.js v10+](https://nodejs.org/en/download/)
- [Yarn v1.x](https://classic.yarnpkg.com/lang/en/)

## Installation and setup details

### NPM Install the project

From the root of the project, run `yarn install --frozen-lockfile`.

### Development locally

Run `yarn dev` to run the app live. Your changes will be automatically hot-loaded into any open tabs.

### The Landing Page

The code for the main landing page lives in this repo, too - in the `landing-page` directory.

You can run `npm start` in there to develop on the landing page.

The built landing page is automatically copied into the final app files before deployment. The app serves the landing page at `/`, and the React app everywhere else.

### Building

Build the React app with

    $ yarn build

This script will build the static assets for the application in the `build/` directory.

### Tests

This application has unit tests (using [Jest](https://jestjs.io/)) and E2E tests (using [Cypress](https://www.cypress.io/)). You can run the tests with the following scripts.

#### Unit Tests

Run unit tests with

    $ yarn test

This will run all unit tests with Jest and output the results to the console.

#### E2E Tests

> **NOTE:** Temporarily non-functional

Run end to end tests with

    $ yarn cypress:open

This will open the Cypress test runner. When it's open, select a test file to run.

Note: Be sure to complete the 'Getting Started' section before running these tests. These Cypress tests will connect to real Twilio rooms, so you may be billed for any time that is used.

## Editor Setup

VS Code is recommended as an editor for its TypeScript integration and various useful extensions.

Some additional setup may be useful for a better development experience:

### i18n completion and preview

Install the [i18n-ally](https://marketplace.visualstudio.com/items?itemName=antfu.i18n-ally) plugin to see previews of i18n strings and get autocompletion for our i18n definitions. This plugin will require some setup to use. Open User Settings (`Cmd/Ctrl+Shift+K`, search "User Settings"), then change:

- Global Default Namespace: `translation`
- Enabled Frameworks: `react`, `i18next`
- Locales Paths: `"src/i18n"`
- Path Matcher: `"{locale}.{ext}"`
- Namespace: `true`

You can change these just for the Workspace, or globally.

If the config is correct, you should see calls to `t('key.path')` replaced with translated text, and when you begin typing `t('` the key paths should autocomplete. Missing translation strings should also be visible. Other features of the extension may work, but I haven't used them.

### Prettier

Installing the [Prettier Code Formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) plugin is highly recommended. It will format your files for you, so you don't have to worry about code style anymore.

### ESLint

[ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) is also recommended, especially since it notifies and fixes problems with the [Rules of Hooks](https://reactjs.org/docs/hooks-rules.html) which can cause very tricky bugs.
