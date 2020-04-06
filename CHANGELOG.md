## 1.4.0

- `usePasscodeAuth#getToken` now rejects when the /token endpoint responds with a 401.
- `AnglesApp#onJoinSubmitHandler` now catches rejections and sets the error in the room state.

## 1.3.0

Hyperlink widget.

- WidgetProvider and WidgetContext for widget state and syncing widget state updates to remote participants.
- Widget bubbles in CirleRoom component.
- Plumb the `addWidget` mutator function into the Footer component "post link" form.
- Custom hook to get the local participant's data track.

## 1.2.0

fixing footer to allow user to click on the on user controls

## 1.1.0

Updating static HTML to show better summary description when link is shared.

## 1.0.0

This release includes the changes to migrate off of Twilio's serverless Functions to Netlify's global CDN and serverless functions. It required all new tooling for local builds, local development and deployments. The README was updated to reflect the latest workflows.

- Update all local dev and build tools to use Netlify CLI
- Modify request routing from `/token` to `/.netlify/functions/token`
- Add configuration files to support Netlify, namely netlify.toml
- Write a new token server to work with Netlilfy. It still talks to Twilio to get the auth tokens

## 0.4.0

Post demo tweaks.

- Remove the dominant speaker shuffling from the `useParticipants` custom hook. This will make the ordering of bubbles stable.
- Make the local participant's bubble first in the list of non-huddle participants.
- Make the local participant's huddle first in the list of huddles.
- Change huddle circle participant rotation angle to put local participant closer to the left side of circle.
- Increase difference in size between local participant bubble and other floaters.
- Increase difference in size between local huddle and other huddles.
- Tweaked some of the bubble size. Still needs a lot of thought put into it.
- Update HuddleProvider#inviteToHuddle to allow a participant to hop from one huddle to another.
- Update HuddleProvider to include functionality to dissolve a huddle.
- Include control in huddle cicles to dissolve the huddle if local participant is in the huddle
- Center the CircleRoom inside AnglesApp and give it a max width.

## 0.3.0

WIP: Demo UI for huddles and participants.

- CircleRoom component to sort room participants into huddle groups and a list of non-huddling participants.
- Circle layout grouping for participants in a huddle.
- Most of the styling included in this release needs love. Will revisit at a later date.

## 0.2.0

This release includes the addition of "huddles" to a room.

- HuddleProvider to maintain state of huddles in progress. Includes track event handlers to update based on remote huddle updates.
- HuddleProvider is added to the VideoProvider so that participants in the room can access/update huddle state.
- useHuddleContext hook to provider access to the HuddleProvider state and functions to update huddle membership.
- useHuddleContext hook used in ParticipantStrip to give ability to add/remote participants from a huddle.
- useAudioTrackBlacklist hook provide a list of participant sids to mute relative to the local participant.
- useAudioTrackBlacklist hook used in ParticipantStrip to disable audio for remote participants that should not be heard.
- Adding Controls to the AnglesApp component so we can toggle camera/mic and leave the room.
- Added #ANGLES_EDIT comments to top of files in the Twilio base app that were modified.

## 0.1.0

This release marks the first iteration of the Twilio Video Collaboration App: a canonical multi-party collaboration video application built with Programmable Video. This application demonstrates the capabilities of Programmable Video and serves as a reference to developers building video apps.

This initial release comes with the following features:

- Join rooms with up to 50 participants
- Toggle local media: camera, audio, and screen.
- Show a Room’s dominant speaker in the primary video view
- Show a participant’s network quality

We intend to iterate on this initial set of features and we look forward to collaborating with the community.
