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
  const data = await readCsv(path)
  for(const row of data) {
    const email = row['Email Address']
    const roomName = row['Room name']
    try {
      const claim = await createOneClaim(email, roomName, allowRegistered)
      console.log(`claim ${claim.id} created ${email} -> ${roomName}`)
    } catch(errorCode) {
      switch(errorCode) {
        case lib.db.ErrorCodes.user.ALREADY_REGISTERED:
          console.log("Skipping already registered user : ", email)
        case lib.db.ErrorCodes.room.UNKNOWN_ROOM:
          // this shouldn't happen; we always allow creating new
          console.log(`Unknown room name ${roomName}`)
        case lib.db.ErrorCodes.room.CLAIM_UNIQUENESS:
          console.log(`Skipping: claim for this room already exists; claimer: ${email}`)
      }

    }

  }
}

const sendUnsent = async (allowRegistered) => {
  const appUrl = "http://localhost:8888"
  const url = await rooms.getClaimUrl(appUrl, claim)
  console.log("Claim URL:", url)
  if(sendEmail) {
    await lib.email.room.sendRoomClaimEmail(email, url)
    console.log("Email sent")
  }
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
    if(options['email-claims-from-queue']) {
      await sendUnsent(allowRegistered)
    } else {
      await claimsFromCsv(allowRegistered, `${__dirname}/one_time/data/subscribed_segment_export_5f6de9269c.csv`)
    }
  } catch(e) {
    console.log(e)
  } finally {
    process.exit(0)
  }
}

run()

