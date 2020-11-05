import * as React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectors as roomSelectors, actions as roomActions } from '../../room/roomSlice';
import { selectors as controlsSelectors, actions as controlsActions } from '../roomControlsSlice';
import { useCoordinatedDispatch } from '../../room/CoordinatedDispatchProvider';
import { WallpaperGrid } from './WallpaperGrid';
import { CustomWallpaperForm } from './CustomWallpaperForm';
import { useTranslation } from 'react-i18next';
import { Modal } from '../../../components/Modal/Modal';
import { ModalPane } from '../../../components/Modal/ModalPane';
import { ModalTitleBar } from '../../../components/Modal/ModalTitleBar';
import { ModalContentWrapper } from '../../../components/Modal/ModalContentWrapper';
import { wallPaperOptions } from './WallpaperOptions';
import { RoomExportButton } from './RoomExportButton';
import { RoomImportButton } from './RoomImportButton';
import { makeStyles } from '@material-ui/core';
import { FeatureFlag } from '../../../components/FeatureFlag/FeatureFlag';

const useStyles = makeStyles((theme) => ({
  button: {
    marginTop: theme.spacing(1),
  },
}));

export const RoomSettingsModal = () => {
  const { t } = useTranslation();
  const classes = useStyles();

  const isOpen = useSelector(controlsSelectors.selectIsRoomSettingsModalOpen);

  const wallpaperUrl = useSelector(roomSelectors.selectWallpaperUrl);

  const dispatch = useDispatch();
  const coordinatedDispatch = useCoordinatedDispatch();
  const setWallpaper = React.useCallback(
    (url: string) => {
      coordinatedDispatch(roomActions.updateRoomWallpaper({ wallpaperUrl: url }));
    },
    [coordinatedDispatch]
  );

  const onClose = () => dispatch(controlsActions.setIsRoomSettingsModalOpen({ isOpen: false }));

  // separate built-in from custom values
  const builtinWallpaperUrl = wallPaperOptions.some((w) => w.url === wallpaperUrl) ? wallpaperUrl : null;
  const customWallpaperUrl = builtinWallpaperUrl ? null : wallpaperUrl;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalTitleBar title={t('modals.wallpaperModal.title')} onClose={onClose} />
      <ModalContentWrapper>
        <ModalPane>
          <WallpaperGrid onChange={setWallpaper} value={builtinWallpaperUrl} />
        </ModalPane>
        <ModalPane>
          <CustomWallpaperForm value={customWallpaperUrl} onChange={setWallpaper} />
          <FeatureFlag flagName="exportRoom">
            <RoomExportButton className={classes.button} />
            <RoomImportButton className={classes.button} />
          </FeatureFlag>
        </ModalPane>
      </ModalContentWrapper>
    </Modal>
  );
};
