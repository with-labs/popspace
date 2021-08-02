import client from '@api/client';
import { FileUploadButton } from '@components/FileUploadButton/FileUploadButton';
import { Spacing } from '@components/Spacing/Spacing';
import { Button, makeStyles } from '@material-ui/core';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useWallpapers } from './useWallpapers';

export interface ICustomWallpaperFormProps {}

const useStyles = makeStyles((theme) => ({
  formWrapper: {},
  submitBtn: {},
}));

export const CustomWallpaperForm: React.FC<ICustomWallpaperFormProps> = () => {
  const { t } = useTranslation();
  const classes = useStyles();

  const [file, setFile] = useState<File | null>(null);
  const onFileUpload = (files: File[]) => {
    setFile(files[0]);
  };

  const [_, uploadWallpaper] = useWallpapers();

  const onSubmit = async () => {
    if (!file) return;
    // upload to the API server
    const wallpaper = await uploadWallpaper(file);
    client.wallpapers.setWallpaper(wallpaper);
  };

  return (
    <Spacing className={classes.formWrapper} flexDirection="column">
      <FileUploadButton onChange={onFileUpload} accept=".PNG, .JPG, .JPEG, .WebP" />
      <Button
        disabled={!file}
        className={classes.submitBtn}
        data-testid="custom-wallpaper-submit-button"
        onClick={onSubmit}
      >
        {t('features.room.submitButtonText')}
      </Button>
    </Spacing>
  );
};
