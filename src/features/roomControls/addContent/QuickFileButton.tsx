import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { AccessoryIcon } from '@components/icons/AccessoryIcon';
import { ResponsiveTooltip } from '@components/ResponsiveTooltip/ResponsiveTooltip';
import { SquareIconButton } from '@components/SquareIconButton/SquareIconButton';
import { browseForFile } from '@utils/browseForFile';
import { useAddFile } from '../../room/files/useAddFile';
import { Origin } from '@analytics/constants';

export function QuickFileButton(props: Record<string, unknown>) {
  const { t } = useTranslation();

  const addFile = useAddFile(Origin.WIDGET_MENU);
  const uploadFile = React.useCallback(async () => {
    const files = await browseForFile(true);
    files?.forEach((file) => addFile(file));
  }, [addFile]);

  return (
    <ResponsiveTooltip title={t('widgets.link.quickActionAddFile') as string} offset={4}>
      <SquareIconButton {...props} onClick={uploadFile}>
        <AccessoryIcon type="file" fontSize="inherit" />
      </SquareIconButton>
    </ResponsiveTooltip>
  );
}
