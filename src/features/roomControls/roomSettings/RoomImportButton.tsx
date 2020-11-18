import * as React from 'react';
import { makeStyles, Button, ButtonProps } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { useRoomImport } from './useRoomImport';
import { useSnackbar } from 'notistack';

const useStyles = makeStyles(() => ({
  input: {
    position: 'absolute',
    width: '0.1px',
    height: '0.1px',
    overflow: 'hidden',
    opacity: 0,
    zIndex: -1,
  },
}));

/**
 * Prompts the user to select a snapshot file to upload
 */
export const RoomImportButton: React.FC<Pick<ButtonProps, 'className' | 'color' | 'variant' | 'size'>> = (props) => {
  const { t } = useTranslation();
  const classes = useStyles();

  const { enqueueSnackbar } = useSnackbar();

  const importRoom = useRoomImport();
  const onChange = async (ev: React.ChangeEvent<HTMLInputElement>) => {
    const file = ev.target.files?.item(0);
    if (!file) return;

    try {
      const json = await file.text();
      const roomObject = JSON.parse(json);
      importRoom(roomObject);
    } catch (err) {
      enqueueSnackbar('Room import failed', { color: 'error' });
    }
  };

  return (
    <>
      <input onChange={onChange} type="file" id="roomImport" name="roomImport" className={classes.input} />
      <Button component="label" htmlFor="roomImport" {...props}>
        {t('features.room.import')}
      </Button>
    </>
  );
};
