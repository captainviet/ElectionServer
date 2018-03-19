const Votes = require('./model')

async function list(ctx, next) {
  ctx.body = await Votes.list(ctx)
}

async function submit(ctx, next) {
  ctx.body = await Votes.submit(ctx)
}

async function eradicate(ctx, next) {
  ctx.body = await Votes.eradicate(ctx)
}

module.exports = {
  list,
  submit,
  eradicate,
}
