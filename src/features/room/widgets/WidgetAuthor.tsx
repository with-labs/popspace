import * as React from 'react';
import { useWidgetContext } from './useWidgetContext';

export interface IWidgetAuthorProps extends React.HTMLAttributes<HTMLSpanElement> {}

/**
 * Renders the name of a widget's author
 */
export const WidgetAuthor: React.FC<IWidgetAuthorProps> = (props) => {
  const {
    widget: { ownerDisplayName: authorName },
  } = useWidgetContext();

  return <span {...props}>{authorName ?? 'Anonymous'}</span>;
};
