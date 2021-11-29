const PeerConnection: typeof RTCPeerConnection =
  typeof RTCPeerConnection !== 'undefined'
    ? RTCPeerConnection
    : // @ts-ignore
    typeof webkitRTCPeerConnection !== 'undefined'
    ? // @ts-ignore
      webkitRTCPeerConnection
    : // @ts-ignore
    typeof mozRTCPeerConnection !== 'undefined'
    ? // @ts-ignore
      mozRTCPeerConnection
    : null;

let isH264Supported: boolean | undefined = undefined;

/**
 * Test support for H264 codec.
 * @returns {Promise<boolean>} true if supported, false if not
 */
export async function testH264Support(): Promise<boolean> {
  if (typeof isH264Supported === 'boolean') {
    return isH264Supported;
  }
  if (!PeerConnection) {
    isH264Supported = false;
    return isH264Supported;
  }

  let offerOptions: RTCOfferOptions = {};
  const pc = new PeerConnection();
  try {
    pc.addTransceiver('video');
  } catch (e) {
    offerOptions.offerToReceiveVideo = true;
  }

  const offer = await pc.createOffer(offerOptions);
  isH264Supported = !!offer.sdp && /^a=rtpmap:.+ H264/m.test(offer.sdp);
  return isH264Supported;
}
