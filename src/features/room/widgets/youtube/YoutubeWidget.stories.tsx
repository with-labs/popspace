import { YoutubeWidget, IYoutubeWidgetProps } from './YoutubeWidget';
import { Story } from '@storybook/react/types-6-0';
import React from 'react';
import { WidgetType } from '../../../../types/room';
import { withViewport } from '../../../../stories/__decorators__/withViewport';
import { Box } from '@material-ui/core';

export default {
  title: 'widgets/Youtube',
  component: YoutubeWidget,
  argTypes: {},
  decorators: [withViewport],
};

const Template: Story<IYoutubeWidgetProps> = (args) => (
  <Box display="flex" flexDirection="column" alignItems="center">
    <YoutubeWidget {...args} />
  </Box>
);

export const Default = Template.bind({});
Default.args = {
  state: {
    id: 'example',
    kind: 'widget',
    participantSid: 'me',
    isDraft: false,
    type: WidgetType.YouTube,
    data: {
      videoId: '-FlxM_0S2lA',
      playStartedTimestampUTC: null,
      isPlaying: true,
    },
  },
  onClose: () => {},
};

export const Draft = Template.bind({});
Draft.args = {
  state: {
    id: 'example',
    kind: 'widget',
    participantSid: 'me',
    isDraft: true,
    type: WidgetType.YouTube,
    data: {
      videoId: '',
      playStartedTimestampUTC: null,
    },
  },
  onClose: () => {},
};
