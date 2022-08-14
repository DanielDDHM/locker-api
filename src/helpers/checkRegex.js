const { REGEX, OPERATIONS } = require('../typings')
const chalk = require('chalk');

const fail = chalk.redBright

module.exports = {
    async checkRegex(args, operation) {
        if (operation = OPERATIONS.CHECK_CONTACTS) {
            if (args.buyerContact) {
                const {buyerEmail, buyerPhone} = args.buyerContact
                if (REGEX.EMAIL.test(buyerEmail) != true) {
                    throw new Error(fail('Invalid buyer email format!'))
                }
                if (REGEX.CELLPHONE.test(buyerPhone) != true) {
                    throw new Error(fail('Invalid buyer phone number format!'))
                }
            }
            if (args.sellerContact) {
                const {sellerEmail, sellerPhone} = args.sellerContact
                if (REGEX.EMAIL.test(sellerEmail) != true) {
                    throw new Error(fail('Invalid seller email format!'))
                }
                if (REGEX.CELLPHONE.test(sellerPhone) != true) {
                    throw new Error(fail('Invalid seller phone number format!'))
                }
            }
        }
    }
}