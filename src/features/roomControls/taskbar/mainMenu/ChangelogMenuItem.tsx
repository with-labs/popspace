import * as React from 'react';
import { IconButton } from '@material-ui/core';
import { WhatsNewIcon } from '../../../../components/icons/WhatsNewIcon';

export interface IChangelogMenuItemProps {
  onClick?: () => void;
  onChangelogUpdated?: () => void;
  className?: string;
}

export const ChangelogButton = React.forwardRef<HTMLButtonElement, IChangelogMenuItemProps>(
  ({ onClick, ...rest }, ref) => {
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

    return (
      <IconButton size="small" ref={ref} onClick={onClick} data-canny-changelog {...rest}>
        <WhatsNewIcon />
      </IconButton>
    );
  }
);
