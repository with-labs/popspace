import { WidgetType } from '@api/roomState/types/widgets';
import { makeStyles } from '@material-ui/core';
import { ThemeName } from '@src/theme/theme';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { useWidgetContext } from '../useWidgetContext';
import { WidgetContent } from '../WidgetContent';
import { WidgetFrame } from '../WidgetFrame';
import { WidgetTitlebar } from '../WidgetTitlebar';
import { MAX_SIZE_FRAME, MIN_SIZE_FRAME } from './constants';
import { LinkMenu } from './menu/LinkMenu';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    height: '100%',
    border: 'none',
  },
}));

/**
 * This handler attempts to stop a ctrl/cmd + wheel event
 * over the iframe from reaching the iframe and causing page
 * zoom. It's passed to the capture-phase wheel event handler
 * so it has a chance to run before the event reaches the iframe
 * from the top of the document.
 */
const stopIframeZoomEvent = (ev: React.WheelEvent) => {
  if (ev.ctrlKey || ev.metaKey) {
    ev.preventDefault();
    ev.stopPropagation();
  }
};

export function IFrameLinkWidget() {
  const { t } = useTranslation();
  const classes = useStyles();
  const {
    widget: { widgetState },
  } = useWidgetContext<WidgetType.Link>();

  return (
    <WidgetFrame
      color={ThemeName.Snow}
      minWidth={MIN_SIZE_FRAME.width}
      minHeight={MIN_SIZE_FRAME.height}
      maxWidth={MAX_SIZE_FRAME.width}
      maxHeight={MAX_SIZE_FRAME.height}
    >
      <WidgetTitlebar title={widgetState.title ?? t('widgets.link.embedTitle')} disableRemove>
        <LinkMenu enableIframe />
      </WidgetTitlebar>
      <WidgetContent disablePadding>
        <iframe
          src={widgetState.iframeUrl ?? widgetState.url}
          title={widgetState.title}
          allow="encrypted-media"
          allowFullScreen
          allowTransparency
          sandbox={'allow-presentation allow-scripts allow-same-origin allow-forms'}
          className={classes.root}
          onWheelCapture={stopIframeZoomEvent}
        />
      </WidgetContent>
    </WidgetFrame>
  );
}
