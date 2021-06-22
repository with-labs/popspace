module.exports = function (eleventyConfig) {
  eleventyConfig.setTemplateFormats([
    'html',
    'njk',
    'gif',
    'png',
    'jpg',
    'svg',
    'webp',
    'webm',
    'mp4',
    'css',
    'woff',
    'woff2',
    'ttf',
    'txt',
    'srt',
    'vtt',
    'otf',
    'ico',
  ]);
  eleventyConfig.addPassthroughCopy({ 'src/static': '/' });
};
