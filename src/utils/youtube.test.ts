import { parseYoutubeLink } from './youtube';

describe('youtube url parser', () => {
  it('parses a basic video URL', () => {
    expect(parseYoutubeLink('https://youtube.com/watch?v=MWcf_ZkYJhY')).toEqual({
      videoId: 'MWcf_ZkYJhY',
      start: null,
      end: null,
      timestamp: null,
    });
  });

  it('parses a shortlink', () => {
    expect(parseYoutubeLink('https://youtu.be/MWcf_ZkYJhY')).toEqual({
      videoId: 'MWcf_ZkYJhY',
      start: null,
      end: null,
      timestamp: null,
    });

    expect(parseYoutubeLink('https://y2u.be/MWcf_ZkYJhY')).toEqual({
      videoId: 'MWcf_ZkYJhY',
      start: null,
      end: null,
      timestamp: null,
    });
  });

  it('parses with www subdomain', () => {
    expect(parseYoutubeLink('https://www.youtube.com/watch?v=MWcf_ZkYJhY')).toEqual({
      videoId: 'MWcf_ZkYJhY',
      start: null,
      end: null,
      timestamp: null,
    });
  });

  it('parses start, end, and timestamp', () => {
    expect(parseYoutubeLink('https://www.youtube.com/watch?v=MWcf_ZkYJhY&t=100&start=2&end=300')).toEqual({
      videoId: 'MWcf_ZkYJhY',
      start: 2,
      end: 300,
      timestamp: 100,
    });
  });

  it('returns null for invalid URLs', () => {
    expect(parseYoutubeLink('foo')).toEqual(null);
  });

  it('returns null for non-Youtube URLs', () => {
    expect(parseYoutubeLink('http://google.com')).toEqual(null);
  });

  it('returns null for the Youtube homespage', () => {
    expect(parseYoutubeLink('https://youtube.com/')).toEqual(null);
  });
});
