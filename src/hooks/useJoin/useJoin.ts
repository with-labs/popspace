import { useState, useCallback } from 'react';
import api from '../../utils/api';
import useVideoContext from '../useVideoContext/useVideoContext';
import { getSessionToken } from '../../utils/getSessionToken';
import { useTranslation } from 'react-i18next';
import { ErrorCodes } from '../../constants/ErrorCodes';
import { ErrorTypes } from '../../constants/ErrorType';

export class JoinError extends Error {}
export class FatalError extends Error {
  constructor(message: string, public errorType: ErrorTypes) {
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
  const join = useCallback(
    async (username?: string, password?: string) => {
      setJoining(true);

      try {
        // split into two code paths - one for if the user has an active session,
        // one for not. Both will populate `token` in the end.
        let token: string;

        const sessionToken = getSessionToken();

        // if there is no session token, or there were provided credentials, use the credentials.
        if (!sessionToken || (username && password)) {
          // if no session and no password, reject
          if (!password || !username) {
            throw new JoinError(t('error.messages.noRoomPassword'));
          }

          const result = await api.getToken(username, password, roomName);
          if (!result.success || !result.token) {
            if (result.errorCode === ErrorCodes.INCORRECT_ROOM_PASSCODE) {
              throw new JoinError(t('error.messages.incorrectRoomPassword'));
            } else if (result.errorCode === ErrorCodes.INVALID_USER_IDENTITY) {
              throw new JoinError(t('error.messages.joinRoomInvalidScreenName'));
            } else if (result.errorCode === ErrorCodes.UNKNOWN_ROOM) {
              throw new FatalError(t('error.messages.unknownRoom'), ErrorTypes.ROOM_NOT_FOUND);
            } else {
              throw new JoinError(t('error.messages.joinRoomUnknownFailure'));
            }
          }
          token = result.token;
        } else {
          const result = await api.loggedInEnterRoom(sessionToken, roomName);
          if (!result.success || !result.token) {
            if (result.errorCode === ErrorCodes.UNAUTHORIZED_ROOM_ACCESS) {
              throw new JoinError(t('error.messages.noRoomAccess'));
            } else {
              throw new JoinError(t('error.messages.joinRoomUnknownFailure'));
            }
          }
          token = result.token;
        }

        // now we have a token, join the room!
        await connect(token);
      } finally {
        setJoining(false);
      }
    },
    [roomName, connect, t]
  );

  return [join, { loading: joining }] as const;
}
