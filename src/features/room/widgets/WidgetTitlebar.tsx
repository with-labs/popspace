import * as React from 'react';
import { Box, IconButton, makeStyles } from '@material-ui/core';
import clsx from 'clsx';
import { ReactComponent as CloseGlyph } from './images/close.svg';
import { DraggableHandle } from '../DraggableHandle';

export type WidgetTitlebarProps = React.HTMLAttributes<HTMLDivElement> & {
  title: string;
  children?: React.ReactNode;
  className?: string;
  onClose: () => void;
};

const useStyles = makeStyles((theme) => ({
  root: {
    borderRadius: `10px 10px 0 0`,
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
    flex: '0 0 auto',
  },
  title: {
    flex: 1,
    fontWeight: 'bold',
    fontSize: theme.typography.pxToRem(16),
    marginRight: theme.spacing(1),
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  controls: {
    flexBasis: 'auto',
    flexShrink: 0,
  },
}));

export const WidgetTitlebar: React.FC<WidgetTitlebarProps> = ({ title, children, className, onClose, ...rest }) => {
  const classes = useStyles();

  return (
    <DraggableHandle>
      <Box
        py={3 / 4}
        pl={2}
        // smaller padding on right so the X button feels correctly placed
        pr={1}
        display="flex"
        flexDirection="row"
        alignItems="center"
        className={clsx(classes.root, className)}
      >
        <div className={classes.title}>{title}</div>
        <div className={classes.controls}>{children}</div>
        <div className={classes.controls}>
          <IconButton onClick={onClose} aria-label="close widget">
            <CloseGlyph />
          </IconButton>
        </div>
      </Box>
    </DraggableHandle>
  );
};
