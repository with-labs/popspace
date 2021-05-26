import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { LocalParticipant, RemoteParticipant, Room } from 'twilio-video';
import { ReconnectingTwilioRoom } from './ReconnectingTwilioRoom';
import { TWILIO_CONNECTION_OPTIONS } from '@constants/twilio';
import { useAllParticipants } from './useAllParticipants';
import { useLocalTrackPublications } from './useLocalTrackPublications';
import { useMobileBackgroundDisconnect } from './useMobileBackgroundDisconnect';
import { logger } from '@utils/logger';
import ReconnectingNotification from './ReconnectingNotification';

export enum TwilioStatus {
  Initial = 'initial',
  Reconnecting = 'reconnecting', // also, Connecting
  Disconnected = 'disconnected',
  Connected = 'connected',
}

export interface TwilioContextData {
  room: Room | null;
  isConnecting: boolean;
  allParticipants: (LocalParticipant | RemoteParticipant)[];
  status: TwilioStatus;
}

export const TwilioContext = createContext<TwilioContextData | null>(null);

export function useTwilio() {
  const ctx = useContext(TwilioContext);
  if (!ctx) {
    throw new Error('useTwilio must be called within a TwilioProvider');
  }
  return ctx;
}

export const TwilioProvider: React.FC<{ roomName: string }> = ({ roomName, children, ...rest }) => {
  const [connection] = useState<ReconnectingTwilioRoom>(() => new ReconnectingTwilioRoom(TWILIO_CONNECTION_OPTIONS));

  // disconnect and cleanup when this component is unmounted
  useEffect(() => {
    return () => {
      connection.dispose();
    };
  }, [connection]);

  // synchronize the twilio Room object, which is managed by the
  // connection above.
  const [room, setRoom] = useState<Room | null>(connection.room);

  useEffect(() => {
    connection.on('roomChanged', setRoom);
    return () => {
      connection.off('roomChanged', setRoom);
    };
  }, [connection]);

  useEffect(() => {
    connection.setRoom(roomName).catch((err) => {
      logger.critical(`Failed to connect to Twilio room ${roomName}`, err);
    });
  }, [roomName, connection]);

  // keep track of room connection state for context
  const [status, setStatus] = useState<TwilioStatus>((room?.state as TwilioStatus) ?? TwilioStatus.Initial);

  useEffect(() => {
    function updateConnectionStatus() {
      setStatus((connection.room?.state as TwilioStatus) ?? TwilioStatus.Disconnected);
    }

    connection.on('reconnecting', updateConnectionStatus);
    connection.on('disconnected', updateConnectionStatus);
    connection.on('connected', updateConnectionStatus);
    connection.on('connecting', updateConnectionStatus);

    return () => {
      connection.off('reconnecting', updateConnectionStatus);
      connection.off('disconnected', updateConnectionStatus);
      connection.off('connected', updateConnectionStatus);
      connection.off('connecting', updateConnectionStatus);
    };
  }, [connection]);

  // enables the declarative media track publishing from LocalTracks
  // state - this hook synchronizes tracks which are enabled locally
  // with streams published to Twilio
  useLocalTrackPublications(connection);
  // handles backgrounding video streams on mobile devices
  useMobileBackgroundDisconnect(connection);

  // gather a list of all room participants in one place, which
  // is propagated through context to be used elsewhere
  const allParticipants = useAllParticipants(room);

  const ctx = useMemo(
    () => ({
      room,
      allParticipants,
      isConnecting: status === TwilioStatus.Reconnecting,
      status,
    }),
    [room, allParticipants, status]
  );

  return (
    <TwilioContext.Provider value={ctx} {...rest}>
      {children}
      <ReconnectingNotification />
    </TwilioContext.Provider>
  );
};
