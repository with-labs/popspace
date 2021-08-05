import { useRoomStore } from '@api/useRoomStore';
import { UserIcon } from '@components/icons/UserIcon';
import { Modal } from '@components/Modal/Modal';
import { Box, BoxProps, makeStyles, Tab, Tabs, Theme, Typography, useMediaQuery } from '@material-ui/core';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { useRoomModalStore } from '../useRoomModalStore';
import { ProfileSettings } from './ProfileSettings';

const useStyles = makeStyles((theme) => ({
  button: {
    marginTop: theme.spacing(1),
  },
  contentWrapper: {
    flexDirection: 'column',
    margin: 0,
    padding: 0,
  },
  formWrapper: {
    flexShrink: 0,
    width: '100%',
    marginBottom: theme.spacing(3),
  },
  tabs: {
    flex: '1 0 0',
    padding: theme.spacing(4),
    paddingRight: theme.spacing(3),
  },
  tabPanelWrapper: {
    flex: '4 0 0',
  },
}));

export const RoomSettingsModal = () => {
  const { t } = useTranslation();
  const classes = useStyles();
  const isSmall = useMediaQuery<Theme>((theme) => theme.breakpoints.down('sm'));

  const [activeTab, setActiveTab] = React.useState(0);

  const isOpen = useRoomModalStore((modals) => modals.settings);
  const closeModal = useRoomModalStore((modals) => modals.api.closeModal);

  const wallpaperUrl = useRoomStore((room) => room.state.wallpaperUrl);
  const isCustomWallpaper = useRoomStore((room) => room.state.isCustomWallpaper);

  const onClose = () => closeModal('settings');

  const handleTabChange = (event: React.ChangeEvent<unknown>, newValue: number) => {
    setActiveTab(newValue);
  };

  // separate built-in from custom values
  const customWallpaperUrl = isCustomWallpaper ? wallpaperUrl : null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} fullWidth maxWidth="lg">
      <Box display="flex" flexDirection="column" className={classes.contentWrapper}>
        <Box display="flex" flexDirection={isSmall ? 'column' : 'row'} width="100%" height="100%" minHeight="0">
          <Box className={classes.tabs} display="flex" flexDirection="column">
            <Box mt={2} ml={2} mr={2} mb={1}>
              <Typography variant="h2">{t('features.roomSettings.title')}</Typography>
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
              {/* <Tab
                icon={<WallpaperIcon />}
                label={t('features.roomSettings.wallpaperTitle')}
                id="wallpaper-tab"
                aria-controls="wallpaper-tabpanel"
              /> */}
              {/* <Tab
                icon={<HearingIcon />}
                label={t('features.roomSettings.soundTitle')}
                id="sound-tab"
                aria-controls="sound-tabpanel"
              /> */}
            </Tabs>
          </Box>
          <Box className={classes.tabPanelWrapper}>
            <TabPanel activeTabValue={activeTab} index={0} overflow="hidden" tabName="profile">
              <ProfileSettings />
            </TabPanel>
            {/* <TabPanel activeTabValue={activeTab} index={1} tabName="wallpaper">
            <Box display="flex" flexDirection="column" className={classes.formWrapper}>
              <CustomWallpaperForm value={customWallpaperUrl} onChange={client.roomState.setWallpaperUrl} />
            </Box>
            <Box>
              <WallpaperCategory onChange={client.roomState.setWallpaperUrl} />
            </Box>
          </TabPanel> */}
            {/* <TabPanel activeTabValue={activeTab} index={2} tabName="sound">
            Item Three
          </TabPanel> */}
          </Box>
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
      overflow="auto"
      maxHeight="75vh"
      role="tabpanel"
      display="flex"
      hidden={activeTabValue !== index}
      id={`${tabName}-tabpanel`}
      aria-labelledby={`vertical-tab-${tabName}`}
      {...other}
    >
      {activeTabValue === index && children}
    </Box>
  );
}
