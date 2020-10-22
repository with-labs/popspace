import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import { useHistory } from 'react-router-dom';
import { Button, TextField, CircularProgress } from '@material-ui/core';
import { Header } from '../../withComponents/Header/Header';
import * as Sentry from '@sentry/react';
import Api from '../../utils/api';
import { Routes } from '../../constants/Routes';
import { ErrorPage } from '../ErrorPage/ErrorPage';
import { ErrorTypes } from '../../constants/ErrorType';
import { ErrorInfo } from '../../types/api';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

import styles from './Admin.module.css';

interface IClaimEmailsTableProps {
  sessionToken: any;
  resendEmail: any;
}

export const ClaimEmailsTable: React.FC<IClaimEmailsTableProps> = (props) => {
  const [rooms, setRooms] = useState<
    {
      email: string;
      name: string;
      resolved_at: string;
      emailed_at: string;
      room_id: number;
    }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ErrorInfo>(null!);

  useEffect(() => {
    Api.adminRoomClaimsData(props.sessionToken).then((claimsData: any) => {
      setIsLoading(false);
      setRooms(claimsData.data);
    });
  }, []);

  function actionForRoom(room: any) {
    if (!room.resolved_at) {
      return <Button onClick={() => props.resendEmail(room.email, room.name)}>Resend email</Button>;
    }
  }

  return error ? (
    <ErrorPage type={error.errorType} errorMessage={error.error?.message} />
  ) : (
    <main className={clsx(styles.root)}>
      {isLoading ? (
        <div className={clsx(styles.root, 'u-flex u-flexJustifyCenter u-flexAlignItemsCenter')}>
          <CircularProgress />
        </div>
      ) : (
        <>
          <TableContainer component={Paper} className={styles.tableContainer}>
            <Table aria-label="user table">
              <TableHead>
                <TableRow>
                  <TableCell>Email</TableCell>
                  <TableCell>Room</TableCell>
                  <TableCell>Emailed at</TableCell>
                  <TableCell>Claimed at</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rooms.map((room) => (
                  <TableRow key={room.room_id}>
                    <TableCell component="th" scope="row">
                      {room.email}
                    </TableCell>
                    <TableCell>{room.name}</TableCell>
                    <TableCell>{room.emailed_at}</TableCell>
                    <TableCell>{room.resolved_at}</TableCell>
                    <TableCell>{actionForRoom(room)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </main>
  );
};
