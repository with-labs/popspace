import * as React from 'react';
import { makeStyles, Box } from '@material-ui/core';
import { ColorButton } from '../ColorButton/ColorButton';
import { COLORS, ERASER_COLOR } from './constants';

export interface IWhiteboardToolsProps {
  onEraserClick: () => void;
  setActiveColor: (color: string) => void;
  activeColor: string;
}

const useStyles = makeStyles((theme) => ({
  root: {},
  controls: {
    backgroundColor: theme.palette.background.paper,
  },
  eraserButton: {
    alignSelf: 'flex-start',
    marginTop: 4,
    marginRight: 8,
  },
}));

export const WhiteboardTools: React.FC<IWhiteboardToolsProps> = ({ onEraserClick, setActiveColor, activeColor }) => {
  const classes = useStyles();

  return (
    <Box display="flex" flexDirection="row" alignItems="center" className={classes.controls}>
      <ColorButton onClick={onEraserClick} color={ERASER_COLOR} active={activeColor === ERASER_COLOR} />
      {COLORS.slice(1).map((color) => (
        <ColorButton key={color} color={color} onClick={() => setActiveColor(color)} active={activeColor === color} />
      ))}
    </Box>
  );
};
