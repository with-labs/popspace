import * as React from 'react';
import { Box, makeStyles } from '@material-ui/core';
import clsx from 'clsx';
import { DraggableHandle } from '../DraggableHandle';
import { DeleteIcon } from '../../../withComponents/icons/DeleteIcon';
import { WidgetTitlebarButton } from './WidgetTitlebarButton';
import { useTranslation } from 'react-i18next';

export type WidgetTitlebarProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> & {
  title: React.ReactNode;
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
    height: 48,
  },
  title: {
    flex: 1,
    fontWeight: theme.typography.fontWeightMedium,
    fontSize: theme.typography.pxToRem(16),
    marginRight: theme.spacing(1),
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
  controls: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    flexBasis: 'auto',
    flexShrink: 0,
    fontSize: theme.typography.pxToRem(18),
    '& + &': {
      marginLeft: theme.spacing(0.5),
    },
  },
}));

export const WidgetTitlebar: React.FC<WidgetTitlebarProps> = ({ title, children, className, onClose, ...rest }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <DraggableHandle>
      <Box
        py={3 / 4}
        pl={2}
        // smaller padding on right so the delete button feels correctly placed
        pr="14px"
        display="flex"
        flexDirection="row"
        alignItems="center"
        className={clsx(classes.root, className)}
      >
        <div className={classes.title}>{title}</div>
        <div className={classes.controls}>{children}</div>
        <div className={classes.controls}>
          <WidgetTitlebarButton onClick={onClose} aria-label={t('widgets.common.close')}>
            <DeleteIcon fontSize="small" color="inherit" />
          </WidgetTitlebarButton>
        </div>
      </Box>
    </DraggableHandle>
  );
};
