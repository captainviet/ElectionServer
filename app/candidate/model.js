const config = require('app/config')
const appConfig = config.app

const add = async(ctx) => {
  const db = ctx.mongo.db(appConfig.db)
  const postBody = ctx.request.body
  const { name, pos } = postBody
  const query = { name, pos }
  const candidate = await db.collection('candidates').findOne(query)

  const response = {
    data: null,
    error: null,
  }

  if (candidate) {
    response.error = 'Candidate already exists'
  } else {
    const record = { name, pos }
    const res = await db.collection('candidates').insert(record)
    response.data = record
  }
  return response

}

const eradicate = async(ctx) => {
  const db = ctx.mongo.db(appConfig.db)
  const postBody = ctx.request.body
  const { name, pos } = postBody
  const query = { name, pos }
  const candidate = await db.collection('candidates').findOne(query)

  const response = {
    data: null,
    error: null,
  }

  if (candidate) {
    const res = await db.collection('candidates').remove(query)
    response.data = query
  } else {
    response.error = 'No candidate with such name'
  }
  return response

}

const list = async(ctx) => {
  const db = ctx.mongo.db(appConfig.db)
  const query = {}
  const opts = {
    _id: 0,
  }
  const candidates = await db.collection('candidates').find(query, opts).toArray()
  const response = {
    data: candidates,
    error: null,
  }
  return response

}

module.exports = {
  add,
  eradicate,
  list,
}
