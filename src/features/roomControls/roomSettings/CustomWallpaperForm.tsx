import React, { useState } from 'react';
import { Box, useTheme, makeStyles } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { Form, Formik } from 'formik';
import { FormikTextField } from '../../../components/fieldBindings/FormikTextField';
import { FormikSubmitButton } from '../../../components/fieldBindings/FormikSubmitButton';
import { TFunction } from 'i18next';

export interface ICustomWallpaperFormProps {
  onChange: (url: string, isCustomWallpaper: boolean) => void;
  value: string | null;
}

type CustomWallpaperData = {
  url: string;
};

function validateUrl(url: string, translate: TFunction) {
  // if it's a full URL with supported filetype, commit the change
  try {
    const parsed = new URL(url);
    const tokens = parsed.pathname.split('/');
    const lastToken = tokens.pop();
    if (lastToken && isSupportedFiletype(lastToken)) {
      return;
    } else {
      return translate('error.messages.supportedFileTypes', {
        fileTypes: translate('features.room.wallpaperSupportedFileTypes'),
      });
    }
  } catch (err) {
    // inform the user that it's not a valid URL
    return translate('error.messages.provideValidUrl');
  }
}

const SUPPORTED_FILETYPES = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
const PLACEHOLDER = 'https://unsplash.com/photos/lxzU…';

function isSupportedFiletype(filename: string) {
  return !!SUPPORTED_FILETYPES.find((type) => filename.toLowerCase().endsWith(type));
}

const useStyles = makeStyles((theme) => ({
  formWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',

    [theme.breakpoints.only('sm')]: {
      flexDirection: 'column',
    },
  },
  submitBtn: {
    height: '48px',
    marginTop: theme.spacing(3),
    width: '180px',
    marginLeft: theme.spacing(2),

    [theme.breakpoints.only('sm')]: {
      flexDirection: 'column',
      width: '100%',
      marginLeft: 0,
    },
  },
}));

export const CustomWallpaperForm: React.FC<ICustomWallpaperFormProps> = ({ onChange, value }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [accepted, setAccepted] = useState(false);

  const onSubmit = async (data: CustomWallpaperData) => {
    onChange(data.url, true);
    setAccepted(true);
  };

  return (
    <Formik initialValues={{ url: value ? value : '' }} onSubmit={onSubmit}>
      <Form>
        <Box display="flex" className={classes.formWrapper}>
          <FormikTextField
            id="customWallpaperInput"
            name="url"
            label={t('features.room.customWallpaperLabel', {
              fileTypes: t('features.room.wallpaperSupportedFileTypes'),
            })}
            helperText={accepted && <WallpaperSetAnnouncement />}
            placeholder={PLACEHOLDER}
            validate={(url: string) => validateUrl(url, t)}
            fullWidth
          />
          <FormikSubmitButton className={classes.submitBtn} aria-label="custom-wallpaper-submit-button">
            {t('features.room.submitButtonText')}
          </FormikSubmitButton>
        </Box>
      </Form>
    </Formik>
  );
};

const WallpaperSetAnnouncement = () => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <span style={{ fontWeight: 'bold', color: theme.palette.success.contrastText }}>
      {t('features.room.wallpaperSet')}
    </span>
  );
};
