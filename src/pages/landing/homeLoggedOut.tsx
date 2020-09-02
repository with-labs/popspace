import React from 'react';
import { styled } from '@material-ui/core/styles';
import Api from '../../utils/api';

const Main = styled('main')({
  height: '100%',
  position: 'relative',
  color: '#000',
  textAlign: 'center',
});

const Auth = styled('button')({
  fontSize: '24px',
  marginTop: '5%',
  marginRight: '5px',
  cursor: 'pointer',
});

const Email = styled('input')({
  fontSize: '24px',
});

const logIn = async () => {
  const emailInput: any = document.getElementById('email') || {};
  const email = emailInput.value;
  const loginRequest: any = await Api.requestLoginOtp(email);
  if (loginRequest.success) {
    const output: any = document.getElementById('tmp') || {};
    output.innerHTML = `<div> Check your email to log in! </a>`;
  } else {
    alert(loginRequest.message);
  }
};
const signUp = () => {
  window.location.href = '/signup';
};

export default class Landing extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
  }

  render() {
    return (
      <Main>
        <Email id="email" placeholder="email" />
        <Auth onClick={logIn}> Log in </Auth>
        <div />
        <Auth onClick={signUp}> Sign up </Auth>
        <div id="tmp" />
      </Main>
    );
  }
}
