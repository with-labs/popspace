import React from 'react';
import Api from '../utils/api';
import { useLocation } from 'react-router-dom';
import Signup from './signup';

export default function SignupThroughInvite() {
  const query = new URLSearchParams(useLocation().search);
  const otp: string = query.get('otp') || '';
  const email: string = query.get('email') || '';
  const inviteId: string = query.get('iid') || '';

  const signUpAndJoinRoom = async (data: any) => {
    // If the user signed up by other means, we allow this link to work
    const existingToken = window.localStorage.getItem('__session_token');
    const result: any = await Api.registerThroughInvite(existingToken, data, otp, inviteId);
    if (result.success) {
      console.log(result);
      if (result.newSessionToken) {
        window.localStorage.setItem('__session_token', result.newSessionToken);
      }
      // window.location.href = `/${result.roomName}`;
    } else {
      alert(result.message);
    }
  };

  return <Signup email={email} register={signUpAndJoinRoom} />;
}
