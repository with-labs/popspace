import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import { LocationTuple } from '../../types';
import {
  EmojiData,
  locationUpdate,
  avatarUpdate,
  emojiUpdate,
  activeCameraUpdate,
  activeMicUpdate,
  viewScreenSidUpdate,
  isSpeakingUpdate,
} from '../../withComponents/ParticipantMetaProvider/participantMetaReducer';
import { useRoomStateContext } from '../../withHooks/useRoomStateContext/useRoomStateContext';
import { RootState } from '../RoomState/store';

export function useParticipantMetaContext() {
  const participantMeta = useSelector((state: RootState) => state.participantMeta);
  const { dispatch } = useRoomStateContext();

  const {
    room: { localParticipant },
  } = useVideoContext();

  const updateLocation = useCallback(
    (sid: string, location: LocationTuple) => {
      dispatch(locationUpdate(sid, location));
    },
    [dispatch]
  );

  const updateEmoji = useCallback(
    (emoji: EmojiData) => {
      dispatch(emojiUpdate(localParticipant.sid, emoji));
    },
    [localParticipant, dispatch]
  );

  const updateAvatar = useCallback(
    (avatar: string) => {
      dispatch(avatarUpdate(localParticipant.sid, avatar));
    },
    [localParticipant, dispatch]
  );

  const updateActiveCamera = useCallback(
    (cameraLabel: string) => {
      dispatch(activeCameraUpdate(localParticipant.sid, cameraLabel));
    },
    [localParticipant, dispatch]
  );

  const updateActiveMic = useCallback(
    (micLabel: string) => {
      dispatch(activeMicUpdate(localParticipant.sid, micLabel));
    },
    [localParticipant, dispatch]
  );

  const updateScreenViewSid = useCallback(
    (screenViewSid: string) => {
      dispatch(viewScreenSidUpdate(localParticipant.sid, screenViewSid));
    },
    [localParticipant, dispatch]
  );

  const updateIsSpeaking = useCallback(
    (isSpeaking: boolean) => {
      dispatch(isSpeakingUpdate(localParticipant.sid, isSpeaking));
    },
    [dispatch, localParticipant]
  );

  return {
    updateLocation,
    updateAvatar,
    updateEmoji,
    updateActiveCamera,
    updateActiveMic,
    updateScreenViewSid,
    updateIsSpeaking,
    participantMeta,
  };
}
