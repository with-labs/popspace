import client from '@api/client';
import { FileUploadButton } from '@components/FileUploadButton/FileUploadButton';
import { Spacing } from '@components/Spacing/Spacing';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { useWallpapers } from './useWallpapers';

export interface ICustomWallpaperFormProps {}

export const CustomWallpaperForm: React.FC<ICustomWallpaperFormProps> = () => {
  const { t } = useTranslation();

  const [file, setFile] = useState<File | null>(null);

  const [_, uploadWallpaper] = useWallpapers();

  const onSubmit = async (file: File) => {
    setFile(file);
    try {
      // upload to the API server
      const wallpaper = await uploadWallpaper(file);
      client.wallpapers.setWallpaper(wallpaper);
      setFile(null);
    } catch (e) {
      toast.error(t('error.api.UNEXPECTED.message') as string);
    }
  };

  return (
    <Spacing flexDirection="column">
      <FileUploadButton loading={!!file} value={file} onChange={onSubmit} accept=".JPG, .JPEG, .PNG, .WebP" />
    </Spacing>
  );
};
