const mongoose = require('mongoose')
const { MONGO_DB_URI, MONGO_DB_URI_TEST, NODE_ENV } = process.env

const connectionString = NODE_ENV === 'test'
    ? MONGO_DB_URI_TEST //base de datos para testing
    : MONGO_DB_URI //base de datos de produccion


mongoose.connect(connectionString)
    .then(() => console.log("Database connected"))
    .catch(err => console.log("error en la conexion", err))

process.on('uncaughtException', () => { //Desconectar el servidor al haber un error
    mongoose.disconnect()
})