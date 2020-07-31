import React from 'react';
import { styled } from '@material-ui/core/styles';

const Main = styled('main')({
  height: '100%',
  position: 'relative',
  color: '#000',
  textAlign: 'center',
});
const logOut = () => {
  localStorage.removeItem('__session_token');
  window.location.href = '/';
};

export default class Landing extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
  }

  render() {
    return (
      <Main>
        <h1> Profile </h1>
        <div>Welcome, {this.props.profile.user.display_name}</div>
        <button onClick={logOut}> Log out </button>
      </Main>
    );
  }
}
