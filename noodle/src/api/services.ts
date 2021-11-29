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

export function getServices() {
  return {
    hermes: {
      http: `${HTTP_PROTOCOL}://${HERMES_HOST}:${HERMES_PORT}`,
      ws: `${WS_PROTOCOL}://${HERMES_HOST}:${HERMES_PORT}`,
    },
    api: {
      http: `${HTTP_PROTOCOL}://${API_HOST}:${API_PORT}`,
    },
    unicorn: {
      http: `${HTTP_PROTOCOL}://${UNICORN_HOST}:${UNICORN_PORT}`,
      ws: `${WS_PROTOCOL}://${UNICORN_HOST}:${UNICORN_PORT}`,
    },
  };
}
