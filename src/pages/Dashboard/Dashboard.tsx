import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import { useHistory } from 'react-router-dom';
import Api from '../../utils/api';
import * as Sentry from '@sentry/react';
import { CircularProgress } from '@material-ui/core';
import { Routes } from '../../constants/Routes';
import { USER_SESSION_TOKEN } from '../../constants/User';

import { DashboardItem } from './DashboardItem/DashboardItem';
import { Header } from '../../withComponents/Header/Header';
import { RoomInfo } from '../../types';
import styles from './Dashboard.module.css';

interface IDashboardProps {}

const sessionTokenExists = (sessionToken: any) => {
  return !!sessionToken && sessionToken !== 'undefined' && sessionToken !== 'null';
};

export const Dashboard: React.FC<IDashboardProps> = (props) => {
  const history = useHistory();
  const [isLoading, setIsLoading] = useState(sessionTokenExists(localStorage.getItem(USER_SESSION_TOKEN)));
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [rooms, setRooms] = useState<{ owned: RoomInfo[]; member: RoomInfo[] }>({ owned: [], member: [] });

  // run this on mount
  useEffect(() => {
    const sessionToken = localStorage.getItem(USER_SESSION_TOKEN);
    if (sessionTokenExists(sessionToken)) {
      // TODO: replace this with the updated api
      // Fix typing
      Api.getProfile(sessionToken)
        .then((result: any) => {
          if (result.success) {
            // this means we have a valid token
            setIsLoading(false);
            setUser(result.profile.user);
            setRooms(result.profile.rooms);
          } else {
            // we dont have a valid token, so redirect to sign in and remove old token
            localStorage.removeItem(USER_SESSION_TOKEN);
            history.push(`/${Routes.SIGN_IN}`);

            // Perhaps we don't always want to remove the sessionToken
            // e.g. we could have an error when there's no iternet
            // localStorage.removeItem("__session_token");
            setIsLoading(false);
            setError(result.message);
          }
        })
        .catch((e: any) => {
          //TODO: handle error better
          // Maybe error boundry?
          Sentry.captureMessage(`Error calling api call getProfile`, Sentry.Severity.Error);
          setError(e.message);
        });
    } else {
      // we arent logged in so redirect to the sign in page
      history.push(`/${Routes.SIGN_IN}`);
    }
  }, [history]);

  const RenderDashboard = () => {
    var ret = null;

    if (user) {
      const ownedRooms = rooms.owned.map((ownedRoom: any) => {
        return <DashboardItem roomName={ownedRoom.name} key={ownedRoom.id} />;
      });

      const memberRooms = rooms.member.map((memberRoom) => {
        return <DashboardItem roomName={memberRoom.name} key={memberRoom.id} />;
      });

      ret = (
        <div className={clsx(styles.roomContainer, 'u-flex')}>
          {ownedRooms}
          {memberRooms}
        </div>
      );
    } else if (error) {
      // TODO : place error boundry here?
      ret = <div>Error: {error}</div>;
    }

    return ret;
  };

  return (
    <main className={clsx(styles.root, 'u-height100Percent')}>
      <div className="u-flex u-flexJustifyCenter u-height100Percent">
        <div className="u-flex u-flexCol u-size4of5">
          <Header isFullLength={true} onSignOutHandler={() => {}} />
          {isLoading ? (
            <div className="u-flex u-flexJustifyCenter u-flexAlignItemsCenter u-height100Percent">
              <CircularProgress />
            </div>
          ) : (
            <RenderDashboard />
          )}
        </div>
      </div>
    </main>
  );
};
