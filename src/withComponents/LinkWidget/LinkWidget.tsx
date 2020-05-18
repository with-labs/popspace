import React from 'react';
import clsx from 'clsx';
import Tooltip from '@material-ui/core/Tooltip';
import { Widget } from '../Widget/Widget';
import { RemoteParticipant, LocalParticipant } from 'twilio-video';
import useParticipantDisplayIdentity from '../../withHooks/useParticipantDisplayIdentity/useParticipantDisplayIdentity';

import styles from './LinkWidget.module.css';

interface ILinkWidget {
  title: string;
  url: string;
  participant?: LocalParticipant | RemoteParticipant;
  onCloseHandler: Function;
}

export const LinkWidget: React.FC<ILinkWidget> = ({ url, participant, onCloseHandler, title }) => {
  const participantDisplayIdentity = useParticipantDisplayIdentity(participant);
  return (
    <Widget title="Link" classNames={styles.linkWidget} onCloseHandler={() => onCloseHandler()}>
      <div>
        <div className="u-fontP1">
          <Tooltip title={url} placement="bottom" PopperProps={{ disablePortal: true }}>
            <a className={styles.link} href={url} target="_blank" rel="noopener noreferrer">
              {title}
            </a>
          </Tooltip>
        </div>
        <div className={clsx('u-fontP2', styles.addedByText)}>Added by {participantDisplayIdentity}</div>
      </div>
    </Widget>
  );
};
