import { ColorButton } from '@components/ColorButton/ColorButton';
import { FormikTextField } from '@components/fieldBindings/FormikTextField';
import { DeleteIcon } from '@components/icons/DeleteIcon';
import { DoneIcon } from '@components/icons/DoneIcon';
import { Box, IconButton, makeStyles, Popover, Typography } from '@material-ui/core';
import { useCanvasObject } from '@providers/canvas/CanvasObject';
import { CanvasObjectDragHandle } from '@providers/canvas/CanvasObjectDragHandle';
import clsx from 'clsx';
import { Form, Formik, FormikHelpers } from 'formik';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import useDoubleClick from 'use-double-click';
import * as Yup from 'yup';

import palette from '../../../theme/palette';
import { ThemeName } from '../../../theme/theme';
import { useWidgetContext } from './useWidgetContext';
import { WidgetTitlebarButton } from './WidgetTitlebarButton';

const MAX_TITLE_SIZE = 100;

const COLORS = [
  { name: ThemeName.Mandarin, value: palette.mandarin.bold },
  { name: ThemeName.Cherry, value: palette.cherry.bold },
  { name: ThemeName.Oregano, value: palette.oregano.bold },
  { name: ThemeName.Lavender, value: palette.lavender.bold },
  { name: ThemeName.Blueberry, value: palette.blueberry.bold },
  { name: ThemeName.Slate, value: palette.slate.bold },
  { name: ThemeName.VintageInk, value: palette.vintageInk.regular },
];

export type WidgetEditableTitlebarProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> & {
  title: string | undefined;
  defaultTitle: string;
  children?: React.ReactNode;
  className?: string;
  disableRemove?: boolean;
  onTitleChanged: (newTitle: string) => void;
  setActiveColor: (color: ThemeName) => void;
  activeColor: ThemeName;
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
    fontWeight: theme.typography.fontWeightMedium as any,
    fontSize: theme.typography.pxToRem(16),
    marginRight: theme.spacing(1),
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    cursor: 'grab',
  },
  titleBarHover: {
    '&:hover': {
      '& > $userTitle': {
        display: 'none',
      },
      '& > $editTitle': {
        display: 'block',
      },
    },
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
  titleBar: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  userTitle: {
    display: 'block',
    cursor: 'grab',
  },
  editTitle: {
    display: 'none',
  },
  editControlText: {
    fontWeight: theme.typography.fontWeightMedium as any,
    color: theme.palette.primary.dark,
    cursor: 'pointer',
  },
  iconButton: {
    color: theme.palette.success.dark,
  },
  hideTitle: {
    display: 'none',
  },
  showTitle: {
    display: 'block',
  },
}));

export const WidgetEditableTitlebar: React.FC<WidgetEditableTitlebarProps> = ({
  title,
  defaultTitle,
  children,
  className,
  disableRemove,
  onTitleChanged,
  setActiveColor,
  activeColor,
  ...rest
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { remove } = useWidgetContext();
  const titleRef = React.useRef(null);
  const formikRef = React.useRef(null);
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const { isGrabbing } = useCanvasObject();

  useDoubleClick({
    onDoubleClick: (e: React.MouseEvent) => {
      setAnchorEl(titleRef.current);
    },
    ref: titleRef,
    latency: 250,
  });

  const handleSubmit = async (values: TitleEditFormData, actions: FormikHelpers<TitleEditFormData>) => {
    if (values.newTitle !== title) {
      onTitleChanged(values.newTitle);
    }
    setAnchorEl(null);
  };

  const handleOnClose = () => {
    const currentValues: any = formikRef.current;
    if (currentValues?.values?.newTitle !== title) {
      onTitleChanged(currentValues.values.newTitle);
    }
    setAnchorEl(null);
  };

  return (
    <>
      <CanvasObjectDragHandle className={clsx(classes.root, className)}>
        <div ref={titleRef} className={classes.titleBar}>
          <div className={clsx(classes.title, { [classes.titleBarHover]: !isGrabbing })}>
            <div className={clsx(classes.userTitle, { [classes.hideTitle]: !!anchorEl })}>
              {title && title.length > 0 ? title : defaultTitle}
            </div>
            <div className={clsx(classes.editTitle, classes.editControlText, { [classes.hideTitle]: !!anchorEl })}>
              {t('widgets.common.editTitle')}
            </div>
            <div
              className={clsx(classes.editControlText, {
                [classes.hideTitle]: !anchorEl,
                [classes.showTitle]: !!anchorEl,
              })}
            >
              {t('widgets.common.closeEditTitle')}
            </div>
          </div>
          <div className={classes.controls}>{children}</div>
          {!disableRemove && (
            <div className={classes.controls}>
              <WidgetTitlebarButton onClick={remove} aria-label={t('widgets.common.close')}>
                <DeleteIcon fontSize="small" color="inherit" />
              </WidgetTitlebarButton>
            </div>
          )}
        </div>
      </CanvasObjectDragHandle>
      <Popover
        id="widgetEditTitle"
        open={!!anchorEl}
        anchorEl={anchorEl}
        onClose={handleOnClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: -16,
          horizontal: 'center',
        }}
      >
        <Box p={2} display="flex" flexDirection="row" alignItems="center" className={classes.titleInput}>
          <Formik
            innerRef={formikRef}
            initialValues={{ newTitle: title && title.length > 0 ? title : '' }}
            onSubmit={handleSubmit}
            validationSchema={validationSchema}
          >
            <Form>
              <FormikTextField
                autoFocus
                autoComplete="off"
                name="newTitle"
                label={t('widgets.common.customTitleLabel')}
                placeholder={t('widgets.common.enterTitle')}
                InputProps={{
                  endAdornment: (
                    <IconButton className={classes.iconButton} color="secondary" onClick={() => handleOnClose()}>
                      <DoneIcon />
                    </IconButton>
                  ),
                }}
              />
            </Form>
          </Formik>
        </Box>
        <Box p={2} display="flex" flexDirection="column">
          <Box mb={1}>
            <Typography color="textSecondary" variant="h4">
              {t('widgets.common.colorPickerLabel')}
            </Typography>
          </Box>
          <Box display="flex" flexDirection="row" alignItems="center" className={classes.controls}>
            {COLORS.map((color) => (
              <ColorButton
                key={color.value}
                color={color.value}
                onClick={() => setActiveColor(color.name)}
                active={activeColor === color.name}
              />
            ))}
          </Box>
        </Box>
      </Popover>
    </>
  );
};
