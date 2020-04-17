import { RemoteParticipant, LocalParticipant } from 'twilio-video';
import { useMemo } from 'react';

import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import useParticipants from '../../hooks/useParticipants/useParticipants';

import useHuddleContext from '../../withHooks/useHuddleContext/useHuddleContext';
import { useWidgetContext } from '../../withHooks/useWidgetContext/useWidgetContext';

import { IWidgetProperties } from '../../withComponents/WidgetProvider/widgetReducer';

export function useRoomParties() {
  const { widgets: widgMap } = useWidgetContext();
  const { huddles: hudMap } = useHuddleContext();
  const participantList = useParticipants();
  const {
    room: { localParticipant },
  } = useVideoContext();

  // `huddles` will be a mapping of { <huddleId>: [(LocalParticipant | RemoteParticipant)] }.
  // `floaters` will be an array of Participants that are not currently in a huddle.
  // `localHuddle` will be the id of the huddle the local participant is in, if any.
  const [huddles, floaters, localHuddle]: [
    { [key: string]: (LocalParticipant | RemoteParticipant)[] },
    (LocalParticipant | RemoteParticipant)[],
    string
  ] = useMemo(() => {
    const huddles: { [key: string]: (LocalParticipant | RemoteParticipant)[] } = {};
    const floaters: (LocalParticipant | RemoteParticipant)[] = [];
    // Get the local participant's huddle, if they are in one.
    const localHuddle = hudMap[localParticipant.sid];

    // To get a full view of who is/isn't in a huddle iterate over the participants and build up the `huddleGroups` and
    // `floaters`.
    participantList.forEach(pt => {
      if (hudMap[pt.sid]) {
        if (huddles[hudMap[pt.sid]]) {
          huddles[hudMap[pt.sid]].push(pt);
        } else {
          huddles[hudMap[pt.sid]] = [pt];
        }
      } else {
        floaters.push(pt);
      }
    });

    // Because the local participant is not included in the list of participants, add them to their huddle or as a
    // floater, as appropriate.
    if (localHuddle && huddles[localHuddle]) {
      huddles[localHuddle].push(localParticipant);
    } else {
      // Make sure the local participant is first in the list of floaters.
      floaters.unshift(localParticipant);
    }
    return [huddles, floaters, localHuddle];
  }, [hudMap, participantList, localParticipant]);

  const widgets: IWidgetProperties[] = [];
  for (let widgetId in widgMap) {
    widgets.push(widgMap[widgetId]);
  }

  return { huddles, floaters, widgets, localHuddle };
}
