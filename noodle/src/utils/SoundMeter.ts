/**
 * Adapted from WebRTC project example code
 *
 * Original comments:
 *
 * Copyright (c) 2014, The WebRTC project authors. All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.

Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

Neither the name of Google nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import { logger } from './logger';

// Safari.
const AudioContext = window.AudioContext || (window as any).webkitAudioContext;

export class SoundMeter {
  private context: AudioContext;
  private script: ScriptProcessorNode;
  private instant = 0.0;
  private slow = 0.0;
  private clip = 0.0;
  private mic: MediaStreamAudioSourceNode | null = null;

  constructor() {
    this.context = new AudioContext();
    this.script = this.context.createScriptProcessor(2048, 1, 1);
    this.script.onaudioprocess = this.process;
  }

  private process = (event: AudioProcessingEvent) => {
    const input = event.inputBuffer.getChannelData(0);
    let i;
    let sum = 0.0;
    let clipcount = 0;
    for (i = 0; i < input.length; ++i) {
      sum += input[i] * input[i];
      if (Math.abs(input[i]) > 0.99) {
        clipcount += 1;
      }
    }
    this.instant = Math.sqrt(sum / input.length);
    this.slow = 0.95 * this.slow + 0.05 * this.instant;
    this.clip = clipcount / input.length;
  };

  connectToStream = (stream: MediaStream) => {
    try {
      this.mic = this.context.createMediaStreamSource(stream);
      this.mic.connect(this.script);
      this.script.connect(this.context.destination);
    } catch (e) {
      logger.error(e);
    }
  };

  connectToTrack = (track: MediaStreamTrack) => {
    try {
      // this might not be supported in the browser - FF only at time of coding
      if ((this.context as any).createMediaStreamTrackSource) {
        this.mic = (this.context as any).createMediaStreamTrackSource(track);
      } else {
        const adHocStream = new MediaStream([track]);
        this.mic = this.context.createMediaStreamSource(adHocStream);
      }
      this.mic?.connect(this.script);
      this.script.connect(this.context.destination);
    } catch (e) {
      logger.error(e);
    }
  };

  stop = () => {
    this.mic?.disconnect();
    this.script.disconnect();
  };

  /**
   * Current volume level of the source
   */
  get volume() {
    return this.instant;
  }
  /**
   * An eased, decaying volume level measured over time for smoother
   * output
   */
  get getEasedVolume() {
    return this.slow;
  }
  /**
   * Percentage of samples which "clipped" (exceeded threshold) in the last
   * buffer
   */
  get clippingLevel() {
    return this.clip;
  }
}
