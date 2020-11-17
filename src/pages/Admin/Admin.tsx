// WIP : add in complete error handling, keep expading features
import React, { useState } from 'react';
import clsx from 'clsx';
import { Button, TextField, makeStyles, Box } from '@material-ui/core';
import { Header } from '../../components/Header/Header';
import Api from '../../utils/api';

import { USER_SESSION_TOKEN } from '../../constants/User';

import { ClaimEmailsTable } from './ClaimEmailsTable';
import { Page } from '../../Layouts/Page/Page';

interface IAdminProps {}

const useStyles = makeStyles((theme) => ({
  wrapper: {
    width: '80%',
  },
  formWrapper: {
    width: '100%',
    flexDirection: 'row',
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
    },
  },
  smSizeFull: {
    [theme.breakpoints.down('sm')]: {
      width: '100%',
    },
  },
  button: {
    height: '48px',
    marginTop: '23px',
    paddingTop: theme.spacing(3),
    [theme.breakpoints.down('sm')]: {
      paddingtop: theme.spacing(2),
    },
  },
  field: {
    padding: `0 ${theme.spacing(2)}px`,
    [theme.breakpoints.down('sm')]: {
      padding: `${theme.spacing(2)}px 0`,
    },
  },
}));

export const Admin: React.FC<IAdminProps> = () => {
  const classes = useStyles();
  const [email, setEmail] = useState('');
  const [roomName, setRoomName] = useState('');

  const sendEmail = async (emailStr: string, roomNameStr: string) => {
    const result: any = await Api.adminCreateAndSendClaimEmail(emailStr, roomNameStr);
    if (result.success) {
      alert(`Email to ${emailStr} sent!`);
    } else {
      alert(result.message + ' ' + result.errorCode);
    }
  };

  const onFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    sendEmail(email, roomName);
  };

  return (
    <Page>
      <Header text="Admin" />
      <Box display="flex" justifyContent="center">
        <Box display="flex" flexDirection="column" flexBasis="auto" className={classes.wrapper}>
          <form onSubmit={onFormSubmit}>
            <Box display="flex" justifyContent="center" alignItems="center" className={classes.formWrapper}>
              <TextField
                id="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                label="Email"
                className={classes.smSizeFull}
              />
              <TextField
                id="roomName"
                value={roomName}
                onChange={(event) => setRoomName(event.target.value)}
                label="Room Name"
                className={clsx(classes.field, classes.smSizeFull)}
              />
              <Button className={clsx(classes.button, classes.smSizeFull)} type="submit" disabled={email.length === 0}>
                Send invite
              </Button>
            </Box>
          </form>
          <ClaimEmailsTable resendEmail={sendEmail} />
        </Box>
      </Box>
    </Page>
  );
};
