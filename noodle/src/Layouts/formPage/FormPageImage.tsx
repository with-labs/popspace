/* eslint-disable jsx-a11y/alt-text */
import { Theme, makeStyles, useMediaQuery } from '@material-ui/core';
import clsx from 'clsx';
import * as React from 'react';
import textureEdge from '../../images/illustrations/textured_side_transparent.png';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    height: '100%',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    gridArea: 'image',
    position: 'relative',

    '&::before': {
      content: '""',
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      right: 'auto',
      width: 16,
      backgroundImage: `url(${textureEdge})`,
      backgroundRepeat: 'repeat-y',
      backgroundSize: 'contain',
    },

    [theme.breakpoints.down('md')]: {
      backgroundPositionY: 'bottom',

      '&::before': {
        display: 'none',
      },
    },
  },
}));

export function FormPageImage({
  src,
  mobileSrc,
  ...props
}: React.HTMLAttributes<HTMLImageElement> & { src: string; mobileSrc: string }) {
  const classes = useStyles();

  const isMobile = useMediaQuery<Theme>((theme) => theme.breakpoints.down('md'));
  const currentSrc = isMobile ? mobileSrc : src;

  return (
    <div {...props} className={clsx(classes.root, props.className)} style={{ backgroundImage: `url(${currentSrc})` }} />
  );
}
