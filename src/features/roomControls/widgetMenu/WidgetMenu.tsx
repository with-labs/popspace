import * as React from 'react';
import { makeStyles, Paper } from '@material-ui/core';
import { QuickAccessoryButton } from '../addContent/QuickAccessoryButton';
import { QuickFileButton } from '../addContent/QuickFileButton';
import { ResponsiveTooltip } from '../../../components/ResponsiveTooltip/ResponsiveTooltip';
import { ActionBarButton } from '../addContent/ActionBarButton';
import { WidgetType } from '../../../roomState/types/widgets';
import { useTranslation } from 'react-i18next';
import { KeyShortcutText } from '../../../components/KeyShortcutText/KeyShortcutText';
import { isMacOs } from 'react-device-detect';
import { ACTION_BAR_ID } from '../addContent/ActionBar';
import { ResponsivePopoverProvider } from '../../../components/ResponsivePopover/ResponsivePopover';
import clsx from 'clsx';
import { Spacing } from '../../../components/Spacing/Spacing';

export interface IWidgetMenuProps {
  className?: string;
}

const useStyles = makeStyles((theme) => ({
  root: {
    position: 'fixed',
    bottom: 0,
    left: `50%`,
    transform: `translate(-50%, 0)`,
    zIndex: theme.zIndex.modal - 1,
    height: 72,
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    borderRadius: `${theme.shape.surfaceBorderRadius}px  ${theme.shape.surfaceBorderRadius}px 0 0`,
  },
}));

const QuickActionTooltip = () => {
  const { t } = useTranslation();
  return (
    <span>
      {t('features.omnibar.quickActionButton')} <KeyShortcutText>{`${isMacOs ? '⌘' : 'Ctrl'} + K`}</KeyShortcutText>
    </span>
  );
};

export const WidgetMenu: React.FC<IWidgetMenuProps> = ({ className, ...rest }) => {
  const { t } = useTranslation();
  const classes = useStyles();

  return (
    <>
      <ResponsivePopoverProvider value={'top'}>
        <Paper square elevation={5} className={clsx(classes.root, className)} {...rest}>
          <Spacing gap={1.5} flexDirection={'row'} alignItems="center" justifyContent="center" flex={1} height="100%">
            <QuickAccessoryButton type={WidgetType.Link} />
            <QuickAccessoryButton type={WidgetType.StickyNote} />
            <QuickAccessoryButton type={WidgetType.Whiteboard} />
            <QuickAccessoryButton type={WidgetType.YouTube} />
            <QuickFileButton />
          </Spacing>
        </Paper>
      </ResponsivePopoverProvider>
    </>
  );
};
