import sharp from 'sharp';

const THUMBNAIL_SIZE = 80;

export const generateThumbnail = (data: Buffer) => {
  const image = sharp(data);

  return image
    .resize({
      width: THUMBNAIL_SIZE,
      height: THUMBNAIL_SIZE,
      fit: sharp.fit.cover,
      position: sharp.strategy.attention,
    })
    .toBuffer();
};

export const extractDominantColor = async (data: Buffer) => {
  const image = sharp(data);

  const stats = await image.stats();
  const { r, g, b } = stats.dominant;
  return `rgb(${r}, ${g}, ${b})`;
};
