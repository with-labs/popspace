import { BrowserInstallers } from '@components/BrowserInstallers/BrowserInstallers';
import { Modal } from '@components/Modal/Modal';
import { ModalActions } from '@components/Modal/ModalActions';
import { ModalTitleBar } from '@components/Modal/ModalTitleBar';
import { useRoomModalStore } from '@features/roomControls/useRoomModalStore';
import { Box, Button, Typography } from '@material-ui/core';
import * as React from 'react';

export function SupportedBrowsersModal() {
  const isOpen = useRoomModalStore((modals) => modals.supportedBrowsers);
  const closeModal = useRoomModalStore((modals) => modals.api.closeModal);
  const close = () => closeModal('supportedBrowsers');

  return (
    <Modal isOpen={isOpen} onClose={close} fullWidth maxWidth="lg">
      <ModalTitleBar title="Supported browsers" />
      <Box p={4} pt={0}>
        <Typography variant="body1" paragraph>
          To ensure a stable experience you can use one of our supported browsers.
        </Typography>
        <BrowserInstallers analyticsEvent="safariModal_browser_install" />
      </Box>
      <ModalActions>
        <Button onClick={close}>Got it</Button>
      </ModalActions>
    </Modal>
  );
}
