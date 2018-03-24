const expect = require('chai').expect
const request = require('request')
const mongodb = require('mongodb')

const MongoClient = mongodb.MongoClient

const config = require('app/config')
const appConfig = config.app
const { buildRequest } = require('app/util/requestBuilder')
const AES = require('app/util/aes-crypto')
const RSA = require('app/util/rsa-crypto')

const requestFn = (url, callback) => {
  return () => {
    request.post(url, (e, res) => {
      callback()
    })
  }
}

const apis = {
  candidate: {
    self: 'candidate',
    list: {
      self: 'list',
    },
    add: {
      self: 'add',
    },
    eradicate: {
      self: 'eradicate',
    },
  },
  vote: {
    self: 'vote',
    list: {
      self: 'list',
    },
    submit: {
      self: 'submit',
    },
    exists: {
      self: 'exists',
    },
  },
}

describe('Election REST APIs', function() {
  const host = `http://localhost:${appConfig.port}`
  const candidate = apis.candidate

  describe(candidate.self, function() {
    const add = candidate.add
    const eradicate = candidate.eradicate
    const list = candidate.list

    describe(add.self, function() {

      const candidateName = 'mrawesome'
      const encodedName = encodeURIComponent(candidateName)
      const form = {
        name: encodedName,
        pos: 'pre',
      }
      const candidateEradicatePaths = [
        host, candidate.self, eradicate.self
      ]
      const requestEradicateUrl = buildRequest(candidateEradicatePaths)

      before(function(done) {
        const args = {
          url: requestEradicateUrl,
          form,
        }
        const deleteCandidate = requestFn(args, done)
        deleteCandidate()
      })

      const candidateAddPaths = [
        host, candidate.self, add.self
      ]
      const requestAddUrl = buildRequest(candidateAddPaths)

      it('returns candidate information with non-null record on successful onboarding of new candidate', function(done) {
        const url = requestAddUrl
        request.post({url, form}, (e, res, body) => {
          expect(res.statusCode).to.equal(200)
          const jsonBody = JSON.parse(body)
          expect(jsonBody).to.be.an('object')
          expect(jsonBody).to.have.property('data')
          expect(jsonBody).to.have.property('error')
          const data = jsonBody.data
          const error = jsonBody.error
          expect(data).to.have.property('name')
          expect(data).to.have.property('pos')
          expect(data.name).to.equal(encodedName)
          expect(data.pos).to.equal('pre')
          expect(error).to.be.null
          done()
        })
      })

      it('returns error message on unsuccessful onboarding of new candidate', function(done) {
        const url = requestAddUrl
        request.post({url, form}, (e, res, body) => {
          expect(res.statusCode).to.equal(200)
          const jsonBody = JSON.parse(body)
          expect(jsonBody).to.be.an('object')
          expect(jsonBody).to.have.property('data')
          expect(jsonBody).to.have.property('error')
          const data = jsonBody.data
          const error = jsonBody.error
          expect(data).to.be.null
          const errorMessage =  'Candidate already exists'
          expect(error).to.equal(errorMessage)
          done()
        })
      })

    })

    describe(list.self, function() {

      const candidateListPaths = [
        host, candidate.self, list.self
      ]
      const requestListUrl = buildRequest(candidateListPaths)

      it('returns all candidates', function(done) {
        MongoClient.connect(appConfig.mongo, (e, db) => {
          if (e) {
            db.close()
            done(e)
          } else {
            const election = db.db(appConfig.db)
            election.collection('candidates').count((e, res) => {
              if (e) {
                db.close()
                done(e)
              } else {
                const expectCount = res
                request(requestListUrl, (e, res, body) => {
                  expect(res.statusCode).to.equal(200)
                  const jsonBody = JSON.parse(body)
                  expect(jsonBody).to.be.an('object')
                  expect(jsonBody).to.have.property('data')
                  expect(jsonBody).to.have.property('error')
                  const data = jsonBody.data
                  const error = jsonBody.error
                  expect(data).to.be.an('array').that.has.lengthOf(expectCount)
                  data.forEach((candidate) => {
                    expect(candidate).to.have.property('name')
                    expect(candidate).to.have.property('pos')
                    expect(candidate.name).to.be.a('string')
                    expect(candidate.pos).to.be.a('string')
                  })
                  expect(error).to.be.null
                  db.close()
                  done()
                })
              }
            })
          }
        })
      })
    })

  })

  const vote = apis.vote

  describe(vote.self, function() {
    const list = vote.list
    const submit = vote.submit
    const eradicate = vote.eradicate
    const exists = vote.exists

    describe(list.self, function() {

      const voteListPaths = [
        host, vote.self, list.self
      ]
      const requestVoteListUrl = buildRequest(voteListPaths)

      it('returns all votes', function(done) {
        MongoClient.connect(appConfig.mongo, (e, db) => {
          if (e) {
            db.close()
            done(e)
          } else {
            const election = db.db(appConfig.db)
            election.collection('votes').count((e, res) => {
              if (e) {
                db.close()
                done(e)
              } else {
                const expectCount = res
                request(requestVoteListUrl, (e, res, body) => {
                  expect(res.statusCode).to.equal(200)
                  const jsonBody = JSON.parse(body)
                  expect(jsonBody).to.be.an('object')
                  expect(jsonBody).to.have.property('data')
                  expect(jsonBody).to.have.property('error')
                  const data = jsonBody.data
                  const error = jsonBody.error
                  expect(data).to.be.an('array').that.has.lengthOf(expectCount)
                  data.forEach((candidate) => {
                    expect(candidate).to.have.property('name')
                    expect(candidate).to.have.property('vote')
                    expect(candidate).to.have.property('timestamp')
                    expect(candidate).to.have.property('hacks')
                    expect(candidate.name).to.be.a('string')
                    expect(candidate.vote).to.be.an('object')
                    expect(candidate.timestamp).to.be.a('string')
                    expect(candidate.hacks).to.be.an('array')
                  })
                  expect(error).to.be.null
                  db.close()
                  done()
                })
              }
            })
          }
        })
      })

    })

    describe(submit.self, function() {

      const add = candidate.add
      const eradicate = candidate.eradicate
      const validChoice = {
        'President': 'Quach Quan',
        'Vice-President': 'Nguyen Duc',
        'Secretary': 'Phan Ngan',
      }
      validChoice['President'] = encodeURIComponent(validChoice['President'])
      validChoice['Vice-President'] = encodeURIComponent(validChoice['Vice-President'])
      validChoice['Secretary'] = encodeURIComponent(validChoice['Secretary'])
      const invalidChoice = {
        'President': 'abc',
        'Vice-President': 'xyz',
        'Secretary': 'tuv',
      }
      const candidateAddPaths = [
        host, candidate.self, add.self
      ]
      const requestAddUrl = buildRequest(candidateAddPaths)

      const preForm = {
        name: validChoice['President'],
        pos: 'pre',
      }
      const vicForm = {
        name: validChoice['Vice-President'],
        pos: 'vic',
      }
      const secForm = {
        name: validChoice['Secretary'],
        pos: 'sec',
      }

      const name = 'mrawesome'
      const validForm = {
        name,
        vote: validChoice,
      }
      const invalidForm = {
        name,
        vote: invalidChoice,
      }

      const voteEradicatePaths = [
        host, vote.self, eradicate.self
      ]
      const requestVoteEradicateUrl = buildRequest(voteEradicatePaths)
      
      before(function(done) {
        const url = requestAddUrl
        const addPre = requestFn({url, form: preForm}, done)
        const addVic = requestFn({url, form: vicForm}, addPre)
        const addSec = requestFn({url, form: secForm}, addVic)
        const args = {
          url: requestVoteEradicateUrl,
          form: validForm,
        }
        const eradicateVote = requestFn(args, addSec) 
        eradicateVote()
      })

      const candidateEradicatePaths = [
        host, candidate.self, eradicate.self
      ]
      const requestEradicateUrl = buildRequest(candidateEradicatePaths)

      after(function(done) {
        const url = requestEradicateUrl
        const eradicatePre = requestFn({url, form: preForm}, done)
        const eradicateVic = requestFn({url, form: vicForm}, eradicatePre)
        const eradicateSec = requestFn({url, form: secForm}, eradicateVic)
        eradicateSec()
      })

      const voteSubmitPaths = [
        host, vote.self, submit.self
      ]
      const requestSubmitUrl = buildRequest(voteSubmitPaths)

      it('returns the content of the vote if the candidate exists', function(done) {
        const url = requestSubmitUrl
        const aesKeyString = AES.generateKeyString()
        const aesKey = AES.convertKeyString(aesKeyString)
        const message = AES.encrypt(aesKey, JSON.stringify(validForm))
        const key = RSA.encryptPublic(aesKeyString)
        const form = {
          message, key
        }
        request.post({url, form}, (e, res, body) => {
          expect(res.statusCode).to.equal(200)
          const jsonBody = JSON.parse(body)
          expect(jsonBody).to.be.an('object')
          expect(jsonBody).to.have.property('data')
          expect(jsonBody).to.have.property('error')
          const data = jsonBody.data
          const error = jsonBody.error
          expect(data).to.be.an('object')
          expect(data).to.have.property('name')
          expect(error).to.be.null
          done()
        })
      })

      it('returns "Vote already cast" if the vote has been casted', function(done) {
        const url = requestSubmitUrl
        const aesKeyString = AES.generateKeyString()
        const aesKey = AES.convertKeyString(aesKeyString)
        const message = AES.encrypt(aesKey, JSON.stringify(validForm))
        const key = RSA.encryptPublic(aesKeyString)
        const form = {
          message, key
        }
        request.post({url, form}, (e, res, body) => {
          expect(res.statusCode).to.equal(200)
          const jsonBody = JSON.parse(body)
          expect(jsonBody).to.be.an('object')
          expect(jsonBody).to.have.property('data')
          expect(jsonBody).to.have.property('error')
          const data = jsonBody.data
          const error = jsonBody.error
          expect(data).to.be.null
          const errorMessage = 'Vote is already casted'
          expect(error).to.equal(errorMessage)
          done()
        })
      })

      it('returns "Candidate not valid" if the candidates doesn\'t exist', function(done) {
        const url = requestSubmitUrl
        const aesKeyString = AES.generateKeyString()
        const aesKey = AES.convertKeyString(aesKeyString)
        const message = AES.encrypt(aesKey, JSON.stringify(invalidForm))
        const key = RSA.encryptPublic(aesKeyString)
        const form = {
          message, key
        }
        request.post({url, form}, (e, res, body) => {
          expect(res.statusCode).to.equal(200)
          const jsonBody = JSON.parse(body)
          expect(jsonBody).to.be.an('object')
          expect(jsonBody).to.have.property('data')
          expect(jsonBody).to.have.property('error')
          const data = jsonBody.data
          const error = jsonBody.error
          expect(data).to.be.null
          const errorMessage = 'Candidates not valid'
          expect(error).to.equal(errorMessage)
          done()
        })
      })

    })

    describe(exists.self, function() {
      const add = candidate.add
      const eradicate = candidate.eradicate

      const existVote = 'abc'
      const nonexistVote = 'def'

      const voteEradicatePaths = [
        host, vote.self, eradicate.self
      ]
      const requestVoteEradicateUrl = buildRequest(voteEradicatePaths)

      const validChoice = {
        'President': 'Quach Quan',
        'Vice-President': 'Nguyen Duc',
        'Secretary': 'Phan Ngan',
      }
      validChoice['President'] = encodeURIComponent(validChoice['President'])
      validChoice['Vice-President'] = encodeURIComponent(validChoice['Vice-President'])
      validChoice['Secretary'] = encodeURIComponent(validChoice['Secretary'])

      const candidateAddPaths = [
        host, candidate.self, add.self
      ]
      const requestAddUrl = buildRequest(candidateAddPaths)

      const preForm = {
        name: validChoice['President'],
        pos: 'pre',
      }
      const vicForm = {
        name: validChoice['Vice-President'],
        pos: 'vic',
      }
      const secForm = {
        name: validChoice['Secretary'],
        pos: 'sec',
      }

      before(function(done) {
        const existForm = {
          name: existVote,
          vote: validChoice,
        }
        const nonexistForm = {
          name: nonexistVote,
          vote: validChoice,
        }
        const removeVote = {
          url: requestVoteEradicateUrl,
          form: nonexistForm,
        }
        const eradicateVote = requestFn(removeVote, done)

        const voteSubmitPaths = [
          host, vote.self, submit.self
        ]
        const requestSubmitUrl = buildRequest(voteSubmitPaths)
        const aesKeyString = AES.generateKeyString()
        const aesKey = AES.convertKeyString(aesKeyString)
        const message = AES.encrypt(aesKey, JSON.stringify(existForm))
        const key = RSA.encryptPublic(aesKeyString)
        const form = {
          message, key
        }
        const addVote = {
          url: requestSubmitUrl,
          form,
        }
        const submitVote = requestFn(addVote, eradicateVote) 
        const url = requestAddUrl
        const addPre = requestFn({url, form: preForm}, submitVote)
        const addVic = requestFn({url, form: vicForm}, addPre)
        const addSec = requestFn({url, form: secForm}, addVic)
        addSec()
      })

      const candidateEradicatePaths = [
        host, candidate.self, eradicate.self
      ]
      const requestEradicateUrl = buildRequest(candidateEradicatePaths)

      after(function(done) {
        const url = requestEradicateUrl
        const eradicatePre = requestFn({url, form: preForm}, done)
        const eradicateVic = requestFn({url, form: vicForm}, eradicatePre)
        const eradicateSec = requestFn({url, form: secForm}, eradicateVic)

        const existForm = {
          name: existVote,
          vote: validChoice,
        }
        const removeVote = {
          url: requestVoteEradicateUrl,
          form: existForm,
        }
        const eradicateVote = requestFn(removeVote, eradicateSec)
        eradicateVote()
      })

      const voteExistsPaths = [
        host, vote.self, exists.self, existVote
      ]
      const voteNonExistsPaths = [
        host, vote.self, exists.self, nonexistVote
      ]
      const requestVoteExistsUrl = buildRequest(voteExistsPaths)
      const requestVoteNonExistsUrl = buildRequest(voteNonExistsPaths)

      it('returns true for existing vote', function(done) {
        request(requestVoteExistsUrl, (e, res, body) => {
          expect(res.statusCode).to.equal(200)
          const jsonBody = JSON.parse(body)
          expect(jsonBody).to.be.an('object')
          expect(jsonBody).to.have.property('data')
          expect(jsonBody).to.have.property('error')
          expect(jsonBody.data).to.be.true
          expect(jsonBody.error).to.be.null
          done()

        })

      })

      it('returns false for non-existing vote', function(done) {
        request(requestVoteNonExistsUrl, (e, res, body) => {
          expect(res.statusCode).to.equal(200)
          const jsonBody = JSON.parse(body)
          expect(jsonBody).to.be.an('object')
          expect(jsonBody).to.have.property('data')
          expect(jsonBody).to.have.property('error')
          expect(jsonBody.data).to.be.false
          expect(jsonBody.error).to.be.null
          done()

        })

      })

    })

  })

})
