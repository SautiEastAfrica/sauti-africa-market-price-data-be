const express = require('express')
const router = express.Router()
const {
  queryCurrency,
  queryProductMarket,
  playgroundDR
} = require('../middleware/validate')
// const validate = require('../middleware/validate.js')
const tokenMiddleware =
  process.env.npm_lifecycle_event !== 'dev'
    ? require('../middleware/token-middleware')
    : function(req, res, next) {
        next()
      }
const db = require('../api-key/dbConfig')
const Client = require('./client-model.js')

const convertCurrencies = require('../currency')

router.get('/', tokenMiddleware, queryCurrency, (req, res) => {
  const message = req.message && req.message.replace('50', '30')
  req.query.count = 30
  Client.getSautiDataClient(req.query)
    .then(records => {
      convertCurrencies(records, req.currency)
        .then(converted => {
          res.status(200).json({
            warning: converted.warning,
            message: message,
            records: converted.data,
            next: converted.next,
            prev: converted.prev,
            count: converted.count,
            ratesUpdated: converted.ratesUpdated
          })
        })
        .catch(error => {
          console.log(error)
        })
    })
    .catch(error => {
      console.log(error)
      res.status(500).send(error.message)
    })
})

router.get('/lists', (req, res) => {
  Client.getListsOfThings(req.query.list)
    .then(records => {
      res.status(200).json(records)
    })
    .catch(error => {
      console.log(error)
      res.status(500).send(error.message)
    })
})
router.get('/superlist', (req, res) => {
  Client.mcpList()
    .then(records => {
      res.status(200).json(records)
    })
    .catch(err => {
      console.log(err.message)
      res.status(500).send(err.message)
    })
})
function apiKeyFn() {
  return db('apiKeys')
}
router.get('/users', (req, res) => {
  apiKeyFn()
    .then(records => {
      res.status(200).json(records)
    })
    .catch(err => {
      console.log(err.message)
      res.status(500).send(err.message)
    })
})
//playground routes//
//product date range//
router.get('/playground/date', playgroundDR, (req, res) => {
  Client.getProductPriceRangePlay(req.query)
    .then(records => {
      res.status(200).json(records)
    })
    .catch(err => {
      console.log(err.message)
      res.status(500).json(err)
    })
})

//get latest price of product in market for playground//
router.get('/playground/latest', queryProductMarket, (req, res) => {
  Client.getPMPlay(req.query)
    .then(records => {
      res.status(200).json(records)
    })
    .catch(err => {
      console.log(err.message)
      res.status(500).send(err.message)
    })
})

module.exports = router
