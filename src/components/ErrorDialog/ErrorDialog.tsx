import React, { PropsWithChildren } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import { useTranslation } from 'react-i18next';
import { ErrorTypes } from '@constants/ErrorTypes';
import { MediaError } from '../../errors/MediaError';

import GenericErrorDialogContent from './GenericErrorDialogContent';
import MediaErrorDialogContent from './MediaErrorDialogContent';
interface ErrorDialogProps {
  dismissError: () => void;
  error: Error | null;
}

function ErrorDialog({ dismissError, error }: PropsWithChildren<ErrorDialogProps>) {
  const { t } = useTranslation();

  const renderErrorContent = (error: Error & { type?: string }) => {
    switch (error.type) {
      case ErrorTypes.MEDIA: {
        return <MediaErrorDialogContent error={error as MediaError} />;
      }
      default:
        return <GenericErrorDialogContent error={error} />;
    }
  };

  return (
    <Dialog open={error !== null} onClose={() => dismissError()} fullWidth={true} maxWidth="xs">
      {error && renderErrorContent(error)}
      <DialogActions>
        <Button onClick={() => dismissError()} color="primary" autoFocus>
          {t('common.confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ErrorDialog;
