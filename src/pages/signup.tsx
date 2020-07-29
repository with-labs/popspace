import React from 'react';
import { styled } from '@material-ui/core/styles';

const Main = styled('main')({
  height: '100%',
  position: 'relative',
  color: '#000',
  textAlign: 'center',
});

export default function Landing() {
  return <Main>Sign up</Main>;
}
