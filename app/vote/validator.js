const WpRest = require('app/vote/wp-rest')
const fs = require('fs')

const logDir = 'app/vote/hack-log/'

const filterUnregistered = async (votes) => {
  const wpUsers = await WpRest.users()
  const registeredUsers = wpUsers.map(user => user.slug)
  const validVotes = votes.filter(vote => registeredUsers.includes(vote.name))
  const invalidVotes = votes.filter(vote => !registeredUsers.includes(vote.name))
  logInvalid(invalidVotes)
  return validVotes.map(vote => vote.vote)

}

const logInvalid = (invalidVotes) => {
  const logFile = 'invalid.txt'
  const filePath = `${logDir}${logFile}`
  fs.writeFile(filePath, JSON.stringify(invalidVotes), (e) => {
    if (e) {
      console.log(e)
    } else {
      console.log(`Invalid vote count: ${invalidVotes.length}`)
    }
  })
}

const logAttempts = (attempts) => {
  const logFile = 'attempts.txt'
  const filePath = `${logDir}${logFile}`
  const names = attempts.map(vote => vote.name)
  fs.writeFile(filePath, JSON.stringify(names), (e) => {
    if (e) {
      console.log(e)
    } else {
      console.log(`Attempts vote count: ${names.length}`)
    }
  })
}

module.exports = {
  filterUnregistered,
  logAttempts,
}
