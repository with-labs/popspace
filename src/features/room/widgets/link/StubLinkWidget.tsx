import { WidgetType } from '@api/roomState/types/widgets';
import { Link } from '@components/Link/Link';
import { Box, makeStyles, Tooltip, Typography } from '@material-ui/core';
import { CanvasObjectDragHandle } from '@providers/canvas/CanvasObjectDragHandle';
import * as React from 'react';
import { FileIcon } from '../file/FileIcon';
import { useWidgetContext } from '../useWidgetContext';
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
export const StubLinkWidget: React.FC = () => {
  const classes = useStyles();
  const {
    widget: { widgetState },
  } = useWidgetContext<WidgetType.Link>();

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
            <Tooltip title={widgetState.url} placement="bottom">
              <Box
                display="flex"
                flexDirection="row"
                alignItems="center"
                flex={1}
                component={Link}
                overflow="hidden"
                {...({ to: widgetState.url, newTab: true } as any)}
              >
                <FileIcon iconUrl={widgetState.iconUrl} className={classes.icon} />
                <Box ml={2} flex={1} display="flex" flexDirection="column" overflow="hidden">
                  <Typography variant="h3" component="span" className={classes.label}>
                    {widgetState.title}
                  </Typography>
                  <Typography variant="caption" className={classes.label}>
                    {widgetState.url}
                  </Typography>
                </Box>
              </Box>
            </Tooltip>
            <LinkMenu className={classes.menu} />
          </div>
        </WidgetContent>
      </CanvasObjectDragHandle>
    </WidgetFrame>
  );
};
