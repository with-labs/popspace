import React, { RefObject, useState, useEffect } from 'react';
import { Widget } from '../Widget/Widget';
import { useWidgetContext } from '../../withHooks/useWidgetContext/useWidgetContext';
import { LocationTuple } from '../../types';
import { Colors } from '../../constants/ColorEnum';
import YouTube from 'react-youtube';
import styles from './YouTubeWidget.module.css';
import { Button, TextField, ThemeProvider } from '@material-ui/core';
import { cherry } from '../../theme/theme';

interface IYoutubeWidgetData {
  isPublished: boolean;
  timeStamp?: number;
  isPlaying?: boolean;
  videoId: string;
}

interface IYouTubeWidget {
  id: string;
  dragConstraints: RefObject<Element>;
  position?: LocationTuple;
  data: IYoutubeWidgetData;
}

// TODO:
// - need to resolve seek and pause issue
// - need to resolve issue with having a video playing and having a person join the room
//   and not having the time be sync'd. ie: if the video is playing when a new user has entered the room
//   will be at the last known
// - improve the publish url parser, to better handle the other paramters and shortened urls

export const YouTubeWidget: React.FC<IYouTubeWidget> = ({ id, dragConstraints, position, data }) => {
  const { isPublished, timeStamp = 0, isPlaying, videoId } = data;
  const { removeWidget, updateWidgetData } = useWidgetContext();
  const [videoUrl, setVideoUrl] = useState('');
  const [formError, setFormError] = useState('');
  const [currentTimeStamp, setCurrentTimeStamp] = useState(-1);
  const [player, setPlayer] = useState<YT.Player>();
  const [playerVars, setPlayerVars] = useState<{ [key: string]: any }>({});

  // check if video status has changed
  useEffect(() => {
    if (isPlaying) {
      player?.playVideo();
    } else {
      player?.pauseVideo();
    }
  }, [player, isPlaying]);

  // sync up seek change
  useEffect(() => {
    // TODO: there is something up with seeking and causing the video to
    // pause, need to investigate this more
    if (Math.abs(timeStamp - currentTimeStamp - 1) > 0.5) {
      player?.seekTo(timeStamp, true);
      setCurrentTimeStamp(timeStamp);
    }
  }, [player, timeStamp, currentTimeStamp]);

  const handlePublish = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const videoOptions: { [key: string]: any } = {};

    // youtube regEx
    var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;

    // get the video ID if its valid
    var match = videoUrl.match(regExp);

    // check to see if we have match
    // video ids are always 11 characters
    if (match && match[2].length === 11) {
      // match will return our video id, so get it here
      const newVideoId = match[2];

      // check to see if we have query params and parse them out
      const querySplit = videoUrl.split('?');
      if (querySplit.length === 2) {
        const queryString = querySplit[1];

        // split the query
        const variables = queryString.split('&');

        // get the content
        variables.forEach((variable) => {
          const splitVar = variable.split('=');

          //TODO: expand on this list of supported things, but
          // but for now jus support start and end times and t as start
          if (splitVar[0] === 'start' || splitVar[0] === 'end' || splitVar[0] === 't') {
            // TODO: check if we have a time string like '1m22s' or just a seonds value
            videoOptions[splitVar[0] === 't' ? 'start' : splitVar[0]] = parseInt(splitVar[1], 10);
          }
        });
      }

      setPlayerVars(videoOptions);

      // update the widet info
      updateWidgetData(id, {
        ...data,
        isPublished: true,
        videoId: newVideoId,
        isPlaying: false,
      });
    } else {
      //error
      let errorText = 'Please provide a valid URL.';

      if (match && match[2].length !== 11) {
        errorText = 'invalid video id';
      }
      setFormError(errorText);
    }
  };

  const onCloseHandler = () => {
    removeWidget(id);
  };

  let videoPlayerContent = (
    <div className={styles.youtubeContainer}>
      <form onSubmit={handlePublish} className={styles.youtubeForm}>
        <TextField
          id={`youtubeWidget-${id}`}
          className={styles.videoUrlInput}
          value={videoUrl}
          onChange={(event) => setVideoUrl(event.target.value)}
          placeholder={'Video Url'}
          error={formError.length > 0}
          helperText={formError}
          margin="normal"
        />
        <Button type="submit" className={styles.addVideoButton}>
          Add a video
        </Button>
      </form>
    </div>
  );

  if (isPublished) {
    // setup all the needed functions for the video player
    // functiont that is called when the player is ready
    const handleOnReady = (event: any) => {
      // target in this case is the current player
      const { target } = event;
      if (target) {
        if (!isPlaying) {
          // inital load, so we just pause the video
          // when a new video is added to the room we pause it
          target.pauseVideo();
        } else if (isPlaying) {
          // else we playing the video
          target.playVideo();
        }

        // get the inital timestamp
        setCurrentTimeStamp(target.getCurrentTime());
        // set the player object so we can call other functions from it
        setPlayer(target);
      }
    };

    // function called when the play event is called from the player
    const handleOnPlay = (event: any) => {
      // check to see if
      if (!isPlaying && player) {
        const currentTime = player.getCurrentTime();
        setCurrentTimeStamp(currentTime);

        // change isPlaying to true
        updateWidgetData(id, {
          ...data,
          isPlaying: true,
          timeStamp: currentTime,
        });
      }
    };

    // function called when the pause event is called
    const handleOnPause = (event: any) => {
      if (isPlaying && player) {
        const currentTime = player.getCurrentTime();
        setCurrentTimeStamp(currentTime);

        // change isPlaying to false
        updateWidgetData(id, {
          ...data,
          isPlaying: false,
          timeStamp: currentTime,
        });
      }
    };

    // TODO: I am seeing more and more issues using this lib, such as player opt not being set correctly,
    // might want to just suck it up and make our own component it seems
    videoPlayerContent = (
      <div className={styles.youtubePlayerContainer}>
        <YouTube
          opts={{
            height: '270',
            width: '480',
            playerVars: { ...playerVars },
          }}
          videoId={videoId}
          onPlay={handleOnPlay}
          onPause={handleOnPause}
          onReady={handleOnReady}
          className={styles.youtubePlayerBorder}
        />
      </div>
    );
  }

  return (
    <ThemeProvider theme={cherry}>
      <Widget
        id={id}
        title="YouTube - beta"
        classNames={styles.youtube}
        titleClassNames={styles.title}
        onCloseHandler={onCloseHandler}
        position={position}
        dragConstraints={dragConstraints}
      >
        {videoPlayerContent}
      </Widget>
    </ThemeProvider>
  );
};
