const STATUS = {
  LOCKER: {},
  DRAWER: {
    AVAILABLE: 'Available',
    RESERVED: 'Reserved',
    IN_USE: 'In Use',
    OUT_OF_ORDER: 'Out of Order'
  },
  ORDER: {
    CREATED: 'Created',
    PENDING: 'Pending (Waiting to Enter Queue)',
    QUEUED: 'Queued',
    DELIVERED_SELLER: 'Delivered By Seller',
    RECEIVED_BUYER: 'Received By Buyer',
    DONE: 'Done',
    CANCELLED: 'Cancelled',
  }
}
module.exports = { STATUS }
