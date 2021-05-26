import { useState, useEffect } from 'react';
import { getSessionToken } from '@utils/sessionToken';

export function useAuth() {
  const [sessionToken, setSessionToken] = useState(getSessionToken());

  useEffect(() => {
    function handleStorageChange() {
      setSessionToken(getSessionToken());
    }
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return { isLoggedIn: !!sessionToken, sessionToken };
}
