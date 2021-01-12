import * as React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectors as roomSelectors, actions as roomActions } from '../../room/roomSlice';
import { selectors as controlsSelectors, actions as controlsActions } from '../roomControlsSlice';
import { useCoordinatedDispatch } from '../../room/CoordinatedDispatchProvider';
import { WallpaperCategory } from './WallpaperCategory';
import { CustomWallpaperForm } from './CustomWallpaperForm';
import { useTranslation } from 'react-i18next';
import { Modal } from '../../../components/Modal/Modal';
import { ModalTitleBar } from '../../../components/Modal/ModalTitleBar';
import { ModalContentWrapper } from '../../../components/Modal/ModalContentWrapper';
import { RoomExportButton } from './RoomExportButton';
import { RoomImportButton } from './RoomImportButton';
import { makeStyles, Box } from '@material-ui/core';
import { FeatureFlag } from '../../../components/FeatureFlag/FeatureFlag';

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

  const isOpen = useSelector(controlsSelectors.selectIsRoomSettingsModalOpen);

  const wallpaperUrl = useSelector(roomSelectors.selectWallpaperUrl);
  const isCustomWallpaper = useSelector(roomSelectors.selectIsCustomWallpaper);

  const dispatch = useDispatch();
  const coordinatedDispatch = useCoordinatedDispatch();
  const setWallpaper = React.useCallback(
    (url: string, isCustom: boolean) => {
      coordinatedDispatch(roomActions.updateRoomWallpaper({ wallpaperUrl: url, isCustomWallpaper: isCustom }));
    },
    [coordinatedDispatch]
  );

  const onClose = () => dispatch(controlsActions.setIsRoomSettingsModalOpen({ isOpen: false }));

  // separate built-in from custom values
  const customWallpaperUrl = isCustomWallpaper ? wallpaperUrl : null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalTitleBar title={t('modals.wallpaperModal.title')} onClose={onClose} />
      <ModalContentWrapper className={classes.contentWrapper}>
        <Box display="flex" flexDirection="column" className={classes.formWrapper}>
          <CustomWallpaperForm value={customWallpaperUrl} onChange={setWallpaper} />
          <FeatureFlag flagName="exportRoom">
            <RoomExportButton className={classes.button} />
            <RoomImportButton className={classes.button} />
          </FeatureFlag>
        </Box>
        <Box className={classes.wallpaperContainer}>
          <WallpaperCategory onChange={setWallpaper} />
        </Box>
      </ModalContentWrapper>
    </Modal>
  );
};
