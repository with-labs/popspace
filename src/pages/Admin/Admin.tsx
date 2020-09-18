import React, { useState } from 'react';
import { TextField } from '../../withComponents/TextField/TextField';
import { Button, ButtonTypes } from '../../withComponents/Button/Button';
import { Header } from '../../withComponents/Header/Header';

interface IAdminProps {}

export const Admin: React.FC<IAdminProps> = (props) => {
  const [email, setEmail] = useState('');
  const [roomName, setRoomName] = useState('');
  const onFormSubmit = () => {};

  return (
    <main>
      <Header text="Admin" />
      <form onSubmit={onFormSubmit}>
        <div className="u-flex u-sm-flexCol u-flexRow">
          <TextField
            id={`email`}
            value={email}
            onChangeHandler={(event: React.ChangeEvent<HTMLInputElement>) => setEmail(event.target.value)}
            labelText="Email"
          />
          <TextField
            id={`roomName`}
            value={roomName}
            onChangeHandler={(event: React.ChangeEvent<HTMLInputElement>) => setRoomName(event.target.value)}
            labelText="Room Name"
          />
        </div>
        <Button
          buttonText="Send invite"
          type={ButtonTypes.SUBMIT}
          isDisabled={email.length === 0 || roomName.length === 0}
        />
      </form>
      <div></div>
    </main>
  );
};
