import * as React from 'react';
import { makeStyles, Box, Popover } from '@material-ui/core';
import { Form, Formik, FormikHelpers } from 'formik';
import { FormikTextField } from '@components/fieldBindings/FormikTextField';
import * as Yup from 'yup';

const MAX_SIZE = 100;

export interface IWidgetEditTitleProps {
  anchorEl: HTMLElement | null;
  defaultTitle: string;
  setAnchorEl: (value: any) => void;
  onSubmit?: (title: string) => void;
}

export type TitleEditFormData = {
  newTitle: string;
};

const validationSchema = Yup.object().shape({
  message: Yup.string().max(MAX_SIZE),
});

const useStyles = makeStyles((theme) => ({
  controls: {
    backgroundColor: theme.palette.background.paper,
  },
}));

export const WidgetEditTitle: React.FC<IWidgetEditTitleProps> = ({ anchorEl, setAnchorEl, onSubmit }) => {
  const classes = useStyles();

  const handleSubmit = async (values: TitleEditFormData, actions: FormikHelpers<TitleEditFormData>) => {
    if (onSubmit) {
      onSubmit(values.newTitle);
    }
    setAnchorEl(null);
  };

  return (
    <Popover
      id="widgetEditTitle"
      open={!!anchorEl}
      anchorEl={anchorEl}
      onClose={() => setAnchorEl(null)}
      transformOrigin={{ vertical: -10, horizontal: 'center' }}
    >
      <Box p={2} display="flex" flexDirection="row" alignItems="center" className={classes.controls}>
        <Formik initialValues={{ newTitle: '' }} onSubmit={handleSubmit} validationSchema={validationSchema}>
          <Form>
            <div>Add a custom title:</div>
            <FormikTextField autoFocus name="newTitle" />
          </Form>
        </Formik>
      </Box>
    </Popover>
  );
};
