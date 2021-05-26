import * as React from 'react';
import { WallpaperCategory } from './WallpaperCategory';
import { CustomWallpaperForm } from './CustomWallpaperForm';
import { useTranslation } from 'react-i18next';
import { Modal } from '@components/Modal/Modal';
import { ModalTitleBar } from '@components/Modal/ModalTitleBar';
import { ModalContentWrapper } from '@components/Modal/ModalContentWrapper';
import { makeStyles, Box } from '@material-ui/core';
import { useRoomModalStore } from '../useRoomModalStore';
import { useRoomStore } from '@roomState/useRoomStore';

const useStyles = makeStyles((theme) => ({
  button: {
    marginTop: theme.spacing(1),
  },
  contentWrapper: {
    flexDirection: 'column',
  },
  formWrapper: {
    flexShrink: 0,
    width: '100%',
    marginBottom: theme.spacing(3),
  },
  wallpaperContainer: {
    overflowY: 'auto',
  },
}));

export const RoomSettingsModal = () => {
  const { t } = useTranslation();
  const classes = useStyles();

  const isOpen = useRoomModalStore((modals) => modals.settings);
  const closeModal = useRoomModalStore((modals) => modals.api.closeModal);

  const wallpaperUrl = useRoomStore((room) => room.state.wallpaperUrl);
  const isCustomWallpaper = useRoomStore((room) => room.state.isCustomWallpaper);
  const updateRoomState = useRoomStore((room) => room.api.updateRoomState);

  const setWallpaper = React.useCallback(
    (url: string, isCustom: boolean) => {
      updateRoomState({ wallpaperUrl: url, isCustomWallpaper: isCustom });
    },
    [updateRoomState]
  );

  const onClose = () => closeModal('settings');

  // separate built-in from custom values
  const customWallpaperUrl = isCustomWallpaper ? wallpaperUrl : null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalTitleBar title={t('modals.wallpaperModal.title')} onClose={onClose} />
      <ModalContentWrapper className={classes.contentWrapper}>
        <Box display="flex" flexDirection="column" className={classes.formWrapper}>
          <CustomWallpaperForm value={customWallpaperUrl} onChange={setWallpaper} />
        </Box>
        <Box className={classes.wallpaperContainer}>
          <WallpaperCategory onChange={setWallpaper} />
        </Box>
      </ModalContentWrapper>
    </Modal>
  );
};
