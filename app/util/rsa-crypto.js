const constants = require('constants')
const fs = require('fs')
const crypto = require('crypto')

const config = require('app/config')
const cryptoConfig = config.crypto

const publickey = fs.readFileSync(cryptoConfig.publicKey, 'utf8')
const privatekey = fs.readFileSync(cryptoConfig.privateKey, 'utf8')

const encryptPublic = (message) => {
  return crypto.publicEncrypt({
    key: publickey,
    padding: constants.RSA_PKCS1_PADDING
  }, new Buffer(message)).toString('base64')
}

const decryptPrivate = (message) => {
  return crypto.privateDecrypt({
    key: privatekey,
    padding: constants.RSA_PKCS1_PADDING
  }, new Buffer(message, 'base64')).toString('utf8')
}

module.exports = {
  encryptPublic,
  decryptPrivate,
}
