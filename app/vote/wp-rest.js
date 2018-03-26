const WPAPI = require('wpapi')
const config = require('app/config')
const { endpoint, username, password, limit } = config.wp

const wp = new WPAPI({ endpoint, username, password })

const users = async () => {
  const firstPage = await wp.users().perPage(limit)
  const totalPages = firstPage._paging.totalPages
  if (totalPages > 1) {
    for (let i = 2; i <= totalPages; i++) {
      const nextPage = await wp.users().perPage(limit).page(i)
      firstPage.concat(nextPage)
    }
  }
  return firstPage
}

module.exports = {
  users,
}
