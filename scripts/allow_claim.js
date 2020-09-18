require("dotenv").config()
const commandLineArgs = require('command-line-args')
const lib = require("../functions/lib/index.js")

const ERRORS = {
  ALREADY_REGISTERED: 1,
  UNKNOWN_ROOM: 2,
  CLAIM_UNIQUENESS: 3
}

const rooms = new db.Rooms()

class Claims {
  constructor() {

  }

  async createClaim(email, roomName, allowRegistered=false, createNewRooms=false) {
    email = lib.util.args.consolidateEmailString(email)
    const user = await db.pg.massive.users.findOne({ email: email })
    if(user) {
      if(allowRegistered) {
        console.log(`Warning: user ${user.email} already registered.`)
      } else {
        return { error: ERRORS.ALREADY_REGISTERED }
      }
    }

    let roomNameEntry = await db.pg.massive.room_names.findOne({name: roomName})

    if(!roomNameEntry) {
      if(createNewRooms) {
        const priorityLevel = 1
        const isVanity = true
        const ownerId = null
        const createResult =  await rooms.createRoomWithName(roomName, ownerId, priorityLevel, isVanity)
        roomNameEntry = createResult.nameEntry
      } else {
        return { error: ERRORS.UNKNOWN_ROOM }
      }
    }

    let room = await rooms.roomById(roomNameEntry.room_id)
    const existingClaim = await db.pg.massive.room_claims.findOne({room_id: room.id})
    if(existingClaim) {
      return { error: ERRORS.CLAIM_UNIQUENESS }
    }
    const claim = await rooms.createClaim(room.id, email)
    return { claim }
  }
}


const createClaim = async (email, roomName, allowRegistered, createNewRooms, sendEmail=false) => {
  if(!email || !roomName) {
    throw("--email and --room-name required arguments")
  }
  await lib.init()
  const claims = new Claims()
  const result = await claims.createClaim(email, roomName, allowRegistered, createNewRooms, sendEmail)

  switch(result.error) {
    case ERRORS.ALREADY_REGISTERED:
      throw ("specify --allow-registered=true to create claims for registered users")
    case ERRORS.UNKNOWN_ROOM:
      throw("Unknown room name: specify a valid --room-name")
    case ERRORS.CLAIM_UNIQUENESS:
      throw(`Claim for this room already exists; claimer: ${email}`)
  }

  const claim = result.claim

  console.log("claim created", claim.id, email, roomName)

  const appUrl = "http://localhost:8888"
  const url = await rooms.getClaimUrl(appUrl, claim)
  console.log("Claim URL:", url)
  if(sendEmail) {
    await lib.email.room.sendRoomClaimEmail(email, url)
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

