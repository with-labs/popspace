import { Box, Button, CircularProgress, Typography } from '@material-ui/core';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { DraggableHandle } from '../../DraggableHandle';
import { useWidgetContext } from '../useWidgetContext';
import { WidgetContent } from '../WidgetContent';
import { WidgetFrame } from '../WidgetFrame';
import { ThemeName } from '../../../../theme/theme';

export function UploadingWidget() {
  const { t } = useTranslation();

  const { remove } = useWidgetContext();

  return (
    <WidgetFrame color={ThemeName.Snow}>
      <DraggableHandle>
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
      </DraggableHandle>
    </WidgetFrame>
  );
}
