import { WidgetType } from '@api/roomState/types/widgets';
import { Link } from '@components/Link/Link';
import { Box, makeStyles, Tooltip, Typography } from '@material-ui/core';
import { useCanvasObject } from '@providers/canvas/CanvasObject';
import { CanvasObjectDragHandle } from '@providers/canvas/CanvasObjectDragHandle';
import { ThemeName } from '@src/theme/theme';
import * as React from 'react';
import { FileIcon } from './FileIcon';
import { useWidgetContext } from '../useWidgetContext';
import { WidgetContent } from '../WidgetContent';
import { WidgetFrame } from '../WidgetFrame';
import { SIZE_STUB } from './constants';
import { FileWidgetMenu } from './menu/FileWidgetMenu';

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

export function StubFileWidget() {
  const classes = useStyles();

  const {
    widget: { widgetState },
  } = useWidgetContext<WidgetType.File>();

  // on mount, enforce the size of the container. enforcing on mount
  // is ok because all document stubs should be the same size always,
  // so it's fine if other clients trigger this resize at random times.
  const { resize } = useCanvasObject();
  React.useEffect(() => {
    resize({ width: SIZE_STUB.width, height: SIZE_STUB.height });
  }, [resize]);

  return (
    <WidgetFrame color={ThemeName.Snow} minHeight={80} minWidth={340} resizeDisabled>
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
                <FileIcon contentType={widgetState.contentType} className={classes.icon} />
                <Box ml={2} flex={1} display="flex" flexDirection="column" overflow="hidden">
                  <Typography variant="h3" component="span" className={classes.label}>
                    {widgetState.fileName}
                  </Typography>
                  <Typography variant="caption" className={classes.label}>
                    {widgetState.url}
                  </Typography>
                </Box>
              </Box>
            </Tooltip>
            <FileWidgetMenu className={classes.menu} />
          </div>
        </WidgetContent>
      </CanvasObjectDragHandle>
    </WidgetFrame>
  );
}
