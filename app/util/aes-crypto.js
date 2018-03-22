const aesjs = require('aes-js')

const round = 5

const random8 = () => Math.random().toString(36).substring(2, 10)

const generateKeyString = () => {
  return random8() + random8()
}

const convertKeyString = (string) => {
  return string.split('').map(char => char.charCodeAt(0))
}

const getAesCounter = (key) => {
  return new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(round))
}

const encrypt = (key, message) => {
  const bytes = aesjs.utils.utf8.toBytes(message)
  const ctr = getAesCounter(key)
  const encrypted = ctr.encrypt(bytes)
  return aesjs.utils.hex.fromBytes(encrypted)
}

const decrypt = (key, message) => {
  const bytes = aesjs.utils.hex.toBytes(message)
  const ctr = getAesCounter(key)
  const decrypted = ctr.decrypt(bytes)
  return aesjs.utils.utf8.fromBytes(decrypted)
}

module.exports = {
  generateKeyString,
  convertKeyString,
  encrypt,
  decrypt,
}
