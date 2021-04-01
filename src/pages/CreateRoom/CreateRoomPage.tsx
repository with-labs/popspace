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
import { InviteRoomMemberStep } from './InviteRoomMemberStep';

import { useHistory } from 'react-router';
import useQueryParams from '../../hooks/useQueryParams/useQueryParams';
import { RouteNames } from '../../constants/RouteNames';
import { Analytics } from '../../analytics/Analytics';
import { EventNames, Origin } from '../../analytics/constants';

export function CreateRoomPage() {
  const query = useQueryParams();
  const isOnboarding = query.get('onboarding');

  const [room, setRoom] = React.useState<ApiNamedRoom | null>(null);

  const history = useHistory<{ origin?: string; ref?: string }>();
  const cancel = () => history.push(RouteNames.ROOT);

  // grab anaylitcs information
  const queryRef = history.location.state?.ref || '';
  const funnelOrigin = history.location.state?.origin || '';
  // if we are onboarding, then the origin for this component is set to onboarding
  const origin = isOnboarding ? Origin.ONBOARDING : funnelOrigin;

  const onCompleteHandler = (room: ApiNamedRoom) => {
    setRoom(room);
    Analytics.trackEvent(isOnboarding ? EventNames.ONBOARDING_NAME_ROOM : EventNames.CREATE_ROOM, {
      origin,
      ref: queryRef,
    });
  };

  return (
    <FormPage>
      <FormPageContent>
        {!!room ? (
          <InviteRoomMemberStep
            origin={origin}
            queryRef={queryRef}
            roomData={room}
            onComplete={(numMembers, isSkipped) => {
              Analytics.trackEvent(
                isOnboarding ? EventNames.ONBOARDING_INVITE_TEAM_MEMBERS : EventNames.INVITE_TEAM_MEMBERS,
                { origin, ref: queryRef, did_skip: isSkipped, invited_count: numMembers ?? 0 }
              );

              // replace - because we don't want the back button to go back to this flow,
              // which is not idempotent (the user coming back here and doing it again
              // would create another room!)
              history.replace(room.route, { origin, ref: queryRef });
            }}
          />
        ) : (
          // Cancel is only shown if we're not onboarding
          <NameRoomStep onComplete={onCompleteHandler} onCancel={isOnboarding ? undefined : cancel} />
        )}
      </FormPageContent>
      <FormPageImage
        src={!room ? nameRoomGraphic : inviteGraphic}
        mobileSrc={!room ? nameRoomMobileGraphic : inviteMobileGraphic}
      />
    </FormPage>
  );
}
