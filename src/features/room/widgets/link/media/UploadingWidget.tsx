import { Box, CircularProgress, Typography } from '@material-ui/core';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

export function UploadingWidget() {
  const { t } = useTranslation();

  return (
    <Box display="flex" flexDirection="row" alignItems="center" p={2} width={340}>
      <CircularProgress />
      <Box ml={2}>
        <Typography component="span" variant="h3">
          {t('widgets.link.uploading')}
        </Typography>
      </Box>
    </Box>
  );
}
