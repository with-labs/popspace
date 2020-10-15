const SENDER = 'notify@with.so'

module.exports = {
  sendRoomInviteEmail: async (toEmail, url) => {
    const subject = `You've been invited to join a With.so room`
    const html = `Hi! Please follow <a href=${url}> this link </a> to join.`
    const plaintextFallback = `Please go to ${url} to join.`
    const tags = [{Name: "type", Value: "room_invite"}]
    return await lib.email.ses.sendMail(SENDER, toEmail, subject, html, plaintextFallback, tags)
  },

  sendRoomClaimEmail: async (toEmail, roomName, url) => {
    const subject = `Action requested: User account migration`
    const tags = [{Name: "type", Value: "room_claim"}]

    const html = `
      <body style="padding: 0px !important; margin: 0px !important; background: white;">
          <div style="padding:24px; margin:0px; background: white; max-width: 520px; margin: 0px auto; text-align: center;">
              <a href="https://with.so" target="_blank" rel="noopener noreferrer" data-auth="NotApplicable" class="x_logo-img" style="border:none; display:block; height:34px; text-decoration:none; margin-bottom: 10px;">

              <img src="https://s3.us-east-2.amazonaws.com/with.static/logo.png" width="68" height="30" border="0" />
            </a>

              <div style="padding:0px; background: #FFF8F0; margin: 0px auto; text-align: left;">
                  <img src="https://s3.us-east-2.amazonaws.com/with.static/02.jpg" alt="A girl holding an envelope over her head with a happy face." style="width: 100%; height: auto;" />
                  <div style="padding:24px;">

                      <p style="font-family:'Helvetica Neue', Helvetica, Arial, sans-serif !important; font-size:16px; line-height:1.6 !important; color: #333; margin: 0px 0px 10px 0px !important">
                          Hi,</p>
                      <p style="font-family:'Helvetica Neue', Helvetica, Arial, sans-serif !important; font-size:16px; line-height:1.6 !important; color: #333; margin: 0px 0px 10px 0px !important">
                          You are receiving this email because you registered to our Early Access program at <a href="https://with.so/">with.so</a> and own the room ${roomName}.</p>
                      <p style="font-family:'Helvetica Neue', Helvetica, Arial, sans-serif !important; font-size:16px; line-height:1.6 !important; color: #333; margin: 0px 0px 10px 0px !important">
                          It's time to migrate to our new user system! This will enable new features coming soon like the ability to create additional rooms, invite team members via email, and preserve the contents of your room between visits in a secure and convenient way.</p>
                      <p style="font-family:'Helvetica Neue', Helvetica, Arial, sans-serif !important; font-size:16px; line-height:1.6 !important; color: #333; margin: 0px 0px 10px 0px !important">
                          In order to keep access to your room, it's important that you finalize your account.</p>
                      <div style="margin-top:30px!important; margin-bottom:30px!important;"><a href="${url}" target="_blank" rel="noopener noreferrer" data-auth="NotApplicable" style="background-color:#ffd873; border-radius:6px; border:1px solid #ebc76a; box-shadow: 0px 2px 8px 0px #ededed; color:#333; display:inline-block; font-family:'Helvetica Neue',Helvetica,Arial,sans-serif!important; font-size:16px; font-weight:700; line-height:24px; padding:8px 16px; text-align:center; text-decoration:none">Finalize my account</a></div>
                      <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif!important; font-size:13px; line-height:1.6!important; color:#333; margin:0px!important;">Or just copy the link below and paste it into your preferred browser.</p>
                      <div style="border-radius:6px; margin-top:10px!important; padding: 12px; background: #ffffff; overflow-wrap: break-word; word-wrap: break-word; -ms-word-break: break-all; word-break: break-word; font-family:'Helvetica Neue',Helvetica,Arial,sans-serif!important; font-size:13px; line-height:1.6!important; color:#333; margin-bottom:30px!important;">${url}</div>
                      <p style="font-family:'Helvetica Neue', Helvetica, Arial, sans-serif !important; font-size:16px; line-height:1.6 !important; color: #333; margin: 0px 0px 10px 0px !important">This is not a marketing email. If you wish to stop hearing from us and delete your With account or if you have any questions, please reply to this email.</p>
                      <p style="font-family:'Helvetica Neue', Helvetica, Arial, sans-serif !important; font-size:16px; line-height:1.6 !important; color: #333; margin: 0px 0px 10px 0px !important">Cheers,<br />The With team</p>
                  </div>
              </div>
              <div style="margin-top:20px!important; font-family:'Helvetica Neue',Helvetica,Arial,sans-serif!important; font-size:10px; line-height:1.6!important; color:#aaa;">
                  <b>With Labs, Inc.</b><br />595 Pacific Ave, 4th Floor<br /> San Francisco, CA 94133
              </div>
          </div>
      </body>
    `

    const plaintextFallback = `
      Hi,\n
      \n
      You are receiving this email because you registered to our Early Access program at https://with.so and own the room ${roomName}.\n
      \n
      It's time to migrate to our new user system! This will enable new features coming soon like the ability to create additional rooms, invite team members via email, and preserve the contents of your room between visits in a secure and convenient way.\n
      \n
      In order to keep access to your room, it's important that you finalize your account.\n
      \n
      -----------------------\n
      ${url}\n
      -----------------------\n
      \n
      This is not a marketing email. If you wish to stop hearing from us and delete your With account or if you have any questions, please reply to this email.\n
      \n
      Cheers,\n
      The With team\n
      \n
      -----------------------\n
      With Labs, Inc.\n
      595 Pacific Ave, 4th Floor\n
      San Francisco, CA 94133\n
    `

    return await lib.email.ses.sendMail(SENDER, toEmail, subject, html, plaintextFallback, tags)
  }
}
