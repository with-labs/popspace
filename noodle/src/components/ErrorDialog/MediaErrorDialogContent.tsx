import React, { PropsWithChildren } from 'react';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContentText from '@material-ui/core/DialogContentText';
import { useTranslation, Trans } from 'react-i18next';
import { MediaError, MEDIA_TYPES, MEDIA_STATUS } from '../../errors/MediaError';
import { makeStyles } from '@material-ui/core';
import { headerCase } from 'change-case';

const useStyles = makeStyles((theme) => ({
  title: {
    '&:first-letter': {
      textTransform: 'uppercase',
    },
  },
}));

interface MediaErrorDialogContentProps {
  error: MediaError | null;
}

function MediaErrorDialogContent({ error }: PropsWithChildren<MediaErrorDialogContentProps>) {
  const classes = useStyles();
  const { mediaType } = error || {};
  const code = (error as any)?.code;
  const { t } = useTranslation();

  if (error?.status === MEDIA_STATUS.NO_SYSTEM_PERMISSIONS) {
    return (
      <>
        <DialogTitle className={classes.title}>{t('error.media.permissionsTitle')}</DialogTitle>
        <DialogContent>
          <DialogContentText>{error.message}</DialogContentText>
          {code && (
            <pre>
              <code>{t('common.errorCode', { code })}</code>
            </pre>
          )}
        </DialogContent>
      </>
    );
  } else if (mediaType === MEDIA_TYPES.UNEXPECTED_MEDIA) {
    return (
      <>
        <DialogTitle className={classes.title}>{t('common.oops')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            <Trans i18nKey="error.media.unexpectedMediaRequestFail">
              Something unexpected happened when requesting your device permissions. Please double check your
              browser setting and try again.
            </Trans>
          </DialogContentText>
          {code && (
            <pre>
              <code>{t('common.errorCode', { code })}</code>
            </pre>
          )}
        </DialogContent>
      </>
    );
  } else {
    const device = t(`error.media.${mediaType}`);
    return (
      <>
        <DialogTitle className={classes.title}>{t('error.media.title', { device: headerCase(device) })}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            <Trans i18nKey="error.media.supportText" values={{ device }}>
              Please allow PopSpace to access your {device} and try again.
            </Trans>
          </DialogContentText>
          {code && (
            <pre>
              <code>{t('common.errorCode', { code })}</code>
            </pre>
          )}
        </DialogContent>
      </>
    );
  }
}

export default MediaErrorDialogContent;
