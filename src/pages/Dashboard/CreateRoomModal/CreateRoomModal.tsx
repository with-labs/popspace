import React from 'react';
import { makeStyles, Typography, Dialog, DialogContent, DialogTitle, Button, Box } from '@material-ui/core';
import { useTranslation, Trans } from 'react-i18next';
import { Form, Formik, FormikHelpers } from 'formik';
import { TFunction } from 'i18next';
import { FormikTextField } from '../../../components/fieldBindings/FormikTextField';
import { FormikSubmitButton } from '../../../components/fieldBindings/FormikSubmitButton';
import { Link } from '../../../components/Link/Link';
import { USER_SUPPORT_EMAIL } from '../../../constants/User';
import { DialogModal } from '../../../components/DialogModal/DialogModal';
import { MAX_ROOM_NAME_LENGTH, MAX_FREE_ROOMS } from '../../../constants/room';

interface ICreateRoomModalProps {
  isOpen: boolean;
  onSubmit: (roomDisplayName: string) => Promise<void>;
  onClose: () => void;
  numberOfRoomsOwned: number;
}

const useStyles = makeStyles((theme) => ({
  root: {},
  spacer: {
    marginTop: theme.spacing(2),
  },
}));

export type NewRoomFormData = {
  newRoonmDisplayName: string;
};

function validateRoomDisplayName(newRoonmDisplayName: string, translate: TFunction) {
  const trimmedRoomName = newRoonmDisplayName.trim();
  if (trimmedRoomName.length === 0) {
    // name cannot be all whitespace
    return translate('error.messages.emptyRoomName');
  } else if (trimmedRoomName.length > MAX_ROOM_NAME_LENGTH) {
    // max room name length error
    return translate('error.messages.maxRoomNameCharacters', { maxChar: MAX_ROOM_NAME_LENGTH });
  }
}

export const CreateRoomModal: React.FC<ICreateRoomModalProps> = (props) => {
  const { isOpen, onClose, onSubmit, numberOfRoomsOwned = 0 } = props;
  const classes = useStyles();
  const { t } = useTranslation();
  const atLimit = numberOfRoomsOwned >= MAX_FREE_ROOMS;

  const onSubmitHandler = async (value: NewRoomFormData, actions: FormikHelpers<NewRoomFormData>) => {
    await onSubmit(value.newRoonmDisplayName.trim());
    actions.resetForm();
  };

  return isOpen && atLimit ? (
    <DialogModal message={{ title: t('modals.createRoomModal.limitTitle'), body: '' }} onClose={() => onClose()}>
      <Typography variant="body1" component={'span'}>
        <Trans i18nKey="modals.createRoomModal.limitBody" values={{ maxRooms: MAX_FREE_ROOMS }}>
          We currently have a limit of 20 rooms per user. If you need more rooms, please
          <Link to={`mailto:${USER_SUPPORT_EMAIL}`}> contact us</Link>!
        </Trans>
      </Typography>
    </DialogModal>
  ) : (
    <Dialog open={isOpen} fullWidth maxWidth="xs">
      <DialogTitle>{t('modals.createRoomModal.title')}</DialogTitle>
      <DialogContent className={classes.root}>
        <Typography variant="body1">{t('modals.createRoomModal.explainationText')}</Typography>
        <Formik initialValues={{ newRoonmDisplayName: '' }} onSubmit={onSubmitHandler}>
          <Form className={classes.spacer}>
            <Box display="flex" flexDirection="column">
              <FormikTextField
                id="newRoom-display-name"
                className=""
                name="newRoonmDisplayName"
                placeholder={t('modals.createRoomModal.placeholder')}
                margin="normal"
                validate={(newRoonmDisplayName) => validateRoomDisplayName(newRoonmDisplayName, t)}
                autoFocus
              />
              <FormikSubmitButton activeOnChange className={classes.spacer}>
                {t('modals.createRoomModal.buttonText')}
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
