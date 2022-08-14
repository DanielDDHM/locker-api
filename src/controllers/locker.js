const prisma = require('../config/prisma')
const { SendResponse, numberGenerator } = require('../helpers')
const { SIZES } = require('../typings')


module.exports = {
  async create(req, res) {
    try {
      var { drawers, streetNumber, zipCode } = req.body

      const lockerNumber = await prisma.lockers.count() + 1 // TODO: implements config {where: false}

      if (drawers) {
        const lockerExists = await prisma.lockers.findFirst({
          where: {
            number: Number(lockerNumber),
          },
        })

        if (!lockerExists || lockerExists === null) {
          const lockerAddressId = await prisma.addresses.findFirst({
            where: {
              streetNumber,
              zipCode,
            },
          })

          if (!lockerAddressId) {
            throw new error('Address does not exist!')
          }

          const identifier = numberGenerator(10)

          const createdLocker = await prisma.lockers.create({
            data: {
              lockerIdentifier: `LCK-${identifier}`,
              number: Number(lockerNumber),
              addressId: lockerAddressId.id,
            },
          })

          for (i = 0; i < Number(drawers); i++) {
            const identifier = numberGenerator(10)

            await prisma.drawers.create({
              data: {
                drawerIdentifier: `DRW-${identifier}`,
                number: Number(i),
                lockerId: createdLocker.id,
                size: SIZES.NONE,
                sizeLabel: 'N'
              },
            })
          }

          const updatedLocker = await prisma.lockers.findFirst({
            where: {
              id: createdLocker.id
            },
            include: {
              drawers: {
                select: {
                  id: true,
                  drawerIdentifier: true,
                  number: true,
                  status: true,
                  size: true,
                  sizeLabel: true,
                  code: true,
                  updatedAt: true,
                }
              }
            }
          })


          return SendResponse(res, 200, 'Success!', [{ locker: updatedLocker }])
        } else {
          throw new Error('Locker already exists!')
        }
      }

      throw new Error('Missing drawers property!')
    } catch (e) {
      return SendResponse(res, 400, [e.message])
    }
  },

  async getAll(req, res) {
    try {
      const { zipCode, streetNumber } = req.body
      const locker = req.query

      if (zipCode && streetNumber) {
        const addressFind = await prisma.addresses.findFirst({
          where: {
            zipCode: zipCode,
            streetNumber: streetNumber,
          },
        })
        locker.addressId = addressFind.id
      }
      const isWhere = !!(!!locker?.number || !!locker?.addressId)

      const where = {
        OR: [
          {
            OR: {
              addressId: locker?.addressId || undefined,
            },
          },
          {
            OR: {
              number: Number(locker?.number) || undefined,
            },
          },
        ],
      }
      const [alllockers, totallockers] = await prisma.$transaction([
        prisma.lockers.findMany({
          where: !isWhere ? { deleted: false } : where,
          skip: (Number(locker.page) - 1) * Number(locker.perPage),
          take: Number(locker.perPage),
        }),
        prisma.lockers.count({
          where: !isWhere ? { deleted: false } : where,
        }),
      ])

      const totalPages = totallockers > locker.perPage ? Math.ceil(totallockers / Number(locker.perPage)) : 1

      return SendResponse(res, 200, 'Success!', [{ alllockers, totallockers, totalPages }])
    } catch (e) {
      return SendResponse(res, 400, [e.message])
    }
  },

  async getById(req, res) {
    try {
      const locker = req.params
      const lockerFind = await prisma.lockers.findFirst({
        where: {
          deleted: false,
          id: locker.id,
        },
      })

      return SendResponse(res, 200, 'Success!', [lockerFind])
    } catch (e) {
      return SendResponse(res, 400, [e.message])
    }
  },

  async delete(req, res) {
    try {
      const locker = req.params
      const lockerDeleted = await prisma.lockers.update({
        where: {
          id: locker.id,
        },
        data: {
          deleted: true,
          number: -1,
          deletedAt: new Date(),
          updatedAt: new Date()
        },
      })
      return SendResponse(res, 200, 'Success!', [lockerDeleted])
    } catch (e) {
      return SendResponse(res, 400, [e.message])
    }
  },
}
