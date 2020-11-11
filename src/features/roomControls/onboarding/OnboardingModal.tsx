import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { makeStyles, Box, Typography, Button, ThemeProvider } from '@material-ui/core';
import { Modal } from '../../../components/Modal/Modal';
import { ModalPane } from '../../../components/Modal/ModalPane';
import { ModalTitleBar } from '../../../components/Modal/ModalTitleBar';
import { ModalContentWrapper } from '../../../components/Modal/ModalContentWrapper';
import { snow } from '../../../theme/theme';
import { USER_ONBOARDING } from '../../../constants/User';
import { BackIcon } from '../../../components/icons/BackIcon';
import { ForwardIcon } from '../../../components/icons/ForwardIcon';
import { selectors as controlSelectors, actions as controlsActions } from '../roomControlsSlice';
import { useRoomName } from '../../../hooks/useRoomName/useRoomName';
import { useCurrentUserProfile } from '../../../hooks/useCurrentUserProfile/useCurrentUserProfile';

import onboardingImg1 from './images/onboarding_1.png';
import onboardingImg2 from './images/onboarding_2.png';
import onboardingImg3 from './images/onboarding_3.png';
import onboardingImg4 from './images/onboarding_4.png';

interface IOnboardingModalProps {}

// dont expect these to change too much so we can just make the
// onboarding steps static for now.
const onboardingSteps = [
  {
    img: onboardingImg1,
    altText: 'modals.onboardingModal.step1.altText',
    title: 'modals.onboardingModal.step1.title',
    text: 'modals.onboardingModal.step1.text',
  },
  {
    img: onboardingImg2,
    altText: 'modals.onboardingModal.step1.altText',
    title: 'modals.onboardingModal.step2.title',
    text: 'modals.onboardingModal.step2.text',
  },
  {
    img: onboardingImg3,
    altText: 'modals.onboardingModal.step3.altText',
    title: 'modals.onboardingModal.step3.title',
    text: 'modals.onboardingModal.step3.text',
  },
  {
    img: onboardingImg4,
    altText: 'modals.onboardingModal.step4.altText',
    title: 'modals.onboardingModal.step4.title',
    text: 'modals.onboardingModal.step4.text',
  },
];

const useStyles = makeStyles((theme) => ({
  image: {
    width: '100%',
    height: '100%',
  },
  infoPane: {
    height: '100%',
  },
  bodyText: {
    display: 'flex',
    flex: '1 1 auto',
    overflowY: 'scroll',
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    whiteSpace: 'pre-line',
  },
  btnSpacing: {
    marginRight: 'auto',
  },
  btnContainer: {
    height: '45px',
  },
  btnIcon: {
    height: 24,
    width: 24,
  },
}));

export const OnboardingModal: React.FC<IOnboardingModalProps> = (props) => {
  const dispatch = useDispatch();
  const isOpen = useSelector(controlSelectors.selectIsOnboardingModalOpen);
  const { t } = useTranslation();
  const classes = useStyles();
  const [currentStep, setCurrentStep] = useState(0);

  const roomName = useRoomName();
  const currentUserProfile = useCurrentUserProfile();

  const isRoomOwner = currentUserProfile?.rooms?.owned.some((room) => room.name === roomName);

  useEffect(() => {
    // check to see if the user has completed the onboarding or not,

    // TODO: change this to be driven by the backend so that a user
    // will only have to see onboarding once per account
    const completedOnboarding = localStorage.getItem(USER_ONBOARDING);
    if (!completedOnboarding) {
      dispatch(controlsActions.setIsOnboardingModalOpen({ isOpen: true }));
    }
  }, [dispatch]);

  const onCloseHandler = () => {
    // set a local cookie if the user has completed
    localStorage.setItem(USER_ONBOARDING, 'completed');
    dispatch(controlsActions.setIsOnboardingModalOpen({ isOpen: false }));
  };

  const nextStep = () => {
    if (currentStep + 1 < onboardingSteps.length) {
      setCurrentStep(currentStep + 1);
    } else if (isRoomOwner) {
      // if its the room owner, close the modal and open the membership mangement modal
      onCloseHandler();
      dispatch(controlsActions.setIsMembershipModalOpen({ isOpen: true }));
    } else {
      // we have hit the end, just call the close handler
      onCloseHandler();
    }
  };

  const prevStep = () => {
    if (currentStep - 1 >= 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const endButtonText = isRoomOwner ? 'modals.onboardingModal.finishInvite' : 'modals.onboardingModal.finishText';

  return (
    <Modal onClose={onCloseHandler} isOpen={isOpen}>
      <ModalTitleBar title={t(onboardingSteps[currentStep].title)} onClose={onCloseHandler} />
      <ModalContentWrapper>
        <ModalPane>
          <img
            src={onboardingSteps[currentStep].img}
            alt={onboardingSteps[currentStep].altText}
            className={classes.image}
          />
        </ModalPane>
        <ModalPane>
          <Box className={classes.infoPane} display="flex" flexDirection="column">
            <Typography className={classes.bodyText} variant="body1">
              {t(onboardingSteps[currentStep].text)}
            </Typography>
            <Box display="flex" flexDirection="row" className={classes.btnContainer}>
              <ThemeProvider theme={snow}>
                <Button
                  className={classes.btnSpacing}
                  disabled={currentStep === 0}
                  onClick={prevStep}
                  fullWidth={false}
                >
                  <BackIcon fontSize="default" />
                </Button>
              </ThemeProvider>
              <Button onClick={nextStep} fullWidth={false}>
                {currentStep === onboardingSteps.length - 1 ? t(endButtonText) : <ForwardIcon fontSize="default" />}
              </Button>
            </Box>
          </Box>
        </ModalPane>
      </ModalContentWrapper>
    </Modal>
  );
};
