const prisma = require('../config/prisma')
const { checkSizes } = require('./checkSizes')
const { STATUS } = require('../typings')

module.exports = {
  async checkDeliveryAvailability(size, buyerLongitude, buyerLatitude, distance) {
    await prisma.$runCommandRaw({
      createIndexes: "Addresses",
      indexes: [
        {
          "key": {
            "location": "2dsphere"
          },
          "name": "location_2dsphere"
        }
      ]
    })
    const addresses = await prisma.addresses.aggregateRaw({
      pipeline: [
        {
          $geoNear: {
            near: { type: "Point", coordinates: [Number(buyerLongitude), Number(buyerLatitude)] },
            distanceField: "dist.calculated",
            maxDistance: Number(distance),
            // query: { addressLabel: "Shopping" },
            spherical: true
          }
        },
      ],
    })
    if (!addresses) {
      throw new Error('No available lockers at the moment in thes specified region!')
    }

    for (let index = 0; index < addresses.length; index++) {
      var addressId = addresses[index]._id.$oid

      var locker = await prisma.lockers.findFirst({ // se houver mais de um locker por endereço, necessário tratativa
        where: {
          addressId
        }
      })

      const { drawerSize, label } = checkSizes(size.width, size.length, size.height)
      const drawer = await prisma.drawers.findFirst({
        where: {
          lockerId: locker.id,
          status: STATUS.DRAWER.AVAILABLE,
          sizeLabel: label
        },
      })
      if (drawer) {
        return drawer
      }
    }

    throw new Error('No available drawers at the moment in the specified region! Plase try a greater search radius')
  }
}