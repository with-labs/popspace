import * as React from 'react';
import { Typography } from '@material-ui/core';

export const QuickActionEmpty = () => {
  return (
    <>
      <Typography variant="caption">
        Type or paste text, links, images, youtube links, and anything else you want to add to the room.
      </Typography>
      {/* TODO: help dialog */}
      {/*<Divider />
      <MenuItem
      >
        <ListItemIcon>
          <HelpIcon />
        </ListItemIcon>
        <ListItemText>See help</ListItemText>
      </MenuItem> */}
    </>
  );
};
