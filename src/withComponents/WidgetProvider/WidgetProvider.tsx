/**
 * This context provider is intended to be the "glue" between the widgets state in the room and the UI. It exposes the
 * widgets state, as well as the action creators that will precipitate updates to the widgets state.
 */

import React, { createContext, ReactNode } from 'react';
import { v4 as uuid } from 'uuid';
import { useSelector } from 'react-redux';

import { useRoomStateContext } from '../../withHooks/useRoomStateContext/useRoomStateContext';

import { IWidgetState, widgetAdd, widgetRemove } from './widgetReducer';

/**
 * React context structure for the widgets context. This will expose the widgets state, as well as functions to
 * mutate the widgets state and, consequently, broadcast messages to remote clients about the change in state.
 */
export interface IWidgetsContext {
  widgets: IWidgetState;
  addWidget: (participantSid: string, hyperlink: string, title: string) => void;
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
 *
 * @param props
 */
export function WidgetProvider({ children }: IWidgetProviderProps) {
  // @ts-ignore
  const widgets = useSelector(state => state.widgets);
  const { dispatch } = useRoomStateContext();

  // Mutator to add a widget.
  const addWidget = (participantSid: string, hyperlink: string, title: string) => {
    const widget = {
      id: uuid(),
      type: 'LINK',
      hyperlink,
      participantSid,
      title,
    };

    dispatch(widgetAdd(widget));
  };

  // Mutator to remove a widget.
  const removeWidget = (widgetId: string) => {
    dispatch(widgetRemove(widgetId));
  };

  // Return the context.
  return <WidgetContext.Provider value={{ widgets, addWidget, removeWidget }}>{children}</WidgetContext.Provider>;
}
