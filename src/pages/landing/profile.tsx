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
      <a key={`room_${room.id}`} href={this.roomUrl(room)}>
        {this.roomName(room)}
      </a>
    );
  }

  roomUrl(room: any) {
    return `/${this.roomName(room)}`;
  }

  roomName(room: any) {
    return room.name || room.unique_id;
  }
}
