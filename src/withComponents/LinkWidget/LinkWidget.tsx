import React, { RefObject, MouseEvent, useState } from 'react';
import clsx from 'clsx';
import Tooltip from '@material-ui/core/Tooltip';
import { Widget } from '../Widget/Widget';
import { Participant } from 'twilio-video';
import useParticipantDisplayIdentity from '../../withHooks/useParticipantDisplayIdentity/useParticipantDisplayIdentity';
import { useWidgetContext } from '../../withHooks/useWidgetContext/useWidgetContext';
import { LocationTuple } from '../../types';
import { FormInputV2 as FormInput } from '../FormInputV2/FormInputV2';
import { WidgetTypes } from '../../withComponents/WidgetProvider/widgetTypes';

import styles from './LinkWidget.module.css';

interface ILinkWidget {
  id: string;
  title: string;
  url: string;
  participant?: Participant;
  onCloseHandler: (event: MouseEvent) => void;
  dragConstraints: RefObject<Element>;
  position?: LocationTuple;
  classNames?: string;
  isPublished: boolean;
  initialOffset?: number;
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
  isPublished,
  initialOffset = 0,
}) => {
  const { updateWidgetData } = useWidgetContext();
  const [titleText, setTitleText] = useState(title);
  const [urlText, setUrlText] = useState(url);
  const [formError, setFormError] = useState('');

  const participantDisplayIdentity = useParticipantDisplayIdentity(participant);

  const handlePublish = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (/^(?:http(s)?:\/\/)[\w.-]+(?:\.[\w.-]+)+[\w\-._~:/?#[\]@!$&'()*+,;=.]+$/.test(urlText)) {
      updateWidgetData(id, {
        isPublished: true,
        title: titleText.length === 0 ? urlText : titleText,
        url: urlText,
        initialOffset,
      });
    } else {
      // Set the invalid url message.
      setFormError('Please provide a valid URL.');
    }
  };

  const linkContent = isPublished ? (
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
  ) : (
    <div>
      <form onSubmit={handlePublish}>
        <FormInput
          classNames={styles.linkInput}
          placeholderText={'Title'}
          value={titleText}
          onChangeHandler={setTitleText}
        />
        <FormInput placeholderText={'Url'} value={urlText} onChangeHandler={setUrlText} />
        <div className={styles.error}>{formError}</div>
        <button type="submit" className={clsx('u-fontB1', styles.createLinkButton)}>
          Add a link
        </button>
      </form>
    </div>
  );

  return (
    <Widget
      id={id}
      title="Link"
      classNames={clsx(styles.linkWidget, classNames)}
      onCloseHandler={onCloseHandler}
      dragConstraints={dragConstraints}
      position={position}
      initialOffset={initialOffset}
      type={WidgetTypes.Link}
    >
      {linkContent}
    </Widget>
  );
};
