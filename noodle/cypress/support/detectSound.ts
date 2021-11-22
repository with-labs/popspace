export default function detectSound(audioEl: any) {
  const stream = audioEl.captureStream();
  const audioContext = new AudioContext();
  const source = audioContext.createMediaStreamSource(stream);
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 2048;
  source.connect(analyser);
  let results = [];
  let reqId: NodeJS.Timeout;

  return new Promise((resolve) => {
    function detect() {
      const samples = new Uint8Array(analyser.fftSize);
      analyser.getByteTimeDomainData(samples);
      results.push(samples.some((i) => i !== 128));
      if (results.length > 50) {
        source.disconnect();
        clearTimeout(reqId);
        resolve(results.some((result) => result));
      } else {
        reqId = setTimeout(detect, 50);
      }
    }
    detect();
  });
}
