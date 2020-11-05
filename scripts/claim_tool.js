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
  "production": "https://app.with.so"
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

const sendClaims = async (claims, allowEmailed) => {
  console.log(`About to send ${claims.length} emails...`)
  for(const claim of claims) {
    if(claim.emailed_at && !allowEmailed) {
      console.log(`Already sent email to ${claim.email} at ${claim.emailed_at}; skipping`)
      continue
    }
    if(claim.resolved_at) {
      console.log(`Already claimed ${claim.room_id} for ${claim.email} at ${claim.resolved_at}; skipping`)
      continue
    }
    const url = await rooms.getClaimUrl(global.gcfg.appUrl(), claim)
    const nameEntry = await rooms.preferredNameById(claim.room_id)
    await rooms.claimUpdateEmailedAt(claim.id)
    await lib.email.room.sendRoomClaimEmail(claim.email, nameEntry.name, url)
    console.log(`Sent to ${claim.email}`)
  }
}

const sendUnsent = async () => {
  const claims = await db.pg.massive.room_claims.find({ emailed_at: null })
  return await sendClaims(claims, false)
}

const sendUnclaimed = async () => {
  const claims = await db.pg.massive.room_claims.find({ resolved_at: null })
  return await sendClaims(claims, true)
}

const run = async () => {
  const optionDefinitions = [
    { name: 'allow-registered', alias: "r", type: Boolean},
    { name: 'mode', alias: "m", type: String},
  ]
  const options = commandLineArgs(optionDefinitions)
  const allowRegistered = options['allow-registered'] || ALLOW_REGISTERED_DEFAULT
  const mode  = options['mode']

  try {
    await lib.init(APP_URL[process.env.NODE_ENV])
    db.pg.silenceLogs()
    switch(mode) {
      case 'from_csv':
        const filename = `${__dirname}/one_time/data/test.csv`
        //const filename = `${__dirname}/one_time/data/subscribed_segment_export_5f6de9269c.csv`
        console.log(`Populating database claims from ${filename}`)
        await claimsFromCsv(allowRegistered, filename)
        break
      case 'send_unsent':
        await sendUnsent(allowRegistered)
        break
      case 'send_unclaimed':
        await sendUnclaimed()
        break
      default:
        console.log("Please provide --mode: 'from_csv', 'send_unsent', 'send_unclaimed'")
        break
    }
  } catch(e) {
    console.log(e)
  } finally {
    console.log("Done")
    process.exit(0)
  }
}

run()

