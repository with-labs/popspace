import { LinkWidget, ILinkWidgetProps } from './LinkWidget';
import { Story } from '@storybook/react/types-6-0';
import React from 'react';
import { WidgetType } from '../../../../types/room';
import { withViewport } from '../../../../stories/__decorators__/withViewport';
import { Box } from '@material-ui/core';

export default {
  title: 'widgets/Link',
  component: LinkWidget,
  argTypes: {},
  decorators: [withViewport],
};

const Template: Story<ILinkWidgetProps> = (args) => (
  <Box display="flex" flexDirection="column" alignItems="center">
    <LinkWidget {...args} />
  </Box>
);

export const Default = Template.bind({});
Default.args = {
  state: {
    id: 'example',
    kind: 'widget',
    participantSid: 'me',
    isDraft: false,
    type: WidgetType.Link,
    data: {
      title: 'Google',
      url: 'https://google.com',
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
    type: WidgetType.Link,
    data: {
      title: '',
      url: '',
    },
  },
  onClose: () => {},
};
