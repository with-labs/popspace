import { CloseIcon } from '@components/icons/CloseIcon';
import { DoneIcon } from '@components/icons/DoneIcon';
import { Modal } from '@components/Modal/Modal';
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
} from '@material-ui/core';
import clsx from 'clsx';
import * as React from 'react';
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
  const classes = useStyles();

  const { api, hasMoved, hasCreated, hasAcknowledgedPersistence } = useOnboarding();

  const done = hasMoved && hasCreated && hasAcknowledgedPersistence;
  const latestUndone = React.useMemo(() => {
    if (!hasMoved) return 'hasMoved';
    if (!hasCreated) return 'hasCreated';
    return 'hasAcknowledgedPersistence';
  }, [hasMoved, hasCreated]);

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
        <Typography variant="h2">Getting started</Typography>
        <IconButton onClick={api.markAll}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Box p={2} overflow="auto" height="300px">
        <OnboardingStep
          id="move"
          title="Move"
          details="To move in a Noodle room, drag and drop your avatar wherever you want to go!"
          expanded={expanded === 'hasMoved'}
          done={hasMoved}
          onChange={() => openSection('hasMoved')}
        />
        <OnboardingStep
          id="create"
          title="Add Widgets"
          details="You can add many kind of content to the room. Try it now!
Clicking on one of the icons at the bottom of the window."
          expanded={expanded === 'hasCreated'}
          done={hasCreated}
          onChange={() => openSection('hasCreated')}
        />
        <OnboardingStep
          id="persistence"
          title="Persistence"
          details="All the widgets you create and the files your upload are automatically saved in the room. Bookmark this page and come back at any time and eveything will still be there."
          expanded={expanded === 'hasAcknowledgedPersistence'}
          done={hasAcknowledgedPersistence}
          onChange={() => openSection('hasAcknowledgedPersistence')}
        >
          <Button onClick={() => api.markComplete('hasAcknowledgedPersistence')} color="default">
            Got it
          </Button>
        </OnboardingStep>
      </Box>
    </ResponsivePopover>
  );
};

const useStepStyles = makeStyles((theme) => ({
  done: {
    backgroundColor: theme.palette.brandColors.oregano.light,
  },
  details: {
    display: 'flex',
    flexDirection: 'column',
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
          {done && <DoneIcon />} {title}
        </Typography>
      </AccordionSummary>
      <AccordionDetails id={`${id}-details`} className={classes.details}>
        <Typography paragraph>{details}</Typography>
        {children}
      </AccordionDetails>
    </Accordion>
  );
};
