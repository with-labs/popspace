import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { AccessoryIcon } from '@components/icons/AccessoryIcon';
import { ResponsiveTooltip } from '@components/ResponsiveTooltip/ResponsiveTooltip';
import { SquareIconButton } from '@components/SquareIconButton/SquareIconButton';
import { useRoomModalStore } from '../useRoomModalStore';
import { EventNames } from '@analytics/constants';
import { Analytics } from '@analytics/Analytics';

export function RoomSettingsButton(props: Record<string, unknown>) {
  const { t } = useTranslation();

  const openModal = useRoomModalStore((store) => store.api.openModal);

  const onClick = () => {
    Analytics.trackEvent(EventNames.SETTINGS_BUTTON_PRESSED);
    openModal('settings');
  };

  return (
    <ResponsiveTooltip title={t('features.roomSettings.roomSettingsButton') as string} offset={4}>
      <SquareIconButton {...props} onClick={onClick}>
        <AccessoryIcon type="settings" fontSize="inherit" />
      </SquareIconButton>
    </ResponsiveTooltip>
  );
}
