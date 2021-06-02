import { CloseIcon } from '@components/icons/CloseIcon';
import { DoneIcon } from '@components/icons/DoneIcon';
import { ResponsivePopover } from '@components/ResponsivePopover/ResponsivePopover';
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
} from '@material-ui/core';
import clsx from 'clsx';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { OnboardingStateShape, useOnboarding } from './useOnboarding';

export interface IOnboardingPopupProps {}

const noop = () => {};

const useStyles = makeStyles((theme) => ({
  root: {
    [theme.breakpoints.up('md')]: {
      width: 360,
    },
  },
}));

export const OnboardingPopup: React.FC<IOnboardingPopupProps> = () => {
  const { t } = useTranslation();
  const classes = useStyles();

  const isSmall = useMediaQuery<Theme>((theme) => theme.breakpoints.down('sm'));

  const { api, hasMoved, hasCreated, hasAcknowledgedPersistence } = useOnboarding();

  const done = hasMoved && (isSmall || hasCreated) && hasAcknowledgedPersistence;
  const latestUndone = React.useMemo(() => {
    if (!hasMoved) return 'hasMoved';
    if (!hasCreated && !isSmall) return 'hasCreated';
    return 'hasAcknowledgedPersistence';
  }, [hasMoved, hasCreated, isSmall]);

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

  return (
    <ResponsivePopover
      open={!done}
      onClose={noop}
      disableBlockBackground
      className={classes.root}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      action={actionRef}
    >
      <Box display="flex" justifyContent="space-between" p={2}>
        <Typography variant="h2">{t('features.onboarding.title')}</Typography>
        <IconButton onClick={api.markAll}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Box p={2} overflow="auto" height="300px">
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
      </Box>
    </ResponsivePopover>
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
    bottom: -6,
  },
}));

const OnboardingStep: React.FC<{
  id: string;
  title: string;
  details: string;
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
        <Typography paragraph>{details}</Typography>
        {children}
      </AccordionDetails>
    </Accordion>
  );
};
