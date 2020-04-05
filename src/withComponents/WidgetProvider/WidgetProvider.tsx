/**
 * The basic structure and concepts for this context provider are based largely on the HuddleProvider provider.
 */

import React, { useEffect, useState, useCallback, createContext, ReactNode } from 'react';
import { v4 as uuid } from 'uuid';

import useVideoContext from '../../hooks/useVideoContext/useVideoContext';

import { useLocalDataTrack } from '../../withHooks/useLocalDataTrack/useLocalDataTrack';

// `WidgetProperties` defines the properties that a widget must have.
type WidgetProperties = { type: string; id: string; hyperlink: string };
// `WidgetState` is the state maintained by this context provider representing the widgets present in the room.
type WidgetState = { [key: string]: WidgetProperties };

/**
 * React context structure for the widgets context. This will expose the widgets state, as well as functions to
 * mutate the widgets state and, consequently, broadcast messages to remote clients about the change in state.
 */
export interface IWidgetsContext {
  widgets: WidgetState;
  addWidget: (hyperlink: string) => void;
  removeWidget: (widgetId: string) => void;
}

// The React context for widgets.
export const WidgetContext = createContext<IWidgetsContext>(null!);

// WidgetProvider props. Only needs children.
interface IWidgetProviderProps {
  children: ReactNode;
}

/**
 * Widget context provider.
 */
export function WidgetProvider({ children }: IWidgetProviderProps) {
  // Widgets state.
  const [widgets, setWidgets] = useState<WidgetState>({});

  // Local data track used to broadcast widget state updates to remote participants.
  const localDT = useLocalDataTrack();

  // room property of the video context. Used to listen to remote data track messages and participant add/leave.
  const { room } = useVideoContext();
  const { localParticipant } = room;

  const messageHandler = useCallback(
    rawMsg => {
      try {
        const { type, payload } = JSON.parse(rawMsg);

        switch (type) {
          case 'WIDGET_ADD': {
            const newWidgets = { ...widgets };
            newWidgets[payload.id] = payload;
            setWidgets(newWidgets);
            break;
          }

          case 'WIDGET_REMOVE': {
            const newWidgets = { ...widgets };
            delete newWidgets[payload];
            setWidgets(newWidgets);
            break;
          }

          case 'WIDGET_PING': {
            if (payload.recipient === localParticipant.sid) {
              setWidgets(payload.widgets);
            }
            break;
          }
        }
      } catch (err) {
        // Assume JSON parse error. Ignore.
      }
    },
    [localParticipant, widgets]
  );

  useEffect(() => {
    room.on('trackMessage', messageHandler);
    return () => {
      room.off('trackMessage', messageHandler);
    };
  });

  // When a new participant joins the room, they need to know what widgets are present, as well.
  // Regarding the timeout and reason for using the `trackPublished` event, see comments in HuddleProvider.
  const trackPublishedHandler = useCallback(
    (pub, pt) => {
      const hasWidgets = Object.keys(widgets).length;

      // Only want to ping the remote participant if there are widgets to share.
      if (hasWidgets && pub.kind === 'data') {
        setTimeout(() => {
          localDT.send(
            JSON.stringify({
              type: 'WIDGET_PING',
              payload: { widgets, recipient: pt.sid, sender: localParticipant.sid },
            })
          );
        }, 500);
      }
    },
    [localDT, widgets, localParticipant]
  );

  useEffect(() => {
    room.on('trackPublished', trackPublishedHandler);
    return () => {
      room.off('trackPublished', trackPublishedHandler);
    };
  });

  // Mutator to add a widget.
  const addWidget = (hyperlink: string) => {
    // Update local state.
    const wId = uuid();
    const widget = { id: wId, type: 'LINK', hyperlink };
    const newWidgets = { ...widgets, [wId]: widget };
    setWidgets(newWidgets);

    // Broadcast to remote participants.
    localDT.send(JSON.stringify({ type: 'WIDGET_ADD', payload: widget }));
  };

  // Mutator to remove a widget.
  const removeWidget = (widgetId: string) => {
    // Update local state.
    const newWidgets = { ...widgets };
    delete newWidgets[widgetId];
    setWidgets(newWidgets);

    // Broadcast to remote participants.
    localDT.send(JSON.stringify({ type: 'WIDGET_REMOVE', payload: widgetId }));
  };

  // Return the context.
  return <WidgetContext.Provider value={{ widgets, addWidget, removeWidget }}>{children}</WidgetContext.Provider>;
}
