import client from '@api/client';
import { Spacing } from '@components/Spacing/Spacing';
import { Button } from '@material-ui/core';
import { useCallback } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { WidgetType } from '@api/roomState/types/widgets';

export function useDeleteWidget(widgetId: string, type: WidgetType) {
  const { t } = useTranslation();

  return useCallback(() => {
    client.widgets.deleteWidget({ widgetId });
    if (type !== WidgetType.SidecarStream) {
      toast(
        (info) => (
          <Spacing alignItems="center">
            <span style={{ whiteSpace: 'nowrap' }}>{t('widgets.common.deleted')}</span>
            <Button
              size="small"
              onClick={() => {
                client.widgets.undoLastDelete();
                toast.dismiss(info.id);
              }}
            >
              {t('widgets.common.undoDelete')}
            </Button>
          </Spacing>
        ),
        {
          duration: 5000,
        }
      );
    }
  }, [widgetId, t, type]);
}
