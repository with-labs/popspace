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

export function IFrameDocumentContent() {
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
        <div className={classes.iframeContainer}>
          <iframe
            src={widgetState.iframeUrl ?? widgetState.url}
            title={widgetState.title}
            style={{ minWidth: 400, minHeight: 400, height: '100%', width: '100%' }}
            allow="encrypted-media"
            allowFullScreen
            allowTransparency
            sandbox="allow-presentation allow-scripts allow-same-origin allow-forms "
            className={classes.iframe}
          />
        </div>
        <WidgetResizeHandle />
      </WidgetContent>
    </>
  );
}
