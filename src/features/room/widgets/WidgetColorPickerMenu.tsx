import * as React from 'react';
import { ColorButton } from '@components/ColorButton/ColorButton';
import palette from '../../../theme/palette';
import { makeStyles, Box, Popover } from '@material-ui/core';
import { ThemeName } from '../../../theme/theme';
import { DropIcon } from '@components/icons/DropIcon';
import { WidgetTitlebarButton } from './WidgetTitlebarButton';

const COLORS = [
  { name: ThemeName.Mandarin, value: palette.mandarin.bold },
  { name: ThemeName.Cherry, value: palette.cherry.bold },
  { name: ThemeName.Oregano, value: palette.oregano.bold },
  { name: ThemeName.Lavender, value: palette.lavender.bold },
  { name: ThemeName.Blueberry, value: palette.blueberry.bold },
  { name: ThemeName.Slate, value: palette.slate.bold },
  { name: ThemeName.VintageInk, value: palette.vintageInk.regular },
];

export interface WidgetColorPickerMenuProps {
  setActiveColor: (color: ThemeName) => void;
  activeColor: ThemeName;
}

const useStyles = makeStyles((theme) => ({
  controls: {
    backgroundColor: theme.palette.background.paper,
  },
}));

export function WidgetColorPickerMenu(props: WidgetColorPickerMenuProps) {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const classes = useStyles();

  return (
    <>
      <WidgetTitlebarButton
        onClick={(ev) => setAnchorEl(ev.currentTarget)}
        aria-haspopup
        aria-controls={!!anchorEl ? 'colorPicker' : undefined}
      >
        <DropIcon />
      </WidgetTitlebarButton>
      <Popover
        id="colorPickerMenu"
        open={!!anchorEl}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        onClick={() => setAnchorEl(null)}
        transformOrigin={{ vertical: -10, horizontal: 'center' }}
      >
        <Box p={2} display="flex" flexDirection="row" alignItems="center" className={classes.controls}>
          {COLORS.map((color) => (
            <ColorButton
              key={color.value}
              color={color.value}
              onClick={() => props.setActiveColor(color.name)}
              active={props.activeColor === color.name}
            />
          ))}
        </Box>
      </Popover>
    </>
  );
}
