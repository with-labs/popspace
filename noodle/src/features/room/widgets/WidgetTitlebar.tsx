import { DeleteIcon } from '@components/icons/DeleteIcon';
import { makeStyles } from '@material-ui/core';
import { CanvasObjectDragHandle } from '@providers/canvas/CanvasObjectDragHandle';
import clsx from 'clsx';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { useWidgetContext } from './useWidgetContext';
import { WidgetTitlebarButton } from './WidgetTitlebarButton';

export type WidgetTitlebarProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> & {
  title: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  disableRemove?: boolean;
};

const useStyles = makeStyles((theme) => ({
  root: {
    borderRadius: `${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0 0`,
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
    flex: '0 0 auto',
    height: 48,
    // smaller padding on right so the delete button feels correctly placed
    padding: `6px 14px 6px 16px`,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    fontWeight: theme.typography.fontWeightMedium as any,
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

export const WidgetTitlebar: React.FC<WidgetTitlebarProps> = ({
  title,
  children,
  className,
  disableRemove,
  ...rest
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { remove } = useWidgetContext();

  return (
    <CanvasObjectDragHandle className={clsx(classes.root, className)}>
      <div className={classes.title}>{title}</div>
      <div className={classes.controls}>{children}</div>
      {!disableRemove && (
        <div className={classes.controls}>
          <WidgetTitlebarButton onClick={remove} aria-label={t('widgets.common.close')}>
            <DeleteIcon fontSize="small" color="inherit" />
          </WidgetTitlebarButton>
        </div>
      )}
    </CanvasObjectDragHandle>
  );
};
