import * as React from 'react';
import { IconButton } from '@material-ui/core';
import { WhatsNewIcon } from '@components/icons/WhatsNewIcon';
import { useAnalytics, IncludeData } from '@hooks/useAnalytics/useAnalytics';
import { EventNames } from '@analytics/constants';
export interface IChangelogMenuItemProps {
  onClick?: () => void;
  onChangelogUpdated?: () => void;
  className?: string;
}

export const ChangelogButton = React.forwardRef<HTMLButtonElement, IChangelogMenuItemProps>(
  ({ onClick, ...rest }, ref) => {
    const { trackEvent } = useAnalytics([IncludeData.roomId]);

    // register changelog state every time this component mounts
    React.useEffect(() => {
      if (process.env.REACT_APP_CANNY_APP_ID) {
        Canny('initChangelog', {
          appID: process.env.REACT_APP_CANNY_APP_ID,
          position: 'top',
          align: 'left',
        });
      }
    }, []);

    const handleClick = () => {
      trackEvent(EventNames.BUTTON_CLICKED, { name: 'changelog' });
      if (onClick) {
        onClick();
      }
    };

    return (
      <IconButton size="small" ref={ref} onClick={handleClick} data-canny-changelog {...rest}>
        <WhatsNewIcon />
      </IconButton>
    );
  }
);
