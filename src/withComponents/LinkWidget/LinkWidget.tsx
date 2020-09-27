import React, { RefObject, useState } from 'react';
import clsx from 'clsx';
import Tooltip from '@material-ui/core/Tooltip';
import { Widget } from '../Widget/Widget';
import { Participant } from 'twilio-video';
import { useWidgetContext } from '../../withHooks/useWidgetContext/useWidgetContext';
import { LocationTuple } from '../../types';
import styles from './LinkWidget.module.css';
import { Button, TextField, ThemeProvider } from '@material-ui/core';
import { lavender } from '../../theme/theme';

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
        onChange={(event) => setTitleText(event.target.value)}
        placeholder={'Title'}
        margin="normal"
      />

      <TextField
        id={`LinkWidgetUrl-${id}`}
        className={styles.linkInput}
        value={urlText}
        onChange={(event) => setUrlText(event.target.value)}
        placeholder={'Url'}
        error={formError.length > 0}
        helperText={formError}
        margin="normal"
      />

      <Button type="submit" className={styles.createLinkButton}>
        Add a link
      </Button>
    </form>
  );

  const onCloseHandler = () => {
    removeWidget(id);
  };

  return (
    <ThemeProvider theme={lavender}>
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
    </ThemeProvider>
  );
};
