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
    left: 0,
    top: `50%`,
    transform: `translate(0, -50%)`,
    zIndex: theme.zIndex.modal - 1,
    width: 56,
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    borderRadius: `0 ${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0`,
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
      <ResponsivePopoverProvider value={'right'}>
        <Paper square elevation={5} className={clsx(classes.root, className)} {...rest}>
          <Spacing gap={2} flexDirection={'column'} alignItems="center" justifyContent="flex-start" flex={1}>
            <ResponsiveTooltip title={<QuickActionTooltip />} offset={4}>
              <ActionBarButton aria-label={t('features.omnibar.quickActionButton')} aria-controls={ACTION_BAR_ID} />
            </ResponsiveTooltip>
            <QuickAccessoryButton type={WidgetType.StickyNote} />
            <QuickAccessoryButton type={WidgetType.Link} />
            <QuickAccessoryButton type={WidgetType.Whiteboard} />
            <QuickAccessoryButton type={WidgetType.YouTube} />
            <QuickFileButton />
          </Spacing>
        </Paper>
      </ResponsivePopoverProvider>
    </>
  );
};
