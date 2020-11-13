module.exports = {
  closePromises: (clients) => {
    return clients.map((c) => (
      new Promise((resolve, reject) => {
        c.on('close', () => (resolve()))
      })
    ))
  }
}
