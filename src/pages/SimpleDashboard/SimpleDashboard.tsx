import React, { useState, useEffect } from 'react';
import Api from '../../utils/api';

import styles from './SimpleDashboard.module.css';

interface ISimpleDashboardProps {}

// TODO: move this into a util?
const sessionTokenExists = (sessionToken: any) => {
  return !!sessionToken && sessionToken !== 'undefined' && sessionToken !== 'null';
};

export const SimpleDashboard: React.FC<ISimpleDashboardProps> = (props) => {
  const [isLoading, setIsLoading] = useState(sessionTokenExists(localStorage.getItem('__session_token')));
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);
  const [rooms, setRooms] = useState([]);

  // Memoize this?
  // run this on mount
  useEffect(() => {
    const sessionToken = localStorage.getItem('__session_token');
    if (sessionTokenExists(sessionToken)) {
      // TODO: replace this with the updated api
      Api.getProfile(sessionToken).then((result: any) => {
        if (result.success) {
          setIsLoading(false);
          setProfile(result.profile);
          debugger;
        } else {
          // Perhaps we don't always want to remove the sessionToken
          // e.g. we could have an error when there's no iternet
          // localStorage.removeItem("__session_token");
          setIsLoading(false);
          setError(result.message);
        }
      });
    }
  }, []);

  return <main>simple dash</main>;
};
