import React from 'react';
import { styled } from '@material-ui/core/styles';

import HomeLoggedOut from './landing/homeLoggedOut';
import Profile from './landing/profile';
import Api from '../utils/api';

const Main = styled('main')({
  height: '100%',
  position: 'relative',
  color: '#000',
  textAlign: 'center',
});

const sessionTokenExists = (sessionToken: any) => {
  return !!sessionToken && sessionToken !== 'undefined' && sessionToken !== 'null';
};

export default class Landing extends React.Component<any, any> {
  onProfileChange: Function;

  constructor(props: any) {
    super(props);

    const sessionToken = localStorage.getItem('__session_token');

    this.state = {
      loading: sessionTokenExists(sessionToken),
      profile: null,
      error: null,
    };

    this.onProfileChange = (newProfile: any) => {
      this.setState(() => ({ profile: newProfile }));
    };
  }

  componentDidMount() {
    const sessionToken = localStorage.getItem('__session_token');
    if (sessionTokenExists(sessionToken)) {
      Api.getProfile(sessionToken).then((result: any) => {
        if (result.success) {
          this.setState({ profile: result.profile, loading: false });
        } else {
          // Perhaps we don't always want to remove the sessionToken
          // e.g. we could have an error when there's no iternet
          // localStorage.removeItem("__session_token");
          this.setState({ error: result.message, loading: false });
        }
      });
    }
  }

  render() {
    return <Main>{this.renderAppropriateState()}</Main>;
  }

  renderAppropriateState() {
    if (this.state.loading) {
      return this.renderLoading();
    } else if (this.state.error) {
      return this.renderError();
    } else if (this.state.profile) {
      return this.renderLoggedIn();
    } else {
      return this.renderLoggedOut();
    }
  }

  renderLoading() {
    return <Main>Loading</Main>;
  }

  renderError() {
    // If something went wrong with authenticating,
    // we should just render the logged out view
    return (
      <Main>
        <HomeLoggedOut />
        {this.state.error}
      </Main>
    );
  }

  renderLoggedIn() {
    return <Profile profile={this.state.profile} onProfileChange={this.onProfileChange} />;
  }

  renderLoggedOut() {
    return <HomeLoggedOut />;
  }
}
