const axios = require('axios')

module.exports = {
  async checkAddress(zipCode) {
    try {
      const response = await axios.get(`https://viacep.com.br/ws/${zipCode}/json/`)
      const data = response.data
      return data
    } catch (error) {
      console.log(error)
    }
  },
}
