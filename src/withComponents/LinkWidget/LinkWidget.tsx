import React, { RefObject, MouseEvent } from 'react';
import clsx from 'clsx';
import Tooltip from '@material-ui/core/Tooltip';
import { Widget } from '../Widget/Widget';
import { RemoteParticipant, LocalParticipant } from 'twilio-video';
import useParticipantDisplayIdentity from '../../withHooks/useParticipantDisplayIdentity/useParticipantDisplayIdentity';
import { LocationTuple } from '../../types';
import styles from './LinkWidget.module.css';

interface ILinkWidget {
  id: string;
  title: string;
  url: string;
  participant?: LocalParticipant | RemoteParticipant;
  onCloseHandler: (event: MouseEvent) => void;
  dragConstraints: RefObject<Element>;
  position?: LocationTuple;
  classNames?: string;
}

export const LinkWidget: React.FC<ILinkWidget> = ({
  id,
  url,
  participant,
  onCloseHandler,
  title,
  dragConstraints,
  position,
  classNames,
}) => {
  const participantDisplayIdentity = useParticipantDisplayIdentity(participant);
  return (
    <Widget
      id={id}
      title="Link"
      classNames={clsx(styles.linkWidget, classNames)}
      onCloseHandler={onCloseHandler}
      dragConstraints={dragConstraints}
      position={position}
    >
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
