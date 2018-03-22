const expect = require('chai').expect
const fs = require('fs')
 config = require('app/config')
const cryptoConfig = config.crypto
const { encryptPublic, decryptPrivate } = require('app/util/rsa-crypto')

describe('RSA Crypto Engine', function() {

  describe('Reversibility', function() {

    it('returns originalMsg after two-way crypto', function() {
      const originalMsg = 'somgthing'
      const encoded = encryptPublic(originalMsg)
      const decoded = decryptPrivate(encoded)
      expect(originalMsg).to.equal(decoded)

    })
  
  })

  describe('Security', function() {
    
    it('returns different cipher every invocation', function() {
      const originalMsg = 'something'
      const encoded = encryptPublic(originalMsg)
      const encoded2 = encryptPublic(originalMsg)
      expect(encoded).to.not.equal(encoded2)

      const decoded = decryptPrivate(encoded)
      const decoded2 = decryptPrivate(encoded2)
      expect(decoded).to.equal(decoded2)
    
    })

  })

})
