import { Story } from '@storybook/react/types-6-0';
import React, { useState } from 'react';
import { Menu, Button, MenuItem, ListItemIcon, ListItemText, Divider, Box } from '@material-ui/core';
import { PlaceholderIcon } from '@components/icons/PlaceholderIcon';

export default {
  title: 'components/Menu',
  component: Menu,
  argTypes: {},
};

const Demo = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  return (
    <Box height={400}>
      {/* Normally you'd set anchor element in the onClick, but using ref here speeds up prototyping by
          opening the menu immediately.
      */}
      <Button ref={setAnchorEl} fullWidth={false}>
        Menu Anchor
      </Button>
      <Menu open={!!anchorEl} anchorEl={anchorEl}>
        <MenuItem>
          <ListItemIcon>
            <PlaceholderIcon />
          </ListItemIcon>
          <ListItemText primary="Primary enabled" />
          <ListItemIcon>
            <PlaceholderIcon />
          </ListItemIcon>
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <PlaceholderIcon />
          </ListItemIcon>
          <ListItemText primary="Another" />
        </MenuItem>
        <MenuItem disabled>
          <ListItemIcon>
            <PlaceholderIcon />
          </ListItemIcon>
          <ListItemText primary="Primary disabled, and longer" />
          <ListItemIcon>
            <PlaceholderIcon />
          </ListItemIcon>
        </MenuItem>
        <Divider />
        <MenuItem dense>
          <ListItemText primary="Secondary (dense)" />
        </MenuItem>
        <MenuItem dense disabled>
          <ListItemText primary="Secondary disabled" />
        </MenuItem>
        <Divider />
        <MenuItem dense>
          <ListItemText primary="One last item" />
        </MenuItem>
      </Menu>
    </Box>
  );
};

const Template: Story<{}> = () => <Demo />;

export const Default = Template.bind({});
