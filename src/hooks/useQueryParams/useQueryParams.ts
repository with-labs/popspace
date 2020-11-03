import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

// A custom hook that builds on useLocation to parse
// the query string for you.
export default function useQueryParams() {
  const location = useLocation();
  return useMemo(() => new URLSearchParams(location.search), [location]);
}
