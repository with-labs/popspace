import * as React from 'react';
import { useRoomExport } from './useRoomExport';
import { Button, ButtonProps } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { useSaveFile } from '../../../hooks/useSaveFile/useSaveFile';
import { useRoomName } from '../../../hooks/useRoomName/useRoomName';

/**
 * On click, saves a snapshot of the room to file.
 */
export const RoomExportButton: React.FC<Omit<ButtonProps, 'onClick'>> = (props) => {
  const { t } = useTranslation();
  const exportableState = useRoomExport();
  const saveFile = useSaveFile();
  const roomName = useRoomName();

  const doExport = () => {
    saveFile(
      JSON.stringify(exportableState),
      `${roomName}-snapshot-${new Date().toLocaleString()}.json`,
      'application/json'
    );
  };

  return (
    <Button {...props} onClick={doExport}>
      {t('features.room.export')}
    </Button>
  );
};
