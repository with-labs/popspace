## 1.76.0

- add room advancit
- remove Jessie's rooms (jessietime, jessiestime)

## 1.75.0

- add room stonna

## 1.74.0

- Enable spatial audio by default
- Disable click to huddle


## 1.73.0

- updating accessory try icon images
- fixing accessory try item spacing
- updating accessory tray item to new standards
- updating join room button to show 'joining...' when joining a room

## 1.72.0

- Add rooms: pomona, odf
- Remove LiveChat

## 1.71.0

- Add rooms: nabeel, roguevc

## 1.70.0

Requery AV devices listings when local tracks change. This covers the case where the a user enters the Room before they have granted access to a microphone and/or camera. This way, once they grant permission for whatever resource it is, the change in the local tracks will trigger a device listing requery and populate the AV devices select menus in the user settings menu.

- Add effect to use useAVSources hook to update device listings when local tracks change.
- Add error handling to the useLocalAudioToggle and useLocalVideoToggle hooks that can capture a "Permission denied" exception and set an appropriate error message in the app state.

## 1.69.0

- Add room saad

## 1.68.0

- Updated participantCircle to be smaller; readjusted buttons to match smaller size.
- fixing logo on join page to have the correct resolution.
- fixing accessories tray from showing drop shadow when closed.

## 1.67.2

- Fix bug: when hovering over another participant's emoji, don't see admin icon

## 1.67.1

- Remove 1 animated avatar

## 1.67.0

- Add 13 new animated avatars
- Remove the snake avatar
- Avatar component to toggle visibility:hidden + absolute positioning of blink/non-blink image rather than using a background + image. This enables designers to create avatar images that make use of transparency and shadows with doubling up shadows during the blink state.
- Using visibility:hidden on avatar images will cause the browser to fetch the blink image before it's needed, thus preventing a flash during asset fetching. Attempting to use display:none was tempting, however some browsers will still not fetch an image until it is rendered (Firefox, at least.)

## 1.66.0

- Add LiveChat on the page to easily talk to early access users

## 1.65.0

- add in doubleClick protection on join page.

## 1.64.0

- Replace the default wallpaper asset in rooms with a tutorial wallpaper
- Replace the background image in joinRoom to use a specific asset so we can keep it separate from default room wallpaper

## 1.63.0

- Add meta description and keywords for SEO purpose.
- Add Opengraph tags so it looks good when people paste an app.with.so url.
- Add more favicon formats so it looks good in more browsers.
- Add Fathom analytics to get basic location, browser, and referral data.
- Changed theme color in meta from black to #F4675A

## 1.62.0

- Add scrumvc, vorga, firstround, sequoia, apronanalytics, wongfam

## 1.61.0

- Change cat room's password

## 1.60.0

Screen sharing plumbing.

- SharedScreenViewer component to show the video stream of a participant's screen share in a large modal.
- Add SharedScreenView to Room.
- Updates to the participant meta reducer and provider to track whose screen the local participant is viewing.
- Add className prop to WithModal.
- Based shared-ness off the local participant's publications.

## 1.59.0

- add rooms: ritomoni, collabbrain, woork, rupie, littlespoon, whoville, dalsden615, woot, room126, steve, youngscience, happyhour, decalab, sevenbridges, happyhours, rb, virvie, fridaydinnerparty, oatcity, jacksroom, beings, yamatomachi, magugz, bletchleypark, work, kabes, lhgraphiste, irina, ken

## 1.58.0

- add rooms: vgs, theloop, caro, danb, commoncode, astro, herskoland, thelibrary, cryptocastle, farmstead, saamyverse, mobelux, creativelounge,

## 1.57.0

- Add in common modal component
- Add in initial work for share screen ui
- Fixing up SettingModal to use common modal

## 1.56.0

- Add ability for user to toggle on/off spatial audio feature

## 1.55.0

- Modify dissolve huddle button to only remove localParticipant

## 1.54.0

- Remove room: crivello
- Add room: mvvc17red, scrumvc

## 1.53.0

AV source robustness.

- Adding hook and provider (AVSourcesProvider) for media source device lists.
- Consume the media device lists from AVSourcesProvider in SettingsModal and useHandleDeviceChange.
- useAVSources hook to query the browser APIs for available sources and update those lists on navigator.mediaDevices.ondevicechange.

## 1.52.0

- Fix hover over emoji to be settings icon
- Fix listed video input default
- Style select elements
- Fix modal height w/ emoji picker
- Adjust location and width of user name on participant bubble
- Adjust fonts on admin panel
- Persist mute/unmute button when muted
- Update video disable/enable tooltip to use "avatar" language

## 1.51.0

- Add functions to the useLocalAudioToggle and useLocalVideoToggle hooks that will allow the app to change the AV sources.
- AV source changing functions will unpublish existing tracks of the same type and publish new tracks with the specified source.
- useLocalAudioToggle now behaves similarly to useLocalVideoToggle in that it publishes/unpublishes the audio track for enabling/disabling rather than calling enable/disable methods on the audio track. This is necessary to be able to set the device for the audio input upon re-enabling audio.
- useLocalTracks and useVideoContext now expose a `getLocalAudioTrack` function used when enabling audio or switching audio inputs.
- useHandleDeviceChange hook that will update audio/video track publications based on passed in device ids.
- Start the new local participant admin UI.
- TODO: polish on the local participant admin UI.
- TODO: speaker output selection.
- TODO: add event listeners to reset the audio/video input sources on device change detected.

## 1.50.0

- Add Whiteboard widget
- Refactor widget data model to make generic, extensible for more widget types
- When adding link widget, make title the URL if no title provided
- Polish dropshadows on some items
- Add rooms: uif, mayfield, floodgate, Early Access Rooms Batch 1
- Admin panel revamp and AV input source selection.

## 1.49.0

- add in new Widget base component
- add in new LinkWidget
- add in ability for user to add a title to the link they post
- add in font css utils
- remove CircleRoom component (unused legacy code)

## 1.48.0

- add rooms: coatue, kpcb

## 1.47.0

- Add room spark

## 1.46.0

- Animate toggle switch

## 1.45.0

- Add room karenbourdon
- Add logging for input device debugging
- Disable spatial audio

## 1.44.0

- Pulling framer-motion package
- upgrade slideMenu to have all animations handled via framer-motion

## 1.43.0

- Set font on FormInputV2.
- Fix custom background url string in useRoomMetaContextBackground hook.
- Set correct modal overlay color.
- CSS utilities for z-index.
- Add edit state for JoinRoom avatar preview.

## 1.42.0

Background wallpaper selection modal and Accessories tray.

- Update UI of BackgroundPicker.
- Put BackgroundPicker in a Modal in the footer.
- Use an options object similar to avatar options for wallpapers.
- Set default wallpaper in the room meta reducer.
- Adding in new slideMenu with animations and mobile state
- Add in AccessoriesTray component
- Removing Footer and Feedback Component

## 1.41.0

Avatar background colors.

- Added backgroundColor property to avatar data objects.
- Plumbed avatar background color into AvatarSelect.
- Plumbed avatar background color to avatar preview on Join page.
- Plumbed avatar background color to ParticipantCircle.
- New settings icon on ParticipantCircle.
- Avatar smaller in ParticipantCircle and toggling participant name color with camera enable.
- Increase huddle bubble radius for small huddles to reduce bubble overlap.
- Add white circle to huddle to show continuity between participants.

## 1.40.0

New AV toggle controls.

- AudioToggle and VideoToggle components.
- Plumbed new toggles into Join/lobby page.
- Plumbed new toggles into ParticipantCircle.

## 1.39.0

- New room: meetwith
- Update pw for chezkerry

## 1.38.0

- Add audio presence based on users location and huddle status
- Update room name to chezkerry
- New rooms: viksit, partytime, maddie

## 1.37.0

- Adding in css utils
- reworking join page to be responsive and match designs
- adding in new font
- reworking avatar picker to use css utils
- updating logos
- adding in default wallpaper

## 1.36.0

Double pane box component. This looks like it's going to be a common UI thing, so I made a component for it.

- DoublePaneBox component.
- Experimenting with transitions between the login area and the avatar selector in the lobby.

## 1.35.0

Blinking avatars.

- Using a combination of background image and image element in Avatar to toggle appearance of blinking.
- Random timout up to 5000ms for non-blinking, 100ms for blinking.
- Now using the Avatar component in AvatarSelect.
- Removing console.logs from AudioTrack.
- Making Participant bubbles smaller on small screens.

## 1.34.0

Laying the groundwork for avatars (tokens).

- Turn video off by default.
- Allow the user to select an avatar in the lobby page.
- When the Room mounts, dispatch an action to set the user's avatar.
- Queue redux actions until a PING is received. Then re-dispatch them. (See extensive comment in RoomStateProvider.tsx)
- Use participant avatar meta property as the background for ParticipantCircle.
- New avatar images.
- First pass at the new lobby page in JoinRoom.

## 1.33.0

New rooms:

- charlesgivre
- seanlutjens
- mindsense
- louis
- crivello

## 1.32.0

Play ping audio when a user is pulled into a huddle

## 1.31.0

New rooms: moxon, fanafan

## 1.30.0

Add room for leah

## 1.29.0

Fix ability to join an existing huddle.

- HuddleBubble needed to use the `inviteToHuddle` handler rather than `removeFromHuddle` in the click handler on a huddle's participant bubbles.

## 1.28.0

Create participant admin model

- Move A/V muting into admin panel, remove from room
- Create emoji picker, and sync emoji state over webrtc
- Create local participant heads up display (HUD) for quick A/V muting, unmuting
- Show participant name always
- Add room for johnpalmer

## 1.27.0

Add new rooms:

- mspennskindergarten
- churchillbuildingcompany
- auraframes
- chrisbecherer
- jonwinny
- hankheyming
- jmow
- virtualkitchen
- mdes
- karenbourdon

## 1.26.0

- updating logo and favicon

## 1.25.0

- Add default background image to room
- Add hint text about how to use postimages.org to host custom background image
- Add itsagooddeck room and update picsofkai passcode

## 1.24.0

Move link bubbles to upper right corner.

- Put LinkBubble components into a container floated to the right in the Room component.
- LinkBubble area is 40% of the Room width, to keep the bubbles from taking over the entire space.
- LinkBubbles will wrap in their area.
- Give the room 80px top margin to compensate for header.

## 1.23.0

Ditch the home grown redux-like state management in favor of actual redux. This buys us stability and good developer tools.

- Install redux and react-redux.
- Create the store for the room state, enabling redux devtools extension integration.
- RoomStateProvider will house the redux store object and redux store Provider for the rest of the app.
- Have the huddle/widget/room meta/participant meta providers get their state values using react-redux's `useSelector` hook.
- Continuing to use the custom `dispatch` function to enable the data track message sending on local action dispatches.
- Move the inclusion of the huddle/widget/room meta/participant meta providers to RoomStateProvider from VideoContext.

## 1.22.0

- Remove share buttons from header
- fix login page to be more mobile friendly

## 1.21.0

Draggable participant bubbles.

- CircleRoom component replaced with withComponents/Room component.
- HuddleBubble component.
- ParticipantMeta context/reducer/provider/hook to track location state of each participant.
- Installed react-dnd for draggability.
- Huddles are not draggable.
- The local participant may only drag their bubble.

## 1.20.0

New room for Jessie Char

## 1.19.0

Add new room name and passcode for Jessie Char

## 1.18.0

Add new room name and passcode for Akash Kuttappa

## 1.17.0

Add new set of room names and passcodes.

## 1.16.0

- Remove the room name from the Header
- Enable new link bubble

## 1.15.0

- Update and polish LinkBubble component
- Update Header to use white logo when custom bg is used

## 1.14.0

Update huddle UI and huddle dissolve button UI

## 1.13.0

Add product analytics tracking disclaimer to JoinRoom form.

## 1.12.0

Ensure all user identities are unique

- Update component ParticipantCircle to use useParticipantDisplayIdentity hook
- Create useParticipantDisplayIdentity hook
- Update token.js server to append UUIDv4 to submitted user name with "#!"

## 1.11.0

Enable users to email feedback to the With team

- Added a feedback link in the "Add Apps" panel
- Added a feedback link in the Room, bottom left corner

## 1.10.0

General UI fixes

- added selected state around custom bg input
- fixed weird closing behavior where the dropdown menu would reset before the menu finished going invisible

## 1.9.0

Room meta provider and custom backgrounds.

- Update the example env file to show the appropriate \_DEV keys to override.
- "room meta" provider to provide a place that we can store some arbitrary data about the room.
- RoomMeta is intended to be a collection of key/value pairs to store random info.
- RoomMetaProvider and roomMetaReducer plumbed in the same fashion as Huddles and Widgets.
- Background form is hooked up to the RoomMetaContext.
- `AnglesApp` component reads room meta properties to set up the background image.

## 1.8.0

- Adding in the ui for choosing a background image
- Updating footer menu to multiple pages

## 1.7.0

This allows us to keep room events and data track messaging contained in one place: `RoomStateProvider`. As seen with `HuddleProvider`, a **ton** of code was able to be removed, which is doubly good because that code was basically duplicated in `WidgetProvider`.

- `RoomStateProvider` will house the centralized state of the room.
- `RoomStateProvider` behaves like redux. It has a state object that is updated when "actions" take place. It exposes a `dispatch` function to its children so that they may trigger "actions".
- `RoomStateProvider`'s `dispatch` function updates the state of the room, as well as sends a data message to the remote participants denoting what action just took place.
- `RoomStateProvider` listens for data messages from remote participants and updates the local room state according to the action contained in the data message.
- `HuddleProvider` now has an accompanying "reducer" to define state updates. This is basically a regular ole redux reducer.
- `HuddleProvider` no longer interacts directly with data tracks or room events. This is handled in the `RoomStateProvider`
- `HuddleProvider` uses the `dispatch` function provided by `RoomStateProvider` to trigger "actions" that will update the state of the room.
- `WidgetProvider` now has an accompanying "reducer" to define state updates. This is basically a regular ole redux reducer.
- `WidgetProvider` no longer interacts directly with data tracks or room events. This is handled in the `RoomStateProvider`
- `WidgetProvider` uses the `dispatch` function provided by `RoomStateProvider` to trigger "actions" that will update the state of the room.

## 1.6.0

Heap analytics

- Added the Heap analytics code to index.html in React app with conditional logic based on environmental variable, REACT_APP_ANALYTICS_ENV.
- Added another set of Twilio API keys to avoid room name collisions with production. Development or production keys are used based on Netlify's build context, which is set as an environment variable.

## 1.5.0

- Adding in new logo
- Adding in new favicon

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
