import { Box, Button } from '@material-ui/core';
import { useFeatureFlag } from 'flagg';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { InviteLink } from '../../features/roomControls/membership/InviteLink';
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
  const [dirty, setDirty] = React.useState(false);

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <FormPageTitle>{t('pages.createRoom.invitePeople.title')}</FormPageTitle>
      <FormPageFields flex={1}>
        <MembershipManagement roomRoute={roomRoute} onChange={() => setDirty(true)} />
        {hasInviteLink && <InviteLink roomRoute={roomRoute} />}
      </FormPageFields>
      <Button fullWidth color={dirty ? 'primary' : 'default'} onClick={onComplete}>
        {t(dirty ? 'pages.createRoom.invitePeople.continue' : 'pages.createRoom.invitePeople.skip')}
      </Button>
    </Box>
  );
};
