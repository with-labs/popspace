import { UploadIcon } from '@components/icons/UploadIcon';
import { Button, makeStyles, useTheme } from '@material-ui/core';
import { animated, useSpring } from '@react-spring/web';
import { getFileDropItems } from '@utils/getFileDropItems';
import clsx from 'clsx';
import * as React from 'react';

export interface FileUploadButtonProps {
  onChange: (files: File[]) => void;
  accept?: string;
}

const AnimatedButton = animated(Button);

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundSize: 'cover',
    borderRadius: theme.shape.contentBorderRadius,
  },
  button: {
    minHeight: 120,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: theme.spacing(2),
    borderRadius: theme.shape.contentBorderRadius,
    cursor: 'pointer',
  },
  label: {},
  hasBackground: {
    color: theme.palette.common.white,
  },
  hiddenInput: {
    display: 'none',
  },
  icon: {
    width: 64,
    height: 64,
  },
}));

export function FileUploadButton({ onChange, accept }: FileUploadButtonProps) {
  const classes = useStyles();
  const theme = useTheme();
  const [isDropping, setIsDropping] = React.useState(false);

  const [file, setFile] = React.useState<File | null>(null);

  const styles = useSpring({
    backgroundColor: isDropping ? theme.palette.brandColors.lavender.light : 'transparent',
  });

  const onDrop = React.useCallback(
    (event: React.DragEvent) => {
      const files = getFileDropItems(event);
      if (!files) return;

      event.preventDefault();

      // filter files
      const acceptTypes = accept ? accept.split(',').map((s) => s.toLowerCase()) : [];
      const filteredFiles = files.filter((file) => {
        if (accept) {
          return acceptTypes.some((fileType) => file.name.toLowerCase().endsWith(fileType));
        }
        return true;
      });

      if (!filteredFiles.length) return;

      setFile(filteredFiles[0]);
      onChange(filteredFiles);
    },
    [onChange, accept]
  );

  const onDragEnter = React.useCallback((ev: React.DragEvent) => {
    setIsDropping(true);
  }, []);

  const onDragOver = React.useCallback((ev: React.DragEvent) => {
    ev.preventDefault();
  }, []);

  const onDragLeave = React.useCallback((ev: React.DragEvent) => {
    setIsDropping(false);
  }, []);

  const onDirectUpload = React.useCallback(
    (ev: React.ChangeEvent<HTMLInputElement>) => {
      if (!ev.target.files) return;
      const files = [];
      for (const file of ev.target.files) {
        files.push(file);
      }
      setFile(files[0]);
      onChange(files);
    },
    [onChange]
  );

  const imageUrl = React.useMemo(() => {
    if (file?.type.startsWith('image')) {
      return URL.createObjectURL(file);
    }
  }, [file]);

  React.useEffect(() => {
    if (imageUrl) {
      return () => {
        URL.revokeObjectURL(imageUrl);
      };
    }
  }, [imageUrl]);

  return (
    <label
      htmlFor="wallpaperUpload"
      className={clsx(imageUrl && classes.hasBackground, classes.root)}
      style={{ backgroundImage: imageUrl ? `url(${imageUrl})` : undefined }}
    >
      <input
        accept={accept}
        type="file"
        id="wallpaperUpload"
        onChange={onDirectUpload}
        className={classes.hiddenInput}
      />
      <animated.div
        style={styles}
        onDragEnter={onDragEnter}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        color="inherit"
        className={classes.button}
      >
        <UploadIcon fontSize="large" className={classes.icon} />
        <span className={classes.label}>{getAcceptsLabel(accept)}</span>
      </animated.div>
    </label>
  );
}

function getAcceptsLabel(accepts?: string) {
  if (!accepts) return 'Upload file';

  return accepts
    .split(',')
    .map((type) => type.trim())
    .join(', ');
}
