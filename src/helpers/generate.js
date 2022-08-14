module.exports = {
    numberGenerator(value) {
        var numberCreated = Math.floor(
            Math.pow(10, value - 1) + Math.random() * (Math.pow(10, value) - Math.pow(10, value - 1) - 1),
        )
        return numberCreated
    },
}