const { checkAddress } = require('./checkAddress')
const { checkDeliveryAvailability } = require('./checkDeliveryAvailability')
const { checkRegex } = require('./checkRegex')
const { checkSizes } = require('./checkSizes')
const { numberGenerator } = require('./generate')
const SendResponse = require('./response')

module.exports = {
  checkAddress,
  checkDeliveryAvailability,
  checkRegex,
  checkSizes,
  numberGenerator,
  SendResponse,
}