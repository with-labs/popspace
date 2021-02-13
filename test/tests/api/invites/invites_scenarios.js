global.tlib = require("../../../lib/_testlib")

module.exports = {
  "enable_invite_link": tlib.TestTemplate.nAuthenticatedUsers(1, async (testEnvironment) => {
    const userInfo = testEnvironment.loggedInUsers[0]
    try {
      const response = await userInfo.client.sendHttpPost("/enable_public_invite_link", {room_id: userInfo.room.id})
      return { response }
    } catch(error) {
      return { error }
    }
  }),

  "enable_invite_twice": tlib.TestTemplate.nAuthenticatedUsers(1, async (testEnvironment) => {
    const userInfo = testEnvironment.loggedInUsers[0]
    try {
      const response1 = await userInfo.client.sendHttpPost("/enable_public_invite_link", {room_id: userInfo.room.id})
      const response2 = await userInfo.client.sendHttpPost("/enable_public_invite_link", {room_id: userInfo.room.id})

      return { response1, response2 }
    } catch(error) {
      return { error }
    }
  }),

  "enable_invite_non_existent_room": () => {},
  "enable_invite_deleted_room": () => {},
  "enable_invite_not_owner": () => {},


  "retrieve_invite_link": tlib.TestTemplate.nAuthenticatedUsers(1, async (testEnvironment) => {
    const userInfo = testEnvironment.loggedInUsers[0]
    try {
      const response = await userInfo.client.sendHttpPost("/enable_public_invite_link", {room_id: userInfo.room.id})
      return {
        response
      }
    } catch(e) {
      return {
        error: e
      }
    }
  }),

  "disable_invite_link": () => {

  },

  "disable_invite_link_unauthorized": () => {

  }




}
