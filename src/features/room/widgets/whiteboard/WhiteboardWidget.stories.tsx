import { WhiteboardWidget } from './WhiteboardWidget';
import { Story } from '@storybook/react/types-6-0';
import React from 'react';
import { WidgetType } from '../../../../types/room';
import { withViewport } from '../../../../stories/__decorators__/withViewport';
import { Box } from '@material-ui/core';

export default {
  title: 'widgets/Whiteboard',
  component: WhiteboardWidget,
  argTypes: {},
  decorators: [withViewport],
};

const Template: Story<{}> = (args) => (
  <Box display="flex" flexDirection="column" alignItems="flex-start" minHeight={800}>
    <WhiteboardWidget
      onClose={() => {}}
      state={{
        id: 'example',
        kind: 'widget',
        participantSid: 'me',
        isDraft: false,
        type: WidgetType.Whiteboard,
        data: {
          whiteboardState: {
            lines: [],
          },
        },
      }}
    />
  </Box>
);

export const Default = Template.bind({});
Default.args = {};
