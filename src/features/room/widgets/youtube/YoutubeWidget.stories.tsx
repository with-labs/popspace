import { YoutubeWidget } from './YoutubeWidget';
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

const Template: Story<{ isPlaying: boolean; videoId: string; isDraft: boolean }> = (args) => (
  <Box display="flex" flexDirection="column" alignItems="flex-start" minHeight={500}>
    <YoutubeWidget
      onClose={() => {}}
      state={{
        id: 'example',
        kind: 'widget',
        participantSid: 'me',
        isDraft: args.isDraft,
        type: WidgetType.YouTube,
        data: {
          videoId: args.videoId,
          playStartedTimestampUTC: null,
          isPlaying: args.isPlaying,
        },
      }}
    />
  </Box>
);

export const Default = Template.bind({});
Default.args = {
  isPlaying: false,
  videoId: '-FlxM_0S2lA',
  isDraft: false,
};

export const Draft = Template.bind({});
Draft.args = {
  ...Default.args,
  isDraft: true,
};
