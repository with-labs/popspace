import React from 'react';
import {
  makeStyles,
  Typography,
  Dialog,
  DialogContent,
  DialogTitle,
  Button,
  ThemeProvider,
  Box,
} from '@material-ui/core';
import { useTranslation, Trans } from 'react-i18next';
import { cherry } from '../../../../theme/theme';
import { RoomInfo } from '../../../../types/api';
import { Form, Formik } from 'formik';
import { FormikTextField } from '@components/fieldBindings/FormikTextField';
import { FormikSubmitButton } from '@components/fieldBindings/FormikSubmitButton';
import { TFunction } from 'i18next';

interface IDeleteRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: (roomInfo: RoomInfo) => void;
  roomInfo: RoomInfo;
}

const useStyles = makeStyles((theme) => ({
  root: {
    maxWidth: 400,
  },
  spacer: {
    marginTop: theme.spacing(2),
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
  },
  title: {
    '& .MuiTypography-root': {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  },
}));

export type DeleteRoomFormData = {
  typedName: string;
};

function validateRoomName(currentRoomName: string, typedName: string, translate: TFunction) {
  // since we are locking deleting the room based on the user typing, we just check the raw
  // string without any kind of whitespace removal
  if (currentRoomName !== typedName) {
    return translate('modals.deleteRoomModal.validateMessage');
  }
}

export const DeleteRoomModal: React.FC<IDeleteRoomModalProps> = (props) => {
  const { isOpen, onClose, onDelete, roomInfo } = props;
  const classes = useStyles();
  const { t } = useTranslation();

  const onConfirm = async () => {
    await onDelete(roomInfo);
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle classes={{ root: classes.title }}>
        {t('modals.deleteRoomModal.title', { roomName: roomInfo.display_name })}
      </DialogTitle>
      <DialogContent className={classes.root}>
        <Trans>
          <Typography className={classes.spacer} variant="body1">
            {t('modals.deleteRoomModal.explainationText', { roomName: roomInfo.display_name })}
          </Typography>
        </Trans>
        <Formik initialValues={{ typedName: '' }} onSubmit={onConfirm} validateOnChange>
          <Form className={classes.spacer}>
            <Box display="flex" flexDirection="column">
              <FormikTextField
                id="deleteRoom-confirmName"
                name="typedName"
                placeholder={roomInfo.display_name}
                margin="normal"
                validate={(typedName) => validateRoomName(roomInfo.display_name, typedName, t)}
              />
              <ThemeProvider theme={cherry}>
                <FormikSubmitButton activeOnChange className={classes.spacer}>
                  {t('modals.deleteRoomModal.buttonText')}
                </FormikSubmitButton>
              </ThemeProvider>
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
