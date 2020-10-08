/**
Tool for our alpha user migration:

Migrate user+room pairs into the database and send an
email for users to claim their rooms/finish registration.

Allows populating the DB with room claims from a CSV,
and also sending emails for pending room claims,
only sending 1 email per claim.

Run with --email-claims-from-queue to send emails.

Accepts --allow-registered to send room claims for existing users.
*/

require("dotenv").config()
const commandLineArgs = require('command-line-args')
const lib = require("../functions/lib/index.js")

const csv = require('csv-parser');
const fs = require('fs');

const APP_URL = {
  "development": "http://localhost:8888",
  "staging": "https://dev.app.with.so",
  "production": "https://with.so"
}

async function readCsv(filename) {
  const result = []
  return new Promise((accept, reject) => {
    fs.createReadStream(filename)
    .pipe(csv())
    .on('data', (row) => {
      result.push(row)
    })
    .on('end', () => {
      accept(result)
    });
  })
}

const rooms = new db.Rooms()
const ALLOW_REGISTERED_DEFAULT = false
const CREATE_NEW_ROOMS = true

const createOneClaim = async (email, roomName, allowRegistered) => {
  const shouldSendEmails = false
  console.log(`Trying to create claim ${email} ${roomName}`)
  const result = await rooms.tryToCreateClaim(
    email,
    roomName,
    allowRegistered,
    CREATE_NEW_ROOMS,
    shouldSendEmails
  )

  if(result.error) {
    throw(result.error)
  }

  return result.claim
}

const claimsFromCsv = async (allowRegistered, path) => {
  console.log(`Importing from ${path}`)
  const data = await readCsv(path)
  for(const row of data) {
    const email = row['email']
    const roomName = row['name']
    try {
      console.log("=========================================")
      const claim = await createOneClaim(email, roomName, allowRegistered)
      console.log(`claim ${claim.id} created ${email} -> ${roomName}`)
    } catch(errorCode) {
      switch(errorCode) {
        case lib.db.ErrorCodes.user.ALREADY_REGISTERED:
          console.log("Skipping already registered user : ", email)
          break
        case lib.db.ErrorCodes.room.UNKNOWN_ROOM:
          // this shouldn't happen; we always allow creating new
          console.log(`Unknown room name ${roomName}`)
          break
        case lib.db.ErrorCodes.room.CLAIM_UNIQUENESS:
          console.log(`Skipping: claim for this room already exists; claimer: ${email}`)
          break
        default:
          console.log(`Unknown error: ${errorCode}`)
          break
      }
    }
  }
  console.log("Import complete")
}

const sendUnsent = async (allowRegistered) => {
  const claims = await db.pg.massive.room_claims.find({ emailed_at: null })
  console.log(`About to send ${claims.length} emails...`)
  const appUrl = APP_URL[process.env.NODE_ENV]
  for(const claim of claims) {
    if(claim.emailed_at) {
      console.log(`Already sent email to ${claim.email} at ${claim.emailed_at}; skipping`)
      continue
    }
    const url = await rooms.getClaimUrl(appUrl, claim)
    const nameEntry = await rooms.preferredNameById(claim.room_id)
    await rooms.claimUpdateEmailedAt(claim.id)
    await lib.email.room.sendRoomClaimEmail(claim.email, nameEntry.name, url)
    console.log(`Sent to ${claim.email}`)
  }
  console.log("Done")
}

const run = async () => {
  const optionDefinitions = [
    { name: 'allow-registered', alias: "r", type: Boolean},
    { name: 'email-claims-from-queue', alias: "q", type: Boolean},
  ]
  const options = commandLineArgs(optionDefinitions)

  const allowRegistered = options['allow-registered'] || ALLOW_REGISTERED_DEFAULT
  try {
    await lib.init()
    db.pg.silenceLogs()
    if(options['email-claims-from-queue']) {
      await sendUnsent(allowRegistered)
    } else {
      // await claimsFromCsv(allowRegistered, `${__dirname}/one_time/data/subscribed_segment_export_5f6de9269c.csv`)
      await claimsFromCsv(allowRegistered, `${__dirname}/one_time/data/test.csv`)
    }
  } catch(e) {
    console.log(e)
  } finally {
    process.exit(0)
  }
}

run()

