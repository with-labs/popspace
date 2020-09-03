import React, { RefObject } from 'react';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import { useRoomParties } from '../../withHooks/useRoomParties/useRoomParties';
import { WidgetTypes } from '../WidgetProvider/widgetTypes';
import { LinkWidget } from '../LinkWidget/LinkWidget';
import { StickyNoteWidget } from '../StickyNoteWidget/StickyNoteWidget';
import Whiteboard from '../Whiteboard/Whiteboard';
import { YouTubeWidget } from '../YouTubeWidget/YouTubeWidget';
import useParticipants from '../../hooks/useParticipants/useParticipants';

export const Widgets: React.FC<{ dragConstraints: RefObject<Element> }> = ({ dragConstraints }) => {
  const { widgets } = useRoomParties();
  const remoteParticipants = useParticipants();
  const {
    room: { localParticipant },
  } = useVideoContext();
  return (
    <>
      {widgets.reduce<JSX.Element[]>((widComps, widget) => {
        if (widget?.data.isPublished || widget.participantSid === localParticipant.sid) {
          switch (widget.type) {
            case WidgetTypes.Link:
              widComps.push(
                <LinkWidget
                  key={widget.id}
                  id={widget.id}
                  dragConstraints={dragConstraints}
                  position={widget.data.location}
                  data={widget.data}
                />
              );
              break;
            case WidgetTypes.StickyNote:
              widComps.push(
                <StickyNoteWidget
                  key={widget.id}
                  id={widget.id}
                  position={widget.data.location}
                  participant={
                    widget.participantSid === localParticipant.sid
                      ? localParticipant
                      : remoteParticipants.find((pt) => pt.sid === widget.participantSid)
                  }
                  dragConstraints={dragConstraints}
                  data={widget.data}
                />
              );
              break;
            case WidgetTypes.Whiteboard:
              widComps.push(
                <Whiteboard
                  key={widget.id}
                  id={widget.id}
                  dragConstraints={dragConstraints}
                  position={widget.data.location}
                  data={widget.data}
                />
              );
              break;
            case WidgetTypes.YouTube:
              widComps.push(
                <YouTubeWidget
                  key={widget.id}
                  id={widget.id}
                  position={widget.data.location}
                  dragConstraints={dragConstraints}
                  data={widget.data}
                />
              );
              break;
            default:
              break;
          }
        }
        return widComps;
      }, [])}
    </>
  );
};
