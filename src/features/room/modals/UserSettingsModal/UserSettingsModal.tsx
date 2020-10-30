import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectors as roomSelectors, actions as roomActions } from '../../roomSlice';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { Form, Formik } from 'formik';
import { Box } from '@material-ui/core';
import { Modal } from '../../../../components/Modal/Modal';
import { ModalPane } from '../../../../components/Modal/ModalPane';
import { ModalTitleBar } from '../../../../components/Modal/ModalTitleBar';
import { ModalContentWrapper } from '../../../../components/Modal/ModalContentWrapper';
import { FormikTextField } from '../../../../components/fieldBindings/FormikTextField';
import { FormikSubmitButton } from '../../../../components/fieldBindings/FormikSubmitButton';
import Api from '../../../../utils/api';
import { sessionTokenExists } from '../../../../utils/SessionTokenExists';
import { useLocalParticipant } from '../../../../hooks/useLocalParticipant/useLocalParticipant';
import useParticipantDisplayIdentity from '../../../../hooks/useParticipantDisplayIdentity/useParticipantDisplayIdentity';
import { useCoordinatedDispatch } from '../../CoordinatedDispatchProvider';
import { useAuth } from '../../../../hooks/useAuth/useAuth';

import { AvatarGrid } from './AvatarGrid';

export type UserSettingFormData = {
  displayName: string;
};

interface IUserSettingsModalProps {}

export const UserSettingsModal: React.FC<IUserSettingsModalProps> = (props) => {
  const dispatch = useDispatch();
  const coordinatedDispatch = useCoordinatedDispatch();
  const { t } = useTranslation();
  const isOpen = useSelector(roomSelectors.selectIsUserSettingsModalOpen);
  const { sessionToken } = useAuth();

  // get the current users information
  const localParticipant = useLocalParticipant();
  const sid = localParticipant?.sid;
  const person = useSelector(roomSelectors.createPersonSelector(sid));
  const { avatar: avatarName } = person ?? {};

  // visible screen name
  const displayIdentity = useParticipantDisplayIdentity(localParticipant);

  const onCloseHandler = () => {
    dispatch(roomActions.setIsUserSettingsModalOpen({ isOpen: false }));
  };

  const onSubmitHandler = (values: UserSettingFormData) => {
    if (sessionTokenExists(sessionToken)) {
      // Api.updateUserInformation(sessionToken, '', values.displayName)
      //   .then((result: any) => {
      //     //TODO fill this out with Alekesi
      //   })
      //   .catch((e: any) => {});
    }
  };

  const setAvatar = useCallback(
    (newAvatar: string) => {
      coordinatedDispatch(roomActions.updatePersonAvatar({ id: sid, avatar: newAvatar }));
    },
    [coordinatedDispatch, sid]
  );

  return (
    <Modal onClose={onCloseHandler} isOpen={isOpen}>
      <ModalTitleBar title={t('modals.userSettingsModal.title')} onClose={onCloseHandler} />
      <ModalContentWrapper>
        <ModalPane>
          <AvatarGrid onChange={setAvatar} value={avatarName} />
        </ModalPane>
        <ModalPane>
          <Formik
            initialValues={{ displayName: displayIdentity ? displayIdentity : '' }}
            onSubmit={onSubmitHandler}
            validateOnMount
            enableReinitialize
          >
            <Form>
              <Box display="flex" flexDirection="row">
                <FormikTextField
                  className=""
                  name="displayName"
                  placeholder={t('modals.userSettingsModal.displayNameInput.placeholder')}
                  label={t('modals.userSettingsModal.displayNameInput.label')}
                  margin="normal"
                  validate={(displayName) => {}}
                  helperText={t('modals.userSettingsModal.displayNameInput.helperText')}
                  disabled={true}
                />
              </Box>
            </Form>
          </Formik>
        </ModalPane>
      </ModalContentWrapper>
    </Modal>
  );
};
