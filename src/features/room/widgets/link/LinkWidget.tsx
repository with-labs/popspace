import * as React from 'react';
import { WidgetFrame } from '../WidgetFrame';
import { WidgetTitlebar } from '../WidgetTitlebar';
import { EditLinkWidgetForm } from './EditLinkWidgetForm';
import { WidgetContent } from '../WidgetContent';
import { useTranslation } from 'react-i18next';
import { MediaLinkWidget } from './media/MediaLinkWidget';
import { LinkWidgetShape, WidgetType } from '../../../../roomState/types/widgets';
import { useCurrentUserProfile } from '../../../../hooks/useCurrentUserProfile/useCurrentUserProfile';
import { DocumentLinkWidget } from './documents/DocumentLinkWidget';
import { useWidgetContext } from '../useWidgetContext';
import { UploadingWidget } from './UploadingWidget';

export interface ILinkWidgetProps {}

const MEDIA_TYPE_BLOCK_LIST = ['video/mov'];

function isMedia(widget: LinkWidgetShape) {
  return (
    widget.widgetState.mediaContentType &&
    /^(image|video|audio)/.test(widget.widgetState.mediaContentType) &&
    !MEDIA_TYPE_BLOCK_LIST.includes(widget.widgetState.mediaContentType)
  );
}

export const LinkWidget: React.FC<ILinkWidgetProps> = () => {
  const { t } = useTranslation();

  const { user } = useCurrentUserProfile();

  const { save, widget: state } = useWidgetContext<WidgetType.Link>();

  if (!state.widgetState.url) {
    if (state.ownerId === user?.id) {
      return (
        <WidgetFrame color="lavender">
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

  // media links are rendered differently
  const isMediaWidget = isMedia(state);

  if (state.widgetState.uploadProgress !== undefined && state.widgetState.uploadProgress < 100) {
    return <UploadingWidget />;
  }

  return isMediaWidget ? <MediaLinkWidget /> : <DocumentLinkWidget />;
};
