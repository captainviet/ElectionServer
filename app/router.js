const Router = require('koa-router')

const VoteHandler = require('app/vote/controller')
const CandidateHandler = require('app/candidate/controller')

const routeOptions = require('app/expose/options')
const { candidate, vote } = routeOptions.registry

const Routes = {}
Routes[candidate.list] = CandidateHandler.list
Routes[candidate.add] = CandidateHandler.add
Routes[candidate.eradicate] = CandidateHandler.eradicate
Routes[vote.list] = VoteHandler.list
Routes[vote.exists] = VoteHandler.exists
Routes[vote.submit] = VoteHandler.submit
Routes[vote.eradicate] = VoteHandler.eradicate

const config = require('app/config')
const appConfig = config.app
const env = appConfig.expose.env
const domain = appConfig.expose.domain
const allowedRoutes = routeOptions[env][domain]

const router = new Router()
allowedRoutes.forEach(route => {
  const { path, method } = route
  const handler = Routes[path]
  if (handler) {
    switch (method) {
      case 'get':
        router.get(path, handler)
        break
      case 'post':
        router.post(path, handler)
        break
      default:
        console.log(route)
    }
  }
})

module.exports = router
