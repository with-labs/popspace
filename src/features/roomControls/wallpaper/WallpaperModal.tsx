import * as React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectors as roomSelectors, actions as roomActions } from '../../room/roomSlice';
import { selectors as controlsSelectors, actions as controlsActions } from '../roomControlsSlice';
import { useCoordinatedDispatch } from '../../room/CoordinatedDispatchProvider';
import { WallpaperGrid } from './WallpaperGrid';
import { CustomWallpaperForm } from './CustomWallpaperForm';
import { BUILT_IN_WALLPAPERS } from '../../../constants/wallpapers';
import { useTranslation } from 'react-i18next';
import { Modal } from '../../../components/Modal/Modal';
import { ModalPane } from '../../../components/Modal/ModalPane';
import { ModalTitleBar } from '../../../components/Modal/ModalTitleBar';
import { ModalContentWrapper } from '../../../components/Modal/ModalContentWrapper';

export const WallpaperModal = () => {
  const { t } = useTranslation();
  const isOpen = useSelector(controlsSelectors.selectIsWallpaperModalOpen);

  const wallpaperUrl = useSelector(roomSelectors.selectWallpaperUrl);

  const dispatch = useDispatch();
  const coordinatedDispatch = useCoordinatedDispatch();
  const setWallpaper = React.useCallback(
    (url: string) => {
      coordinatedDispatch(roomActions.updateRoomWallpaper({ wallpaperUrl: url }));
    },
    [coordinatedDispatch]
  );

  const onClose = () => dispatch(controlsActions.setIsWallpaperModalOpen({ isOpen: false }));

  // separate built-in from custom values
  const builtinWallpaperUrl = BUILT_IN_WALLPAPERS.includes(wallpaperUrl) ? wallpaperUrl : null;
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
        </ModalPane>
      </ModalContentWrapper>
    </Modal>
  );
};
