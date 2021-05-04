import { Hidden, makeStyles, Paper, Theme, useMediaQuery } from '@material-ui/core';
import clsx from 'clsx';
import { useFeatureFlag } from 'flagg';
import * as React from 'react';
import { isMacOs } from 'react-device-detect';
import { useTranslation } from 'react-i18next';
import { KeyShortcutText } from '../../../components/KeyShortcutText/KeyShortcutText';
import { ResponsivePopoverProvider } from '../../../components/ResponsivePopover/ResponsivePopover';
import { ResponsiveTooltip } from '../../../components/ResponsiveTooltip/ResponsiveTooltip';
import { Spacing } from '../../../components/Spacing/Spacing';
import { MediaFailedWrapper } from '../../../roomState/MediaFailedWrapper';
import { WidgetType } from '../../../roomState/types/widgets';
import { isPIPAvailable } from '../../pictureInPicture/pictureInPictureFeatureDetection';
import { ACTION_BAR_ID } from '../addContent/ActionBar';
import { ActionBarButton } from '../addContent/ActionBarButton';
import { FloatingActionBarButton } from '../addContent/FloatingActionBarButton';
import { QuickAccessoryButton } from '../addContent/QuickAccessoryButton';
import { QuickFileButton } from '../addContent/QuickFileButton';
import { AwayToggle } from '../away/AwayToggle';
import { CameraToggle } from '../media/CameraToggle';
import { MicToggle } from '../media/MicToggle';
import { PictureInPictureToggle } from '../media/PictureInPictureToggle';
import { ScreenShareToggle } from '../media/ScreenShareToggle';
import { StatusControls } from '../media/StatusControls';
import { MainMenu } from './mainMenu/MainMenu';
import { ChatButton } from './ChatButton/ChatButton';
export interface IRoomTaskbarProps {
  className?: string;
}

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    padding: theme.spacing(1),
    position: 'relative',
    zIndex: theme.zIndex.modal - 1,
  },
  vertical: {
    top: 0,
    flexDirection: 'column',
  },
  horizontal: {
    flexDirection: 'row',
    right: 0,
    top: 'auto',
  },
  floatingActionButton: {
    position: 'fixed',
    bottom: 60 + theme.spacing(2),
    right: theme.spacing(2),
    borderRadius: '100%',
    width: 56,
    height: 56,
  },
}));

export const RoomTaskbar: React.FC<IRoomTaskbarProps> = ({ className, ...rest }) => {
  const { t } = useTranslation();

  const classes = useStyles();

  const isSmall = useMediaQuery<Theme>((theme) => theme.breakpoints.down('sm'));
  const [hasPip] = useFeatureFlag('pictureInPicture');
  const [verticalTaskbar] = useFeatureFlag('verticalTaskbar');

  const isHorizontal = !verticalTaskbar || isSmall;

  return (
    <>
      <ResponsivePopoverProvider value={isHorizontal ? 'top' : 'right'}>
        <Paper
          square
          elevation={5}
          className={clsx(
            classes.root,
            {
              [classes.vertical]: !isHorizontal,
              [classes.horizontal]: isHorizontal,
            },
            className
          )}
          {...rest}
        >
          <Spacing
            gap={2}
            flexDirection={isHorizontal ? 'row' : 'column'}
            alignItems="center"
            justifyContent="flex-start"
            flex={1}
          >
            <MainMenu />
            <Hidden smDown>
              <ResponsiveTooltip title={<QuickActionTooltip />} offset={4}>
                <ActionBarButton aria-label={t('features.omnibar.quickActionButton')} aria-controls={ACTION_BAR_ID} />
              </ResponsiveTooltip>
              <QuickAccessoryButton type={WidgetType.StickyNote} />
              <QuickAccessoryButton type={WidgetType.Link} />
              <QuickAccessoryButton type={WidgetType.Whiteboard} />
              <QuickAccessoryButton type={WidgetType.YouTube} />
              <QuickFileButton />
            </Hidden>
          </Spacing>
          <MediaFailedWrapper>
            <Spacing gap={0.5} alignItems="center" color="grey.900" flexDirection={isHorizontal ? 'row' : 'column'}>
              <CameraToggle />
              <MicToggle />
              <StatusControls />
              <Hidden xsDown>
                <ScreenShareToggle />
                {isPIPAvailable && hasPip && <PictureInPictureToggle />}
              </Hidden>
              <AwayToggle />
              <ChatButton />
            </Spacing>
          </MediaFailedWrapper>
        </Paper>
      </ResponsivePopoverProvider>
      <Hidden mdUp>
        <FloatingActionBarButton
          aria-label={t('features.omnibar.quickActionButton')}
          aria-controls={ACTION_BAR_ID}
          className={classes.floatingActionButton}
        />
      </Hidden>
    </>
  );
};

const QuickActionTooltip = () => {
  const { t } = useTranslation();
  return (
    <span>
      {t('features.omnibar.quickActionButton')} <KeyShortcutText>{`${isMacOs ? '⌘' : 'Ctrl'} + K`}</KeyShortcutText>
    </span>
  );
};
