const expect = require('chai').expect
const fs = require('fs')
const AES = require('app/util/aes-crypto')

describe('AES Crypto Engine', function() {

  describe('Reversibility', function() {

    it('returns originalMsg after two-way crypto', function() {
      const originalMsg = 'somgthing wrong'
      const aesKeyString = AES.generateKeyString()
      const aesKey = AES.convertKeyString(aesKeyString)
      const encoded = AES.encrypt(aesKey, originalMsg)
      const decoded = AES.decrypt(aesKey, encoded)
      expect(originalMsg).to.equal(decoded)

    })
  
  })

})
