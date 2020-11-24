import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { Form, Formik, FormikHelpers } from 'formik';
import { makeStyles, Box, Typography, CircularProgress } from '@material-ui/core';
import { FormikTextField } from '../../../components/fieldBindings/FormikTextField';
import { FormikSubmitButton } from '../../../components/fieldBindings/FormikSubmitButton';
import { isEmailValid } from '../../../utils/CheckEmail';
import Api, { ApiRoomMember, ApiError } from '../../../utils/api';
import { useRoomName } from '../../../hooks/useRoomName/useRoomName';
import { USER_SESSION_TOKEN } from '../../../constants/User';
import { sessionTokenExists } from '../../../utils/SessionTokenExists';
import { ErrorModal } from '../../../components/ErrorModal/ErrorModal';

import { MemberList } from './MemberList/MemberList';
import { useQuery, useQueryCache } from 'react-query';
import { logger } from '../../../utils/logger';

export type MembershipFormData = {
  inviteeEmail: string;
};

const EMPTY_VALUES: MembershipFormData = {
  inviteeEmail: '',
};

interface IMembershipManagementModalProps {
  autoFocusInvite?: boolean;
}

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

export const MembershipManagement: React.FC<IMembershipManagementModalProps> = ({ autoFocusInvite }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const roomName = useRoomName();
  const sessionToken = localStorage.getItem(USER_SESSION_TOKEN);
  const [submitError, setSubmitError] = useState<ApiError | null>(null);

  const cache = useQueryCache();
  const { data, isLoading, error } = useQuery<{ result: ApiRoomMember[] }, ApiError>([
    '/room_get_members',
    {
      roomName,
    },
  ]);
  const members = data?.result || [];

  useEffect(() => {
    if (error) logger.error(error);
  }, [error]);

  const onSubmitHandler = async (values: MembershipFormData, actions: FormikHelpers<MembershipFormData>) => {
    try {
      if (sessionTokenExists(sessionToken) && roomName) {
        const response = await Api.sendRoomInvite(roomName, values.inviteeEmail);
        if (response.success) {
          // update query cache for members list query
          cache.setQueryData<{ result: ApiRoomMember[] }>(['/get_room_members', { roomName }], (cur) => ({
            result: [...(cur?.result ?? []), response.newMember],
          }));
        } else {
          // TODO: convert to try/catch when api module throws errors
          setSubmitError(new ApiError(response));
        }
      }
    } catch (e) {
      logger.error(`Error membership modal send invite`, e);
      setSubmitError(e);
    } finally {
      actions.resetForm();
    }
  };

  const onMemberRemove = (member: any) => {
    // remove member from the query cache
    cache.setQueryData<{ result: ApiRoomMember[] }>(['/get_room_members', { roomName }], (cur) => ({
      result: cur?.result ? cur.result.filter((m) => m !== member) : [],
    }));
  };

  const remainingInvites = MAX_INVITE_COUNT - members.length;

  return (
    <>
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
                remainingInvites === 0 ? 'modals.inviteUserModal.noInvitesLeft' : 'modals.inviteUserModal.invitesLeft',
                { count: remainingInvites }
              )}
              autoFocus={autoFocusInvite}
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
        <Box display="flex" justifyContent="center" alignItems="center" flexGrow={1} flexShrink={0} flexBasis="auto">
          {isLoading ? (
            <CircularProgress />
          ) : (
            <Typography variant="body1" className={classes.inviteText}>
              {t('modals.inviteUserModal.getStarted')}
            </Typography>
          )}
        </Box>
      )}
      <ErrorModal error={error || submitError} />
    </>
  );
};
