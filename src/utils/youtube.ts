const SHORTLINKS = ['youtu.be', 'y2u.be'];

export function parseYoutubeLink(link: string) {
  try {
    const url = new URL(link);

    const isShortlink = SHORTLINKS.some((host) => url.host.endsWith(host));
    const isYoutubeUrl = url.host.endsWith('youtube.com') || isShortlink;
    const isVideoPath = isShortlink || url.pathname === '/watch' || url.pathname === '/embed';

    if (!(isYoutubeUrl && isVideoPath)) {
      return null;
    }

    const videoId = isShortlink ? url.pathname.slice(1) : url.searchParams.get('v');
    const startStr = url.searchParams.get('start');
    const endStr = url.searchParams.get('end');
    const timestampStr = url.searchParams.get('t');

    if (!videoId) return null;

    return {
      videoId,
      start: startStr && parseInt(startStr, 10),
      end: endStr && parseInt(endStr, 10),
      timestamp: timestampStr && parseInt(timestampStr, 10),
    };
  } catch (err) {
    return null;
  }
}
