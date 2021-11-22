import { Box, Button, DialogActions, Typography } from '@material-ui/core';
import { TFunction } from 'i18next';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '@components/Modal/Modal';
import { ModalContentWrapper } from '@components/Modal/ModalContentWrapper';
import { ModalTitleBar } from '@components/Modal/ModalTitleBar';
import { useQuickAction } from '../../roomControls/addContent/quickActions/useQuickAction';
import { useAddFile } from '../files/useAddFile';
import { PasteContentPreview } from './PasteContentPreview';
import { usePasteStore } from './usePasteStore';
import * as matchers from '../../quickActions/matchers';
import { matchQuickActions } from '../../quickActions/matchQuickActions';
import { logger } from '@utils/logger';
import { Origin } from '@analytics/constants';

// only a subset of matchers are used for paste operations
const pasteMatchers = [matchers.link, matchers.stickyNote, matchers.youtube];
function getFirstQuickActionMatch(prompt: string, t: TFunction) {
  return matchQuickActions(prompt, pasteMatchers, t)[0] ?? null;
}

const autoFocus = (el: HTMLButtonElement | null) => {
  if (el) el.focus();
};

export function PasteConfirmModal() {
  const { t } = useTranslation();

  const files = usePasteStore((store) => store.pastedFiles);
  const text = usePasteStore((store) => store.pastedText);
  const api = usePasteStore((store) => store.api);

  const isOpen = !!(files || text);

  const addFile = useAddFile(Origin.PASTE);
  const applyQuickAction = useQuickAction();

  const confirm = React.useCallback(() => {
    if (files) {
      files.forEach((file) => addFile(file));
    } else if (text) {
      const action = getFirstQuickActionMatch(text, t);
      if (!action) {
        logger.warn(`No quick actions matched pasted text: ${text}`);
      }
      applyQuickAction(action);
    }
    api.clear();
  }, [addFile, api, applyQuickAction, files, t, text]);

  return (
    <Modal isOpen={isOpen} onClose={api.clear} maxWidth="sm">
      <ModalTitleBar title={t('features.paste.modalTitle')} />
      <ModalContentWrapper>
        <Box display="flex" flexDirection="column" width="100%">
          <Typography paragraph>{t('features.paste.modalDetails')}</Typography>
          <PasteContentPreview files={files} text={text} />
        </Box>
      </ModalContentWrapper>
      <DialogActions style={{ marginTop: 8 }}>
        <Button variant="text" color="inherit" fullWidth={false} onClick={api.clear}>
          {t('common.cancel')}
        </Button>
        <Button onClick={confirm} fullWidth={false} ref={autoFocus}>
          {t('features.paste.confirm')}
        </Button>
      </DialogActions>
    </Modal>
  );
}
