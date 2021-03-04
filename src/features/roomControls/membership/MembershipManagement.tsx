import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { Form, Formik, FormikHelpers } from 'formik';
import { makeStyles, Box, Typography, CircularProgress, InputAdornment, IconButton } from '@material-ui/core';
import { FormikTextField } from '../../../components/fieldBindings/FormikTextField';
import { isEmailValid } from '../../../utils/CheckEmail';
import Api, { ApiRoomMember, ApiError } from '../../../utils/api';
import { USER_SESSION_TOKEN } from '../../../constants/User';
import { sessionTokenExists } from '../../../utils/sessionToken';
import { DialogModal } from '../../../components/DialogModal/DialogModal';
import { getErrorMessageFromResponse } from '../../../utils/ErrorMessage';
import { SendIcon } from '../../../components/icons/SendIcon';

import { MemberList } from './MemberList/MemberList';
import { useQuery, useQueryCache } from 'react-query';
import { logger } from '../../../utils/logger';

import InviteMembersImg from './images/invite_some_people.png';

export type MembershipFormData = {
  inviteeEmail: string;
};

const EMPTY_VALUES: MembershipFormData = {
  inviteeEmail: '',
};

// todo: update this to fix the roonName terminology,
// we are really looking for the url route, not roomName,
// confusing
interface IMembershipManagementModalProps {
  autoFocusInvite?: boolean;
  className?: string;
  size?: 'small' | 'large';
  roomRoute: string;
  memberListClasses?: string;
  onChange?: () => void;
}

const useStyles = makeStyles((theme) => ({
  getStarted: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1 auto',
  },
  submitBtn: {
    height: '48px',
    width: 100,
    [theme.breakpoints.down('sm')]: {
      width: '100%',
      marginBottom: theme.spacing(2),
    },
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
  formWrapper: {
    flexDirection: 'column',
    [theme.breakpoints.up('md')]: {
      flexDirection: 'row',
    },
  },
  inviteImg: {
    width: 340,
    height: 220,
  },
}));

function validateEmail(email: string, translate: TFunction) {
  if (!isEmailValid(email)) {
    return translate('error.messages.provideValidEmail');
  }
}

const ROOM_MEMBERS_QUERY = '/room_get_members';

export const MembershipManagement = React.forwardRef<HTMLDivElement, IMembershipManagementModalProps>(
  ({ autoFocusInvite, roomRoute: inviteRoomRoute, memberListClasses, className, onChange }, ref) => {
    const { t } = useTranslation();
    const classes = useStyles();
    const sessionToken = localStorage.getItem(USER_SESSION_TOKEN);

    const cache = useQueryCache();
    const { data, isLoading, error } = useQuery<{ result: ApiRoomMember[] }, ApiError>([
      ROOM_MEMBERS_QUERY,
      {
        roomName: inviteRoomRoute,
      },
    ]);
    const members = data?.result || [];

    const formatErrorMessage = (response: any) => {
      return {
        title: t('common.error'),
        body: getErrorMessageFromResponse(response, t) ?? '',
      };
    };

    const [dialogError, setDialogError] = useState(error ? formatErrorMessage(error) : null);

    useEffect(() => {
      if (error) logger.error(error);
    }, [error]);

    const onSubmitHandler = async (values: MembershipFormData, actions: FormikHelpers<MembershipFormData>) => {
      try {
        if (sessionTokenExists(sessionToken) && inviteRoomRoute) {
          const response = await Api.sendRoomInvite(inviteRoomRoute, values.inviteeEmail);
          if (response.success) {
            // update query cache for members list query
            cache.setQueryData<{ result: ApiRoomMember[] }>(
              [ROOM_MEMBERS_QUERY, { roomName: inviteRoomRoute }],
              (cur) => ({
                result: [...(cur?.result ?? []), response.newMember],
              })
            );
            onChange?.();
          } else {
            // TODO: convert to try/catch when api module throws errors
            setDialogError(formatErrorMessage(new ApiError(response)));
          }
        }
      } catch (e) {
        logger.error(`Error membership modal send invite`, e);
        setDialogError(formatErrorMessage(e));
      } finally {
        actions.resetForm();
      }
    };

    const onMemberRemove = (member: any) => {
      // remove member from the query cache
      cache.setQueryData<{ result: ApiRoomMember[] }>([ROOM_MEMBERS_QUERY, { roomName: inviteRoomRoute }], (cur) => ({
        result: cur?.result ? cur.result.filter((m) => m !== member) : [],
      }));
    };

    return (
      <div ref={ref} className={className}>
        <Formik initialValues={EMPTY_VALUES} onSubmit={onSubmitHandler} validateOnMount>
          {({ isSubmitting, isValid }) => (
            <Form>
              <Box display="flex" className={classes.formWrapper} alignItems="flex-start">
                <FormikTextField
                  name="inviteeEmail"
                  placeholder={t('common.emailInput.placeHolder')}
                  aria-label={t('common.emailInput.label')}
                  margin="normal"
                  validate={(inviteeEmail) => validateEmail(inviteeEmail, t)}
                  autoFocus={autoFocusInvite}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        {isSubmitting ? (
                          <CircularProgress size={24} />
                        ) : (
                          <IconButton
                            disabled={!isValid}
                            type="submit"
                            aria-label={t('features.status.altClearButton')}
                            edge="end"
                            size="small"
                          >
                            <SendIcon fontSize="small" />
                          </IconButton>
                        )}
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
            </Form>
          )}
        </Formik>
        {members.length > 0 && inviteRoomRoute ? (
          <MemberList
            className={memberListClasses}
            members={members}
            onMemberRemove={onMemberRemove}
            roomRoute={inviteRoomRoute}
          />
        ) : (
          <Box display="flex" justifyContent="center" alignItems="center" flexGrow={1} flexShrink={0} flexBasis="auto">
            {isLoading ? (
              <CircularProgress />
            ) : (
              <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center">
                <img src={InviteMembersImg} className={classes.inviteImg} />
                <Typography variant="body1" className={classes.inviteText}>
                  {t('modals.inviteUserModal.getStarted')}
                </Typography>
              </Box>
            )}
          </Box>
        )}
        <DialogModal message={dialogError} onClose={() => setDialogError(null)} />
      </div>
    );
  }
);
