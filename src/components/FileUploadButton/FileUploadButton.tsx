import { UploadIcon } from '@components/icons/UploadIcon';
import { Button, CircularProgress, makeStyles, useTheme } from '@material-ui/core';
import { getFileDropItems } from '@utils/getFileDropItems';
import clsx from 'clsx';
import * as React from 'react';

export interface FileUploadButtonProps {
  value: File | null;
  onChange: (file: File) => void;
  accept?: string;
  loading?: boolean;
}

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
    justifyContent: 'center',
    padding: theme.spacing(2),
    borderRadius: theme.shape.contentBorderRadius,
    cursor: 'pointer',
    marginBottom: theme.spacing(1),
    position: 'relative',
    backgroundColor: theme.palette.brandColors.slate.light,
    backgroundSize: 'cover',
    color: theme.palette.brandColors.slate.ink,
  },
  label: {
    color: 'inherit',
    fontWeight: theme.typography.button.fontWeight,
  },
  hiddenInput: {
    display: 'none',
  },
  icon: {
    color: 'inherit',
    width: 32,
    height: 32,
    marginBottom: theme.spacing(0.5),
  },
  spinner: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
  },
  dropping: {
    backgroundColor: theme.palette.brandColors.lavender.light,
  },
}));

export function FileUploadButton({ value, onChange, accept, loading }: FileUploadButtonProps) {
  const classes = useStyles();
  const theme = useTheme();
  const [isDropping, setIsDropping] = React.useState(false);

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

      onChange(filteredFiles[0]);
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
      const file = ev.target.files?.item(0);
      if (!file) return;
      onChange(file);
    },
    [onChange]
  );

  const imageUrl = React.useMemo(() => {
    if (value?.type.startsWith('image')) {
      return URL.createObjectURL(value);
    }
  }, [value]);

  React.useEffect(() => {
    if (imageUrl) {
      return () => {
        URL.revokeObjectURL(imageUrl);
      };
    }
  }, [imageUrl]);

  const inputRef = React.useRef<HTMLInputElement | null>(null);

  return (
    <label htmlFor="wallpaperUpload" className={classes.root}>
      <input
        accept={accept}
        type="file"
        id="wallpaperUpload"
        onChange={onDirectUpload}
        className={classes.hiddenInput}
        ref={inputRef}
      />
      <div
        onDragEnter={onDragEnter}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        color="inherit"
        style={{
          backgroundImage: imageUrl ? `url(${imageUrl})` : 'none',
        }}
        className={clsx(classes.button, isDropping && classes.dropping)}
      >
        {loading ? (
          <div className={classes.spinner}>
            <CircularProgress />
          </div>
        ) : (
          <>
            <UploadIcon fontSize="large" className={classes.icon} />
            <span className={classes.label}>{getAcceptsLabel(accept)}</span>
          </>
        )}
      </div>
      <Button disabled={loading} onClick={() => inputRef.current?.click()}>
        Upload
      </Button>
    </label>
  );
}

function getAcceptsLabel(accepts?: string) {
  if (!accepts) return 'Upload file';

  return (
    accepts
      .split(',')
      // omit .jpeg, it's paired with .jpg which is fine by itself
      .filter((fileType) => fileType.trim().toLowerCase() !== '.jpeg')
      .map((type) => type.trim().replace('.', ''))
      .join(', ')
  );
}
