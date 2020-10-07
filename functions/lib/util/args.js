module.exports = {
  consolidateEmailString: (email) => {
    if(email) {
      return email.trim().toLowerCase()
    }
    return email
  },

  normalizeRoomName: (roomName) => {
    if(roomName) {
      return roomName.trim().toLowerCase()
    }
    return roomName
  }
}
