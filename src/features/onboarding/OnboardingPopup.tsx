import { CloseIcon } from '@components/icons/CloseIcon';
import { DoneIcon } from '@components/icons/DoneIcon';
import { Link } from '@components/Link/Link';
import { useMediaReady } from '@components/MediaReadinessProvider/useMediaReady';
import { Spacing } from '@components/Spacing/Spacing';
import { RouteNames } from '@constants/RouteNames';
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
import { Trans, useTranslation } from 'react-i18next';
import { OnboardingStateShape, useOnboarding } from './useOnboarding';

export interface IOnboardingPopupProps {}

const useStyles = makeStyles((theme) => ({
  root: {
    [theme.breakpoints.up('md')]: {
      width: 360,
      maxHeight: '80vh',
    },
  },
}));

export const OnboardingPopup: React.FC<IOnboardingPopupProps> = () => {
  const { t } = useTranslation();
  const classes = useStyles();

  const isSmall = useMediaQuery<Theme>((theme) => theme.breakpoints.down('sm'));
  const theme = useTheme();

  const { api, hasMoved, hasCreated, hasAcknowledgedPersistence, hasAcknowledgedMakeYourOwn } = useOnboarding();

  const done = hasMoved && (isSmall || hasCreated) && hasAcknowledgedPersistence && hasAcknowledgedMakeYourOwn;
  const latestUndone = React.useMemo(() => {
    if (!hasMoved) return 'hasMoved';
    if (!hasCreated && !isSmall) return 'hasCreated';
    if (!hasAcknowledgedPersistence) return 'hasAcknowledgedPersistence';
    return 'hasAcknowledgedMakeYourOwn';
  }, [hasMoved, hasCreated, isSmall, hasAcknowledgedPersistence]);

  const actionRef = React.useRef<PopoverActions>(null);

  const [expanded, setExpanded] = React.useState<keyof OnboardingStateShape>(latestUndone);
  // expand new sections as user completes old ones
  React.useEffect(() => {
    setExpanded(latestUndone);
  }, [latestUndone]);

  const openSection = (sectionName: keyof OnboardingStateShape) => {
    setExpanded(sectionName);
    setTimeout(() => actionRef.current?.updatePosition(), 300);
  };

  const isReady = useMediaReady();

  const isOpen = !done && isReady;

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
          <IconButton onClick={api.markAll}>
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
          />
          {!isSmall && (
            <OnboardingStep
              id="create"
              title={t('features.onboarding.addWidgets.title')}
              details={t('features.onboarding.addWidgets.details')}
              expanded={expanded === 'hasCreated'}
              done={hasCreated}
              onChange={() => openSection('hasCreated')}
            />
          )}
          <OnboardingStep
            id="persistence"
            title={t('features.onboarding.persistence.title')}
            details={t('features.onboarding.persistence.details')}
            expanded={expanded === 'hasAcknowledgedPersistence'}
            done={hasAcknowledgedPersistence}
            onChange={() => openSection('hasAcknowledgedPersistence')}
          >
            <Button onClick={() => api.markComplete('hasAcknowledgedPersistence')} color="default">
              {t('common.confirm')}
            </Button>
          </OnboardingStep>
          <OnboardingStep
            id="create"
            title={t('features.onboarding.makeYourOwn.title')}
            details={<Trans i18nKey="features.onboarding.makeYourOwn.details" />}
            expanded={expanded === 'hasAcknowledgedMakeYourOwn'}
            done={hasAcknowledgedMakeYourOwn}
            onChange={() => openSection('hasAcknowledgedMakeYourOwn')}
          >
            <Spacing flexDirection="column">
              <Link to={RouteNames.ROOT} disableStyling newTab>
                <Button color="default">{t('features.onboarding.makeYourOwn.learnMore')}</Button>
              </Link>
              <Button onClick={() => api.markComplete('hasAcknowledgedMakeYourOwn')} color="default">
                {t('common.confirm')}
              </Button>
            </Spacing>
          </OnboardingStep>
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
}));

const OnboardingStep: React.FC<{
  id: string;
  title: string;
  details: React.ReactNode;
  done: boolean;
  expanded: boolean;
  onChange: (event: any, isExpanded: boolean) => void;
}> = ({ id, title, details, done, expanded, onChange, children }) => {
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
    <Accordion expanded={expanded} onChange={onChange} className={clsx(done && classes.done)} ref={ref}>
      <AccordionSummary aria-controls={`${id}-details`} id={`${id}-summary`}>
        <Typography variant="h3">
          {done && <DoneIcon className={classes.icon} />} {title}
        </Typography>
      </AccordionSummary>
      <AccordionDetails id={`${id}-details`} className={classes.details}>
        <Typography paragraph={!!children}>{details}</Typography>
        {children}
      </AccordionDetails>
    </Accordion>
  );
};
