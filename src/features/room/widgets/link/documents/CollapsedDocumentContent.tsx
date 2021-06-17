import { Box, makeStyles, Tooltip, Typography } from '@material-ui/core';
import * as React from 'react';
import { Link } from '@components/Link/Link';
import { useCanvasObject } from '@providers/canvas/CanvasObject';
import { CanvasObjectDragHandle } from '@providers/canvas/CanvasObjectDragHandle';
import { WidgetType } from '@api/roomState/types/widgets';
import { useWidgetContext } from '../../useWidgetContext';
import { WidgetContent } from '../../WidgetContent';
import { SIZE_STUB } from '../constants';
import { FileIcon } from '../FileIcon';
import { LinkMenu } from '../menu/LinkMenu';

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
    width: 340,
    overflow: 'hidden',
  },
  label: {
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  },
  icon: {
    flexShrink: 0,
  },
}));
export function CollapsedDocumentContent() {
  const classes = useStyles();

  const {
    widget: { widgetState },
  } = useWidgetContext<WidgetType.Link>();

  // on mount, enforce the size of the container. enforcing on mount
  // is ok because all document stubs should be the same size always,
  // so it's fine if other clients trigger this resize at random times.
  const { resize } = useCanvasObject();
  React.useEffect(() => {
    resize({ width: SIZE_STUB.width, height: SIZE_STUB.height });
  }, [resize]);

  return (
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
              {...({ href: widgetState.url, newTab: true } as any)}
            >
              <FileIcon state={widgetState} className={classes.icon} />
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
  );
}
