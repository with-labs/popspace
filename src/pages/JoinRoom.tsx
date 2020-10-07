import React, { useEffect, useState } from 'react';
import Api from '../utils/api';
import { useLocation } from 'react-router-dom';
import Signup from './signup';

const ERRORS = {
  JOIN_FAIL_NO_SUCH_USER: 1,
  JOIN_ALREADY_MEMBER: 2,
};

export default function JoinRoom() {
  const query = new URLSearchParams(useLocation().search);
  const otp: string = query.get('otp') || '';
  const email: string = query.get('email') || '';
  const inviteId: string = query.get('iid') || '';

  const [showSignup, setShowSignup] = useState(false);

  const renderError = (result: any) => {
    const output: any = document.getElementById('output') || {};
    output['innerHTML'] = result.message;
    alert(result.message);
  };

  const signUpAndJoinRoom = async (data: any) => {
    // If the user signed up by other means, we allow this link to work
    const existingToken = window.localStorage.getItem('__session_token');
    const result: any = await Api.registerThroughInvite(existingToken, data, otp, inviteId);
    if (result.success) {
      console.log(result);
      if (result.newSessionToken) {
        window.localStorage.setItem('__session_token', result.newSessionToken);
      }
      window.location.href = `/${result.roomName}`;
    } else {
      // invalid link page
      alert(result.message);
    }
  };

  const maybeRenderSignup = () => {
    if (showSignup) {
      return <Signup email={email} register={signUpAndJoinRoom} />;
    }
  };

  const requestCompleteSetup = () => {
    Api.resolveRoomInvite(window.localStorage.getItem('__session_token'), otp, inviteId).then((result: any) => {
      if (result.success) {
        console.log(result);
        if (result.newSessionToken) {
          window.localStorage.setItem('__session_token', result.newSessionToken);
        }
        window.location.href = `/${result.roomName}`;
      } else {
        if (result.errorCode === ERRORS.JOIN_FAIL_NO_SUCH_USER) {
          setShowSignup(true);
        } else {
          renderError(result);
          // same as finalize account
        }
      }
    });
  };

  useEffect(requestCompleteSetup, []);

  return <div>{maybeRenderSignup()}</div>;
}
