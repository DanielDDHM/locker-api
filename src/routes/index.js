const express = require('express');
const app = express();
const lockers = require('./locker')
const orders = require('./order')
const address = require('./address')
const drawer = require('./drawer')

app.use('/lockers', lockers)
app.use('/orders', orders)
app.use('/addresses', address)
app.use('/drawers', drawer)

module.exports = app
