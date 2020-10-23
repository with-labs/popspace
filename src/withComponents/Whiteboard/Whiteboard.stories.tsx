import { Whiteboard } from './Whiteboard';
import { Story } from '@storybook/react/types-6-0';
import React from 'react';
import { Box } from '@material-ui/core';
import { useWhiteboard } from './useWhiteboard';
import { WhiteboardTools } from './WhiteboardTools';

export default {
  title: 'components/Whiteboard',
  component: Whiteboard,
  argTypes: {},
};

const Preview = () => {
  const { whiteboardProps, toolsProps, exportToImageURL } = useWhiteboard();

  const handleExport = () => {
    const url = exportToImageURL();
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
      <Whiteboard {...whiteboardProps} />
      <WhiteboardTools {...toolsProps} />
      <button onClick={handleExport}>Export</button>
    </Box>
  );
};

const Template: Story<{}> = () => <Preview />;

export const Default = Template.bind({});
