var express = require('express')
var router = express.Router()

const { address } = require('../controllers')

router.post('/', async (req, res) => {
  await address.create(req, res)
})

router.get('/nearest', async (req, res) => {
  await address.getNearest(req, res)
})

router.put('/update/:id', async (req, res) => {
  await address.update(req, res)
})

router.delete('/:id', async (req, res) => {
  await address.delete(req, res)
})

module.exports = router
