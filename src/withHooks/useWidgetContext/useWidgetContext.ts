import { useContext } from 'react';

import { WidgetContext } from '../../withComponents/WidgetProvider/WidgetProvider';

export function useWidgetContext() {
  const context = useContext(WidgetContext);

  if (!context) {
    throw new Error('useWidgetContext must be used inside a WidgetContext');
  }

  return context;
}
