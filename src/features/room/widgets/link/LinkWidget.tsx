import { Link, makeStyles, Tooltip } from '@material-ui/core';
import * as React from 'react';
import { useLocalParticipant } from '../../../../hooks/useLocalParticipant/useLocalParticipant';
import { useSaveWidget } from '../useSaveWidget';
import { WidgetFrame } from '../WidgetFrame';
import { WidgetTitlebar } from '../WidgetTitlebar';
import { EditLinkWidgetForm } from './EditLinkWidgetForm';
import { LinkWidgetState } from '../../../../types/room';
import { WidgetContent } from '../WidgetContent';
import { useTranslation } from 'react-i18next';

export interface ILinkWidgetProps {
  state: LinkWidgetState;
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

  const localParticipant = useLocalParticipant();

  const saveWidget = useSaveWidget(state.id);

  if (state.isDraft && state.participantSid === localParticipant?.sid) {
    return (
      <WidgetFrame color="lavender" widgetId={state.id}>
        <WidgetTitlebar title={t('widgets.link.addWidgetTitle')} onClose={onClose} />
        <WidgetContent>
          <EditLinkWidgetForm onSave={saveWidget} />
        </WidgetContent>
      </WidgetFrame>
    );
  }

  // TODO: edit a published widget

  return (
    <WidgetFrame color="lavender" widgetId={state.id}>
      <WidgetTitlebar title={state.data.title || t('widgets.link.title')} onClose={onClose} />
      <WidgetContent>
        <Tooltip title={state.data.url} placement="bottom">
          <Link
            href={state.data.url}
            target="_blank"
            rel="noopener noreferrer"
            color="inherit"
            className={classes.link}
          >
            {state.data.url}
          </Link>
        </Tooltip>
      </WidgetContent>
    </WidgetFrame>
  );
};
