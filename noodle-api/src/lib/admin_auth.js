/*
  Admin login, configured with ADMIN_USERNAME / ADMIN_PASSWORD.
  Only signed-in admins can create rooms. Without ADMIN_PASSWORD nobody
  can sign in, so room creation stays closed (fail closed).
*/
const adminAuth = {
  isEnabled: () => !!process.env.ADMIN_PASSWORD,

  username: () => process.env.ADMIN_USERNAME || 'admin',

  checkCredentials: (username, password) => {
    const passwordLib = shared.lib.password
    // evaluate both so timing doesn't reveal which one was wrong
    const usernameOk = passwordLib.safeEqual(String(username), adminAuth.username())
    const passwordOk = passwordLib.safeEqual(String(password), process.env.ADMIN_PASSWORD)
    return usernameOk && passwordOk
  },

  canCreateRooms: (actor) => !!(actor && actor.admin)
}

// runs while lib is loading, before the global logger exists
if (!adminAuth.isEnabled()) {
  console.warn("ADMIN_PASSWORD is not set: nobody can sign in to create rooms")
}

module.exports = adminAuth
