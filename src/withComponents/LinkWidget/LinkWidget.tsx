import React, { RefObject, useState } from 'react';
import clsx from 'clsx';
import Tooltip from '@material-ui/core/Tooltip';
import { Widget } from '../Widget/Widget';
import { Participant } from 'twilio-video';
import { useWidgetContext } from '../../withHooks/useWidgetContext/useWidgetContext';
import { LocationTuple } from '../../types';
import { TextField } from '../TextField/TextField';
import { Button, ButtonTypes } from '../Button/Button';
import { Colors } from '../../constants/ColorEnum';
import styles from './LinkWidget.module.css';

interface ILinkWidgetData {
  isPublished: boolean;
  title: string;
  url: string;
}

interface ILinkWidget {
  id: string;
  participant?: Participant;
  dragConstraints: RefObject<Element>;
  position?: LocationTuple;
  classNames?: string;
  data: ILinkWidgetData;
}

export const LinkWidget: React.FC<ILinkWidget> = ({ id, dragConstraints, position, classNames, data }) => {
  // get the needed data from the data object
  const { isPublished, title, url } = data;

  const { updateWidgetData, removeWidget } = useWidgetContext();
  const [titleText, setTitleText] = useState(title);
  const [urlText, setUrlText] = useState(url);
  const [formError, setFormError] = useState('');

  const handlePublish = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (/^(?:http(s)?:\/\/)[\w.-]+(?:\.[\w.-]+)+[\w\-._~:/?#[\]@!$&'()*+,;=.]+$/.test(urlText)) {
      updateWidgetData(id, {
        ...data,
        isPublished: true,
        title: titleText.length === 0 ? urlText : titleText,
        url: urlText,
      });
    } else {
      // Set the invalid url message.
      setFormError('Please provide a valid URL.');
    }
  };

  const linkContent = isPublished ? (
    <div className="u-fontP1">
      <Tooltip title={url} placement="bottom" PopperProps={{ disablePortal: true }}>
        <a className={styles.link} href={url} target="_blank" rel="noopener noreferrer">
          {title}
        </a>
      </Tooltip>
    </div>
  ) : (
    <form onSubmit={handlePublish}>
      <TextField
        id={`LinkWidgetTitle-${id}`}
        className={styles.linkInput}
        value={titleText}
        onChangeHandler={(event: React.ChangeEvent<HTMLInputElement>) => setTitleText(event.target.value)}
        placeholderText={'Title'}
      />

      <TextField
        id={`LinkWidgetUrl-${id}`}
        className={styles.linkInput}
        value={urlText}
        onChangeHandler={(event: React.ChangeEvent<HTMLInputElement>) => setUrlText(event.target.value)}
        placeholderText={'Url'}
        hasError={formError.length > 0}
        helperText={formError}
      />

      <Button
        buttonText="Add a link"
        type={ButtonTypes.SUBMIT}
        buttonColor={Colors.lavender}
        className={styles.createLinkButton}
      />
    </form>
  );

  const onCloseHandler = () => {
    removeWidget(id);
  };

  return (
    <Widget
      id={id}
      title="Link"
      classNames={clsx(styles.linkWidget, classNames)}
      titleClassNames={styles.title}
      onCloseHandler={onCloseHandler}
      dragConstraints={dragConstraints}
      position={position}
    >
      <div className={styles.linkWidgetContainer}>{linkContent}</div>
    </Widget>
  );
};
