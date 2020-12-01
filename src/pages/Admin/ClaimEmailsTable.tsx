// WIP : add in complete error handling, keep expading features
import React, { useState, useEffect } from 'react';
import { Button, CircularProgress, Box, makeStyles } from '@material-ui/core';
import Api from '../../utils/api';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

interface IClaimEmailsTableProps {
  resendEmail: (emailStr: string, roomNameStr: string) => void;
}

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    width: '100%',
    backgroundColor: theme.palette.brandColors.sand.regular,
  },
  tableContainer: {
    marginTop: theme.spacing(2),
  },
  spinner: {
    backgroundColor: theme.palette.brandColors.sand.regular,
  },
}));

export const ClaimEmailsTable: React.FC<IClaimEmailsTableProps> = ({ resendEmail }) => {
  const classes = useStyles();

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

  useEffect(() => {
    Api.adminRoomClaimsData().then((claimsData: any) => {
      setIsLoading(false);
      setRooms(claimsData.data);
    });
  }, []);

  function actionForRoom(room: any) {
    if (!room.resolved_at) {
      return <Button onClick={() => resendEmail(room.email, room.name)}>Resend email</Button>;
    }
  }

  return (
    <main className={classes.root}>
      {isLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" flexGrow={1} className={classes.spinner}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer component={Paper} className={classes.tableContainer}>
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
