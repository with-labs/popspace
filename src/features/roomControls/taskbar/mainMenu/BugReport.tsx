import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, makeStyles } from '@material-ui/core';
import { Modal } from '../../../../components/Modal/Modal';
import { ModalTitleBar } from '../../../../components/Modal/ModalTitleBar';
import { ModalContentWrapper } from '../../../../components/Modal/ModalContentWrapper';
import { ModalPane } from '../../../../components/Modal/ModalPane';
import { Formik, Form } from 'formik';
import { FormikSubmitButton } from '../../../../components/fieldBindings/FormikSubmitButton';
import { FormikTextField } from '../../../../components/fieldBindings/FormikTextField';
import { Box, Typography } from '@material-ui/core';
import * as Sentry from '@sentry/react';
import { useCurrentUserProfile } from '../../../../hooks/api/useCurrentUserProfile';
import clsx from 'clsx';
import { Trans } from 'react-i18next';
import { DialogModal, DialogMessage } from '../../../../components/DialogModal/DialogModal';
import { logger } from '../../../../utils/logger';
import { v4 } from 'uuid';
import bugReportImg from '../../../../images/illustrations/bug_report.png';
import { useAnalytics, includeData } from '../../../../hooks/useAnalytics/useAnalytics';
import { EventNames } from '../../../../analytics/constants';

type BugReportFormData = {
  description: string;
};

const EMPTY_VALUES: BugReportFormData = {
  description: '',
};

function validateForm(description: string) {
  let error;

  if (!description || description?.length === 0) {
    // we arent goign to be dsiplaying a validation error to the user
    // so we can just use a string to trigger the enable / disable
    error = 'Required';
  }

  return error;
}

interface IBugReportProps {
  className?: string;
}

const useStyles = makeStyles((theme) => ({
  formTitle: {
    color: theme.palette.brandColors.slate.ink,
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  form: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  textarea: {
    flex: `1 1`,
    width: '100%',
    resize: 'none',
  },
  multilineInput: {
    padding: theme.spacing(2),
  },
  reportButton: {
    whiteSpace: 'nowrap',
  },
}));

export const BugReport: React.FC<IBugReportProps> = (props) => {
  const { className } = props;
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<DialogMessage | null>(null);
  const { t } = useTranslation();
  const classes = useStyles();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { user } = useCurrentUserProfile();
  const { trackEvent } = useAnalytics([includeData.roomId]);

  const onOpenHandler = () => {
    trackEvent(EventNames.BUTTON_CLICKED, { name: 'bug_report' });
    setShowConfirmation(false);
    setIsOpen(true);
  };

  const onCloseHandler = () => {
    setIsOpen(false);
  };

  // creates a dummy “User Bug Report” event
  // submits the description field as User Feedback to the Sentry API
  // the feedback then appears in the User Feedback section
  const onSubmitHandler = useCallback(
    async (values: { description: string }) => {
      // generate an event to associate feedback with
      // add in the report_id tag so we can select on it and create individual reports in sentry
      // Set the grouping fingerprint in sentry to be
      // message:"User Bug Report" -> bug-report, {{ tags.report_id }}
      const evtId = Sentry.captureEvent({
        message: 'User Bug Report',
        level: Sentry.Severity.Critical,
        tags: { report_id: v4() },
      });

      try {
        // use Sentry API to submit feedback
        const response = await fetch(`https://sentry.io/api/0/projects/with-labs/with-browser/user-feedback/`, {
          method: 'POST',
          body: JSON.stringify({
            event_id: evtId,
            name: user?.id,
            email: user?.email,
            comments: values.description,
          }),
          headers: {
            'Content-Type': 'application/json',
            Authorization: `DSN ${process.env.REACT_APP_SENTRY_DSN}`,
          },
        });

        if (response.ok) {
          setShowConfirmation(true);
        } else {
          logger.warn(`Issue submitting error report`, response);
          // just popup the dialog modal to tell the user what the error is
          // keep the report modal open to give them a chance to recover.
          setError({
            title: t('common.error'),
            body: t('modals.bugReportModal.errorMessage'),
          });
        }
      } catch (err) {
        logger.error(`Error submitting error report`, err);
        // just popup the dialog modal to tell the user what the error is
        // keep the report modal open to give them a chance to recover.
        setError({
          title: t('common.error'),
          body: t('modals.bugReportModal.errorMessage'),
        });
      }
    },
    [user, setShowConfirmation, setError, t]
  );

  return (
    <>
      <Button
        color="inherit"
        className={clsx(classes.reportButton, className)}
        onClick={onOpenHandler}
        size="small"
        variant="text"
        fullWidth={false}
      >
        {t('modals.bugReportModal.title')}
      </Button>
      <Modal onClose={onCloseHandler} isOpen={isOpen}>
        <ModalTitleBar title={t('modals.bugReportModal.title')} onClose={onCloseHandler} />
        <ModalContentWrapper>
          <ModalPane>
            <img src={bugReportImg} alt={t('modals.bugReportModal.imgAltText')} className={classes.image} />
          </ModalPane>
          <ModalPane>
            {showConfirmation ? (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                textAlign="center"
                flexGrow={1}
                flexShrink={0}
                flexBasis="auto"
              >
                <Trans>
                  <Typography variant="body1">{t('modals.bugReportModal.confirmationText')}</Typography>
                </Trans>
              </Box>
            ) : (
              <>
                <Formik initialValues={EMPTY_VALUES} onSubmit={onSubmitHandler} validateOnMount>
                  <Form className={classes.form}>
                    <FormikTextField
                      multiline
                      required
                      name="description"
                      className={classes.textarea}
                      autoFocus
                      validate={(description) => validateForm(description)}
                      label={t('modals.bugReportModal.explanationText')}
                      rows={11}
                      InputProps={{ classes: { multiline: classes.multilineInput } }}
                      onBlur={() => {
                        // no-op to disable on blur validation
                      }}
                    />
                    <FormikSubmitButton>{t('modals.bugReportModal.submitButton')}</FormikSubmitButton>
                  </Form>
                </Formik>
              </>
            )}
          </ModalPane>
        </ModalContentWrapper>
      </Modal>
      <DialogModal message={error} onClose={() => setError(null)} />
    </>
  );
};
