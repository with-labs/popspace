import React, { PropsWithChildren } from 'react';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContentText from '@material-ui/core/DialogContentText';
import enhanceMessage from './enhanceMessage';
import { useTranslation } from 'react-i18next';

interface GenericErrorDialogContentProps {
  error: Error | null;
}

function GenericErrorDialogContent({ error }: PropsWithChildren<GenericErrorDialogContentProps>) {
  const { message } = error || {};
  const code = (error as any)?.code;
  const enhancedMessage = enhanceMessage(message, code);
  const { t } = useTranslation();

  return (
    <>
      <DialogTitle>{t('common.error')}</DialogTitle>
      <DialogContent>
        <DialogContentText>{enhancedMessage}</DialogContentText>
        {code && (
          <pre>
            <code>{t('common.errorCode', { code })}</code>
          </pre>
        )}
      </DialogContent>
    </>
  );
}

export default GenericErrorDialogContent;
