import React, { useEffect, useState } from 'react';
import Api from '../utils/api';
import { useLocation } from 'react-router-dom';
import Signup from './signup';

const ERRORS = {
  CLAIM_FAIL_NO_SUCH_USER: 1,
};

export default function ClaimRoom() {
  const query = new URLSearchParams(useLocation().search);
  const otp: string = query.get('otp') || '';
  const email: string = query.get('email') || '';
  const claimId: string = query.get('cid') || '';

  const [showSignup, setShowSignup] = useState(false);

  const renderError = (result: any) => {
    const output: any = document.getElementById('output') || {};
    output['innerHTML'] = result.message;
    alert(result.message);
  };

  const signUpAndClaimRoom = async (data: any) => {
    // If the user signed up by other means, we allow this link to work
    const existingToken = window.localStorage.getItem('__session_token');
    const result: any = await Api.registerThroughClaim(existingToken, data, otp, claimId);
    if (result.success) {
      console.log(result);
      if (result.newSessionToken) {
        window.localStorage.setItem('__session_token', result.newSessionToken);
      }
      window.location.href = `/${result.roomName}`;
    } else {
      alert(result.message);
    }
  };

  const maybeRenderSignup = () => {
    if (showSignup) {
      return (
        <div>
          <h1>Welcome to With Beta!</h1>
          <h2>Thanks for being an Alpha user! Complete the signup for to claim your Alpha room.</h2>
          <Signup email={email} register={signUpAndClaimRoom} />;
        </div>
      );
    }
  };

  const requestCompleteSetup = () => {
    Api.resolveRoomClaim(window.localStorage.getItem('__session_token'), otp, claimId).then((result: any) => {
      if (result.success) {
        if (result.newSessionToken) {
          window.localStorage.setItem('__session_token', result.newSessionToken);
        }
        window.location.href = `/${result.roomName}`;
      } else {
        if (result.errorCode == ERRORS.CLAIM_FAIL_NO_SUCH_USER) {
          setShowSignup(true);
        } else {
          renderError(result);
        }
      }
    });
  };

  useEffect(requestCompleteSetup, []);

  return <div> {maybeRenderSignup()} </div>;
}
