import { Box, CircularProgress, Typography } from '@material-ui/core';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Draggable } from '../../Draggable';
import { DraggableHandle } from '../../DraggableHandle';
import { WidgetContent } from '../WidgetContent';
import { WidgetFrame } from '../WidgetFrame';

export function UploadingWidget() {
  const { t } = useTranslation();

  return (
    <WidgetFrame color="snow">
      <DraggableHandle>
        <WidgetContent>
          <Box display="flex" flexDirection="row" alignItems="center" width={340}>
            <CircularProgress />
            <Box ml={2}>
              <Typography component="span" variant="h3">
                {t('widgets.link.uploading')}
              </Typography>
            </Box>
          </Box>
        </WidgetContent>
      </DraggableHandle>
    </WidgetFrame>
  );
}
