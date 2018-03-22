const config = require('app/config')
const appConfig = config.app

const Koa = require('koa')

const bodyParser = require('koa-bodyparser')
const mongo = require('koa-mongo')
const logger = require('koa-logger')
const cors = require('@koa/cors')

const router = require('app/router')

const app = new Koa()
app.use(logger())
app.use(cors())

app.use(bodyParser())
app.use(mongo({
  uri: appConfig.mongo
}))

app.use(router.routes()).use(router.allowedMethods())

app.listen(appConfig.port, () => {
  console.log(`App listening on port ${appConfig.port}...`)
})
