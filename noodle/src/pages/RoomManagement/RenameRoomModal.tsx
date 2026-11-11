import client from '@api/client';
import { AdminRoom, RoomNameCheck } from '@api/types';
import { Modal } from '@components/Modal/Modal';
import { ModalActions } from '@components/Modal/ModalActions';
import { ModalContentWrapper } from '@components/Modal/ModalContentWrapper';
import { ModalTitleBar } from '@components/Modal/ModalTitleBar';
import { Box, Button, CircularProgress } from '@material-ui/core';
import * as React from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { RoomNameField } from './RoomNameField';

export interface IRenameRoomModalProps {
  room: AdminRoom | null;
  onClose: () => void;
  onRenamed: () => void;
}

export const RenameRoomModal: React.FC<IRenameRoomModalProps> = ({ room, onClose, onRenamed }) => {
  const { t } = useTranslation();
  const [name, setName] = React.useState('');
  const [check, setCheck] = React.useState<RoomNameCheck | null>(null);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    setName(room?.displayName || '');
  }, [room]);

  const onSave = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!room) return;
    setSaving(true);
    try {
      await client.renameRoom(room.roomId, name);
      toast.success(t('pages.roomManagement.renamed') as string);
      onRenamed();
      onClose();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={!!room} onClose={onClose} maxWidth="sm" fullWidth>
      <ModalTitleBar title={t('pages.roomManagement.renameTitle')} onClose={onClose} />
      <form onSubmit={onSave}>
        <ModalContentWrapper>
          <Box width="100%" minWidth={0}>
            <RoomNameField
              value={name}
              onChange={setName}
              roomId={room?.roomId}
              onCheck={setCheck}
              fullWidth
              autoFocus
              required
            />
          </Box>
        </ModalContentWrapper>
        <ModalActions>
          <Button type="submit" disabled={saving || !check?.available}>
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
