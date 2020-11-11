import { useEffect, useState, useMemo } from 'react';
import { Room, RemoteParticipant } from 'twilio-video';
import { RoomEvent } from '../../../constants/twilio';

export function useAllParticipants(room: Room | null) {
  const [remoteParticipants, setRemoteParticipants] = useState(
    room?.participants ? Array.from(room.participants.values()) : []
  );

  useEffect(() => {
    if (!room) return;

    setRemoteParticipants(Array.from(room.participants.values()));

    const participantConnected = (participant: RemoteParticipant) =>
      setRemoteParticipants((prevParticipants) => [...prevParticipants, participant]);
    const participantDisconnected = (participant: RemoteParticipant) =>
      setRemoteParticipants((prevParticipants) => prevParticipants.filter((p) => p !== participant));
    room.on(RoomEvent.ParticipantConnected, participantConnected);
    room.on(RoomEvent.ParticipantDisconnected, participantDisconnected);
    return () => {
      room.off(RoomEvent.ParticipantConnected, participantConnected);
      room.off(RoomEvent.ParticipantDisconnected, participantDisconnected);
    };
  }, [room]);

  return useMemo(() => {
    if (!room) return [];
    return [...remoteParticipants, room.localParticipant];
  }, [room, remoteParticipants]);
}
