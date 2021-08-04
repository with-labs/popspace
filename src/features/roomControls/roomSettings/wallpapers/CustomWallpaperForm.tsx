import client from '@api/client';
import { FileUploadButton } from '@components/FileUploadButton/FileUploadButton';
import { Spacing } from '@components/Spacing/Spacing';
import { Button, CircularProgress } from '@material-ui/core';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { useWallpapers } from './useWallpapers';

export interface ICustomWallpaperFormProps {}

export const CustomWallpaperForm: React.FC<ICustomWallpaperFormProps> = () => {
  const { t } = useTranslation();

  const [file, setFile] = useState<File | null>(null);
  const onFileUpload = (files: File[]) => {
    setFile(files[0]);
  };

  const [_, uploadWallpaper] = useWallpapers();
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!file) return;
    setLoading(true);
    try {
      // upload to the API server
      const wallpaper = await uploadWallpaper(file);
      client.wallpapers.setWallpaper(wallpaper);
    } catch (e) {
      toast.error(t('error.api.UNEXPECTED.message') as string);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Spacing flexDirection="column">
      <FileUploadButton onChange={onFileUpload} accept=".PNG, .JPG, .JPEG, .WebP" />
      <Button disabled={!file || loading} data-testid="custom-wallpaper-submit-button" onClick={onSubmit}>
        {loading ? <CircularProgress size="22px" color="inherit" /> : t('features.room.submitButtonText')}
      </Button>
    </Spacing>
  );
};
