import { Box, makeStyles, Typography } from '@material-ui/core';
import * as React from 'react';
import { Markdown } from '@components/Markdown/Markdown';

export interface IPasteContentPreviewProps {
  text: string | null;
  files: File[] | null;
}

const useStyles = makeStyles(() => ({
  imagePreview: {
    height: '100%',
    width: 'auto',
    margin: 'auto',
    objectFit: 'cover',
  },
}));

export const PasteContentPreview: React.FC<IPasteContentPreviewProps> = ({ text, files }) => {
  const classes = useStyles();

  if (files) {
    return (
      <Box display="flex" flexDirection="column" width="100%" height="20vh">
        {files.map((file) => {
          if (file.type.startsWith('image')) {
            return <ImagePreview key={file.name} file={file} className={classes.imagePreview} />;
          }
          return <div key={file.name}>{file.name}</div>;
        })}
      </Box>
    );
  }

  return (
    <Box p={2} width="100%" height="20vh">
      <Typography color="textSecondary" style={{ whiteSpace: 'pre' }}>
        <Markdown>{text || ''}</Markdown>
      </Typography>
    </Box>
  );
};

const ImagePreview: React.FC<{ file: File; className?: string }> = ({ file, ...rest }) => {
  const [objectUrl, setObjectUrl] = React.useState(() => {
    return URL.createObjectURL(file);
  });

  React.useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setObjectUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [file]);

  return <img src={objectUrl} alt={file.name} {...rest} />;
};
