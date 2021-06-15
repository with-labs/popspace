module.exports = {
  dashboard: () => {
    return "/"
  },
  getVerifyUrl(magic) {
    return `/verify_account?code=${encodeURIComponent(magic.code)}`
  },
  getLoginUrl(magic) {
    return `/login?code=${encodeURIComponent(magic.code)}`
  }
}
