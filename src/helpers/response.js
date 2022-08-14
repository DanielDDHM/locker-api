module.exports = (res, status, msg, data = []) => {
  res.status(status).send({
    msg,
    data
  })
}