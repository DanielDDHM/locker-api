const prisma = require('../config/prisma')
const { STATUS, QUERY, OPERATIONS } = require('../typings')
const { SendResponse, numberGenerator, checkRegex } = require('../helpers')

module.exports = {
  async create(req, res) {
    const orderNumber = await prisma.orders.count() + 1

    const {
      orderIdentifier,
      address,
      size,
      distance,
      contact,
    } = req.body

    const {
      street,
      streetNumber,
      neighborhood,
      city,
      state,
      zipCode,
      buyerLongitude,
      buyerLatitude,
    } = address

    await checkRegex(contact, OPERATIONS.CHECK_CONTACTS)

    try {
      const orderAlreadyExists = await prisma.orders.findFirst({
        where: {
          orderIdentifier
        }
      })

      if (orderAlreadyExists) {
        throw new Error('Order already exists!')
      }

      const result = await prisma.orders.create({
        data: {
          orderIdentifier,
          number: orderNumber,
          status: STATUS.ORDER.PENDING,
          size,
          contact,
          buyersAddress: {
            'street': street,
            'streetNumber': streetNumber,
            'neighborhood': neighborhood,
            'city': city,
            'state': state,
            'zipCode': zipCode,
            'buyerLongitude': buyerLongitude,
            'buyerLatitude': buyerLatitude,
            'distance': distance,

          }
        }
      })

      return SendResponse(res, 201, 'Success!', [{ order: result, }])
    } catch (e) {
      return SendResponse(res, 400, e.message)
    }
  },

  async getById(req, res) {
    const { id } = req.params

    try {
      const result = await prisma.orders.findFirst({
        where: {
          id
        },
        include: QUERY
      })

      if (!result || result === null) {
        throw new Error('Order does not exist!')
      }

      return SendResponse(res, 200, 'Success!', [{ order: result }])
    } catch (e) {
      return SendResponse(res, 400, e.message)
    }
  },

  async deliveryOrPickup(req, res) {
    const { id } = req.params
    const { code } = req.body

    try {
      const order = await prisma.orders.findFirst({
        where: {
          id
        }
      })

      const isDelivery = order.deliveryCode === code;
      const isPickUp = order.pickupCode === code;

      if (isDelivery) {
        const drawer = await prisma.drawers.findFirst({
          where: {
            id: order.drawerId
          }
        })

        const invalidCode = code !== drawer.code

        if (invalidCode) {
          throw new Error('Order delivery code does not match drawer code!')
        }

        const pickupCode = numberGenerator(6)

        const updatedOrder = await prisma.orders.update({
          where: {
            id
          },
          data: {
            status: STATUS.ORDER.DELIVERED_SELLER,
            deliveryCode: null,
            pickupCode,
            delivered: true,
            deliveredAt: new Date(),
            updatedAt: new Date(),
          }
        })

        await prisma.drawers.update({
          where: {
            id: updatedOrder.drawerId
          },
          data: {
            status: STATUS.DRAWER.IN_USE,
            code: pickupCode,
            updatedAt: new Date(),
          }
        })

        const getOrder = await prisma.orders.findFirst({
          where: {
            id: updatedOrder.id
          },
          include: QUERY
        })

        return SendResponse(res, 200, 'Success!', [{ order: getOrder }])
      }

      if (isPickUp) {
        const drawer = await prisma.drawers.findFirst({
          where: {
            id: order.drawerId
          }
        })

        const invalidCode = code !== drawer.code

        if (invalidCode) {
          throw new Error('Order pick up code does not match drawer code!')
        }

        const updatedOrder = await prisma.orders.update({
          where: {
            id
          },
          data: {
            status: STATUS.ORDER.RECEIVED_BUYER,
            pickupCode: null,
            received: true,
            receivedAt: new Date(),
            updatedAt: new Date(),
          }
        })

        await prisma.drawers.update({
          where: {
            id: updatedOrder.drawerId
          },
          data: {
            status: STATUS.DRAWER.AVAILABLE,
            code: null,
            updatedAt: new Date(),
          }
        })

        const getOrder = await prisma.orders.findFirst({
          where: {
            id: updatedOrder.id
          },
          include: QUERY
        })

        return SendResponse(res, 200, 'Success!', [{ order: getOrder }])
      }

      throw new Error('Invalid order id OR delivery/pickup code!')
    } catch (e) {
      return SendResponse(res, 400, e.message)
    }
  },

  async validate(req, res) {
    const { id } = req.params

    try {
      const order = await prisma.orders.findFirst({
        where: {
          id
        }
      })

      if (order.status !== STATUS.ORDER.RECEIVED_BUYER) {
        throw new Error('Cannot validate. Order not received by buyer yet!')
      }

      await prisma.orders.update({
        where: {
          id
        },
        data: {
          status: STATUS.ORDER.DONE,
          updatedAt: new Date()
        }
      })

      updatedOrder = await prisma.orders.findFirst({
        where: {
          id
        },
        include: QUERY
      })

      return SendResponse(res, 200, 'Success!', [{ order: updatedOrder }])
    } catch (e) {
      return SendResponse(res, 400, e.message)
    }
  },

  async delete(req, res) {
    const { id: orderId } = req.params

    try {
      const orderExists = await prisma.orders.findFirst({
        where: {
          id: orderId
        }
      })

      if (!orderExists || orderExists === null) {
        throw new Error('Invalid order!')
      }

      if (orderExists.deleted === true) {
        throw new Error('Order already deleted!')
      }

      const result = await prisma.orders.update({
        where: {
          id: orderId
        },
        data: {
          status: STATUS.ORDER.CANCELLED,
          deleted: true,
          updatedAt: new Date(),
          deletedAt: new Date()
        }
      })

      return SendResponse(res, 200, 'Success!', [{ order: result }])
    } catch (e) {
      return SendResponse(res, 400, e.message)
    }
  },
}