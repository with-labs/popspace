import React from 'react';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core';

interface IPanelImageProps {
  src: string;
  altTextKey: string;
}

const useStyles = makeStyles((theme) => ({
  imageContainer: {
    maxWidth: '100%',
    borderRadius: theme.shape.borderRadius,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    maxWidth: 600,
    display: 'block',
  },
}));

/**
 * PanelImage is a special layout component for displaying large images in the two colun layout that will
 * fill out the entire space it is given
 *
 * @param src image source string
 * @param atlTextKey react-i18next translation key that represents the alt text for the image
 */
export const PanelImage: React.FC<IPanelImageProps> = ({ src, altTextKey }) => {
  const { t } = useTranslation();
  const classes = useStyles();

  return (
    <div className={classes.imageContainer}>
      <img className={classes.image} src={src} alt={t(altTextKey)} />
    </div>
  );
};
