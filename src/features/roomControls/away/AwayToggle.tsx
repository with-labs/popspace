import { makeStyles } from '@material-ui/core';
import { ToggleButton } from '@material-ui/lab';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { AwayIcon } from '../../../components/icons/AwayIcon';
import { KeyShortcutText } from '../../../components/KeyShortcutText/KeyShortcutText';
import { useHotkeys } from 'react-hotkeys-hook';
import { KeyShortcut } from '../../../constants/keyShortcuts';
import { useIsAway } from './useIsAway';
import { ResponsiveTooltip } from '../../../components/ResponsiveTooltip/ResponsiveTooltip';
import { useLocalTracks } from '../../../providers/media/hooks/useLocalTracks';
export interface IAwayToggleProps {
  className?: string;
}

const useStyles = makeStyles((theme) => ({
  button: {
    '&$buttonSelected': {
      // TODO: better color palettes - this is blueberry vibrant
      color: '#65B2E2',
    },
  },
  buttonSelected: {},
}));

export const AwayToggle: React.FC<IAwayToggleProps> = ({ className }) => {
  const { t } = useTranslation();
  const classes = useStyles();

  const [isAway, setAway] = useIsAway();

  // synchronizes audio/video with away state
  const { stopAudio, stopVideo, stopScreenShare } = useLocalTracks();
  React.useEffect(() => {
    if (isAway) {
      stopAudio();
      stopVideo();
      stopScreenShare();
    }
  }, [isAway, stopAudio, stopVideo, stopScreenShare]);

  useHotkeys(
    KeyShortcut.ToggleAway,
    (ev) => {
      ev.preventDefault();
      setAway(!isAway);
    },
    [isAway, setAway]
  );

  return (
    <ResponsiveTooltip
      title={
        <>
          {t('features.away.tooltip') as string} <KeyShortcutText>{KeyShortcut.ToggleAway}</KeyShortcutText>
        </>
      }
      className={className}
    >
      <div>
        <ToggleButton
          value="away"
          aria-label={isAway ? t('features.away.return') : t('features.away.leave')}
          selected={isAway}
          onChange={() => setAway(!isAway)}
          classes={{
            root: classes.button,
            selected: classes.buttonSelected,
          }}
        >
          <AwayIcon fontSize="default" />
        </ToggleButton>
      </div>
    </ResponsiveTooltip>
  );
};
