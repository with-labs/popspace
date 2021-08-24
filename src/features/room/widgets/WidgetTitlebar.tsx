import * as React from 'react';
import { makeStyles } from '@material-ui/core';
import clsx from 'clsx';
import { DeleteIcon } from '@components/icons/DeleteIcon';
import { WidgetTitlebarButton } from './WidgetTitlebarButton';
import { useTranslation } from 'react-i18next';
import { useWidgetContext } from './useWidgetContext';
import { CanvasObjectDragHandle } from '@providers/canvas/CanvasObjectDragHandle';
import useDoubleClick from 'use-double-click';
import { WidgetEditTitle } from './WidgetEditTitle';

export type WidgetTitlebarProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> & {
  title: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  disableRemove?: boolean;
  onTitleChanged?: (newTitle: string) => void;
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

export const WidgetTitlebar: React.FC<WidgetTitlebarProps> = ({
  title,
  children,
  className,
  disableRemove,
  onTitleChanged,
  ...rest
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { remove } = useWidgetContext();
  const titleRef = React.useRef(null);
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

  useDoubleClick({
    onSingleClick: (e) => {},
    onDoubleClick: (e) => {
      if (onTitleChanged) {
        setAnchorEl(e.target as HTMLElement);
      }
    },
    ref: titleRef,
    latency: 250,
  });

  return (
    <CanvasObjectDragHandle className={clsx(classes.root, className)}>
      <div className={classes.title} ref={titleRef}>
        {title}
      </div>
      <div className={classes.controls}>{children}</div>
      {!disableRemove && (
        <div className={classes.controls}>
          <WidgetTitlebarButton onClick={remove} aria-label={t('widgets.common.close')}>
            <DeleteIcon fontSize="small" color="inherit" />
          </WidgetTitlebarButton>
        </div>
      )}
      <WidgetEditTitle
        defaultTitle={title as string}
        anchorEl={anchorEl}
        setAnchorEl={setAnchorEl}
        onSubmit={onTitleChanged}
      />
    </CanvasObjectDragHandle>
  );
};
