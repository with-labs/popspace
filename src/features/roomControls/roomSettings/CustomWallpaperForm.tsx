import * as React from 'react';
import { TextField, useTheme } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

export interface ICustomWallpaperFormProps {
  onChange: (url: string) => void;
  value: string | null;
}

const SUPPORTED_FILETYPES = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
const PLACEHOLDER = 'https://unsplash.com/photos/lxzU…';

function isSupportedFiletype(filename: string) {
  return !!SUPPORTED_FILETYPES.find((type) => filename.toLowerCase().endsWith(type));
}

export const CustomWallpaperForm: React.FC<ICustomWallpaperFormProps> = ({ onChange, value }) => {
  const { t } = useTranslation();

  const [internalValue, setInternalValue] = React.useState(() => value || '');
  const [parseError, setParseError] = React.useState('');
  const [accepted, setAccepted] = React.useState(false);

  const handleInputChange = React.useCallback(
    (ev: React.ChangeEvent<HTMLInputElement>) => {
      const url = ev.target.value;
      setInternalValue(url);

      // if it's a full URL with supported filetype, commit the change
      try {
        const parsed = new URL(url);
        const tokens = parsed.pathname.split('/');
        const lastToken = tokens.pop();
        if (lastToken && isSupportedFiletype(lastToken)) {
          onChange(url);
          setAccepted(true);
        } else {
          setParseError(
            t('error.messages.supportedFileTypes', {
              fileTypes: t('features.room.wallpaperSupportedFileTypes'),
            })
          );
          setAccepted(false);
        }
      } catch (err) {
        // inform the user that it's not a valid URL
        setParseError(t('error.messages.provideValidUrl'));
        setAccepted(false);
      }
    },
    [t, onChange]
  );

  return (
    <TextField
      onChange={handleInputChange}
      value={internalValue}
      label={t('features.room.customWallpaperLabel')}
      helperText={
        parseError ||
        (accepted && <WallpaperSetAnnouncement />) ||
        t('error.messages.supportedFileTypes', { fileTypes: t('features.room.wallpaperSupportedFileTypes') })
      }
      placeholder={PLACEHOLDER}
      error={!!parseError}
      id="customWallpaperInput"
    />
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
