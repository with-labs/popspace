import { CloseIcon } from '@components/icons/CloseIcon';
import { DoneIcon } from '@components/icons/DoneIcon';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  IconButton,
  makeStyles,
  PopoverActions,
  Typography,
  useMediaQuery,
  Theme,
  Paper,
  Grow,
  useTheme,
} from '@material-ui/core';
import clsx from 'clsx';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { OnboardingStateShape, useOnboarding } from './useOnboarding';
import { Analytics } from '@analytics/Analytics';

import moveVideo from '@src/videos/onboarding/move.mp4';
import contentVideo from '@src/videos/onboarding/content.mp4';
import persistenceVideo from '@src/videos/onboarding/persistence.mp4';
import { useRoomStore } from '@api/useRoomStore';

const ANALYTICS_ID = 'gettingStarted';

export interface IOnboardingPopupProps {}

const useStyles = makeStyles((theme) => ({
  root: {
    [theme.breakpoints.up('md')]: {
      width: 360,
      maxHeight: '80vh',
    },
  },
}));

const ORDERED_STEPS: readonly (keyof OnboardingStateShape)[] = ['hasMoved', 'hasCreated', 'hasAcknowledgedPersistence'];

export const OnboardingPopup: React.FC<IOnboardingPopupProps> = () => {
  const { t } = useTranslation();
  const classes = useStyles();

  const isSmall = useMediaQuery<Theme>((theme) => theme.breakpoints.down('sm'));
  const theme = useTheme();

  const { api, hasMoved, hasCreated, hasAcknowledgedPersistence /*hasAcknowledgedMakeYourOwn*/ } = useOnboarding();

  const done = hasMoved && (isSmall || hasCreated) && hasAcknowledgedPersistence; /* && hasAcknowledgedMakeYourOwn*/
  const latestUndone = React.useMemo(() => {
    if (!hasMoved) return 0;
    if (!hasCreated && !isSmall) return 1;
    // TODO: re-enable this step
    // if (!hasAcknowledgedPersistence) return 2;
    // return 3;
    return 2;
  }, [hasMoved, hasCreated, isSmall]);

  const actionRef = React.useRef<PopoverActions>(null);

  const [expanded, setExpanded] = React.useState<keyof OnboardingStateShape>(ORDERED_STEPS[latestUndone]);
  // expand new sections as user completes old ones
  React.useEffect(() => {
    setExpanded(ORDERED_STEPS[latestUndone]);
  }, [latestUndone]);

  const openSection = (sectionName: keyof OnboardingStateShape) => {
    setExpanded(sectionName);
    setTimeout(() => actionRef.current?.updatePosition(), 300);
  };

  // wait for user to enter room
  const isReady = useRoomStore((room) => !room.cacheApi.getCurrentUser()?.isObserver);

  const isOpen = !done && isReady;

  // Analytic setup
  React.useEffect(() => {
    if (isOpen) {
      Analytics.trackEvent(`${ANALYTICS_ID}_visited`, new Date().toUTCString());
    }
  }, [isOpen]);

  React.useEffect(() => {
    function trackClosing() {
      // the page was closed before interacting with it
      Analytics.trackEvent(`${ANALYTICS_ID}_closed`, ORDERED_STEPS[latestUndone]);
    }

    window.addEventListener('beforeunload', trackClosing);

    return () => {
      window.removeEventListener('beforeunload', trackClosing);
    };
  }, [latestUndone]);

  return (
    <Grow in={isOpen}>
      <Box
        component={Paper}
        p={2}
        {...({ elevation: 3 } as any)}
        position="fixed"
        bottom={theme.spacing(2)}
        right={theme.spacing(2)}
        className={classes.root}
        zIndex={theme.zIndex.modal}
        display="flex"
        flexDirection="column"
      >
        <Box display="flex" justifyContent="space-between" p={2}>
          <Typography variant="h2">{t('features.onboarding.title')}</Typography>
          <IconButton
            onClick={() => {
              Analytics.trackEvent(`${ANALYTICS_ID}_dismiss`, latestUndone);
              api.markAll();
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        <Box p={2} overflow="auto" flex={1}>
          <OnboardingStep
            id="move"
            title={t('features.onboarding.move.title')}
            details={t('features.onboarding.move.details')}
            expanded={expanded === 'hasMoved'}
            done={hasMoved}
            onChange={() => openSection('hasMoved')}
            videoSrc={moveVideo}
          />
          {!isSmall && (
            <OnboardingStep
              id="create"
              title={t('features.onboarding.addWidgets.title')}
              details={t('features.onboarding.addWidgets.details')}
              expanded={expanded === 'hasCreated'}
              done={hasCreated}
              onChange={() => openSection('hasCreated')}
              videoSrc={contentVideo}
              disabled={latestUndone < 1}
            >
              <Button
                onClick={() => {
                  api.markComplete('hasCreated');
                }}
                color="primary"
              >
                {t('common.confirm')}
              </Button>
            </OnboardingStep>
          )}
          <OnboardingStep
            id="persistence"
            title={t('features.onboarding.persistence.title')}
            details={t('features.onboarding.persistence.details')}
            expanded={expanded === 'hasAcknowledgedPersistence'}
            done={hasAcknowledgedPersistence}
            onChange={() => openSection('hasAcknowledgedPersistence')}
            videoSrc={persistenceVideo}
            disabled={latestUndone < 2}
          >
            <Button
              onClick={() => {
                Analytics.trackEvent(`${ANALYTICS_ID}_completed`, new Date().toUTCString());
                api.markComplete('hasAcknowledgedPersistence');
              }}
              color="primary"
            >
              {t('common.confirm')}
            </Button>
          </OnboardingStep>
          {/* <OnboardingStep
            id="create"
            title={t('features.onboarding.makeYourOwn.title')}
            details={<Trans i18nKey="features.onboarding.makeYourOwn.details" />}
            expanded={expanded === 'hasAcknowledgedMakeYourOwn'}
            done={hasAcknowledgedMakeYourOwn}
            onChange={() => openSection('hasAcknowledgedMakeYourOwn')}
            videoSrc={learnMoreVideo}
          >
            <Spacing flexDirection="row" justifyContent="space-evenly">
              <Button onClick={() => api.markComplete('hasAcknowledgedMakeYourOwn')} color="default" fullWidth={false}>
                {t('features.onboarding.makeYourOwn.later')}
              </Button>
              <Link to={RouteNames.ROOT} disableStyling newTab>
                <Button color="primary">{t('features.onboarding.makeYourOwn.learnMore')}</Button>
              </Link>
            </Spacing>
          </OnboardingStep> */}
        </Box>
      </Box>
    </Grow>
  );
};

const useStepStyles = makeStyles((theme) => ({
  done: {
    // increase specificity over expanded styles
    '&&': {
      backgroundColor: theme.palette.brandColors.oregano.light,
    },
  },
  details: {
    display: 'flex',
    flexDirection: 'column',
  },
  icon: {
    color: theme.palette.brandColors.oregano.bold,
    fontSize: theme.typography.pxToRem(24),
    position: 'relative',
    marginBottom: -6,
  },
  video: {
    width: '100%',
    height: 'auto',
    borderRadius: theme.shape.contentBorderRadius,
    marginBottom: theme.spacing(1),
  },
}));

const OnboardingStep: React.FC<{
  id: string;
  title: string;
  details: React.ReactNode;
  done: boolean;
  expanded: boolean;
  videoSrc?: string;
  onChange: (event: any, isExpanded: boolean) => void;
  disabled?: boolean;
}> = ({ id, title, details, done, expanded, onChange, videoSrc, children, disabled }) => {
  const classes = useStepStyles();
  const ref = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    if (expanded) {
      ref.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
      });
    }
  }, [ref, expanded]);

  return (
    <Accordion
      expanded={expanded}
      onChange={onChange}
      className={clsx(done && classes.done)}
      disabled={disabled}
      ref={ref}
    >
      <AccordionSummary aria-controls={`${id}-details`} id={`${id}-summary`}>
        <Typography variant="h3">
          {done && <DoneIcon className={classes.icon} />} {title}
        </Typography>
      </AccordionSummary>
      <AccordionDetails id={`${id}-details`} className={classes.details}>
        {videoSrc && <video className={classes.video} src={videoSrc} controls={false} autoPlay muted loop />}
        <Typography paragraph={!!children}>{details}</Typography>
        {children}
      </AccordionDetails>
    </Accordion>
  );
};
