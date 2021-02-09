import { FormControlLabel, Switch } from '@material-ui/core';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { usePictureInPictureSettings } from '../../pictureInPicture/usePictureInPictureSettings';

export interface IAutoPIPToggleProps {
  className?: string;
}

export const AutoPIPToggle: React.FC<IAutoPIPToggleProps> = (props) => {
  const { t } = useTranslation();
  const enabled = usePictureInPictureSettings((settings) => settings.autoPIPEnabled);
  const set = usePictureInPictureSettings((settings) => settings.api.setAutoPIPEnabled);
  const handleChange = (_ev: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    set(checked);
  };

  return (
    <FormControlLabel
      control={<Switch onChange={handleChange} checked={enabled} value="autoPIP" />}
      label={t('features.pictureInPicture.autoPictureInPicture')}
    />
  );
};
