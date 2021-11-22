import { Box, Button, CircularProgress, Typography } from '@material-ui/core';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useWidgetContext } from '../useWidgetContext';
import { WidgetContent } from '../WidgetContent';
import { WidgetFrame } from '../WidgetFrame';
import { ThemeName } from '@src/theme/theme';
import { CanvasObjectDragHandle } from '@providers/canvas/CanvasObjectDragHandle';

export function UploadingWidget() {
  const { t } = useTranslation();

  const { remove } = useWidgetContext();

  return (
    <WidgetFrame color={ThemeName.Snow} minHeight={80} minWidth={340} resizeDisabled>
      <CanvasObjectDragHandle>
        <WidgetContent>
          <Box display="flex" flexDirection="row" alignItems="center" width={340}>
            <CircularProgress style={{ flex: '0 0 auto' }} />
            <Box mx={2} flex={1}>
              <Typography component="span" variant="h3">
                {t('widgets.link.uploading')}
              </Typography>
            </Box>
            <Button variant="text" onClick={remove} color="inherit" fullWidth={false}>
              {t('widgets.link.uploadCancel')}
            </Button>
          </Box>
        </WidgetContent>
      </CanvasObjectDragHandle>
    </WidgetFrame>
  );
}
