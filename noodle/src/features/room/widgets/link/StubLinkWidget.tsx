import { Link } from '@components/Link/Link';
import { Box, makeStyles, Tooltip, Typography } from '@material-ui/core';
import { CanvasObjectDragHandle } from '@providers/canvas/CanvasObjectDragHandle';
import * as React from 'react';

import { FileIcon } from '../file/FileIcon';
import { WidgetContent } from '../WidgetContent';
import { WidgetFrame } from '../WidgetFrame';
import { SIZE_STUB } from './constants';
import { LinkMenu } from './menu/LinkMenu';

const useStyles = makeStyles((theme) => ({
  menu: {
    marginLeft: theme.spacing(2),
    flexShrink: 0,
  },
  linkWrapper: {
    padding: theme.spacing(2),
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    width: 300,
    overflow: 'hidden',
  },
  icon: {
    flexShrink: 0,
  },
  label: {
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  },
}));

/**
 * Rendering mode for links with no additional preview or embed
 */
export const StubLinkWidget: React.FC<{ title?: string; iconUrl?: string | null; url: string; enableIframe: boolean }> =
  ({ url, title, iconUrl, enableIframe }) => {
    const classes = useStyles();

    return (
      <WidgetFrame
        minWidth={SIZE_STUB.width}
        minHeight={SIZE_STUB.height}
        maxWidth={SIZE_STUB.width}
        maxHeight={SIZE_STUB.height}
        resizeDisabled
      >
        <CanvasObjectDragHandle>
          <WidgetContent disablePadding>
            <div className={classes.linkWrapper}>
              <Tooltip title={url} placement="bottom">
                <Box
                  display="flex"
                  flexDirection="row"
                  alignItems="center"
                  flex={1}
                  component={Link}
                  overflow="hidden"
                  {...({ to: url, newTab: true } as any)}
                >
                  <FileIcon iconUrl={iconUrl} className={classes.icon} />
                  <Box ml={2} flex={1} display="flex" flexDirection="column" overflow="hidden">
                    <Typography variant="h3" component="span" className={classes.label}>
                      {title}
                    </Typography>
                    <Typography variant="caption" className={classes.label}>
                      {url}
                    </Typography>
                  </Box>
                </Box>
              </Tooltip>
              <LinkMenu className={classes.menu} enableIframe={enableIframe} />
            </div>
          </WidgetContent>
        </CanvasObjectDragHandle>
      </WidgetFrame>
    );
  };
