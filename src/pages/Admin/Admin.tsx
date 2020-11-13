import React, { useState } from 'react';
import clsx from 'clsx';
import { Button, TextField } from '@material-ui/core';
import { Header } from '../../components/Header/Header';
import Api from '../../utils/api';
import styles from './Admin.module.css';
import { ClaimEmailsTable } from './ClaimEmailsTable';
import { Page } from '../../Layouts/Page/Page';

interface IAdminProps {}

export const Admin: React.FC<IAdminProps> = () => {
  const [email, setEmail] = useState('');
  const [roomName, setRoomName] = useState('');

  const sendEmail = async (email: string, roomName: string) => {
    const result: any = await Api.adminCreateAndSendClaimEmail(email, roomName);
    if (result.success) {
      alert(`Email to ${email} sent!`);
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
      <div className="u-flex u-flexJustifyCenter">
        <div className="u-flex u-flexCol u-size4of5">
          <form onSubmit={onFormSubmit}>
            <div className="u-flex u-sm-flexCol u-flexRow u-flexJustifyCenter u-flexAlignItemsCenter u-width100Percent">
              <TextField
                id="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                label="Email"
                className={'u-sm-sizeFull'}
              />
              <TextField
                id="roomName"
                value={roomName}
                onChange={(event) => setRoomName(event.target.value)}
                label="Room Name"
                className={clsx(styles.field, 'u-sm-sizeFull')}
              />
              <Button className={clsx(styles.button, 'u-sm-sizeFull')} type="submit" disabled={email.length === 0}>
                Send invite
              </Button>
            </div>
          </form>
          <ClaimEmailsTable resendEmail={sendEmail} />
        </div>
      </div>
    </Page>
  );
};
