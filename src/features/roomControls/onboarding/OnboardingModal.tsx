// WIP
// TODO: we need to update Typography varients, so the title is the proper h2 in legato
// Do we need to disable closing on clicking off of the modal for

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { makeStyles, Box, Typography, Button, ThemeProvider } from '@material-ui/core';
import { Modal } from '../../../components/Modal/Modal';
import { ModalPane } from '../../../components/Modal/ModalPane';
import { ModalTitleBar } from '../../../components/Modal/ModalTitleBar';
import { ModalContentWrapper } from '../../../components/Modal/ModalContentWrapper';
import { snow } from '../../../theme/theme';
import Cookie from 'js-cookie';
import { USER_ONBOARDING } from '../../../constants/User';

import testimg from './images/test.jpg';

interface IOnboardingModalProps {}

// dont expect these to change too much so we can just make the
// onboarding steps static for now.
const onboardingSteps = [
  {
    img: testimg,
    altText: 'modals.onboardingModal.step1.altText',
    title: 'modals.onboardingModal.step1.title',
    text: 'modals.onboardingModal.step1.text',
  },
  {
    img: testimg,
    altText: 'modals.onboardingModal.step1.altText',
    title: 'modals.onboardingModal.step2.title',
    text: 'modals.onboardingModal.step2.text',
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
  },
  btnSpacing: {
    marginRight: theme.spacing(2),
  },
}));

export const OnboardingModal: React.FC<IOnboardingModalProps> = (props) => {
  const { t } = useTranslation();
  const classes = useStyles();

  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // check to see if the user has completed the onboarding or not,
    // if not display the modal
    const completedOnboarding = Cookie.get(USER_ONBOARDING);
    if (!completedOnboarding) {
      setIsOpen(true);
    }
  }, [setIsOpen]);

  const onCloseHandler = () => {
    // set a local cookie if the user has completed
    Cookie.set(USER_ONBOARDING, 'completed');
    setIsOpen(false);
  };

  const nextStep = () => {
    if (currentStep + 1 < onboardingSteps.length) {
      setCurrentStep(currentStep + 1);
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

  return (
    <Modal onClose={onCloseHandler} isOpen={isOpen}>
      <ModalTitleBar title={t('modals.onboardingModal.title')} onClose={onCloseHandler} />
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
            <Typography variant="h6">{t(onboardingSteps[currentStep].title)}</Typography>
            <Typography className={classes.bodyText}>{t(onboardingSteps[currentStep].text)}</Typography>
            <Box display="flex" flexDirection="row">
              <ThemeProvider theme={snow}>
                <Button className={classes.btnSpacing} disabled={currentStep === 0} onClick={prevStep}>
                  {t('modals.onboardingModal.PreviousText')}
                </Button>
              </ThemeProvider>
              <Button onClick={nextStep}>
                {t(
                  currentStep === onboardingSteps.length - 1
                    ? 'modals.onboardingModal.finishText'
                    : 'modals.onboardingModal.nextBtnText'
                )}
              </Button>
            </Box>
          </Box>
        </ModalPane>
      </ModalContentWrapper>
    </Modal>
  );
};
