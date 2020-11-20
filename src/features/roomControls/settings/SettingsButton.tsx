import * as React from 'react';
import { SettingsIcon } from '../../../components/icons/SettingsIcon';
import { AudioVideoSettingsModal } from '../../preferences/AudioVideoSettingsModal';
import { ToggleButton } from '@material-ui/lab';

export const SettingsButton = (props: { className?: string }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      <ToggleButton
        value="settings"
        selected={false}
        onClick={() => setIsOpen((v) => !v)}
        className={props.className}
        color="default"
      >
        <SettingsIcon fontSize="default" color="inherit" />
      </ToggleButton>
      <AudioVideoSettingsModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};
