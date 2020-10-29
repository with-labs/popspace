import * as React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectors as roomSelectors, actions as roomActions, actions } from '../roomSlice';
import { useCoordinatedDispatch } from '../CoordinatedDispatchProvider';
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
  const isOpen = useSelector(roomSelectors.selectIsWallpaperModalOpen);

  const wallpaperUrl = useSelector(roomSelectors.selectWallpaperUrl);

  const dispatch = useDispatch();
  const coordinatedDispatch = useCoordinatedDispatch();
  const setWallpaper = React.useCallback(
    (url: string) => {
      coordinatedDispatch(actions.updateRoomWallpaper({ wallpaperUrl: url }));
    },
    [coordinatedDispatch]
  );

  const onClose = () => dispatch(roomActions.setIsWallpaperModalOpen({ isOpen: false }));

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
