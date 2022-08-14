const Queue = require('bull')
const chalk = require('chalk');
const { checkDeliveryAvailability, numberGenerator } = require('../helpers')
const prisma = require('../config/prisma')
const { STATUS } = require('../typings')

const CONCURRENCY = 1

const success = chalk.greenBright
const fail = chalk.redBright

const orderQueue = new Queue('order', {
    redis: {
        port: 6379,
        host: 'localhost',
    },
    defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: true,
    }
})

orderQueue.process(CONCURRENCY, async (job) => {
    const { id, size, buyersAddress } = job.data

    const { buyerLongitude, buyerLatitude, distance } = buyersAddress
    try {
        const drawer = await checkDeliveryAvailability(size, buyerLongitude, buyerLatitude, distance)
        const deliveryCode = numberGenerator(6)

        await prisma.$transaction([
            prisma.drawers.update({
                where: {
                    id: drawer.id,
                },
                data: {
                    status: STATUS.DRAWER.RESERVED,
                    code: deliveryCode,
                    updatedAt: new Date(),
                }
            }),
            prisma.orders.update({
                where: {
                    id,
                },
                data: {
                    deliveryCode: deliveryCode,
                    status: STATUS.ORDER.CREATED,
                    drawerId: drawer.id,
                    updatedAt: new Date(),
                }
            }),
        ])
    } catch (e) {
        console.log(e)
    }

})

orderQueue.on('completed', job => {
    console.log(success(`[ Job with id ${job.id} has been completed! Order ${job.data.id} ]`));
})

orderQueue.on('failed', job => {
    console.log(fail(`[ Job with id ${job.id} has failed! Order ${job.data.id} ]`));
})

module.exports = { orderQueue }