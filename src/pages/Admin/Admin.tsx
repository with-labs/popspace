// TODO: WIP
import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import { TextField } from '../../withComponents/TextField/TextField';
import { Button, ButtonTypes } from '../../withComponents/Button/Button';
import { Header } from '../../withComponents/Header/Header';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

import styles from './Admin.module.css';

interface IAdminProps {}

export const Admin: React.FC<IAdminProps> = (props) => {
  const [email, setEmail] = useState('');
  const [roomName, setRoomName] = useState('');
  const [users, setUsers] = useState<{ email: string; room: string }[]>([]);

  useEffect(() => {
    // TODO:
    // double check if user is valid admin, else redirect
  });

  const onFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // TODO: handle taking user email and room and submitting invite to the backend
  };

  return (
    <main className={clsx(styles.root, 'u-height100Percent')}>
      <Header text="Admin" />
      <div className="u-flex u-flexJustifyCenter">
        <div className="u-flex u-flexCol u-size4of5">
          <form onSubmit={onFormSubmit}>
            <div className="u-flex u-sm-flexCol u-flexRow u-flexJustifyCenter u-flexAlignItemsCenter u-width100Percent">
              <TextField
                id="email"
                value={email}
                onChangeHandler={(event: React.ChangeEvent<HTMLInputElement>) => setEmail(event.target.value)}
                labelText="Email"
                className={'u-sm-sizeFull'}
              />
              <TextField
                id="roomName"
                value={roomName}
                onChangeHandler={(event: React.ChangeEvent<HTMLInputElement>) => setRoomName(event.target.value)}
                labelText="Room Name"
                className={clsx(styles.field, 'u-sm-sizeFull')}
              />
              <Button
                className={clsx(styles.button, 'u-sm-sizeFull')}
                buttonText="Send invite"
                type={ButtonTypes.SUBMIT}
                isDisabled={email.length === 0 || roomName.length === 0}
              />
            </div>
          </form>
          <TableContainer component={Paper} className={styles.table}>
            <Table className={styles.table} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>Email</TableCell>
                  <TableCell>Room</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.email}>
                    <TableCell component="th" scope="row">
                      {user.email}
                    </TableCell>
                    <TableCell align="right">{user.room}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </div>
    </main>
  );
};
