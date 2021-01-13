import { Link, makeStyles, Tooltip } from '@material-ui/core';
import * as React from 'react';
import { useSaveWidget } from '../useSaveWidget';
import { WidgetFrame } from '../WidgetFrame';
import { WidgetTitlebar } from '../WidgetTitlebar';
import { EditLinkWidgetForm } from './EditLinkWidgetForm';
import { WidgetContent } from '../WidgetContent';
import { useTranslation } from 'react-i18next';
import { MediaLinkWidget } from './MediaLinkWidget';
import { LinkWidgetShape, LinkWidgetState } from '../../../../roomState/types/widgets';
import { useCurrentUserProfile } from '../../../../hooks/useCurrentUserProfile/useCurrentUserProfile';

export interface ILinkWidgetProps {
  state: LinkWidgetShape & { ownerId: string };
  /**
   * Called when the user hits the X to close the widget
   */
  onClose: () => void;
}

const useStyles = makeStyles((theme) => ({
  link: {
    position: 'relative',
    display: 'inline-block',
    textDecoration: 'none',
    textOverflow: 'ellipsis',
    width: '100%',
    maxWidth: 400,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    fontSize: theme.typography.pxToRem(13),
    fontWeight: theme.typography.fontWeightRegular,
    color: theme.palette.grey[900],
  },
}));

export const LinkWidget: React.FC<ILinkWidgetProps> = ({ state, onClose }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const { user } = useCurrentUserProfile();

  const saveWidget = useSaveWidget(state.widgetId);

  if (!state.widgetState.url) {
    if (state.ownerId === user?.id) {
      return (
        <WidgetFrame color="lavender" widgetId={state.widgetId}>
          <WidgetTitlebar title={t('widgets.link.addWidgetTitle')} onClose={onClose} />
          <WidgetContent>
            <EditLinkWidgetForm onSave={saveWidget} />
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
  if (state.widgetState.mediaUrl && state.widgetState.mediaContentType) {
    return (
      <MediaLinkWidget
        widgetId={state.widgetId}
        data={state.widgetState as Required<LinkWidgetState>}
        onClose={onClose}
      />
    );
  }

  return (
    <WidgetFrame color="lavender" widgetId={state.widgetId}>
      <WidgetTitlebar title={state.widgetState.title || t('widgets.link.title')} onClose={onClose} />
      <WidgetContent>
        <Tooltip title={state.widgetState.url} placement="bottom">
          <Link
            href={state.widgetState.url}
            target="_blank"
            rel="noopener noreferrer"
            color="inherit"
            className={classes.link}
          >
            {state.widgetState.url}
          </Link>
        </Tooltip>
      </WidgetContent>
    </WidgetFrame>
  );
};
