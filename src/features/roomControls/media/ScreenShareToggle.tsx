import * as React from 'react';
import { ToggleButton } from '@material-ui/lab';
import { SharingOnIcon } from '../../../components/icons/SharingOnIcon';
import { SharingOffIcon } from '../../../components/icons/SharingOffIcon';
import useScreenShareToggle from '../../../hooks/useScreenShareToggle/useScreenShareToggle';
import { useTranslation } from 'react-i18next';
import { ResponsiveTooltip } from '../../../components/ResponsiveTooltip/ResponsiveTooltip';

export const ScreenShareToggle = (props: { className?: string }) => {
  const { t } = useTranslation();
  const [isSharingOn, toggleSharingOn] = useScreenShareToggle();

  return (
    <ResponsiveTooltip title={t('features.mediaControls.screenShareToggle') as string}>
      <ToggleButton value="video" selected={isSharingOn} onChange={toggleSharingOn} {...props}>
        {isSharingOn ? <SharingOnIcon fontSize="default" /> : <SharingOffIcon fontSize="default" />}
      </ToggleButton>
    </ResponsiveTooltip>
  );
};
