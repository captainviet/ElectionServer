const config = require('app/config')
const appConfig = config.app

const AES = require('app/util/aes-crypto')
const RSA = require('app/util/rsa-crypto')

const eradicate = async(ctx) => {
  const db = ctx.mongo.db(appConfig.db)
  const postBody = ctx.request.body
  const name = postBody.name
  const query = {
    name,
  }
  const userVote = await db.collection('votes').findOne(query)

  const response = {
    data: null,
    error: null,
  }

  if (userVote) {
    const result = await db.collection('votes').remove(query)
    response.data = {
      name,
    }
  } else {
    response.error = 'Vote does not exists'
  }
}

const list = async(ctx) => {
  const db = ctx.mongo.db(appConfig.db)
  const votes = await db.collection('votes').find().toArray()

  const response = {
    data: votes,
    error: null,
  }
  return response
}

const submit = async(ctx) => {
  const db = ctx.mongo.db(appConfig.db)
  const encryptedBody = ctx.request.body
  const aesKey = RSA.decryptPrivate(encryptedBody.key)
  const postBody = JSON.parse(AES.decrypt(AES.convertKeyString(aesKey), encryptedBody.message))
  const name = postBody.name
  const rawVote = postBody.vote
  const query = {
    name,
  }
  const userVote = await db.collection('votes').findOne(query)

  const preQuery = {
    name: rawVote['President'],
  }
  const vicQuery = {
    name: rawVote['Vice-President'],
  }
  const secQuery = {
    name: rawVote['Secretary'],
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
      response.data = {
        name,
        vote: rawVote,
      }
    }

  }
  return response
}

module.exports = {
  list,
  submit,
  eradicate,
}
