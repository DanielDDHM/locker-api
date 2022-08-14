const prisma = require('../config/prisma')
const { SendResponse } = require('../helpers')


module.exports = {
  async create(req, res) {
    const {
      addressLabel,
      addressName,
      street,
      streetNumber,
      neighborhood,
      city,
      state,
      zipCode,
      location
    } = req.body

    try {
      if (streetNumber && zipCode) {
        const addressExists = await prisma.addresses.findFirst({
          where: {
            streetNumber,
            zipCode
          }
        })

        if (addressExists) {
          throw new Error('Address already exists!')
        }

        const result = await prisma.addresses.create({
          data: {
            addressLabel,
            addressName,
            street,
            streetNumber,
            neighborhood,
            city,
            state,
            zipCode,
            location
          }
        })

        return SendResponse(res, 201, 'Success!', [result])
      }

      throw new Error('Missing properties in JSON body, check the schema!')
    } catch (e) {
      return SendResponse(res, 400, e.message)
    }
  },

  async getNearest(req, res) {
    const { long, lat, distance, addressLabel } = req.query // addressLabel permite buscar por tipos de endereço

    try {
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

      const locations = await prisma.addresses.aggregateRaw({
        pipeline: [
          {
            $geoNear: {
              near: { type: "Point", coordinates: [Number(long), Number(lat)] },
              distanceField: "distance.calculated",
              maxDistance: Number(distance),
              // query: { addressLabel: "Supermercado" },
              spherical: true
            }
          },
        ],
      })

      return SendResponse(res, 200, 'Success!', [locations])

    } catch (e) {
      return SendResponse(res, 400, e.message)
    }
  },

  async update(req, res) {
    const { id: addressId } = req.params
    const {
      addressLabel,
      addressName,
      street,
      streetNumber,
      neighborhood,
      city,
      state,
      zipCode,
    } = req.body

    try {
      if (addressId && (street || streetNumber || neighborhood || city || state || zipCode)) {
        const addressExists = await prisma.addresses.findFirst({
          where: {
            id: addressId,
            deleted: false
          }
        })

        if (!addressExists || addressExists === null) {
          throw new Error('Invalid address!')
        }

        const result = await prisma.addresses.update({
          where: {
            id: addressId
          },
          data: {
            addressLabel,
            addressName,
            street,
            streetNumber,
            neighborhood,
            city,
            state,
            zipCode,
            updatedAt: new Date(),
          }
        })

        return SendResponse(res, 200, 'Success!', [result])
      }

      throw new Error('Missing address id OR needs at least one property to update address!')
    } catch (e) {
      return SendResponse(res, 400, e.message)
    }
  },

  async delete(req, res) {
    const { id: addressId } = req.params

    try {
      const addressExists = await prisma.addresses.findFirst({
        where: {
          id: addressId
        }
      })

      if (!addressExists || addressExists === null) {
        throw new Error('Invalid address!')
      }

      if (addressExists.deleted === true) {
        throw new Error('Address already deleted!')
      }

      const result = await prisma.addresses.update({
        where: {
          id: addressId
        },
        data: {
          deleted: true,
          updatedAt: new Date(),
          deletedAt: new Date()
        }
      })

      return SendResponse(res, 200, 'Success!', [result])
    } catch (e) {
      return SendResponse(res, 400, e.message)
    }
  }
}