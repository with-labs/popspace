import { PictureInPicture } from '@material-ui/icons';
import { ToggleButton } from '@material-ui/lab';
import * as React from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useTranslation } from 'react-i18next';
import { KeyShortcutText } from '@components/KeyShortcutText/KeyShortcutText';
import { ResponsiveTooltip } from '@components/ResponsiveTooltip/ResponsiveTooltip';
import { KeyShortcut } from '@constants/keyShortcuts';
import { isAutoPIPAvailable } from '../../pictureInPicture/pictureInPictureFeatureDetection';
import { usePictureInPicture } from '../../pictureInPicture/usePictureInPicture';

export interface IPictureInPictureToggleProps {
  className?: string;
}

export const PictureInPictureToggle: React.FC<IPictureInPictureToggleProps> = ({ className, ...rest }) => {
  const { t } = useTranslation();

  // the act of rendering this hook sets up all the required
  // tooling to enable the PIP view. Even if we don't render the toggle itself,
  // the hook needs to be called.
  const [active, toggle] = usePictureInPicture();

  useHotkeys(
    KeyShortcut.TogglePictureInPicture,
    (ev) => {
      ev.preventDefault();
      toggle();
    },
    [toggle]
  );

  // don't show an actual toggle if auto PIP is available since
  // the user doesn't need to manually control it.
  if (isAutoPIPAvailable) {
    return null;
  }

  return (
    <ResponsiveTooltip
      title={
        <>
          {t('features.pictureInPicture.toggle') as string}{' '}
          <KeyShortcutText>{KeyShortcut.TogglePictureInPicture}</KeyShortcutText>
        </>
      }
    >
      <div>
        <ToggleButton value="pip" selected={active} onChange={toggle} className={className} {...rest}>
          <PictureInPicture fontSize="default" />
        </ToggleButton>
      </div>
    </ResponsiveTooltip>
  );
};
