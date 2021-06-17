import { useContext } from 'react';
import { WidgetType } from '@api/roomState/types/widgets';
import { WidgetContext, WidgetContextValue } from './WidgetProvider';

export const useWidgetContext = <T extends WidgetType = any>() => {
  const ctx = useContext(WidgetContext) as WidgetContextValue<T>;
  if (!ctx) {
    throw new Error('useWidgetContext must be called inside a Widget');
  }
  return ctx;
};
