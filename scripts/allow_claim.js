require("dotenv").config()
const commandLineArgs = require('command-line-args')
const lib = require("../functions/lib/index.js")

const rooms = new db.Rooms()


const createClaim = async (email, roomName, allowRegistered, createNewRooms, sendEmail=false) => {
  if(!email || !roomName) {
    throw("--email and --room-name required arguments")
  }
  await lib.init()

  const result = await rooms.tryToCreateClaim(email, roomName, allowRegistered, createNewRooms, sendEmail)

  switch(result.error) {
    case lib.db.ErrorCodes.user.ALREADY_REGISTERED:
      throw ("specify --allow-registered=true to create claims for registered users")
    case lib.db.ErrorCodes.room.UNKNOWN_ROOM:
      throw("Unknown room name: specify a valid --room-name")
    case lib.db.ErrorCodes.room.CLAIM_UNIQUENESS:
      throw(`Claim for this room already exists; claimer: ${email}`)
  }

  const claim = result.claim

  console.log("claim created", claim.id, email, roomName)

  const appUrl = "http://localhost:8888"
  const url = await rooms.getClaimUrl(appUrl, claim)
  console.log("Claim URL:", url)
  if(sendEmail) {
    await rooms.claimUpdateEmailedAt(claim.id)
    await lib.email.room.sendRoomClaimEmail(email, roomName, url)
    console.log("Email sent")
  }

  process.exit(0)
}


const run = async () => {
  const optionDefinitions = [
    { name: 'email', alias: 'e', type: String },
    { name: 'room-name', alias: 'r', type: String },
    { name: 'allow-registered', alias: "a", type: Boolean},
    { name: 'create-new-rooms', alias: "c", type: Boolean},
    { name: 'send-email', alias: "s", type: Boolean},
  ]
  const options = commandLineArgs(optionDefinitions)

  try {
    await createClaim(
      options.email,
      options['room-name'],
      options['allow-registered'],
      options['create-new-rooms'],
      options['send-email']
    )
  } catch(e) {
    console.log(e)
    process.exit(0)
  }
}

run()

