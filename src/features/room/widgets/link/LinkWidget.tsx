import * as React from 'react';
import { WidgetFrame } from '../WidgetFrame';
import { WidgetTitlebar } from '../WidgetTitlebar';
import { EditLinkWidgetForm } from './EditLinkWidgetForm';
import { WidgetContent } from '../WidgetContent';
import { useTranslation } from 'react-i18next';
import { WidgetType } from '@api/roomState/types/widgets';
import { DocumentLinkWidget } from './DocumentLinkWidget';
import { useWidgetContext } from '../useWidgetContext';
import { ThemeName } from '../../../../theme/theme';
import { MAX_SIZE_EDIT, MIN_SIZE_EDIT } from './constants';
import { useIsMe } from '@api/useIsMe';

export interface ILinkWidgetProps {}

export const LinkWidget: React.FC<ILinkWidgetProps> = () => {
  const { t } = useTranslation();

  const { save, widget: state } = useWidgetContext<WidgetType.Link>();
  const isMine = useIsMe(state.creatorId);

  if (!state.widgetState.url) {
    if (isMine) {
      return (
        <WidgetFrame
          color={ThemeName.Lavender}
          minWidth={MIN_SIZE_EDIT.width}
          minHeight={MIN_SIZE_EDIT.height}
          maxWidth={MAX_SIZE_EDIT.width}
          maxHeight={MAX_SIZE_EDIT.height}
        >
          <WidgetTitlebar title={t('widgets.link.addWidgetTitle')} />
          <WidgetContent>
            <EditLinkWidgetForm onSave={save} />
          </WidgetContent>
        </WidgetFrame>
      );
    } else {
      // this widget doesn't have a link yet and it isn't ours - the owner is probably
      // typing or pasting a link right now. don't render anything yet.
      return null;
    }
  }

  return <DocumentLinkWidget />;
};
