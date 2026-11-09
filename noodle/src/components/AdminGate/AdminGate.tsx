import client from '@api/client';
import { Actor } from '@api/types';
import { Box, Button, CircularProgress, TextField, Typography } from '@material-ui/core';
import { logger } from '@utils/logger';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { CenterColumnPage } from '../../Layouts/CenterColumnPage/CenterColumnPage';

/**
 * Only renders children for signed-in admins and shows a login form otherwise.
 * Admin login is configured on the server with ADMIN_USERNAME / ADMIN_PASSWORD.
 */
export const AdminGate: React.FC = ({ children }) => {
  const { t } = useTranslation();
  const [authEnabled, setAuthEnabled] = React.useState<boolean | null>(null);
  const [actor, setActor] = React.useState<Actor | null>(client.actor);
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    client.on('actorChange', setActor);
    Promise.all([client.getAuthConfig(), client.login()])
      .then(([{ adminAuthEnabled }]) => setAuthEnabled(adminAuthEnabled))
      .catch((err) => {
        logger.error(err);
        setError(err.message);
      });
    return () => {
      client.off('actorChange', setActor);
    };
  }, []);

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await client.adminLogin(username, password);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (actor?.admin) {
    return <>{children}</>;
  }

  if (authEnabled === null && !error) {
    return (
      <CenterColumnPage>
        <CircularProgress />
      </CenterColumnPage>
    );
  }

  return (
    <CenterColumnPage>
      <Typography variant="h1">{t('pages.adminLogin.title')}</Typography>
      {authEnabled === false && (
        <Box mt={2}>
          <Typography color="error">{t('pages.adminLogin.notConfigured')}</Typography>
        </Box>
      )}
      <Box component="form" onSubmit={onSubmit} mt={4} width="100%" maxWidth={360}>
        <TextField
          label={t('pages.adminLogin.usernameLabel')}
          value={username}
          onChange={(ev) => setUsername(ev.target.value)}
          autoComplete="username"
          fullWidth
          margin="normal"
          autoFocus
          required
        />
        <TextField
          label={t('pages.adminLogin.passwordLabel')}
          type="password"
          value={password}
          onChange={(ev) => setPassword(ev.target.value)}
          autoComplete="current-password"
          fullWidth
          margin="normal"
          required
        />
        {error && (
          <Typography color="error" variant="body2">
            {error}
          </Typography>
        )}
        <Box mt={2}>
          <Button type="submit" fullWidth disabled={submitting || !authEnabled}>
            {t('pages.adminLogin.submit')}
          </Button>
        </Box>
      </Box>
    </CenterColumnPage>
  );
};
