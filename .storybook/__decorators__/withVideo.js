import React from 'react';
import { VideoContext } from '../../src/components/VideoProvider';
import { EventEmitter } from 'events';

const fakeLocalParticipant = {
  sid: 'me',
  state: '',
  identity: 'me#!',
  networkQualityLevel: null,
  networkQualityStatus: null,
  audioTracks: {},
  dataTracks: {},
  tracks: {},
  videoTracks: {},
  signalingRegion: '',

  publishTrack: () => {},
  publishTracks: () => {},
  setParameters: () => {},
  unpublishTrack: () => {},
  unpublishTracks: () => {},

  on: () => {},
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
    <VideoContext.Provider value={value}>
      <Story />
    </VideoContext.Provider>
  );
}
