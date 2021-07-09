import { WidgetType } from '@api/roomState/types/widgets';
import { Link } from '@components/Link/Link';
import { Box, makeStyles, Typography } from '@material-ui/core';
import { ThemeName } from '@src/theme/theme';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { useWidgetContext } from '../useWidgetContext';
import { WidgetContent } from '../WidgetContent';
import { WidgetFrame } from '../WidgetFrame';
import { WidgetTitlebar } from '../WidgetTitlebar';
import { SUMMARY_SIZE, SUMMARY_WITH_IMAGE_SIZE } from './constants';
import { LinkMenu } from './menu/LinkMenu';
import { EmbedlyResponse } from './types';

const useStyles = makeStyles((theme) => ({
  linkWrapper: {
    textDecoration: 'none',
    color: 'inherit',
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
  },
  image: {
    flex: 1,
    objectFit: 'cover',
    width: '100%',
  },
  description: {
    overflow: 'hidden',
    lineClamp: 3,
    textOverflow: 'ellipsis',
    maxHeight: 30,
  },
}));

/**
 * Shows a preview image and details for a URL with opengraph data.
 */
export function SummaryLinkWidget({ embedlyResponse }: { embedlyResponse: EmbedlyResponse }) {
  const { t } = useTranslation();
  const classes = useStyles();
  const {
    widget: { widgetState },
  } = useWidgetContext<WidgetType.Link>();

  const { title, provider_name, provider_url, url, description, thumbnail_url } = embedlyResponse;

  const size = thumbnail_url ? SUMMARY_WITH_IMAGE_SIZE : SUMMARY_SIZE;

  return (
    <WidgetFrame
      minWidth={size.width}
      minHeight={size.height}
      maxWidth={size.width}
      maxHeight={size.height}
      resizeDisabled
      color={ThemeName.Snow}
    >
      <WidgetTitlebar title={title ?? t('widgets.link.embedTitle')} disableRemove>
        <LinkMenu />
      </WidgetTitlebar>
      <WidgetContent disablePadding>
        <Box
          flexDirection="column"
          alignItems="stretch"
          component={Link}
          overflow="hidden"
          className={classes.linkWrapper}
          flex="0 1 auto"
          {...({ to: url, newTab: true, disableStyling: true } as any)}
        >
          <Box p={2} flex={1} display="flex" flexDirection="column">
            <Typography variant="h2">{provider_name}</Typography>
            <Typography id="url" variant="body1">
              {provider_url}
            </Typography>
            <Typography className={classes.description} variant="body2">
              {description}
            </Typography>
          </Box>
          {thumbnail_url && <img className={classes.image} alt="" src={thumbnail_url} />}
        </Box>
      </WidgetContent>
    </WidgetFrame>
  );
}
