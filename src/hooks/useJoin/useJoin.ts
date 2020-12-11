import { useState, useCallback } from 'react';
import api from '../../utils/api';
import useVideoContext from '../useVideoContext/useVideoContext';
import { useTranslation } from 'react-i18next';
import { ErrorCodes } from '../../constants/ErrorCodes';
import { logger } from '../../utils/logger';
export class JoinError extends Error {
  constructor(message: string, public errorCode: ErrorCodes) {
    super(message);
  }
}
export class FatalError extends Error {
  constructor(message: string, public errorCode: ErrorCodes) {
    super(message);
  }
}

/**
 * Encapsulates all the fun stuff we need to join a room. Returns a function
 * you can call to join at your leisure, and a state object indicating the
 * status of any ongoing join request. Also prevents doing multiple concurrent
 * joins.
 */
export function useJoin(roomName: string) {
  const { t } = useTranslation();

  const [joining, setJoining] = useState(false);

  const { connect } = useVideoContext();

  /**
   * Joins a room - credentials are only required if the user
   * is not signed in.
   */
  const join = useCallback(async () => {
    setJoining(true);
    try {
      const result = await api.loggedInEnterRoom(roomName);
      if (!result.success || !result.token) {
        if (result.errorCode === ErrorCodes.UNAUTHORIZED_ROOM_ACCESS) {
          // user is logged in but doesnt have room access
          throw new JoinError(t('error.messages.noRoomAccess'), ErrorCodes.UNAUTHORIZED_ROOM_ACCESS);
        } else if (result.errorCode === ErrorCodes.UNKNOWN_ROOM) {
          // trying to join a room that does not exist
          throw new FatalError(t('error.messages.unknownRoom'), ErrorCodes.ROOM_NOT_FOUND);
        }
        if (result.errorCode === ErrorCodes.UNAUTHORIZED_USER) {
          // user is not logged in
          throw new JoinError(t('error.messages.unauthorized'), ErrorCodes.UNAUTHORIZED_USER);
        } else {
          logger.error(`Unhandled expection in useJoin`, result.errorCode, result.message);
          throw new JoinError(t('error.messages.joinRoomUnknownFailure'), ErrorCodes.JOIN_ROOM_UNKNOWN);
        }
      }
      const token = result.token;

      // now we have a token, join the room!
      await connect(token);
    } finally {
      setJoining(false);
    }
  }, [roomName, connect, t]);

  return [join, { loading: joining }] as const;
}
