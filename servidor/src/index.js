const express= require('express') // Se importa la librería de express
const app = express() // Se crea la constante app la cual va a ser la que escuche el servidor
const puerto = 3000
const routes = require('./api/endPoints')

app.use('/', routes)

app.listen(puerto, ()=> {
    console.log(`Escuchando desde el puerto ${puerto}`)
})