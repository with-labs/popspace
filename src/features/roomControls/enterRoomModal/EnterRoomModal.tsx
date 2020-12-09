import * as React from 'react';
import { MediaReadinessContext } from '../../../components/MediaReadinessProvider/MediaReadinessProvider';
import { Dialog, DialogContent, DialogContentText, DialogTitle, Button, DialogActions } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { useLocalTracks } from '../../../components/LocalTracksProvider/useLocalTracks';

/**
 * Pops a modal when the user has not
 */
export const EnterRoomModal: React.FC = () => {
  const { t } = useTranslation();

  // automatically opens when media is not ready yet
  const { isReady, onReady } = React.useContext(MediaReadinessContext);
  const { startAudio } = useLocalTracks();

  const enterRoom = () => {
    onReady();
  };

  // auto-start mic when:
  // 1. user clicks to enter room
  // 2. this component mounts and they are already ready to enter (dialog doesn't open)
  React.useEffect(() => {
    if (isReady) {
      startAudio();
    }
  }, [isReady, startAudio]);

  return (
    <Dialog open={!isReady} disableBackdropClick>
      <DialogTitle>{t('modals.enterRoomModal.title')}</DialogTitle>
      <DialogContent>
        <DialogContentText>{t('modals.enterRoomModal.content')}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={enterRoom}>{t('modals.enterRoomModal.buttonText')}</Button>
      </DialogActions>
    </Dialog>
  );
};
