import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectors as roomSelectors, actions as roomActions } from '../../roomSlice';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { Form, Formik } from 'formik';
import { makeStyles, Box, Typography, CircularProgress } from '@material-ui/core';
import { Modal } from '../../../../components/Modal/Modal';
import { ModalPane } from '../../../../components/Modal/ModalPane';
import { ModalTitleBar } from '../../../../components/Modal/ModalTitleBar';
import { ModalContentWrapper } from '../../../../components/Modal/ModalContentWrapper';
import { FormikTextField } from '../../../../components/fieldBindings/FormikTextField';
import { FormikSubmitButton } from '../../../../components/fieldBindings/FormikSubmitButton';
import { isEmailValid } from '../../../../utils/CheckEmail';
import Api from '../../../../utils/api';
import { useRoomName } from '../../../../hooks/useRoomName/useRoomName';
import { USER_SESSION_TOKEN } from '../../../../constants/User';
import { sessionTokenExists } from '../../../../utils/SessionTokenExists';

import { MemberList } from './MemberList/MemberList';

import membersImg from './images/members.png';

export type MembershipFormData = {
  inviteeEmail: string;
};

const EMPTY_VALUES: MembershipFormData = {
  inviteeEmail: '',
};

interface IMembershipManagementModalProps {}

const useStyles = makeStyles((theme) => ({
  getStarted: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1 auto',
  },
  emailField: {
    marginRight: '16px',
  },
  submitBtn: {
    height: '48px',
    marginTop: '23px',
    width: '100px',
  },
  imgPane: {
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },
  image: {
    width: '100%',
    height: '100%',
  },
}));

function validateEmail(email: string, translate: TFunction) {
  if (!isEmailValid(email)) {
    return translate('error.messages.provideValidEmail');
  }
}

export const MembershipManagementModal: React.FC<IMembershipManagementModalProps> = (props) => {
  const dispatch = useDispatch();
  const isOpen = useSelector(roomSelectors.selectIsMembershipModalOpen);

  const { t } = useTranslation();
  const classes = useStyles();
  const [isLoading, setIsLoading] = useState(false);
  const roomName = useRoomName();
  const sessionToken = localStorage.getItem(USER_SESSION_TOKEN);

  // temp var, will be replaced with data once we hook up stuf
  const [inviteCount, setInviteCount] = useState(Math.floor(Math.random() * Math.floor(3)));
  const [members, setMembers] = useState([]);

  const onCloseHandler = () => {
    dispatch(roomActions.setIsMembershipModalOpen({ isOpen: false }));
  };

  const onSubmitHandler = (values: MembershipFormData) => {
    if (sessionTokenExists(sessionToken) && roomName) {
      Api.sendRoomInvite(sessionToken, '', values.inviteeEmail)
        .then((result: any) => {
          //TODO fill this out with Alekesi
        })
        .catch((e: any) => {});
    }
  };

  useEffect(() => {
    // TODO: what happens if the user has an expired session token?
    // do we redirect to login?, just never open the modal?
    // will we need to make this call every time we open it or
    // can we cache this result?

    // get the current membership list
    if (sessionTokenExists(sessionToken) && roomName) {
      setIsLoading(true);
      Api.getRoomMembers(sessionToken, roomName)
        .then((result: any) => {
          setIsLoading(false);
          //TODO fill this out with Alekesi
        })
        .catch((e: any) => {
          setIsLoading(false);
        });
    }
  }, [sessionToken, roomName]);

  return (
    <Modal onClose={onCloseHandler} isOpen={isOpen}>
      <ModalTitleBar title={t('modals.inviteUserModal.title')} onClose={onCloseHandler} />
      <ModalContentWrapper>
        <ModalPane className={classes.imgPane}>
          <img src={membersImg} alt="Members" className={classes.image} />
        </ModalPane>
        <ModalPane>
          <Formik initialValues={EMPTY_VALUES} onSubmit={onSubmitHandler} validateOnMount>
            <Form>
              <Box display="flex" flexDirection="row">
                <FormikTextField
                  className={classes.emailField}
                  name="inviteeEmail"
                  placeholder={t('common.emailInput.placeHolder')}
                  label={t('common.emailInput.label')}
                  margin="normal"
                  validate={(inviteeEmail) => validateEmail(inviteeEmail, t)}
                  helperText={t(
                    inviteCount === 0 ? 'modals.inviteUserModal.noInvitesLeft' : 'modals.inviteUserModal.invitesLeft',
                    { count: inviteCount }
                  )}
                />
                <FormikSubmitButton className={classes.submitBtn}>
                  {t('modals.inviteUserModal.inviteBtn')}
                </FormikSubmitButton>
              </Box>
            </Form>
          </Formik>
          {members.length > 0 ? (
            <MemberList members={members} />
          ) : (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              flexGrow={1}
              flexShrink={0}
              flexBasis="auto"
            >
              {isLoading ? <CircularProgress /> : <Typography>{t('modals.inviteUserModal.getStarted')}</Typography>}
            </Box>
          )}
        </ModalPane>
      </ModalContentWrapper>
    </Modal>
  );
};
