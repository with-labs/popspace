const SENDER = 'notify@with.so'

module.exports = {

  sendEmailWhatsNew: async (email, appUrl) => {
    const subject = `Bigger! 🎉`
    const tags = [{Name: "type", Value: "welcome"}]

    const user = await db.accounts.userByEmail(email)

    if(!user) {
      throw `Email not registered ${user.email}`
    }

    if(!user.newsletter_opt_in) {
      console.log(`User opted out of newsletters: ${email}`)
      return
    }

    const magicLink = await db.magic.createUnsubscribe(user.id)
    const unsubscribeUrl = await lib.db.magic.unsubscribeUrl(appUrl, magicLink)
    const firstName = user.first_name;
    const url = `${appUrl}/${util.routes.static.dashboard()}`

    const html = `
<div style="padding:8px;background:white;max-width:500px;margin:0px auto;text-align:center">
  <a style="border:none;display:block;height:34px;text-decoration:none;margin-bottom:10px" href="${url}">
    <img src="https://s3-us-west-2.amazonaws.com/with.playground/logo-medium.png" width="68" height="30" border="0">
  </a>
  <div style="overflow:hidden;border-radius:14px;background-color:#FFF8F0">
    <div style="padding:0px;margin:0px;border:none">
      <a style="padding:0px;margin:0px;border:none;text-decoration:none" href="${url}">
        <img style="width:100%;height:auto" src="https://s3.us-east-2.amazonaws.com/with.static/2020-10-22_bigroom_header.png">
      </a>
    </div>
    <div style="padding:20px;background:clear;margin:0px auto;text-align:left">
      <p style="font-size:16px;font-family:&#x27;Helvetica Neue&#x27;, Helvetica, Arial, sans-serif;line-height:1.6;color:#333;padding:0px 0px 20px 0px;margin:0px;background-color:clear">Hi ${firstName},</p>
      <p style="font-size:16px;font-family:&#x27;Helvetica Neue&#x27;, Helvetica, Arial, sans-serif;line-height:1.6;color:#333;padding:0px 0px 20px 0px;margin:0px;background-color:clear">We&#x27;ve got some exciting new updates to With!</p>
      <div style="padding:0px 0px 20px 0px;margin:0px;background-color:clear">
        <a style="background-color:#FFCB45;border-radius:6px;color:#7C4F00;display:inline-block;font-size:16px;font-weight:700;line-height:24px;padding:8px 16px;text-align:center;text-decoration:none;font-family:&#x27;Helvetica Neue&#x27;, Helvetica, Arial, sans-serif" href="${url}">Check out the new features</a>
      </div>
      <div style="padding:40px 0px 20px 0px;margin:0px;background-color:clear">
        <a style="padding:0px;margin:0px;border:none;text-decoration:none" href="${url}">
          <img style="width:100%;height:auto;border-radius:6px;padding:0px;margin:0px" src="https://s3.us-east-2.amazonaws.com/with.static/2020-10-22_bigroom_bigroom.gif">
        </a>
      </div>
      <div style="padding:0px 0px 20px 0px;background:clear;margin:0px auto;text-align:left;background-color:clear">
        <h2 style="font-size:18px;font-weight:700;color:#333;font-family:&#x27;Helvetica Neue&#x27;, Helvetica, Arial, sans-serif;line-height:1.6;margin:0px;padding:0px">The big room</h2>
      </div>
      <p style="font-size:16px;font-family:&#x27;Helvetica Neue&#x27;, Helvetica, Arial, sans-serif;line-height:1.6;color:#333;padding:0px 0px 20px 0px;margin:0px;background-color:clear">
        Your room just got much bigger! Rooms now extend beyond the edges of your browser window. This gives you more space to conduct a stand up, host a workshop, grab a colleague for a quick chat, or just find a quiet spot where you can focus on your work.
      </p>
      <p style="font-size:16px;font-family:&#x27;Helvetica Neue&#x27;, Helvetica, Arial, sans-serif;line-height:1.6;color:#333;padding:0px 0px 20px 0px;margin:0px;background-color:clear">
        You can zoom in and out with your mouse or trackpad, use the +/- keys, or you can use the zoom controls in the lower right hand corner of your screen.
      </p>
      <p style="font-size:16px;font-family:&#x27;Helvetica Neue&#x27;, Helvetica, Arial, sans-serif;line-height:1.6;color:#333;padding:0px 0px 20px 0px;margin:0px;background-color:clear">
        You can pan around the room by clicking and dragging on the wallpaper or by using the arrow buttons on your keyboard. We&#x27;ve added a physics model to moving and zooming so everything feels natural and smooth. Give it a whirl.
      </p>
      <div style="padding:40px 0px 20px 0px;margin:0px;background-color:clear">
        <a style="padding:0px;margin:0px;border:none;text-decoration:none" href="${url}">
          <img style="width:100%;height:auto;border-radius:6px;padding:0px;margin:0px" src="https://s3.us-east-2.amazonaws.com/with.static/2020-10-22_bigroom_youtube_spatial_audio.jpg">
        </a>
      </div>
      <div style="padding:0px 0px 20px 0px;background:clear;margin:0px auto;text-align:left;background-color:clear">
        <h2 style="font-size:18px;font-weight:700;color:#333;font-family:&#x27;Helvetica Neue&#x27;, Helvetica, Arial, sans-serif;line-height:1.6;margin:0px;padding:0px">YouTube spatial audio</h2>
      </div>
      <p style="font-size:16px;font-family:&#x27;Helvetica Neue&#x27;, Helvetica, Arial, sans-serif;line-height:1.6;color:#333;padding:0px 0px 20px 0px;margin:0px;background-color:clear">
        You now control the volume of YouTube videos by moving closer or further away from the video. You can also mute audio&#8212;for yourself&#8212;with the new mute control in the video&#x27;s title bar.
      </p>
      <div style="padding:40px 0px 20px 0px;margin:0px;background-color:clear">
        <a style="padding:0px;margin:0px;border:none;text-decoration:none" href="${url}">
          <img style="width:100%;height:auto;border-radius:6px;padding:0px;margin:0px" src="https://s3.us-east-2.amazonaws.com/with.static/2020-10-22_bigroom_whiteboard.jpg">
        </a>
      </div>
      <div style="padding:0px 0px 20px 0px;background:clear;margin:0px auto;text-align:left;background-color:clear">
        <h2 style="font-size:18px;font-weight:700;color:#333;font-family:&#x27;Helvetica Neue&#x27;, Helvetica, Arial, sans-serif;line-height:1.6;margin:0px;padding:0px">Updated accessories</h2>
      </div>
      <p style="font-size:16px;font-family:&#x27;Helvetica Neue&#x27;, Helvetica, Arial, sans-serif;line-height:1.6;color:#333;padding:0px 0px 20px 0px;margin:0px;background-color:clear">
        You can resize YouTube using the resize handle in the lower right corner, and you can save your whiteboard work with the save icon in our newly rewritten whiteboard accessory.
      </p>
      <div style="padding:40px 0px 20px 0px;margin:0px;background-color:clear">
        <a style="padding:0px;margin:0px;border:none;text-decoration:none" href="${url}">
          <img style="width:100%;height:auto;border-radius:6px;padding:0px;margin:0px" src="https://s3.us-east-2.amazonaws.com/with.static/2020-10-22_bigroom_user_accounts.png">
        </a>
      </div>
      <div style="padding:0px 0px 20px 0px;background:clear;margin:0px auto;text-align:left;background-color:clear">
        <h2 style="font-size:18px;font-weight:700;color:#333;font-family:&#x27;Helvetica Neue&#x27;, Helvetica, Arial, sans-serif;line-height:1.6;margin:0px;padding:0px">User accounts</h2>
      </div>
      <p style="font-size:16px;font-family:&#x27;Helvetica Neue&#x27;, Helvetica, Arial, sans-serif;line-height:1.6;color:#333;padding:0px 0px 20px 0px;margin:0px;background-color:clear">
        We recently introduced user accounts. Thank you to everyone who completed the migration process.
      </p>
      <p style="font-size:16px;font-family:&#x27;Helvetica Neue&#x27;, Helvetica, Arial, sans-serif;line-height:1.6;color:#333;padding:0px 0px 20px 0px;margin:0px;background-color:clear">
        We will soon allow you to invite other people via email. For now, your guests can still access your room with the same password as before.
      </p>
      <div style="padding:0px 0px 20px 0px;margin:0px;background-color:clear">
        <a style="background-color:#FFCB45;border-radius:6px;color:#7C4F00;display:inline-block;font-size:16px;font-weight:700;line-height:24px;padding:8px 16px;text-align:center;text-decoration:none;font-family:&#x27;Helvetica Neue&#x27;, Helvetica, Arial, sans-serif" href="${url}">Check out the new features</a>
      </div>
      <p style="font-size:16px;font-family:&#x27;Helvetica Neue&#x27;, Helvetica, Arial, sans-serif;line-height:1.6;color:#333;padding:0px 0px 20px 0px;margin:0px;background-color:clear">If you have any questions, please reply to this email.</p>
      <div style="font-size:16px;font-family:&#x27;Helvetica Neue&#x27;, Helvetica, Arial, sans-serif;line-height:1.6;color:#333;margin:0px;padding:0px;background-color:clear">
        <p style="margin:0px;padding:0px">
          Cheers,
          <br>
          The With team
        </p>
      </div>
    </div>
  </div>
  <div style="margin-top:20px!important;font-family:&#x27;Helvetica Neue&#x27;,Helvetica,Arial,sans-serif!important;font-size:10px;line-height:1.6!important;color:#aaa;margin:0px;padding:0px">
    <p style="margin:0px;padding:0px">
      <b>With Labs, Inc.</b>
    </p>
    <p style="margin:0px;padding:0px">595 Pacific Ave, 4th Floor</p>
    <p style="margin:0px;padding:0px">San Francisco, CA 94133</p>
  </div>
  <div style="margin:0px;padding:10px 0px 0px 0px;background-color:clear">
    <a style="font-family:&#x27;Helvetica Neue&#x27;,Helvetica,Arial,sans-serif!important;font-size:10px;line-height:1.6!important;color:#666;margin:0px;padding:0px" href="${unsubscribeUrl}">Unsubscribe</a>
  </div>
</div>
`

    // Seems tabs are included in these strings. We'll need a better way to store them.
    const plaintextFallback = `
Hi ${firstName},
We've got some exciting new updates to With!

The big room
Your room just got much bigger! Rooms now extend beyond the edges of your browser window. This gives you more space to conduct a stand up, host a workshop, grab a colleague for a quick chat, or just find a quiet spot where you can focus on your work.
You can zoom in and out with your mouse or trackpad, use the +/- keys, or you can use the zoom controls in the lower right hand corner of your screen.
You can pan around the room by clicking and dragging on the wallpaper or by using the arrow buttons on your keyboard. We've added a physics model to moving and zooming so everything feels natural and smooth. Give it a whirl.

YouTube spatial audio
You now control the volume of YouTube videos by moving closer or further away from the video. You can also mute audio—for yourself—with the new mute control in the video's title bar.

Updated accessories
You can resize YouTube using the resize handle in the lower right corner, and you can save your whiteboard work with the save icon in our newly rewritten whiteboard accessory.

User accounts
We recently introduced user accounts. Thank you to everyone who completed the migration process.
We will soon allow you to invite other people via email. For now, your guests can still access your room with the same password as before.

-------------------------------
Check out the new features
${url}
-------------------------------

If you have any questions, please reply to this email.

Cheers,
The With team
-----------------------
With Labs, Inc.
595 Pacific Ave, 4th Floor
San Francisco, CA 94133
-----------------------
Unsubscribe at ${unsubscribeUrl}
`

    return await lib.email.ses.sendMail(SENDER, user.email, subject, html, plaintextFallback, tags, user)
  }
}
