import * as React from 'react';
import { Button } from '@material-ui/core';
import { SettingsIcon } from '../../../components/icons/SettingsIcon';
import { AudioVideoSettingsModal } from '../../preferences/AudioVideoSettingsModal';

export const SettingsButton = (props: { className?: string }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      <Button variant="outlined" onClick={() => setIsOpen((v) => !v)} className={props.className} color="default">
        <SettingsIcon fontSize="default" color="inherit" />
      </Button>
      <AudioVideoSettingsModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};
