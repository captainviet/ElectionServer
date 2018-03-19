const Candidates = require('./model')

async function add(ctx, next) {
  ctx.body = await Candidates.add(ctx)
}

async function eradicate(ctx, next) {
  ctx.body = await Candidates.eradicate(ctx)
}

async function list(ctx, next) {
  ctx.body = await Candidates.list(ctx)
}

module.exports = {
  add,
  eradicate,
  list,
}
