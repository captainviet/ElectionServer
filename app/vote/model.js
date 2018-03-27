const config = require('app/config')
const appConfig = config.app

const AES = require('app/util/aes-crypto')
const RSA = require('app/util/rsa-crypto')

const VoteValidator = require('app/vote/validator')

const exists = async(ctx) => {
  const db = ctx.mongo.db(appConfig.db)
  const { name } = ctx.params
  const query = { name }
  const vote = await db.collection('votes').findOne(query)
  
  return {
    data: vote ? true : false,
    error: null,
  }
}

const eradicate = async(ctx) => {
  const db = ctx.mongo.db(appConfig.db)
  const postBody = ctx.request.body
  const { name } = postBody
  const query = { name }
  const userVote = await db.collection('votes').findOne(query)

  const response = {
    data: null,
    error: null,
  }

  if (userVote) {
    const result = await db.collection('votes').remove(query)
    response.data = query
  } else {
    response.error = 'Vote does not exists'
  }
}

const list = async(ctx) => {
  const db = ctx.mongo.db(appConfig.db)
  const attemptsQuery = {
    hacks: {
      $ne: [],
    },
  }
  const attemptsOpts = {
    _id: 0,
    name: 1,
  }
  const attempts = await db.collection('votes').find(attemptsQuery, attemptsOpts).toArray()
  VoteValidator.logAttempts(attempts)
  const voteQuery = {
    hacks: {
      $eq: [],
    },
  }
  const voteOpts = {
    _id: 0,
    name: 1,
    vote: 1,
  }
  const votes = await db.collection('votes').find(voteQuery, voteOpts).toArray()
  const candidateQuery = {}
  const candidateOpts = {}
  const candidates = await db.collection('candidates').find(candidateQuery, candidateOpts).toArray()
  const decodedNames = candidates.map(candidate => {
    candidate.name = decodeURIComponent(candidate.name)
    return candidate
  })
  const idCandidateMap = decodedNames.reduce((map, candidate) => {
    const { _id, name } = candidate
    map[_id] = name
    return map
  }, {})

  const filteredVotes = await VoteValidator.filterUnregistered(votes.map(vote => {
    vote.name = vote.name.toLowerCase()
    vote.name = vote.name.replace('.', '-')
    return vote
  }))
  const voteData = filteredVotes.map(vote => {
    const result = {} 
    for (let i in vote) {
      result[i] = idCandidateMap[vote[i]]
    }
    return result
  })
  const rawCandData = candidates.reduce((map, candidate) => {
    if (!map[candidate.pos]) {
      map[candidate.pos] = []
    }
    map[candidate.pos].push(candidate.name)
    return map
  }, {})
  const candData = {
    'President': rawCandData.pre,
    'Vice-President': rawCandData.vic,
    'Secretary': rawCandData.sec,
  }

  const response = {
    data: {
      votes: voteData,
      candidates: candData,
    },
    error: null,
  }
  return response
}

const submit = async(ctx) => {
  const db = ctx.mongo.db(appConfig.db)
  const encryptedBody = ctx.request.body
  const { key, message } = encryptedBody
  const aesKey = RSA.decryptPrivate(key)
  const postBody = JSON.parse(AES.decrypt(AES.convertKeyString(aesKey), message))
  const { name, vote } = postBody

  const preQuery = {
    name: vote['President'],
    pos: 'pre',
  }
  const vicQuery = {
    name: vote['Vice-President'],
    pos: 'vic',
  }
  const secQuery = {
    name: vote['Secretary'],
    pos: 'sec',
  }
  const pre = await db.collection('candidates').findOne(preQuery)
  const vic = await db.collection('candidates').findOne(vicQuery)
  const sec = await db.collection('candidates').findOne(secQuery)

  const response = {
    data: null,
    error: null,
  }

  if (!pre || !vic || !sec) {
    response.error = 'Candidates not valid'
  } else {

    const vote = {
      pre: pre._id,
      vic: vic._id,
      sec: sec._id,
    }

    const query = { name }
    const userVote = await db.collection('votes').findOne(query)
    if (userVote) {
      const update = {
        $push: {
          hacks: new Date(),
        },
      }
      const result = await db.collection('votes').updateOne(query, update)
      response.error = 'Vote is already casted'
    } else {
      const record = {
        name,
        vote,
        timestamp: new Date(),
        hacks: [],
      }
      const result = await db.collection('votes').insert(record)
      response.data = { name }
    }

  }
  return response
}

module.exports = {
  list,
  submit,
  eradicate,
  exists,
}
