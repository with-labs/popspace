import { Box, Link, makeStyles, Tooltip } from '@material-ui/core';
import * as React from 'react';
import { useLocalParticipant } from '../../../../withHooks/useLocalParticipant/useLocalParticipant';
import { useSaveWidget } from '../useSaveWidget';
import { WidgetFrame } from '../WidgetFrame';
import { WidgetTitlebar } from '../WidgetTitlebar';
import { EditLinkWidgetForm } from './EditLinkWidgetForm';
import { LinkWidgetState } from '../../../../types/room';

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
    fontSize: theme.typography.pxToRem(16),
  },
}));

export const LinkWidget: React.FC<ILinkWidgetProps> = ({ state, onClose }) => {
  const classes = useStyles();

  const localParticipant = useLocalParticipant();

  const saveWidget = useSaveWidget(state.id);

  if (state.isDraft && state.participantSid === localParticipant.sid) {
    return (
      <WidgetFrame color="lavender">
        <WidgetTitlebar title="Add a Link" onClose={onClose} />
        <Box p={2} width={300} position="relative">
          <EditLinkWidgetForm onSave={saveWidget} />
        </Box>
      </WidgetFrame>
    );
  }

  // TODO: edit a published widget

  return (
    <WidgetFrame color="lavender">
      <WidgetTitlebar title="Link" onClose={onClose} />
      <Box position="relative" width="100%" maxWidth={200} p={2}>
        <Tooltip title={state.data.url} placement="bottom">
          <Link
            href={state.data.url}
            target="_blank"
            rel="noopener noreferrer"
            color="inherit"
            className={classes.link}
          >
            {state.data.title}
          </Link>
        </Tooltip>
      </Box>
    </WidgetFrame>
  );
};
