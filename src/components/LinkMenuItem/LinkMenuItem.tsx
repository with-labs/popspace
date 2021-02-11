import { MenuItem, MenuItemProps } from '@material-ui/core';
import * as React from 'react';
import { Link, ILinkProps } from '../Link/Link';

export interface ILinkMenuItemProps extends Pick<MenuItemProps, 'button' | 'dense'>, ILinkProps {}

/**
 * Takes the guesswork out of making a Link from a MenuItem.
 */
export const LinkMenuItem = React.forwardRef<any, ILinkMenuItemProps>((props, ref) => {
  return <MenuItem component={Link} ref={ref} {...(props as any)} />;
});
