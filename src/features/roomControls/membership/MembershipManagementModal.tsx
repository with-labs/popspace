import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectors as controlsSelectors, actions as controlsActions } from '../roomControlsSlice';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { Form, Formik, FormikHelpers } from 'formik';
import { makeStyles, Box, Typography, CircularProgress } from '@material-ui/core';
import { Modal } from '../../../components/Modal/Modal';
import { ModalPane } from '../../../components/Modal/ModalPane';
import { ModalTitleBar } from '../../../components/Modal/ModalTitleBar';
import { ModalContentWrapper } from '../../../components/Modal/ModalContentWrapper';
import { FormikTextField } from '../../../components/fieldBindings/FormikTextField';
import { FormikSubmitButton } from '../../../components/fieldBindings/FormikSubmitButton';
import { isEmailValid } from '../../../utils/CheckEmail';
import Api from '../../../utils/api';
import { useRoomName } from '../../../hooks/useRoomName/useRoomName';
import { USER_SESSION_TOKEN } from '../../../constants/User';
import { sessionTokenExists } from '../../../utils/SessionTokenExists';
import { ErrorModal } from '../.././../components/ErrorModal/ErrorModal';
import * as Sentry from '@sentry/react';
import { ErrorCodes } from '../../../constants/ErrorCodes';
import { BaseResponse } from '../../../utils/api';

import { MemberList } from './MemberList/MemberList';
import membersImg from './images/ManageMembers.png';

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
  inviteText: {
    width: 172,
    textAlign: 'center',
  },
}));

function validateEmail(email: string, translate: TFunction) {
  if (!isEmailValid(email)) {
    return translate('error.messages.provideValidEmail');
  }
}

const MAX_INVITE_COUNT = 20;

export const MembershipManagementModal: React.FC<IMembershipManagementModalProps> = (props) => {
  const dispatch = useDispatch();
  const isOpen = useSelector(controlsSelectors.selectIsMembershipModalOpen);
  const [error, setError] = useState<BaseResponse | null>(null);

  const { t } = useTranslation();
  const classes = useStyles();
  const [isLoading, setIsLoading] = useState(false);
  const roomName = useRoomName();
  const sessionToken = localStorage.getItem(USER_SESSION_TOKEN);

  const [inviteCount, setInviteCount] = useState(0);
  const [members, setMembers] = useState([]);

  const onCloseHandler = () => {
    dispatch(controlsActions.setIsMembershipModalOpen({ isOpen: false }));
  };

  const updateMembers = (newMembers: []) => {
    setInviteCount(MAX_INVITE_COUNT - newMembers.length);
    setMembers(newMembers);
  };

  const onSubmitHandler = async (values: MembershipFormData, actions: FormikHelpers<MembershipFormData>) => {
    try {
      if (sessionTokenExists(sessionToken) && roomName) {
        const result: BaseResponse = await Api.sendRoomInvite(roomName, values.inviteeEmail);
        if (result.success) {
          const newMembers: any = [...members, result.newMember];
          updateMembers(newMembers);
        } else {
          setError(result);
        }
      }
    } catch (e) {
      Sentry.captureMessage(`Error membership modal send invite`, Sentry.Severity.Error);
      setError({
        success: false,
        errorCode: ErrorCodes.UNEXPECTED,
      });
    } finally {
      actions.resetForm();
    }
  };

  useEffect(() => {
    // get the current membership list
    if (isOpen && sessionTokenExists(sessionToken) && roomName) {
      setIsLoading(true);
      Api.getRoomMembers(roomName)
        .then((result: any) => {
          if (result.success) {
            setIsLoading(false);
            updateMembers(result.result);
          } else {
            setError(result);
          }
        })
        .catch((e: any) => {
          setIsLoading(false);
          Sentry.captureMessage(`Error membership modal get room members`, Sentry.Severity.Error);
          setError({
            success: false,
            errorCode: ErrorCodes.UNEXPECTED,
          });
        });
    }
  }, [isOpen, sessionToken, roomName]);

  const onMemberRemove = (member: any) => {
    const newMembers: [] = [];
    for (let i = 0; i < members.length; i++) {
      if (members[i] !== member) {
        newMembers.push(members[i]);
      }
    }
    updateMembers(newMembers);
  };

  return (
    <>
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
            {members.length > 0 && roomName ? (
              <MemberList members={members} onMemberRemove={onMemberRemove} roomName={roomName} />
            ) : (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                flexGrow={1}
                flexShrink={0}
                flexBasis="auto"
              >
                {isLoading ? (
                  <CircularProgress />
                ) : (
                  <Typography variant="body1" className={classes.inviteText}>
                    {t('modals.inviteUserModal.getStarted')}
                  </Typography>
                )}
              </Box>
            )}
          </ModalPane>
        </ModalContentWrapper>
      </Modal>
      <ErrorModal open={!!error} error={error!} onClose={() => setError(null)} />
    </>
  );
};
