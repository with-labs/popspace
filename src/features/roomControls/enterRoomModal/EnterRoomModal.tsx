import * as React from 'react';
import { MediaReadinessContext } from '../../../components/MediaReadinessProvider/MediaReadinessProvider';
import { Dialog, DialogContent, DialogContentText, DialogTitle, Button, DialogActions, Box } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { CameraToggle } from '../media/CameraToggle';
import { MicToggle } from '../media/MicToggle';

/**
 * Pops a modal when the user has not
 */
export const EnterRoomModal: React.FC = () => {
  const { t } = useTranslation();

  // automatically opens when media is not ready yet
  const { isReady, onReady } = React.useContext(MediaReadinessContext);

  const enterRoom = () => {
    onReady();
  };

  return (
    <Dialog open={!isReady} disableBackdropClick>
      <DialogTitle>{t('modals.enterRoomModal.title')}</DialogTitle>
      <DialogContent>
        <DialogContentText>{t('modals.enterRoomModal.content')}</DialogContentText>
        <Box display="flex" flexDirection="row" alignItems="center" justifyContent="center">
          <CameraToggle />
          <MicToggle />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={enterRoom}>{t('modals.enterRoomModal.buttonText')}</Button>
      </DialogActions>
    </Dialog>
  );
};
