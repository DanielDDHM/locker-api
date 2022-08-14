var express = require('express')
var router = express.Router()

const { drawer } = require('../controllers')

router.post('/', async (req, res) => {
  await drawer.create(req, res)
})

router.put('/update/:id', async (req, res) => {
  await drawer.update(req, res)
})

router.get('/getByLocker/:id', async (req, res) => {
  await drawer.getByLocker(req, res)
})

router.get('/:id', async (req, res) => {
  await drawer.getById(req, res)
})

module.exports = router
