import React from 'react';
import Api from '../utils/api';
import { useLocation } from 'react-router-dom';

type RoomProps = {
  name: string;
  error: any;
  setError: any;
};

export default function VerifyEmail() {
  const query = new URLSearchParams(useLocation().search);
  const otp: string = query.get('otp') || '';
  const email: string = query.get('email') || '';

  const renderError = (result: any) => {
    const output: any = document.getElementById('output') || {};
    output['innerHTML'] = result.message;
    alert(result.message);
  };

  Api.completeSignup(otp, email).then((result: any) => {
    if (result.success) {
      window.localStorage.setItem('__session_token', result.token);
      window.location.href = '/';
    } else {
      renderError(result);
    }
  });

  return (
    <div>
      <div id="output"> Finishing account setup... </div>
    </div>
  );
}
