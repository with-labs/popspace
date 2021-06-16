import * as React from 'react';
import { RouteNames } from './constants/RouteNames';
import { Route, Switch } from 'react-router-dom';
import { AdminRoute } from './components/AdminRoute/AdminRoute';
import { FlaggAdmin } from 'flagg/dist/react';
import { Page } from './Layouts/Page/Page';
import RoomPage from './pages/RoomPage/RoomPage';
import { Subscribe } from './pages/Subscribe/Subscribe';
import { Unsubscribe } from './pages/Unsubscribe/Unsubscribe';
import { MeetingSelect } from './pages/MeetingSelect/MeetingSelect';
import { MeetingLink } from './pages/MeetingLink/MeetingLink';
import { CreateMeeting } from './pages/CreateMeeting/CreateMeeting';
const LicensesPage = React.lazy(() => import('./pages/licenses/LicensesPage'));

export interface IRoutesProps {}

export const Routes: React.FC<IRoutesProps> = () => {
  return (
    <Switch>
      <Route exact path={RouteNames.CREATE_MEETING}>
        <MeetingSelect />
      </Route>

      <Route exact path={RouteNames.MEETING_LINK}>
        <MeetingLink />
      </Route>

      <Route exact path={RouteNames.CREATE_MEETING_URL}>
        <CreateMeeting />
      </Route>

      <Route path={RouteNames.SUBSCRIBE}>
        <Subscribe />
      </Route>

      <Route path={RouteNames.UNSUBSCRIBE}>
        <Unsubscribe />
      </Route>

      <AdminRoute
        path={RouteNames.FEATURE_FLAGS}
        render={({ history }) => <FlaggAdmin onDone={() => history.push('/')} />}
      />

      <Route path={RouteNames.LICENSES}>
        <React.Suspense fallback={<Page isLoading />}>
          <LicensesPage />
        </React.Suspense>
      </Route>

      <Route
        path="/:roomRoute"
        render={(renderProps) => {
          return <RoomPage roomRoute={renderProps.match.params.roomRoute || null} />;
        }}
      />
    </Switch>
  );
};
