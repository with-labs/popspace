// TODO: remove this
import React from 'react';
import { styled } from '@material-ui/core/styles';
import Api from '../../utils/api';

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

export default class Profile extends React.Component<any, any> {
  createRoom: (event: any) => void;
  invite: (room: any) => void;

  constructor(props: any) {
    super(props);
    this.createRoom = async () => {
      const result: any = await Api.createRoom(localStorage.getItem('__session_token'));
      if (result.success) {
        if (this.props.onProfileChange) {
          this.props.profile.rooms.owned.push(result.newRoom);
          this.props.onProfileChange(this.props.profile);
        }
      } else {
        window.alert(result.message);
      }
    };
    this.invite = async (room) => {
      // TODO: use proper react style to fetch input values
      const emailInput: any = document.getElementById(`invite_${room.id}`);
      const result: any = await Api.roomInvite(localStorage.getItem('__session_token'), room.id, emailInput.value);
      if (result.success) {
        window.alert('Invite email sent!');
      } else {
        window.alert(result.message);
      }
    };
  }

  render() {
    return (
      <Main>
        <h1> Profile </h1>
        <div>Welcome, {this.props.profile.user.display_name}</div>
        {this.renderRooms()}
        <br />
        <button onClick={logOut}> Log out </button>
      </Main>
    );
  }

  renderRooms() {
    return (
      <div>
        <h2> Your rooms </h2>
        {this.renderCreateRoom()}
        <br />
        <br />
        {this.renderOwnedRoomList(this.props.profile.rooms.owned)}
        <h2> Rooms you're a member in </h2>
        {this.renderMemberRoomList(this.props.profile.rooms.member)}
      </div>
    );
  }

  renderOwnedRoomList(rooms: any) {
    const roomRenderer = (room: any) => this.renderOwnedRoom(room);
    return rooms.map(roomRenderer);
  }

  renderMemberRoomList(rooms: any) {
    const roomRenderer = (room: any) => this.renderMemberRoom(room);
    return rooms.map(roomRenderer);
  }

  renderOwnedRoom(room: any) {
    return (
      <div key={`oroom_${room.id}`}>
        <a href={this.roomUrl(room)}>{this.roomName(room)}</a>
        <input id={`invite_${room.id}`} placeholder="Invite by email" />
        <button
          onClick={() => {
            this.invite(room);
          }}
        >
          {' '}
          Invite{' '}
        </button>
      </div>
    );
  }

  renderMemberRoom(room: any) {
    return (
      <div key={`mroom_${room.id}`}>
        <a href={this.roomUrl(room)}>{this.roomName(room)}</a>
      </div>
    );
  }

  roomUrl(room: any) {
    return `/${this.roomName(room)}`;
  }

  roomName(room: any) {
    return room.name;
  }

  renderCreateRoom() {
    return <button onClick={this.createRoom}>New room</button>;
  }
}
