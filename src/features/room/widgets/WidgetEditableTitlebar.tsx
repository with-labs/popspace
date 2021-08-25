import * as React from 'react';
import { makeStyles, Popover, Box } from '@material-ui/core';
import clsx from 'clsx';
import { DeleteIcon } from '@components/icons/DeleteIcon';
import { WidgetTitlebarButton } from './WidgetTitlebarButton';
import { useTranslation } from 'react-i18next';
import { useWidgetContext } from './useWidgetContext';
import { CanvasObjectDragHandle } from '@providers/canvas/CanvasObjectDragHandle';
import useDoubleClick from 'use-double-click';
import { ResponsiveTooltip } from '@components/ResponsiveTooltip/ResponsiveTooltip';
import { Form, Formik, FormikHelpers } from 'formik';
import { FormikTextField } from '@components/fieldBindings/FormikTextField';
import * as Yup from 'yup';

const MAX_TITLE_SIZE = 100;

export type WidgetEditableTitlebarProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> & {
  title: string;
  children?: React.ReactNode;
  className?: string;
  disableRemove?: boolean;
  onTitleChanged: (newTitle: string) => void;
};

export type TitleEditFormData = {
  newTitle: string;
};

const validationSchema = Yup.object().shape({
  message: Yup.string().max(MAX_TITLE_SIZE),
});

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
  titleInput: {
    backgroundColor: theme.palette.background.paper,
  },
}));

export const WidgetEditableTitlebar: React.FC<WidgetEditableTitlebarProps> = ({
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
      setAnchorEl(e.target as HTMLElement);
    },
    ref: titleRef,
    latency: 250,
  });

  const handleSubmit = async (values: TitleEditFormData, actions: FormikHelpers<TitleEditFormData>) => {
    onTitleChanged(values.newTitle);
    setAnchorEl(null);
  };

  return (
    <CanvasObjectDragHandle className={clsx(classes.root, className)}>
      <ResponsiveTooltip title={t('widgets.common.customTitleExplainer') as string} offset={4}>
        <div className={classes.title} ref={titleRef}>
          {title}
        </div>
      </ResponsiveTooltip>
      <div className={classes.controls}>{children}</div>
      {!disableRemove && (
        <div className={classes.controls}>
          <WidgetTitlebarButton onClick={remove} aria-label={t('widgets.common.close')}>
            <DeleteIcon fontSize="small" color="inherit" />
          </WidgetTitlebarButton>
        </div>
      )}
      <Popover
        id="widgetEditTitle"
        open={!!anchorEl}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        transformOrigin={{ vertical: -10, horizontal: 'center' }}
      >
        <Box p={2} display="flex" flexDirection="row" alignItems="center" className={classes.titleInput}>
          <Formik initialValues={{ newTitle: '' }} onSubmit={handleSubmit} validationSchema={validationSchema}>
            <Form>
              <FormikTextField
                autoFocus
                autoComplete="off"
                name="newTitle"
                label={t('widgets.common.customTitleLabel')}
              />
            </Form>
          </Formik>
        </Box>
      </Popover>
    </CanvasObjectDragHandle>
  );
};
