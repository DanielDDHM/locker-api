const QUERY = {
  drawer: {
    select: {
      id: true,
      number: true,
      status: true,
      size: true,
      sizeLabel: true,
      code: true,
      updatedAt: true,
      locker: {
        select: {
          id: true,
          number: true,
          lockersAddress: {
            select: {
              id: true,
              addressLabel: true,
              addressName: true,
              street: true,
              streetNumber: true,
              neighborhood: true,
              city: true,
              state: true,
              zipCode: true,
              location: true,
            }
          }
        }
      }
    }
  }
}

module.exports = { QUERY }