import { Box, FormControlLabel, Switch, Typography } from '@material-ui/core';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Analytics } from '../../../analytics/Analytics';
import { EventNames } from '../../../analytics/constants';
import { Modal } from '../../../components/Modal/Modal';
import { ModalContentWrapper } from '../../../components/Modal/ModalContentWrapper';
import { ModalTitleBar } from '../../../components/Modal/ModalTitleBar';
import { useRoomStore } from '../../../roomState/useRoomStore';
import { clampVector } from '../../../utils/math';
import { useRoomModalStore } from '../useRoomModalStore';

export interface IExperimentsModalProps {}

export const ExperimentsModal: React.FC<IExperimentsModalProps> = () => {
  const { t } = useTranslation();

  const isOpen = useRoomModalStore((modals) => modals.experiments);
  const toggleModal = useRoomModalStore((modals) => modals.api.toggleModal);

  const updateRoomState = useRoomStore((room) => room.api.updateRoomState);
  const isRoomHuge = useRoomStore((room) => room.state.width > 2400);
  const makeRoomHuge = () => {
    updateRoomState({
      width: 1_000_000,
      height: 1_000_000,
      wallpaperUrl: 'https://withhq.sirv.com/internal/wallpapers/tiles/grass_tile.png',
    });
    Analytics.trackEvent(EventNames.ENABLE_INFINITE_ROOM);
  };
  const makeRoomSmallAgain = () => {
    // welp, we have to move all the widgets so they are back inside the room...
    const allWidgetPositions = Object.entries(useRoomStore.getState().widgetPositions);
    const moveWidget = useRoomStore.getState().api.moveWidget;
    for (const [id, transform] of allWidgetPositions) {
      const limited = clampVector(transform.position, { x: -1184, y: -1184 }, { x: 1184, y: 1184 });
      if (limited.x !== transform.position.x || limited.y !== transform.position.y) {
        moveWidget({ widgetId: id, position: limited });
      }
    }
    // finally, change room size
    updateRoomState({
      width: 2400,
      height: 2400,
    });
    Analytics.trackEvent(EventNames.DISABLE_INFINITE_ROOM);
  };

  const onRoomSizeChange = (_ev: any, enabled: boolean) => {
    if (enabled) {
      makeRoomHuge();
    } else {
      makeRoomSmallAgain();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={() => toggleModal('experiments')}>
      <ModalTitleBar onClose={() => toggleModal('experiments')} title={t('features.experiments.title')} />
      <ModalContentWrapper>
        <Box width="100%">
          <div>
            <FormControlLabel
              control={<Switch onChange={onRoomSizeChange} checked={isRoomHuge} />}
              label={t('features.experiments.massiveRoom')}
            />
          </div>
          <Typography variant="caption">{t('features.experiments.massiveRoomExplainer')}</Typography>
        </Box>
      </ModalContentWrapper>
    </Modal>
  );
};
