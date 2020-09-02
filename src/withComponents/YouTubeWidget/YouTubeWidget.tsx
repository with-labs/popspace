import React, { RefObject, useState, useEffect } from 'react';
import clsx from 'clsx';
import { Widget } from '../Widget/Widget';
import { useWidgetContext } from '../../withHooks/useWidgetContext/useWidgetContext';
import { LocationTuple } from '../../types';
import { FormInputV2 as FormInput } from '../FormInputV2/FormInputV2';
import { WidgetTypes } from '../WidgetProvider/widgetTypes';
import YouTube from 'react-youtube';
import styles from './YouTubeWidget.module.css';

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
    // check to see if the url is valid, using the full and short youtube url
    if (/^(https?:\/\/)?((www\.)?youtube\.com|youtu\.?be)\/.+$/.test(videoUrl)) {
      // strip the video id out of the
      // TODO: sanitize inputs? check for issues?
      const tempVideoId = videoUrl.split('?v=')[1];
      if (tempVideoId) {
        // we have a video id
        // update the widet info
        updateWidgetData(id, {
          ...data,
          isPublished: true,
          videoId: tempVideoId,
          isPlaying: false,
        });
      } else {
        // set invalid url
        setFormError('Cannot find video id.');
      }
    } else {
      // set invalid url
      setFormError('Please provide a valid URL.');
    }
  };

  const onCloseHandler = () => {
    removeWidget(id);
  };

  let videoPlayerContent = (
    <div className={styles.youtubeContainer}>
      <form onSubmit={handlePublish}>
        <FormInput
          classNames={styles.videoUrlInput}
          placeholderText={'Video Url'}
          value={videoUrl}
          onChangeHandler={setVideoUrl}
        />
        <div className={styles.error}>{formError}</div>
        <button type="submit" className={clsx('u-fontB1', styles.addVideoButton)}>
          Add a Video
        </button>
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

    videoPlayerContent = (
      <div className={styles.youtubePlayerContainer}>
        <YouTube
          opts={{
            height: '270',
            width: '480',
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
  );
};
