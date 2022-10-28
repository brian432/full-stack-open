const bcrypt = require('bcrypt')
const User = require('../models/user')
const mongoose = require('mongoose')

const { server } = require('../index')
const { api } = require('./test_helper')

describe('when there is initially one user in db', () => {
    beforeEach(async () => {
        await User.deleteMany({})

        const passwordHash = await bcrypt.hash('sekret', 10)
        const user = new User({ username: 'root', passwordHash })

        await user.save()
    })

    test('La creación se realiza correctamente con un nuevo nombre de usuario', async () => {
        const usersInDb = await User.find({})
        const usersAtStart = usersInDb.map(user => user.toJSON())

        const newUser = {
            username: 'mluukkai',
            name: 'Matti Luukkainen',
            password: 'salainen',
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(200)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await User.find({})
        const usernames = usersAtEnd.map(u => u.username)

        expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)
        expect(usernames).toContain(newUser.username)
    })
    afterAll(() => {
        mongoose.connection.close()
        server.close()
    })
})

