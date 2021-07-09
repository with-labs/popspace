import { makeStyles } from '@material-ui/core';
import { ThemeName } from '@src/theme/theme';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { WidgetContent } from '../WidgetContent';
import { WidgetFrame } from '../WidgetFrame';
import { WidgetTitlebar } from '../WidgetTitlebar';
import { MAX_SIZE_FRAME, MIN_SIZE_FRAME } from './constants';
import { LinkMenu } from './menu/LinkMenu';
import { EmbedlyResponse } from './types';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    height: '100%',
    border: 'none',
  },
}));

export function EmbedlyHtmlLinkWidget({ embedlyResponse }: { embedlyResponse: EmbedlyResponse }) {
  const { t } = useTranslation();
  const classes = useStyles();

  if (!embedlyResponse.html) return null;

  const srcDoc = `<html><body>${embedlyResponse.html}</body></html>`;

  return (
    <WidgetFrame
      color={ThemeName.Snow}
      minWidth={MIN_SIZE_FRAME.width}
      minHeight={MIN_SIZE_FRAME.height}
      maxWidth={MAX_SIZE_FRAME.width}
      maxHeight={MAX_SIZE_FRAME.height}
    >
      <WidgetTitlebar title={embedlyResponse.title ?? t('widgets.link.embedTitle')} disableRemove>
        <LinkMenu disableIframe />
      </WidgetTitlebar>
      <WidgetContent disablePadding>
        <iframe srcDoc={srcDoc} title={embedlyResponse.title} className={classes.root} />
      </WidgetContent>
    </WidgetFrame>
  );
}
