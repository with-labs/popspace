import React from 'react';
import { makeStyles, Dialog, DialogContent, DialogTitle, Button, Box } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { Form, Formik } from 'formik';
import { TFunction } from 'i18next';
import { FormikTextField } from '../../../components/fieldBindings/FormikTextField';
import { FormikSubmitButton } from '../../../components/fieldBindings/FormikSubmitButton';
import { RoomInfo } from '../../../types/api';
import { MAX_ROOM_NAME_LENGTH } from '../../../constants/room';

interface IRenameRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRename: (roomInfo: RoomInfo, newName: string) => Promise<void>;
  roomInfo: RoomInfo;
}

const useStyles = makeStyles((theme) => ({
  root: {},
  spacer: {
    marginTop: theme.spacing(2),
  },
  title: {
    '& .MuiTypography-root': {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  },
}));

export type RenameRoomFormData = {
  newName: string;
};

function validateRoomName(newRoomName: string, translate: TFunction) {
  const trimmedRoomName = newRoomName.trim();
  if (trimmedRoomName.length === 0) {
    // name cannot be all whitespace
    return translate('error.messages.emptyRoomName');
  } else if (trimmedRoomName.length > MAX_ROOM_NAME_LENGTH) {
    // max room name length error
    return translate('error.messages.maxRoomNameCharacters', { maxChar: MAX_ROOM_NAME_LENGTH });
  }
}

export const RenameRoomModal: React.FC<IRenameRoomModalProps> = (props) => {
  const { isOpen, onClose, roomInfo, onRename } = props;
  const classes = useStyles();
  const { t } = useTranslation();

  const onSubmit = async (e: any) => {
    await onRename(roomInfo, e.newName.trim());
    onClose();
  };

  return (
    <Dialog open={isOpen} fullWidth maxWidth="xs">
      <DialogTitle classes={{ root: classes.title }}>
        {t('modals.renameRoomModal.title', { roomName: roomInfo.display_name })}
      </DialogTitle>
      <DialogContent className={classes.root}>
        <Formik initialValues={{ newName: '' }} onSubmit={onSubmit}>
          <Form className={classes.spacer}>
            <Box display="flex" flexDirection="column">
              <FormikTextField
                id="renameRoom-newName"
                className=""
                name="newName"
                placeholder={t('modals.renameRoomModal.placeholder')}
                margin="normal"
                validate={(newName) => validateRoomName(newName, t)}
              />
              <FormikSubmitButton activeOnChange className={classes.spacer}>
                {t('modals.renameRoomModal.buttonText')}
              </FormikSubmitButton>
              <Button variant="text" color="inherit" onClick={() => onClose()} className={classes.spacer}>
                {t('common.cancel')}
              </Button>
            </Box>
          </Form>
        </Formik>
      </DialogContent>
    </Dialog>
  );
};
