const express = require('express');
const router = require('./routes');
const { searchQueuedOrders } = require('./cronjobs')

const cors = require('cors');
const helmet = require('helmet')
const morgan = require('morgan')

const app = express();
const port = 3000

//ENHANCEMENT
app.use(helmet())
app.use(morgan('combined'))
app.use(express.urlencoded({ extended: false }))

//MIDDLEWARES
app.use(express.json()); /* bodyParser.json() is deprecated */
app.use(cors())

// CRONS
searchQueuedOrders.start()

// ROUTES
app.use('/v1', router)

// TEST GET
app.get("/", (req, res) => {
  res.json({ message: "Welcome to application." });
});

// RODANDO NOSSA APLICAÇÃO NA PORTA SETADA
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`)
});
