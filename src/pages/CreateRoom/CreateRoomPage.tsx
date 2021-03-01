import * as React from 'react';
import { FormPage } from '../../Layouts/formPage/FormPage';
import { FormPageContent } from '../../Layouts/formPage/FormPageContent';
import { FormPageImage } from '../../Layouts/formPage/FormPageImage';
import nameRoomGraphic from '../../images/illustrations/name_your_room.jpg';
import nameRoomMobileGraphic from '../../images/illustrations/name_your_room_responsive.jpg';
import inviteGraphic from '../../images/illustrations/invite_your_team.jpg';
import inviteMobileGraphic from '../../images/illustrations/invite_your_team_responsive.jpg';
import { NameRoomStep } from './NameRoomStep';
import { ApiNamedRoom } from '../../utils/api';
import { InvitePeopleStep } from './InvitePeopleStep';
import { useHistory } from 'react-router';
import useQueryParams from '../../hooks/useQueryParams/useQueryParams';
import { RouteNames } from '../../constants/RouteNames';

export function CreateRoomPage() {
  const query = useQueryParams();
  const isOnboarding = query.get('onboarding');

  const [room, setRoom] = React.useState<ApiNamedRoom | null>(null);

  const history = useHistory();

  const cancel = () => history.push(RouteNames.ROOT);

  return (
    <FormPage>
      <FormPageContent>
        {!!room ? (
          <InvitePeopleStep
            roomRoute={room.route}
            onComplete={() => {
              // replace - because we don't want the back button to go back to this flow,
              // which is not idempotent (the user coming back here and doing it again
              // would create another room!)
              history.replace(room.route);
            }}
          />
        ) : (
          // Cancel is only shown if we're not onboarding
          <NameRoomStep onComplete={setRoom} onCancel={isOnboarding ? undefined : cancel} />
        )}
      </FormPageContent>
      <FormPageImage
        src={!room ? nameRoomGraphic : inviteGraphic}
        mobileSrc={!room ? nameRoomMobileGraphic : inviteMobileGraphic}
      />
    </FormPage>
  );
}
