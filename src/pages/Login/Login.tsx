import React, { useState } from 'react';
import './index.css';

import LoginInput from '../../withComponents/LoginInput/LoginInput';

import withLogo from './images/with.svg';
import hashTag from './images/hashTag.svg';
import key from './images/key.svg';
import person from './images/person.svg';

const Login = () => {
  const [roomName, setRoomName] = useState('');
  const [password, setPassword] = useState('');
  const [screenName, setScreenName] = useState('');

  const onSubmitHandler = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    //TODO input validation and add stuff here
  };

  return (
    <div className="Login">
      <img src={withLogo} />
      <div className="Login-titleText">Create a new room</div>
      <form className="Login-form" onSubmit={onSubmitHandler}>
        <LoginInput
          imgSrc={hashTag}
          imgAltText={'hashTag image'}
          placeholderText={'Room hastag (example #happyhourSF)'}
          classNames={'Login-formInputOffset'}
          value={roomName}
          setValue={setRoomName}
        />
        <LoginInput
          imgSrc={key}
          imgAltText={'key image'}
          placeholderText={'Passord (optional)'}
          classNames={'Login-formInputOffset'}
          value={password}
          setValue={setPassword}
        />
        <LoginInput
          imgSrc={person}
          imgAltText={'person image'}
          placeholderText={'Screen name'}
          value={screenName}
          setValue={setScreenName}
        />
        <button
          type="submit"
          className={roomName && screenName ? 'Login-button' : 'Login-button Login-button--inactive'}
        >
          Create Room
        </button>
      </form>
    </div>
  );
};

export default Login;
