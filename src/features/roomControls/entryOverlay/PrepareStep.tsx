import { Box, Button, makeStyles, TextField, Typography } from '@material-ui/core';
import * as React from 'react';
import { Logo } from '../../../components/Logo/Logo';
import shallow from 'zustand/shallow';
import { useRoomStore } from '../../../roomState/useRoomStore';
import { AvatarSelectorBubble } from '../avatar/AvatarSelectorBubble';
import patternBg from '../../../images/illustrations/pattern_bg_1.svg';
import { Spacing } from '../../../components/Spacing/Spacing';
import { CameraToggle } from '../media/CameraToggle';
import { MicToggle } from '../media/MicToggle';
import { useTranslation } from 'react-i18next';

export interface IPrepareStepProps {
  onComplete: () => void;
}

const useStyles = makeStyles((theme) => ({
  background: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 32,
    width: '100%',
    backgroundColor: theme.palette.brandColors.mandarin.light,
    backgroundImage: `url(${patternBg})`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
  },
  avatarButton: {
    border: 'none',
    background: 'none',
    marginTop: theme.spacing(6),
    left: '50%',
    transform: 'translateX(-50%)',
    cursor: 'pointer',
  },
  nameField: {
    position: 'relative',
    zIndex: 1,
  },
}));

export const PrepareStep: React.FC<IPrepareStepProps> = ({ onComplete }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const [user, updateSelf] = useRoomStore(
    (room) => [room.users[room.sessionLookup[room.sessionId || '']], room.api.updateSelf],
    shallow
  );

  const [name, setName] = React.useState(user?.participantState?.displayName ?? '');

  const handleComplete = () => {
    if (name !== user?.participantState?.displayName) {
      updateSelf({
        displayName: name,
      });
    }
    onComplete();
  };

  return (
    <Box minHeight="100%" display="flex" flexDirection="column">
      <Logo style={{ marginBottom: 16 }} link />
      <Box display="flex" flexDirection="column" flex={1}>
        <Box flex={1} display="flex" flexDirection="column">
          <Box position="relative" marginBottom={0.5}>
            <div className={classes.background} />
            <AvatarSelectorBubble className={classes.avatarButton} showVideo />
          </Box>
          <TextField
            placeholder={t('modals.devicePermissionsModal.namePlaceholder')}
            required
            value={name}
            onChange={(ev) => setName(ev.target.value)}
            className={classes.nameField}
          />
          <Spacing style={{ alignSelf: 'center', marginTop: 8 }} alignItems="center">
            <Box display="flex" alignItems="center">
              <CameraToggle isLocal />
            </Box>
            <Box display="flex" alignItems="center">
              <MicToggle isLocal />
            </Box>
          </Spacing>
        </Box>
      </Box>
      <Typography variant="h2" gutterBottom>
        {t('modals.devicePermissionsModal.prepareTitle')}
      </Typography>
      <Typography paragraph>{t('modals.devicePermissionsModal.setupExplanation')}</Typography>
      <Button onClick={handleComplete} disabled={!name}>
        {t('modals.devicePermissionsModal.enterRoomButton')}
      </Button>
    </Box>
  );
};
