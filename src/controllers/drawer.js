const prisma = require('../config/prisma')
const { SendResponse, numberGenerator } = require('../helpers')
const { STATUS, SIZES } = require('../typings')


module.exports = {
  async create(req, res) {
    try {
      const { lockerId, size } = req.body
      drawerNumber = await prisma.drawers.count({ where: { lockerId } }) + 1 // TODO: implements config {where: false}

      let drawerSize = {}

      const checkDrawers = await prisma.drawers.findFirst({
        where: {
          number: drawerNumber,
          lockerId: lockerId,
        },
      })

      if (lockerId && !checkDrawers) {
        switch (size.toUpperCase()) {
          case 'S': drawerSize = SIZES.SMALL; break;
          case 'M': drawerSize = SIZES.MEDIUM; break;
          case 'L': drawerSize = SIZES.LARGE; break;
        }

        const identifier = numberGenerator(10)

        const drawerCreated = await prisma.drawers.create({
          data: {
            drawerIdentifier: `DRW-${identifier}`,
            number: drawerNumber,
            lockerId: lockerId,
            status: STATUS.DRAWER.AVAILABLE,
            size: drawerSize
          },
        })


        return SendResponse(res, 200, [drawerCreated])
      } else {
        throw new Error('Drawer already exists!')
      }
    } catch (e) {
      return SendResponse(res, 400, [e.message])
    }
  },

  async update(req, res) {
    const { id } = req.params

    try {
      const drawer = await prisma.drawers.findFirst({
        where: {
          id
        }
      })

      if (drawer.status === STATUS.DRAWER.AVAILABLE) {
        const updatedDrawer = await prisma.drawers.update({
          where: {
            id
          },
          data: {
            status: STATUS.DRAWER.OUT_OF_ORDER,
            updatedAt: new Date()
          }
        })

        return SendResponse(res, 200, 'Success!', [{ drawer: updatedDrawer }
        ])
      }

      if (drawer.status === STATUS.DRAWER.OUT_OF_ORDER) {
        const updatedDrawer = await prisma.drawers.update({
          where: {
            id
          },
          data: {
            status: STATUS.DRAWER.AVAILABLE,
            updatedAt: new Date()
          }
        })

        return SendResponse(res, 200, 'Success!', [{ drawer: updatedDrawer }
        ])
      }
    } catch (e) {
      return SendResponse(res, 400, [e.message])
    }
  },

  async getByLocker(req, res) {
    const locker = req.query
    try {

      const [allDrawers, totalDrawers] = await prisma.$transaction([
        prisma.drawers.findMany({
          where: {
            lockerId: locker.id,
          },
          skip: (Number(locker.page) - 1) * Number(locker.perPage),
          take: Number(locker.perPage),
        }),

        prisma.drawers.count({
          where: {
            lockerId: locker.id,
          },
        }),
      ])

      const totalPages = totalDrawers > locker.perPage ? Math.ceil(totalDrawers / Number(locker.perPage)) : 1

      return SendResponse(res, 200, [{ allDrawers, totalDrawers, totalPages }])
    } catch (e) {
      return SendResponse(res, 400, [e.message])
    }
  },

  async getById(req, res) {
    try {
      const drawer = req.query
      const drawerFind = await prisma.drawers.findFirst({
        where: {
          id: drawer.id,
        },
      })
      return SendResponse(res, 200, [drawerFind])
    } catch (e) {
      return SendResponse(res, 400, [e.message])
    }
  },
}
