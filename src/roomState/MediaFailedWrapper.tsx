import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Typography } from '@material-ui/core';
import { Warning } from '@material-ui/icons';
import * as React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link } from '../components/Link/Link';
import { HelpIcon } from '../components/icons/HelpIcon';
import { ResponsiveTooltip } from '../components/ResponsiveTooltip/ResponsiveTooltip';
import { Spacing } from '../components/Spacing/Spacing';
import { USER_SUPPORT_EMAIL } from '../constants/User';
import { useRoomStatus } from '../providers/twilio/hooks/useRoomStatus';
import { TwilioStatus } from '../providers/twilio/TwilioProvider';

export interface IMediaFailedWrapperProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * A wrapper which displays a tooltip proactively when our media connection
 * to Twilio goes into a failed state
 */
export const MediaFailedWrapper: React.FC<IMediaFailedWrapperProps> = (props) => {
  const roomStatus = useRoomStatus();
  const { t } = useTranslation();

  const [open, setOpen] = React.useState(false);

  return (
    <>
      <ResponsiveTooltip
        interactive
        title={
          <Spacing flexDirection="row" alignItems="center" gap={0.25}>
            <Warning color="error" fontSize="small" style={{ marginRight: 8 }} />
            <Typography style={{ fontSize: 12 }}>{t('error.twilioFailure.tooltip')}</Typography>
            <IconButton size="small" onClick={() => setOpen(true)}>
              <HelpIcon fontSize="small" />
            </IconButton>
          </Spacing>
        }
        open={roomStatus === TwilioStatus.Disconnected}
      >
        <div {...props} />
      </ResponsiveTooltip>
      <MediaHelpModal open={open} onClose={() => setOpen(false)} />
    </>
  );
};

const MediaHelpModal: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{t('error.twilioFailure.tooltip')}</DialogTitle>
      <DialogContent>
        <Typography paragraph>
          <Trans i18nKey="error.twilioFailure.explainer">
            We lost our media connection (sorry!). Audio and video are unavailable. Check your internet status, try
            refreshing, and <Link to={`mailto:${USER_SUPPORT_EMAIL}`}>contact us</Link> if this persists.
          </Trans>
        </Typography>
      </DialogContent>
      <DialogActions style={{ flexDirection: 'column', display: 'flex' }}>
        <Button color="primary" onClick={() => window.location.reload()}>
          {t('error.twilioFailure.refresh')}
        </Button>
        <Button variant="text" color="inherit" onClick={onClose}>
          {t('error.twilioFailure.continue')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
