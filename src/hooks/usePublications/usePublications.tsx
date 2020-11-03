import { useEffect, useState } from 'react';
import { LocalTrackPublication, Participant, RemoteTrackPublication } from 'twilio-video';

type TrackPublication = LocalTrackPublication | RemoteTrackPublication;

// FIXME: re-storing publications in state just to be notified when they change
// seems inefficient - perhaps Observables could help here?
export default function usePublications(participant?: Participant | null) {
  const [publications, setPublications] = useState<TrackPublication[]>(() => {
    // prevents the publications state from being empty on first mount even if participant is already loaded
    if (participant) {
      return Array.from(participant.tracks.values()) as TrackPublication[];
    }
    return [];
  });

  useEffect(() => {
    if (!participant) {
      setPublications([]);
      return;
    }

    // Reset the publications when the 'participant' variable changes.
    setPublications(Array.from(participant.tracks.values()) as TrackPublication[]);

    const publicationAdded = (publication: TrackPublication) =>
      setPublications((prevPublications) => [...prevPublications, publication]);
    const publicationRemoved = (publication: TrackPublication) =>
      setPublications((prevPublications) => prevPublications.filter((p) => p !== publication));

    participant.on('trackPublished', publicationAdded);
    participant.on('trackUnpublished', publicationRemoved);
    return () => {
      participant.off('trackPublished', publicationAdded);
      participant.off('trackUnpublished', publicationRemoved);
    };
  }, [participant]);

  return publications;
}
