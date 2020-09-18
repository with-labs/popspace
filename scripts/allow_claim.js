const commandLineArgs = require('command-line-args')
const lib = require("../functions/lib/index.js")

class Claims {
  constructor() {

  }
}


const createClaim = async (email, roomName, allowRegistered=false, createNewRooms=false) => {
  if(!email || !roomName) {
    throw("--email and --room-name required arguments")
  }
  await lib.init()
  email = lib.util.args.consolidateEmailString(email)
  const user = await db.pg.massive.users.findOne({ email: email })
  if(user) {
    if(allowRegistered) {
      console.log(`Warning: user ${user.email} already registered.`)
    } else {
      throw ("specify --allow-registered=true to create claims for registered users")
    }
  }

  let roomNameEntry = await db.pg.massive.room_names.findOne({name: roomName})
  const rooms = new db.Rooms()

  if(!roomNameEntry) {
    if(createNewRooms) {
      const priorityLevel = 1
      const isVanity = true
      const ownerId = null
      const createResult =  await rooms.createRoomWithName(roomName, ownerId, priorityLevel, isVanity)
      roomNameEntry = createResult.nameEntry
    } else {
      throw("Unknown room name - specify a valid --room-name")
    }
  }

  let room = await rooms.roomById(roomNameEntry.room_id)
  const existingClaim = await db.pg.massive.room_claims.findOne({room_id: room.id})
  if(existingClaim) {
    throw(`Claim for this room already exists; claimer: ${existingClaim.email}`)
  }
  const claim = await rooms.createClaim(room.id, email)
  console.log("claim created", claim.id, email, roomNameEntry.name)

  const appUrl = "http://localhost:8888"
  const url = await rooms.getClaimUrl(appUrl, claim)

  console.log("Claim URL:", url)

  process.exit(0)
}

const optionDefinitions = [
  { name: 'email', alias: 'e', type: String },
  { name: 'room-name', alias: 'r', type: String },
  { name: 'allow-registered', alias: "a", type: Boolean},
  { name: 'create-new-rooms', alias: "c", type: Boolean},
]
const options = commandLineArgs(optionDefinitions)

const run = async () => {
  try {
    await createClaim(options.email, options['room-name'], options['allow-registered'], options['create-new-rooms'])
  } catch(e) {
    console.log(e)
    process.exit(0)
  }
}

run()

