export function attachTrack(el: HTMLMediaElement, track: MediaStreamTrack) {
  const mediaStream = new MediaStream();

  el.autoplay = true;

  if (track.kind === 'video') {
    if (!isVideoElement(el)) {
      throw new Error(
        'attachTrack for a video track only works with video elements',
      );
    }
    el.playsInline = true;
    el.muted = true;
    // NOT A MISTAKE - Safari won't play the video without toggling this
    // on and off...
    el.controls = true;
    el.controls = false;

    if (mediaStream.getVideoTracks().length === 0) {
      mediaStream.addTrack(track);
    } else {
      mediaStream.removeTrack(mediaStream.getVideoTracks()[0]);
      mediaStream.addTrack(track);
    }
  } else if (track.kind === 'audio') {
    if (mediaStream.getAudioTracks().length === 0) {
      mediaStream.addTrack(track);
    } else {
      mediaStream.removeTrack(mediaStream.getAudioTracks()[0]);
      mediaStream.addTrack(track);
    }
  } else {
    throw new Error('Cannot attach track of kind ' + track.kind);
  }

  el.srcObject = mediaStream;
  return () => {
    // stop media
    el.pause();
    el.srcObject = null;
    el.load();
    // cleanup stream
    for (const track of mediaStream.getTracks().slice()) {
      mediaStream.removeTrack(track);
    }
  };
}

function isVideoElement(el: HTMLMediaElement): el is HTMLVideoElement {
  return el.tagName === 'VIDEO';
}
