import { Story } from '@storybook/react/types-6-0';
import React, { useState, useEffect } from 'react';
import { PersonBubble } from './PersonBubble';
import { Box } from '@material-ui/core';
import { LocalVideoTrack, LocalVideoTrackPublication, LocalAudioTrack, LocalAudioTrackPublication } from 'twilio-video';
import { options } from '../../../components/AvatarSelect/options';

export default {
  title: 'components/PersonBubble',
  component: PersonBubble,
  argTypes: {
    isLocal: 'boolean',
    videoOn: 'boolean',
    emoji: 'string',
    status: 'string',
    avatar: {
      control: {
        type: 'select',
        options: options.map((opt) => opt.name),
      },
    },
  },
};

const localParticipant = {
  sid: 'me',
  state: '',
  identity: 'me#!',
  tracks: {
    values: () => [],
  },
  on: () => {},
} as any;

const localPerson = {
  id: 'me',
  kind: 'person' as const,
  avatar: 'puppy',
  emoji: null,
  viewingScreenSid: null,
  isSpeaking: false,
  status: null,
  isSharingScreen: false,
};

const remoteParticipant = {
  sid: 'them',
  state: '',
  identity: 'them#!',
  tracks: {
    values: () => [],
  },
  on: () => {},
} as any;

const remotePerson = {
  id: 'them',
  kind: 'person' as const,
  avatar: 'star',
  emoji: null,
  viewingScreenSid: null,
  isSpeaking: false,
  status: null,
  isSharingScreen: true,
};

function createFakeVideoTrackPublication(stream: MediaStream) {
  const t = new LocalVideoTrack(stream.getVideoTracks()[0]);
  return {
    track: t,
    on: () => {},
    off: () => {},
  };
}

function createFakeAudioTrackPublication(stream: MediaStream, muted: boolean) {
  const t = new LocalAudioTrack(stream.getAudioTracks()[0]);

  if (!t) return undefined;

  // idk how this is supposed to work
  if (!muted) {
    t.enable();
  }
  t.isEnabled = !muted;

  return {
    track: t,
    on: () => {},
    off: () => {},
  };
}

function Demo({
  isMuted,
  videoOn,
  isLocal,
  emoji,
  status,
  avatar,
}: {
  isLocal: boolean;
  isMuted: boolean;
  videoOn: boolean;
  emoji?: string;
  status?: string;
  avatar?: string;
}) {
  const [localVideo, setLocalVideo] = useState<LocalVideoTrackPublication | null>(null);
  const [localAudio, setLocalAudio] = useState<LocalAudioTrackPublication | null>(null);
  const [localScreenShare, setLocalScreenShare] = useState<LocalVideoTrackPublication | null>(null);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({
        video: true,
        audio: true,
      })
      .then((s) => {
        if (videoOn) {
          setLocalVideo(createFakeVideoTrackPublication(s) as any);
          setLocalScreenShare(createFakeVideoTrackPublication(s) as any);
        } else {
          setLocalVideo(null);
          setLocalScreenShare(null);
        }
        setLocalAudio(createFakeAudioTrackPublication(s, isMuted) as any);
      });
  }, [videoOn, isMuted]);

  const person = {
    ...(isLocal ? localPerson : remotePerson),
    avatar: avatar || 'puppy',
  };

  return (
    <Box
      bgcolor="primary.main"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      width="100vw"
      height="100vh"
    >
      <PersonBubble
        participant={isLocal ? localParticipant : remoteParticipant}
        person={{
          ...person,
          emoji: emoji ?? person.emoji,
          status: status ?? person.status,
        }}
        isLocal={isLocal}
        cameraTrack={localVideo}
        audioTrack={localAudio}
        screenShareTrack={localScreenShare}
      />
    </Box>
  );
}

const Template: Story<{
  isLocal: boolean;
  videoOn: boolean;
  isMuted: boolean;
  emoji?: string;
  status?: string;
}> = (args) => <Demo {...args} />;

export const Local = Template.bind({});
Local.args = {
  isLocal: true,
  videoOn: false,
  isMuted: false,
  emoji: undefined,
  status: undefined,
};

export const Remote = Template.bind({});
Remote.args = {
  isLocal: false,
  isMuted: false,
  videoOn: false,
  emoji: undefined,
  status: undefined,
};

export const TheWorks = Template.bind({});
TheWorks.args = {
  isLocal: false,
  isMuted: true,
  videoOn: true,
  emoji: 'santa',
  status: 'Hello world!',
};
