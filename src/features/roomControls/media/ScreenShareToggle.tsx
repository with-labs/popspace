import * as React from 'react';
import { ToggleButton } from '@material-ui/lab';
import { SharingOnIcon } from '../../../components/icons/SharingOnIcon';
import { SharingOffIcon } from '../../../components/icons/SharingOffIcon';
import useScreenShareToggle from '../../../hooks/useScreenShareToggle/useScreenShareToggle';
import { Tooltip } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

export const ScreenShareToggle = (props: { className?: string }) => {
  const { t } = useTranslation();
  const [isSharingOn, toggleSharingOn] = useScreenShareToggle();

  return (
    <Tooltip title={t('features.mediaControls.screenShareToggle') as string}>
      <ToggleButton value="video" selected={isSharingOn} onChange={toggleSharingOn} {...props}>
        {isSharingOn ? <SharingOnIcon fontSize="default" /> : <SharingOffIcon fontSize="default" />}
      </ToggleButton>
    </Tooltip>
  );
};
