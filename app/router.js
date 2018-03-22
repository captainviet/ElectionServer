const Router = require('koa-router')

const VoteHandler = require('app/vote/controller')
const CandidateHandler = require('app/candidate/controller')

const config = require('app/config')

const router = new Router()
router.get('/candidate/list/', CandidateHandler.list)
router.post('/candidate/add/', CandidateHandler.add)
router.post('/candidate/eradicate/', CandidateHandler.eradicate)
router.get('/vote/list/', VoteHandler.list)
router.get('/vote/exists/:name', VoteHandler.exists)
router.post('/vote/submit/', VoteHandler.submit)
router.post('/vote/eradicate/', VoteHandler.eradicate)

module.exports = router
