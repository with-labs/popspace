// users can define a shared main host which all services
// live on...
const SHARED_HOST = process.env.REACT_APP_HOST || window.location.hostname;
const HERMES_HOST = process.env.REACT_APP_HERMES_HOST || SHARED_HOST;
const HERMES_PORT = process.env.REACT_APP_HERMES_PORT || 8890;
const API_HOST = process.env.REACT_APP_API_HOST || SHARED_HOST;
const API_PORT = process.env.REACT_APP_API_PORT || 8889;
const UNICORN_HOST = process.env.REACT_APP_UNICORN_HOST || SHARED_HOST;
const UNICORN_PORT = process.env.REACT_APP_UNICORN_PORT || 8891;
const USE_HTTPS = window.location.protocol === 'https:';
const HTTP_PROTOCOL = USE_HTTPS ? 'https' : 'http';
const WS_PROTOCOL = USE_HTTPS ? 'wss' : 'ws';
// ...or, behind a reverse proxy, reach every service on the UI's own
// origin under /api, /hermes and /unicorn
const USE_SERVICE_PATHS = process.env.REACT_APP_SERVICE_PATHS === 'true';

function serviceUrls(host: string, port: string | number, path: string) {
  if (USE_SERVICE_PATHS) {
    return {
      http: `${HTTP_PROTOCOL}://${window.location.host}${path}`,
      ws: `${WS_PROTOCOL}://${window.location.host}${path}`,
    };
  }
  return {
    http: `${HTTP_PROTOCOL}://${host}:${port}`,
    ws: `${WS_PROTOCOL}://${host}:${port}`,
  };
}

export function getServices() {
  const api = serviceUrls(API_HOST, API_PORT, '/api');
  return {
    hermes: serviceUrls(HERMES_HOST, HERMES_PORT, '/hermes'),
    api: {
      http: api.http,
    },
    unicorn: serviceUrls(UNICORN_HOST, UNICORN_PORT, '/unicorn'),
  };
}
