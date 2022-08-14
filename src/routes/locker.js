var express = require('express')
var router = express.Router()

const { locker } = require('../controllers')

router.get('/', async (req, res) => {
  await locker.getAll(req, res)
})

router.get('/:id', async (req, res) => {
  await locker.getById(req, res)
})

router.post('/', async (req, res) => {
  await locker.create(req, res)
})

router.put('/:id', async (req, res) => {
  await locker.delete(req, res)
})

module.exports = router
