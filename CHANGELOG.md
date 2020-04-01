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
