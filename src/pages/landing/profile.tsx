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

  constructor(props: any) {
    super(props);
    const sessionToken = localStorage.getItem('__session_token');
    this.createRoom = async () => {
      const result: any = await Api.createRoom(sessionToken);
      if (result.success) {
        if (this.props.onProfileChange) {
          this.props.profile.rooms.owned.push(result.newRoom);
          this.props.onProfileChange(this.props.profile);
        }
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
        <button onClick={logOut}> Log out </button>
      </Main>
    );
  }

  renderRooms() {
    return (
      <div>
        <h2> Your rooms </h2>
        {this.renderRoomList(this.props.profile.rooms.owned)}
        {this.renderCreateRoom()}
        <h2> Rooms you're a member in </h2>
        {this.renderRoomList(this.props.profile.rooms.member)}
      </div>
    );
  }

  renderRoomList(rooms: any) {
    const roomRenderer = (room: any) => this.renderRoom(room);
    return rooms.map(roomRenderer);
  }

  renderRoom(room: any) {
    return (
      <div key={`room_${room.id}`}>
        <a href={this.roomUrl(room)}>{this.roomName(room)}</a>
      </div>
    );
  }

  roomUrl(room: any) {
    return `/${this.roomName(room)}`;
  }

  roomName(room: any) {
    return room.name || room.unique_id;
  }

  renderCreateRoom() {
    return <button onClick={this.createRoom}>New room</button>;
  }
}
