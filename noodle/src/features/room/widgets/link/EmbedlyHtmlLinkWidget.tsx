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

const processHTML = (html: string) => {
  const replacedExplicitSizes = html.replace(/(width|height)="\d+"/g, '$1="100%"');
  return `
    <html>
      <head>
        <style>
          body, html {
            width: 100%;
            height: 100%;
            margin: 0;
          }
          iframe {
            width: 100%;
            height: 100%;
          }
        </style>
      </head>
      <body>${replacedExplicitSizes}</body>
    </html>`;
};

export function EmbedlyHtmlLinkWidget({ embedlyResponse }: { embedlyResponse: EmbedlyResponse }) {
  const { t } = useTranslation();
  const classes = useStyles();

  if (!embedlyResponse.html) return null;

  const srcDoc = processHTML(embedlyResponse.html);

  return (
    <WidgetFrame
      color={ThemeName.Snow}
      minWidth={MIN_SIZE_FRAME.width}
      minHeight={MIN_SIZE_FRAME.height}
      maxWidth={MAX_SIZE_FRAME.width}
      maxHeight={MAX_SIZE_FRAME.height}
    >
      <WidgetTitlebar title={embedlyResponse.title ?? t('widgets.link.embedTitle')} disableRemove>
        <LinkMenu enableIframe />
      </WidgetTitlebar>
      <WidgetContent disablePadding>
        <iframe srcDoc={srcDoc} title={embedlyResponse.title} className={classes.root} />
      </WidgetContent>
    </WidgetFrame>
  );
}
