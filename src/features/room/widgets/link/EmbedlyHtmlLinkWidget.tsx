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

export function EmbedlyHtmlLinkWidget() {
  const { t } = useTranslation();
  const classes = useStyles();
  const {
    widget: { widgetState },
  } = useWidgetContext<WidgetType.Link>();

  if (!widgetState.embedly?.html) return null;

  const srcDoc = `<html><body>${widgetState.embedly.html}</body></html>`;

  return (
    <WidgetFrame
      color={ThemeName.Snow}
      minWidth={MIN_SIZE_FRAME.width}
      minHeight={MIN_SIZE_FRAME.height}
      maxWidth={MAX_SIZE_FRAME.width}
      maxHeight={MAX_SIZE_FRAME.height}
    >
      <WidgetTitlebar title={widgetState.embedly.title ?? t('widgets.link.embedTitle')} disableRemove>
        <LinkMenu />
      </WidgetTitlebar>
      <WidgetContent disablePadding>
        <iframe srcDoc={srcDoc} title={widgetState.embedly.title} className={classes.root} />
      </WidgetContent>
    </WidgetFrame>
  );
}
