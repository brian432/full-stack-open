const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/User')

usersRouter.post('/', async (request, response, next) => { //Cuando se hace el post en el frontend, nuestro backend recibe la request con la informacion enviada en el body de la request
    const { body: { username, name, password } } = request //obtenemos las variables que necesitamos para enviar a nuestra base de datos a partir del body de la request
    try {
        const saltRounds = 10
        const passwordHash = await bcrypt.hash(password, saltRounds) //Encriptamos la informacion proveniente de la constante password

        const user = new User({ //Creamos un nuevo usuario a partir de nuestro modelo/esquema/objeto User
            username: username,
            name: name,
            passwordHash,
        })

        const savedUser = await user.save()
        response.status(201).json({
            status_code: 201,
            user:savedUser
        })
    } catch (err) {
        next(err)
    }

})

usersRouter.get('/', async (request, response) => {
    const users = await User.find({}).populate('notes', { content: 1, date: 1 })
    response.json(users)
})

module.exports = usersRouter