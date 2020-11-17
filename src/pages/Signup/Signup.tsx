// TODO: WIP
import React, { useState } from 'react';
import { TwoColLayout } from '../../Layouts/TwoColLayout/TwoColLayout';
import { Column } from '../../Layouts/TwoColLayout/Column/Column';
import { Page } from '../../Layouts/Page/Page';
import { useTranslation, Trans } from 'react-i18next';
import { Button, TextField, Link, Typography, makeStyles } from '@material-ui/core';
import Api from '../../utils/api';

import { Header } from '../../components/Header/Header';
import { CheckboxField } from '../../components/CheckboxField/CheckboxField';
import { ErrorInfo } from '../../types/api';
import { Links } from '../../constants/Links';
import signinImg from '../../images/SignIn.png';
import { PanelImage } from '../../Layouts/PanelImage/PanelImage';
import { PanelContainer } from '../../Layouts/PanelContainer/PanelContainer';

interface ISignupProps {}

const useStyles = makeStyles((theme) => ({
  title: {
    marginBottom: 10,
  },
  checkboxes: {
    marginTop: theme.spacing(2),
  },
  email: {
    marginTop: theme.spacing(2),
  },
  nameWrapper: {
    display: 'flex',
    flexDirection: 'column',
    [theme.breakpoints.up('md')]: {
      flexDirection: 'row',
    },
  },
  firstName: {
    marginRight: theme.spacing(2.5),
    [theme.breakpoints.only('sm')]: {
      marginRight: 0,
      marginBottom: theme.spacing(2),
    },
  },
  lastName: {
    [theme.breakpoints.only('sm')]: {
      marginTop: theme.spacing(1.25),
      marginBottom: theme.spacing(2),
    },
  },
  button: {
    marginTop: theme.spacing(5),
  },
}));

export const Signup: React.FC<ISignupProps> = (props) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [acceptTos, setAcceptTos] = useState(false);
  const [receiveMarketing, setReceiveMarketing] = useState(false);
  const [error] = useState<ErrorInfo>(null!);
  const [isLoading] = useState(false);

  /**
   * from the old page, use as notes
   *   const register = async (input: any) => {
    const result: any = await Api.signup(input);
    const temp: any = document.getElementById('temp') || {};

    if (result && result.success) {
      const signupUrl = (result || {}).signupUrl;
      temp['innerHTML'] = `<div>Check your email to complete signup! </a>`;
    } else {
      alert(result.message);
    }
  };

  const finishSignup = async () => {
    const input = getInput();
    const validation = checkInput(input);
    if (validation.valid) {
      if (props.register) {
        // Support embedding the signup form with custom behavior
        // e.g. for processing email invitations.
        await props.register(input);
      } else {
        await register(input);
      }
    } else {
      alert(`Invalid fields: ${JSON.stringify(Object.keys(validation.invalidFields))}`);
      console.log(validation);
    }
  };

  const getInputValue = (fieldId: string) => {
    const input = document.getElementById(fieldId) as HTMLInputElement;
    return input.value;
  };

  const getCheckedValue = (checkboxId: string) => {
    const checked = document.getElementById(checkboxId) as HTMLInputElement;
    return checked.checked;
  };

  const getInput = () => {
    return {
      firstName: getInputValue('first_name'),
      lastName: getInputValue('last_name'),
      email: getInputValue('email'),
      acceptTos: getCheckedValue('accept_tos'),
      receiveMarketing: getCheckedValue('receive_marketing'),
    };
  };

  const checkInput = (input: { [key: string]: any }) => {
    // In principle all string input is vulnerable to XSS
    // E.g. the name could be <script>sendLocalStorageContentsToMyServer()</script>
    // TODO: input validation should prevent XSS, e.g. disallow < and >
    const invalidFields: any = {};
    // TODO: we can hook up some npm package for field validation
    if (!input['firstName']) invalidFields['first_name'] = true;
    if (!input['lastName']) invalidFields['last_name'] = true;
    // We don't need to validate email too much, since we'll verify it via otp
    if (!input['email']) invalidFields['email'] = true;
    if (!input['acceptTos']) invalidFields['accept_tos'] = true;

    if (Object.keys(invalidFields).length > 0) {
      return {
        valid: false,
        invalidFields: invalidFields,
      };
    } else {
      return { valid: true };
    }
  };

   */

  const onFormSubmit = async () => {
    try {
    } catch (err) {}
  };

  return (
    <Page isLoading={isLoading} error={error}>
      <Header />
      <TwoColLayout>
        <Column centerContent={true}>
          <PanelContainer>
            <Typography variant="h2" className={classes.title}>
              {t('pages.signup.title')}
            </Typography>
            <form onSubmit={onFormSubmit}>
              <div className={classes.nameWrapper}>
                <TextField
                  id="firstName"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  placeholder={t('pages.signup.firstName.placeholder')}
                  label={t('pages.signup.firstName.label')}
                  className={classes.firstName}
                />
                <TextField
                  id="lastName"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  placeholder={t('pages.signup.lastName.placeholder')}
                  label={t('pages.signup.lastName.label')}
                  className={classes.lastName}
                />
              </div>
              <TextField
                id="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={t('pages.signup.email.placeholder')}
                label={t('pages.signup.email.placeholder')}
                className={classes.email}
              />
              <div className={classes.checkboxes}>
                <CheckboxField
                  label={
                    <span>
                      I agree to the{' '}
                      <Link href={Links.TOS} target="_blank" rel="noopener noreferrer">
                        Terms of Service
                      </Link>
                    </span>
                  }
                  checked={acceptTos}
                  onChange={() => setAcceptTos(!acceptTos)}
                  name="terms of service checkbox"
                />
                <CheckboxField
                  label="It’s ok to send me occasional emails"
                  checked={receiveMarketing}
                  onChange={() => setReceiveMarketing(!receiveMarketing)}
                  name="end me occasional emails checkbox"
                />
              </div>
              <Button className={classes.button} type="submit" disabled={!firstName || !lastName || !acceptTos}>
                {t('pages.signup.submitButtonText')}
              </Button>
            </form>
          </PanelContainer>
        </Column>
        <Column centerContent={true} hide="sm">
          <PanelImage src={signinImg} altTextKey="pages.signup.imgAltText" />
        </Column>
      </TwoColLayout>
    </Page>
  );
};
