const { SIZES } = require('../typings')
module.exports = {
    checkSizes(width, length, height) {
        try {
            if (width <= 20 && length <= 48 && height <= 20) {
                return { drawerSize: SIZES.SMALL, label: 'Small' }
            }
            else if (width <= 40 && length <= 48 && height <= 20) {
                return { drawerSize: SIZES.MEDIUM, label: 'Medium' }
            }
            else if (width <= 60 && length <= 48 && height <= 40) {
                return { drawerSize: SIZES.LARGE, label: 'Large' }
            }

            throw new Error('Order size is not compatible with drawer sizes!')
        } catch (e) {
            console.log(e)
        }

    }
}
