import React from 'react';
import { styled } from '@material-ui/core/styles';

import HomeLoggedOut from './landing/home_logged_out';
import Profile from './landing/profile';
import Api from '../utils/api';

const Main = styled('main')({
  height: '100%',
  position: 'relative',
  color: '#000',
  textAlign: 'center',
});

export default class Landing extends React.Component<any, any> {
  constructor(props: any) {
    super(props);

    const sessionToken = localStorage.getItem('__session_token');

    this.state = {
      loading: !!sessionToken,
      profile: null,
      error: null,
    };

    if (sessionToken) {
      Api.getProfile(sessionToken).then((result: any) => {
        if (result.success) {
          this.setState({ profile: result.profile, loading: false });
        } else {
          this.setState({ error: result.message, loading: false });
        }
      });
    }
  }

  render() {
    console.log(this.state);
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
    return <Main>{this.state.error}</Main>;
  }

  renderLoggedIn() {
    return <Profile profile={this.state.profile} />;
  }

  renderLoggedOut() {
    return <HomeLoggedOut />;
  }
}
