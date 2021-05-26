import React from 'react';
import {
  makeStyles,
  Dialog,
  DialogContent,
  DialogTitle,
  Button,
  Box,
  Typography,
  ThemeProvider,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { Form, Formik } from 'formik';
import { FormikSubmitButton } from '@components/fieldBindings/FormikSubmitButton';
import { RoomInfo } from '../../../../types/api';
import { cherry } from '../../../../theme/theme';

interface IRenameRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLeave: (roomInfo: RoomInfo) => Promise<void>;
  roomInfo: RoomInfo;
}

const useStyles = makeStyles((theme) => ({
  root: {
    height: 400,
  },
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
  form: {
    height: '100%',
  },
  textWrapper: {
    marginTop: theme.spacing(2),
    flexGrow: 1,
  },
}));

export const LeaveRoomModal: React.FC<IRenameRoomModalProps> = (props) => {
  const { isOpen, onClose, roomInfo, onLeave } = props;
  const classes = useStyles();
  const { t } = useTranslation();

  const onConfirm = async () => {
    await onLeave(roomInfo);
    onClose();
  };

  return (
    <Dialog open={isOpen} fullWidth maxWidth="xs">
      <DialogTitle classes={{ root: classes.title }}>
        {t('modals.leaveRoomModal.title', { roomName: roomInfo.display_name })}
      </DialogTitle>
      <DialogContent className={classes.root}>
        <Formik initialValues={{}} onSubmit={onConfirm}>
          <Form className={classes.form}>
            <Box display="flex" flexDirection="column" height="100%">
              <Typography className={classes.textWrapper} variant="body1">
                {t('modals.leaveRoomModal.explainationText', { roomName: roomInfo.display_name })}
              </Typography>
              <Box>
                <ThemeProvider theme={cherry}>
                  <FormikSubmitButton className={classes.spacer}>
                    {t('modals.leaveRoomModal.buttonText')}
                  </FormikSubmitButton>
                </ThemeProvider>
                <Button variant="text" color="inherit" onClick={() => onClose()} className={classes.spacer}>
                  {t('common.cancel')}
                </Button>
              </Box>
            </Box>
          </Form>
        </Formik>
      </DialogContent>
    </Dialog>
  );
};
