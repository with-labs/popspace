import { StickyNoteWidget } from './StickyNoteWidget';
import { Story } from '@storybook/react/types-6-0';
import React from 'react';
import { withViewport } from '../../../../stories/__decorators__/withViewport';
import { Box } from '@material-ui/core';
import { WidgetType } from '../../../../roomState/types/widgets';

export default {
  title: 'widgets/StickyNote',
  component: StickyNoteWidget,
  argTypes: {},
  decorators: [withViewport],
};

const Template: Story<{ text: string }> = (args) => (
  <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight={500}>
    <StickyNoteWidget
      onClose={() => {}}
      state={{
        widgetId: 'example',
        ownerId: 'me',
        ownerDisplayName: 'Me',
        type: WidgetType.StickyNote,
        widgetState: {
          text: args.text,
        },
      }}
    />
  </Box>
);

export const Default = Template.bind({});
Default.args = {
  text: 'Hello world!',
};

export const Draft = Template.bind({});
Draft.args = {
  text: '',
};
