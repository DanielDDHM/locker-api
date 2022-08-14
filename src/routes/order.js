var express = require('express')
var router = express.Router()

const { order } = require('../controllers')

router.post('/', async (req, res) => {
  await order.create(req, res)
})

router.get('/:id', async (req, res) => {
  await order.getById(req, res)
})

router.put('/deliveryOrPickup/:id', async (req, res) => {
  await order.deliveryOrPickup(req, res)
})

router.put('/validate/:id', async (req, res) => {
  await order.validate(req, res)
})

router.delete('/:id', async (req, res) => {
  await order.delete(req, res)
})

router.get('/', async (req, res) => {
  await order.getAll(req, res)
})

module.exports = router
