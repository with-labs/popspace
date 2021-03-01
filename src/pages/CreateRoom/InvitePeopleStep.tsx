import { Box, Button } from '@material-ui/core';
import { useFeatureFlag } from 'flagg';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { InviteLink } from '../../features/roomControls/InviteLink/InviteLink';
import { MembershipManagement } from '../../features/roomControls/membership/MembershipManagement';
import { FormPageFields } from '../../Layouts/formPage/FormPageFields';
import { FormPageTitle } from '../../Layouts/formPage/FormPageTitle';

export interface IInvitePeopleStepProps {
  onComplete: () => void;
  roomRoute: string;
}

export const InvitePeopleStep: React.FC<IInvitePeopleStepProps> = ({ onComplete, roomRoute }) => {
  const { t } = useTranslation();
  const [hasInviteLink] = useFeatureFlag('inviteLink');

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <FormPageTitle>{t('pages.createRoom.invitePeople.title')}</FormPageTitle>
      <FormPageFields flex={1}>
        <MembershipManagement roomRoute={roomRoute} />
        {hasInviteLink && <InviteLink roomRoute={roomRoute} />}
      </FormPageFields>
      <Button fullWidth onClick={onComplete}>
        {t('pages.createRoom.invitePeople.continue')}
      </Button>
    </Box>
  );
};
