import React from 'react';
import { VideoContext } from '../../src/components/VideoProvider';
import { LocalTracksProvider } from '../../src/components/LocalTracksProvider/LocalTracksProvider';
import { EventEmitter } from 'events';
import AppStateProvider from '../../src/state';

const fakeLocalParticipant = {
  sid: 'me',
  state: '',
  identity: 'me#!',
  networkQualityLevel: null,
  networkQualityStatus: null,
  audioTracks: {
    values: () => [],
  },
  dataTracks: {
    values: () => [],
  },
  tracks: {
    values: () => [],
  },
  videoTracks: {
    values: () => [],
  },
  signalingRegion: '',

  publishTrack: () => {},
  publishTracks: () => {},
  setParameters: () => {},
  unpublishTrack: () => {},
  unpublishTracks: () => {},

  on: () => {},
  off: () => {},
};

class FakeRoom extends EventEmitter {
  dominantSpeaker = null;
  isRecording = false;
  localParticipant = fakeLocalParticipant;
  mediaRegion = '';
  name = 'fake room';
  participants = {
    [fakeLocalParticipant.sid]: fakeLocalParticipant,
  };
  sid = '123';
  state = '';
  disconnect() {
    return this;
  }
  getStats() {}
}

const fakeRoom = new FakeRoom();

const value = {
  room: fakeRoom,
  localTracks: [
    {
      id: 'fake_data',
      kind: 'data',
      name: 'fooo',
      maxPacketLifeTime: 0,
      maxRetransmits: 0,
      ordered: false,
      reliable: false,
      send: () => {},
    },
  ],
  isConnecting: false,
  connect: () => Promise.resolve(fakeRoom),
  onError: () => {},
  onDisconnect: () => {},
  getLocalVideoTrack: () => {},
  getLocalAudioTrack: () => {},
  isAcquiringLocalTracks: false,
  removeLocalVideoTrack: () => {},
};

export function withVideo(Story) {
  return (
    <AppStateProvider>
      <LocalTracksProvider>
        <VideoContext.Provider value={value}>
          <Story />
        </VideoContext.Provider>
      </LocalTracksProvider>
    </AppStateProvider>
  );
}
