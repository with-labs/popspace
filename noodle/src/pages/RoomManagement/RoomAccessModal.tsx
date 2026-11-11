import client from '@api/client';
import { AdminRoom } from '@api/types';
import { Modal } from '@components/Modal/Modal';
import { ModalActions } from '@components/Modal/ModalActions';
import { ModalContentWrapper } from '@components/Modal/ModalContentWrapper';
import { ModalTitleBar } from '@components/Modal/ModalTitleBar';
import {
  Box,
  Button,
  CircularProgress,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from '@material-ui/core';
import * as React from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const MIN_ROOM_PASSWORD_LENGTH = 12;

export interface IRoomAccessModalProps {
  room: AdminRoom | null;
  onClose: () => void;
  onChanged: () => void;
}

/**
 * Makes a room public, or private with a new password. The current
 * password can't be shown since only its hash is stored.
 */
export const RoomAccessModal: React.FC<IRoomAccessModalProps> = ({ room, onClose, onChanged }) => {
  const { t } = useTranslation();
  const [accessMode, setAccessMode] = React.useState<'public' | 'password'>('public');
  const [password, setPassword] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    setAccessMode(room?.passwordProtected ? 'password' : 'public');
    setPassword('');
  }, [room]);

  const wantsPassword = accessMode === 'password';
  // keeping a public room public changes nothing
  const unchanged = !wantsPassword && !room?.passwordProtected;
  const canSave = !saving && !unchanged && (!wantsPassword || password.length >= MIN_ROOM_PASSWORD_LENGTH);

  const onSave = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!room || !canSave) return;
    setSaving(true);
    try {
      await client.setRoomPassword(room.roomId, wantsPassword ? password : null);
      toast.success(
        t(
          wantsPassword ? 'pages.roomManagement.access.madePrivate' : 'pages.roomManagement.access.madePublic'
        ) as string
      );
      onChanged();
      onClose();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={!!room} onClose={onClose} maxWidth="sm" fullWidth>
      <ModalTitleBar title={t('pages.roomManagement.access.title')} onClose={onClose} />
      <form onSubmit={onSave}>
        <ModalContentWrapper>
          <Box width="100%" minWidth={0}>
            <RadioGroup value={accessMode} onChange={(ev) => setAccessMode(ev.target.value as any)}>
              <FormControlLabel value="public" control={<Radio />} label={t('pages.meetingSelect.publicOption')} />
              <FormControlLabel value="password" control={<Radio />} label={t('pages.meetingSelect.passwordOption')} />
            </RadioGroup>
            {wantsPassword && (
              <TextField
                label={t(
                  room?.passwordProtected
                    ? 'pages.roomManagement.access.newPasswordLabel'
                    : 'pages.meetingSelect.passwordLabel'
                )}
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(ev) => setPassword(ev.target.value)}
                inputProps={{ maxLength: 128 }}
                helperText={t('pages.roomManagement.access.passwordHint')}
                fullWidth
                margin="normal"
                autoFocus
              />
            )}
            <Box mt={2}>
              <Typography variant="body2" color="textSecondary">
                {t(
                  wantsPassword ? 'pages.roomManagement.access.privateNote' : 'pages.roomManagement.access.publicNote'
                )}
              </Typography>
            </Box>
          </Box>
        </ModalContentWrapper>
        <ModalActions>
          <Button type="submit" disabled={!canSave}>
            {saving ? <CircularProgress size={22} /> : t('pages.roomManagement.save')}
          </Button>
          <Button variant="text" color="inherit" onClick={onClose} disabled={saving}>
            {t('common.cancel')}
          </Button>
        </ModalActions>
      </form>
    </Modal>
  );
};
