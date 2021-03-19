import { Box, Button, TextField, Typography } from '@material-ui/core';
import * as React from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { ButtonLoader } from '../../components/ButtonLoader/ButtonLoader';
import { useCurrentUserProfile } from '../../hooks/useCurrentUserProfile/useCurrentUserProfile';
import { FormPageFields } from '../../Layouts/formPage/FormPageFields';
import { FormPageTitle } from '../../Layouts/formPage/FormPageTitle';
import api, { ApiError, ApiNamedRoom } from '../../utils/api';
export interface INameRoomStepProps {
  onComplete: (room: ApiNamedRoom) => void;
  onCancel?: () => void;
  origin?: string;
}

export const NameRoomStep: React.FC<INameRoomStepProps> = ({ onComplete, onCancel }) => {
  const { t } = useTranslation();
  const { user } = useCurrentUserProfile();
  const [name, setName] = React.useState(user?.display_name ? `${user?.display_name}'s room` : 'My room');
  const [loading, setLoading] = React.useState(false);

  const createRoom = async () => {
    try {
      setLoading(true);
      const response = await api.roomCreate(name);
      if (!response.success) {
        throw new ApiError(response);
      }
      onComplete(response.newRoom);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <FormPageTitle>{t('pages.createRoom.nameRoom.title')}</FormPageTitle>
      <FormPageFields flex={1}>
        <Typography paragraph>{t('pages.createRoom.nameRoom.explainer')}</Typography>
        <TextField value={name} onChange={(ev) => setName(ev.target.value)} name="roomName" />
      </FormPageFields>
      <Button fullWidth onClick={createRoom} disabled={loading}>
        {loading ? <ButtonLoader /> : t('pages.createRoom.nameRoom.continue')}
      </Button>
      {onCancel && (
        <Button fullWidth onClick={onCancel} variant="text" color="inherit" style={{ marginTop: 8 }}>
          {t('common.cancel')}
        </Button>
      )}
    </Box>
  );
};
