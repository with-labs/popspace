import { makeStyles } from '@material-ui/core';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { WidgetType } from '../../../../../roomState/types/widgets';
import { useWidgetContext } from '../../useWidgetContext';
import { WidgetContent } from '../../WidgetContent';
import { WidgetResizeHandle } from '../../WidgetResizeHandle';
import { WidgetTitlebar } from '../../WidgetTitlebar';
import { LinkMenu } from '../menu/LinkMenu';

const useStyles = makeStyles((theme) => ({
  iframeContainer: {
    width: '100%',
    height: '100%',
  },
  iframe: {
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

export function IFrameDocumentContent({ disableSandbox }: { disableSandbox?: boolean }) {
  const classes = useStyles();
  const { t } = useTranslation();

  const {
    widget: { widgetState },
  } = useWidgetContext<WidgetType.Link>();

  return (
    <>
      <WidgetTitlebar title={widgetState.title ?? t('widgets.link.embedTitle')} disableRemove>
        <LinkMenu />
      </WidgetTitlebar>
      <WidgetContent disablePadding>
        <div className={classes.iframeContainer} onWheelCapture={stopIframeZoomEvent}>
          <iframe
            src={widgetState.iframeUrl ?? widgetState.url}
            title={widgetState.title}
            style={{ minWidth: 400, minHeight: 400, height: '100%', width: '100%' }}
            allow="encrypted-media"
            allowFullScreen
            allowTransparency
            sandbox={disableSandbox ? undefined : 'allow-presentation allow-scripts allow-same-origin allow-forms'}
            className={classes.iframe}
          />
        </div>
        <WidgetResizeHandle />
      </WidgetContent>
    </>
  );
}
