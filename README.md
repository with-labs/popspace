# Departure Notes

## Dev Notes
* we are going to deviate from the structure of the forked twilio app.
** going to have a /pages dir where our main pages will live instead of having pages live in the components dir
** components we write will live in the /components dir
* Since we have 2 weeks, dont use material ui right in new code since it will take time to learn and we are quicker falling back to our old way of doing thing.
* Split the css into a seperate file and follow BEM / suit standards. this will allow us to future proof our code
* Don't worry about css utility classes for right now, just put things where they are needed now. we can make things better when we get some sponsorship
* the main focus is having a good and presentable app, we can fix our code when we move off of twilio

# With React App
Hacked version of the Twilio Sample Video Application that now is deployed to Netlify and uses Netlify's serverless functions.

## What is it

This application demonstrates a multi-party video application built with [twilio-video.js](https://github.com/twilio/twilio-video.js) and [Create React App](https://github.com/facebook/create-react-app).

## Pre-requisites

You must have the following installed:

* [Node.js v10+](https://nodejs.org/en/download/)
* NPM v6+ (comes installed with newer Node versions)
* Netlify CLI - [docs](https://docs.netlify.com/cli/get-started/)
  * Install the CLI (see below)
  * Authenticate with Netlify (see below)
  * Connect your local repo (see below)

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

With Netlify CLI installed globally, you only need to run two commands. The first is to build the React app. The second is to activate the Netlify development environment, which will run a server to host the React app with hot-reload, PLUS server the token server.

*There is a convenience npm script to do both at once: `npm run dev`*

1) Build the React app: `npm run build`
2) Activate Netlify dev environment: `netlify dev`

### Deploy the app and token serverless function to Netlify

There is no need to do manual deploys to Netlify. When code is merged into the `dev` or `master` branches, Netlify will make a build and deploy to the associated branch's environment (dev->dev, master->production).

You can do manual deploys directly from your local repo without merging code to a branch. Do so at your own risk. Here are the [docs](https://docs.netlify.com/cli/get-started/#manual-deploys).

## Deeper dive

### Running a local token serverless function

This application requires a Twilio access token to connect to a Twilio Video Room. The included local token [server](functions/token.js) provides the application with access tokens from Twilio. By default, the Netlify CLI will use the Twilio keys that stored inside the Netlify admin panel's environment variables tool. However, you can override those Twilio API keys and use others if you like. See details below:

- Store your Account SID, API Key SID, and API Key Secret in a new file called `.env` in the root level of the application (example below).
- When Netlify boots up its development environment, it will use your local keys instead of the ones inside our Netlify admin panel.

```
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_API_KEY_SID=SKxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_API_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Running the App locally

Run the app locally with

    $ npm run dev

This will build the React app and start the local token serverless function. The React app is hosted at [http://localhost:3000](http://localhost:3000), and the token serverless function is available at [http://localhost:8888](http://localhost:8888). You should access the appliation at [http://localhost:8888](http://localhost:8888), because the Netlify development environment will proxy requests for the React app from port `8888` to `3000`.

*Please remember that you need to use the `?r=roomName` query param*
So the correct URL to visit the app locally is:

`http://localhost:8888?r=roomName`

You can find the passcodes for the whitelisted room names here: [/functions/token.js](/functions/tokens.js). Look for the constant `ROOM_WHITELIST_PASSCODES`.

The page will reload if you make changes to the source code in `src/`.
You will also see any linting errors in the console.

The token server runs on port 8888 and expects a `POST` request at the `/.netlify/functions/token` route with the following JSON body:

```
{
  "user_identity": string,  // the user's identity
  "room_name": string   // the room name
  "passcode": string // the passcode that corresponds to the room_name
}
```

The response will be a token that can be used to connect to a room.

Try it out with this sample `curl` command:

```
curl --header "Content-Type: application/json" \
  --request POST \
  --data '{"user_identity":"xyz","passcode":"92cd6c0cdd0b323ab88329e9f12cb17c", "room_name":"dev"}' \
  http://localhost:8888/.netlify/functions/token
```

*The local token serverless function uses a room_name white list and passcode verification. So, you must use a whitelisted room name and associated passcode.*

### Multiple Participants in a Room

If you want to see how the application behaves with multiple participants, you can simply open `localhost:8888` in multiple tabs in your browser and connect to the same room using different user names.

Additionally, if you would like to invite other participants to a room, each participant would need to have their own installation of this application and use the same room name and Account SID (the API Key and Secret can be different).

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

### Application Architecture

The state of this application (with a few exceptions) is managed by the [room object](https://media.twiliocdn.com/sdk/js/video/releases/2.0.0/docs/Room.html) that is supplied by the SDK. The `room` object contains all information about the room that the user is connected to. The class hierarchy of the `room` object can be viewed [here](https://www.twilio.com/docs/video/migrating-1x-2x#object-model).

One great way to learn about the room object is to explore it in the browser console. When you are connected to a room, the application will expose the room object as a window variable: `window.twilioRoom`.

Since the Twilio Video SDK manages the `room` object state, it can be used as the source of truth. It isn't necessary to use a tool like Redux to track the room state. The `room` object and most child properties are [event emitters](https://nodejs.org/api/events.html#events_class_eventemitter), which means that we can subscribe to these events to update React components as the room state changes.

[React hooks](https://reactjs.org/docs/hooks-intro.html) can be used to subscribe to events and trigger component re-renders. This application frequently uses the `useState` and `useEffect` hooks to subscribe to changes in room state. Here is a simple example:

```
import { useEffect, useState } from 'react';

export default function useDominantSpeaker(room) {
  const [dominantSpeaker, setDominantSpeaker] = useState(room.dominantSpeaker);

  useEffect(() => {
    room.on('dominantSpeakerChanged', setDominantSpeaker);
    return () => {
      room.off('dominantSpeakerChanged', setDominantSpeaker);
    };
  }, [room]);

  return dominantSpeaker;
}
```

In this hook, the `useEffect` hook is used to subscribe to the `dominantSpeakerChanged` event emitted by the `room` object. When this event is emitted, the `setDominantSpeaker` function is called which will update the `dominantSpeaker` variable and trigger a re-render of any components that are consuming this hook.

For more information on how React hooks can be used with the Twilio Video SDK, see this tutorial: https://www.twilio.com/blog/video-chat-react-hooks. To see all of the hooks used by this application, look in the `src/hooks` directory.

### Configuration

The `connect` function from the SDK accepts a [configuration object](https://media.twiliocdn.com/sdk/js/video/releases/2.0.0/docs/global.html#ConnectOptions). The configuration object for this application can be found in [src/index.ts](https://github.com/twilio/twilio-video-app-react/blob/master/src/index.tsx#L20). In this object, we 1) enable dominant speaker detection, 2) enable the network quality API, and 3) supply various options to configure the [bandwidth profile](https://www.twilio.com/docs/video/tutorials/using-bandwidth-profile-api).

#### Track Priority Settings

This application dynamically changes the priority of remote video tracks to provide an optimal collaboration experience. Any video track that will be displayed in the main video area will have `track.setPriority('high')` called on it (see the [VideoTrack](https://github.com/twilio/twilio-video-app-react/blob/master/src/components/VideoTrack/VideoTrack.tsx#L25) component) when the component is mounted. This higher priority enables the track to be rendered at a high resolution. `track.setPriority(null)` is called when the component is unmounted so that the track's priority is set to its publish priority (low).

### Google Authentication using Firebase (optional)

This application can be configured to authenticate users before they use the app. Once users have signed into the app with their Google credentials, their Firebase ID Token will be included in the Authorization header of the HTTP request that is used to obtain an access token. The Firebase ID Token can then be [verified](https://firebase.google.com/docs/auth/admin/verify-id-tokens) by the server that dispenses access tokens for connecting to a room.

See [.env.example](.env.example) for an explanation of the environment variables that must be set to enable Google authentication.

## Related

- [Twilio Video Android App](https://github.com/twilio/twilio-video-app-android)
- [Twilio Video iOS App](https://github.com/twilio/twilio-video-app-ios)
- [Twilio CLI RTC Plugin](https://github.com/twilio-labs/plugin-rtc)

## License

See the [LICENSE](LICENSE) file for details.
