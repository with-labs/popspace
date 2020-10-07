import { Whiteboard } from './Whiteboard';
import { Story } from '@storybook/react/types-6-0';
import React from 'react';
import { Box } from '@material-ui/core';

export default {
  title: 'components/Whiteboard',
  component: Whiteboard,
  argTypes: {},
};

const Template: Story<{}> = (args) => {
  const ref = React.useRef<{ exportToImageURL: () => string }>(null);

  const handleExport = () => {
    const url = ref.current?.exportToImageURL();
    if (!url) {
      console.log('no url!');
      return;
    }

    const a = document.createElement('a');
    a.href = url;
    a.download = 'canvas.png';

    const clickHandler = () => {
      setTimeout(() => {
        URL.revokeObjectURL(url);
        a.removeEventListener('click', clickHandler);
      }, 150);
    };

    a.addEventListener('click', clickHandler, false);

    a.click();
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      <Whiteboard {...args} ref={ref} />
      <button onClick={handleExport}>Export</button>
    </Box>
  );
};

export const Default = Template.bind({});
