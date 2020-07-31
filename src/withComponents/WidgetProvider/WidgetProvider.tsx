/**
 * This context provider is intended to be the "glue" between the widgets state in the room and the UI. It exposes the
 * widgets state, as well as the action creators that will precipitate updates to the widgets state.
 */

import React, { createContext, ReactNode, useCallback } from 'react';
import { v4 as uuid } from 'uuid';
import { useSelector } from 'react-redux';
import { LocationTuple } from '../../types';

import { useRoomStateContext } from '../../withHooks/useRoomStateContext/useRoomStateContext';

import { WidgetTypes } from './widgetTypes';
import { IWidgetState, widgetAdd, widgetRemove, widgetLocationUpdate } from './widgetReducer';

/**
 * React context structure for the widgets context. This will expose the widgets state, as well as functions to
 * mutate the widgets state and, consequently, broadcast messages to remote clients about the change in state.
 */
export interface IWidgetsContext {
  widgets: IWidgetState;
  addWidget: (type: WidgetTypes, participantSid: string, data: object) => void;
  removeWidget: (widgetId: string) => void;
  updateWidgetLocation: (id: string, location: LocationTuple) => void;
}

// The React context for widgets.
export const WidgetContext = createContext<IWidgetsContext>(null!);

// WidgetProvider props. Only needs children.
interface IWidgetProviderProps {
  children: ReactNode;
}

/**
 * Widget context provider.
 *
 * @param props
 */
export function WidgetProvider({ children }: IWidgetProviderProps) {
  // @ts-ignore
  const widgets = useSelector(state => state.widgets);
  const { dispatch } = useRoomStateContext();

  // Mutator to add a widget.
  const addWidget = useCallback(
    (type: WidgetTypes, participantSid: string, data: any) => {
      const widget = {
        id: uuid(),
        type,
        participantSid,
        // data holds the specific data needed for each type of widget
        data,
      };

      dispatch(widgetAdd(widget));
    },
    [dispatch]
  );

  // Mutator to remove a widget.
  const removeWidget = useCallback(
    (widgetId: string) => {
      dispatch(widgetRemove(widgetId));
    },
    [dispatch]
  );

  // update the location of a widget
  const updateWidgetLocation = useCallback(
    (id: string, location: LocationTuple) => {
      dispatch(widgetLocationUpdate(id, location));
    },
    [dispatch]
  );

  // Return the context.
  return (
    <WidgetContext.Provider
      value={{
        widgets,
        addWidget,
        removeWidget,
        updateWidgetLocation,
      }}
    >
      {children}
    </WidgetContext.Provider>
  );
}
