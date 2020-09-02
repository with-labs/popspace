import React from 'react';
import Api from '../utils/api';
import Signup from './signup';
import { useLocation } from 'react-router-dom';

export default function VerifyEmail() {
  const query = new URLSearchParams(useLocation().search);
  const otp: string = query.get('otp') || '';
  const inviteId: string = query.get('iid') || '';

  const renderError = (result: any) => {
    const output: any = document.getElementById('output') || {};
    output['innerHTML'] = result.message;
    alert(result.message);
  };

  const register = (input) => {
    Api.registerThroughInvite(input, otp, inviteId).then((result: any) => {
      if (result.success) {
        if (result.newSessionToken) {
          window.localStorage.setItem('__session_token', result.newSessionToken);
        }
        window.location.href = `/${result.roomName}`;
      } else {
        renderError(result);
      }
    });
  };

  return <Signup register={register} />;
}
