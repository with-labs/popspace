import { YoutubeWidget } from './YoutubeWidget';
import { Story } from '@storybook/react/types-6-0';
import React from 'react';
import { withViewport } from '../../../../stories/__decorators__/withViewport';
import { Box } from '@material-ui/core';
import { WidgetType } from '../../../../roomState/types/widgets';

export default {
  title: 'widgets/Youtube',
  component: YoutubeWidget,
  argTypes: {},
  decorators: [withViewport],
};

const Template: Story<{ isPlaying: boolean; videoId: string }> = (args) => (
  <Box display="flex" flexDirection="column" alignItems="flex-start" minHeight={500}>
    <YoutubeWidget
      onClose={() => {}}
      state={{
        widgetId: 'example',
        ownerId: 'me',
        ownerDisplayName: 'Me',
        type: WidgetType.YouTube,
        widgetState: {
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
};

export const Draft = Template.bind({});
Draft.args = {};
