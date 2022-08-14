var CronJob = require('cron').CronJob;
const { STATUS } = require('../typings')
const { orderQueue } = require('../jobs/queue');
const prisma = require('../config/prisma')
const chalk = require('chalk');

const EMPTY = 0
const cron = '* * * * *' // Every minute
const tz = 'America/Sao_Paulo'

const log = console.log
const info = chalk.cyanBright

var searchQueuedOrders = new CronJob(
    cron,
    async function () {
        log(info('[ Searching for orders... ]'))

        const queuedOrders = await prisma.orders.findMany({
            where: {
                OR: [
                    {
                        status: STATUS.ORDER.PENDING,
                    },
                    {
                        status: STATUS.ORDER.QUEUED,
                    },
                ]
            },
            orderBy: {
                createdAt: 'asc'
            }
        })

        if (queuedOrders.length === EMPTY) {
            log(info('[ No pending/queued orders found! ]'))
        }

        for (let i = 0; i < queuedOrders.length; i++) {
            if (queuedOrders[i].status === STATUS.ORDER.PENDING) {
                await prisma.orders.update({
                    where: {
                        id: queuedOrders[i].id,
                    },
                    data: {
                        status: STATUS.ORDER.QUEUED,
                        updatedAt: new Date(),
                    }
                })
            }

            await orderQueue.add(queuedOrders[i]);

            log(info(`[ Order ${queuedOrders[i].id} added to the queue! ]`))
        }
    },
    null,
    true,
    tz
);

module.exports = { searchQueuedOrders }