import client from '@api/client';
import { Modal } from '@components/Modal/Modal';
import { ModalContentWrapper } from '@components/Modal/ModalContentWrapper';
import { ModalTitleBar } from '@components/Modal/ModalTitleBar';
import { Box, Button, TextField, Typography } from '@material-ui/core';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

export interface IRoomPasswordPromptProps {
  roomRoute: string;
  onUnlocked: () => void;
}

export const RoomPasswordPrompt: React.FC<IRoomPasswordPromptProps> = ({ roomRoute, onUnlocked }) => {
  const { t } = useTranslation();
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await client.unlockRoom(roomRoute, password);
      onUnlocked();
    } catch (err: any) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={true} maxWidth="xs">
      <ModalTitleBar title={t('pages.roomPassword.title')} />
      <ModalContentWrapper>
        <Box component="form" onSubmit={onSubmit} width="100%">
          <Typography variant="body1">{t('pages.roomPassword.explanation')}</Typography>
          <TextField
            label={t('pages.roomPassword.passwordLabel')}
            type="password"
            value={password}
            onChange={(ev) => setPassword(ev.target.value)}
            fullWidth
            margin="normal"
            autoFocus
            required
          />
          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}
          <Box mt={2}>
            <Button type="submit" fullWidth disabled={submitting || !password}>
              {t('pages.roomPassword.submit')}
            </Button>
          </Box>
        </Box>
      </ModalContentWrapper>
    </Modal>
  );
};
