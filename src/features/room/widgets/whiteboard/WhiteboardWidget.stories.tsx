import { WhiteboardWidget } from './WhiteboardWidget';
import { Story } from '@storybook/react/types-6-0';
import React from 'react';
import { withViewport } from '../../../../stories/__decorators__/withViewport';
import { Box } from '@material-ui/core';
import { WidgetType } from '../../../../roomState/types/widgets';

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
        widgetId: 'example',
        ownerId: 'me',
        ownerDisplayName: 'Me',
        type: WidgetType.Whiteboard,
        widgetState: {
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
