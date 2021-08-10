import { useRoomStore } from '@api/useRoomStore';
import { CloseIcon } from '@components/icons/CloseIcon';
import { HearingIcon } from '@components/icons/HearingIcon';
import { UserIcon } from '@components/icons/UserIcon';
import { WallpaperIcon } from '@components/icons/WallpaperIcon';
import { Modal } from '@components/Modal/Modal';
import { Box, BoxProps, IconButton, makeStyles, Tab, Tabs, Theme, useMediaQuery } from '@material-ui/core';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { useRoomModalStore } from '../useRoomModalStore';
import { AudioSettings } from './AudioSettings';
import { ProfileSettings } from './ProfileSettings';
import { WallpaperRoomSettings } from './wallpapers/WallpaperRoomSettings';

const useStyles = makeStyles((theme) => ({
  modalContent: {
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    height: '75vh',
    maxHeight: '500px',
    [theme.breakpoints.down('sm')]: {
      height: '90vh',
      maxHeight: 'initial',
    },
  },
  button: {
    marginTop: theme.spacing(1),
  },
  tabs: {
    flex: '1',
    padding: theme.spacing(4),
    paddingRight: theme.spacing(3),
  },
  tabPanelWrapper: {
    flex: '4',
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
  },
}));

export const RoomSettingsModal = () => {
  const { t } = useTranslation();
  const classes = useStyles();
  const isSmall = useMediaQuery<Theme>((theme) => theme.breakpoints.down('sm'));

  const [activeTab, setActiveTab] = React.useState(0);

  const isOpen = useRoomModalStore((modals) => modals.settings);
  const closeModal = useRoomModalStore((modals) => modals.api.closeModal);

  const isGlobalAudioOn = useRoomStore((room) => room.state.isAudioGlobal);

  const onClose = () => closeModal('settings');

  const handleTabChange = (event: React.ChangeEvent<unknown>, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} fullWidth maxWidth="lg" contentClassName={classes.modalContent}>
      <Box display="flex" flexDirection={isSmall ? 'column' : 'row'} width="100%" height="100%" minHeight="0">
        <Box className={classes.tabs} display="flex" flexDirection="column">
          <Box mx={0.5} mb={2}>
            <IconButton onClick={onClose} aria-label={t('common.closeModal')}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Tabs
            orientation={isSmall ? 'horizontal' : 'vertical'}
            value={activeTab}
            onChange={handleTabChange}
            TabIndicatorProps={{
              style: {
                display: 'none',
              },
            }}
          >
            <Tab
              icon={<UserIcon />}
              label={t('features.roomSettings.profileTitle')}
              id="profile-tab"
              aria-controls="profile-tabpanel"
            />
            <Tab
              icon={<WallpaperIcon />}
              label={t('features.roomSettings.wallpaperTitle')}
              id="wallpaper-tab"
              aria-controls="wallpaper-tabpanel"
            />
            <Tab
              icon={<HearingIcon />}
              label={t(isGlobalAudioOn ? 'features.roomSettings.audioGlobal' : 'features.roomSettings.audioNearby')}
              id="sound-tab"
              aria-controls="sound-tabpanel"
            />
          </Tabs>
        </Box>
        <Box className={classes.tabPanelWrapper}>
          <TabPanel activeTabValue={activeTab} index={0} tabName="profile">
            <ProfileSettings />
          </TabPanel>
          <TabPanel activeTabValue={activeTab} index={1} tabName="wallpaper">
            <WallpaperRoomSettings />
          </TabPanel>
          <TabPanel activeTabValue={activeTab} index={2} tabName="sound" height="100%">
            <AudioSettings />
          </TabPanel>
        </Box>
      </Box>
    </Modal>
  );
};

interface TabPanelProps extends BoxProps {
  children?: React.ReactNode;
  index: any;
  activeTabValue: any;
  tabName: string;
}

function TabPanel(props: TabPanelProps) {
  const { children, activeTabValue, index, tabName, ...other } = props;

  return (
    <Box
      width="100%"
      overflow="hidden"
      role="tabpanel"
      display={activeTabValue === index ? 'flex' : 'none'}
      hidden={activeTabValue !== index}
      id={`${tabName}-tabpanel`}
      aria-labelledby={`vertical-tab-${tabName}`}
      {...other}
    >
      {activeTabValue === index && children}
    </Box>
  );
}
