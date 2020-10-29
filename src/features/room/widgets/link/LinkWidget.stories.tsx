import { LinkWidget } from './LinkWidget';
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

const Template: Story<{ url: string; title: string; isDraft: boolean }> = (args) => (
  <Box display="flex" flexDirection="column" alignItems="center" minHeight={500}>
    <LinkWidget
      onClose={() => {}}
      state={{
        id: 'example',
        kind: 'widget',
        participantSid: 'me',
        isDraft: args.isDraft,
        type: WidgetType.Link,
        data: {
          title: args.title,
          url: args.url,
        },
      }}
    />
  </Box>
);

export const Default = Template.bind({});
Default.args = {
  title: 'Google',
  url: 'https://google.com',
  isDraft: false,
};

export const Draft = Template.bind({});
Draft.args = {
  title: '',
  url: '',
  isDraft: true,
};
