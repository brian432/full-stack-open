const mongoose = require('mongoose')
const Note = require('../models/Note')

const { server } = require('../index')
const { getAllContentFromNotes, initialNotes, api } = require('./test_helper')

describe('when there is initially one user in db', () => {
    beforeEach(async () => {
        await Note.deleteMany({})

        const noteObject = initialNotes.map(note => new Note(note)) //creamos las notas a partir del esquema
        const promiseArray = noteObject.map(note => note.save()) //guardamos las notas creadas

        await Promise.all(promiseArray)

    })

    //Test GET
    test('Devuelve todas las notas de la base de datos', async () => { //Testeamos que el status y el content type sean los esperados
        await api
            .get('/api/notes')
            .expect(200)
            .expect('Content-Type', /application\/json/)
    })

    test('Devuelve el contenido esperado', async () => {
        const { response } = await getAllContentFromNotes()
        expect(response.body).toHaveLength(initialNotes.length) //Al hacer la peticion esperamos que en el body devuelva dos notas, las notas mockeadas por nosotros en beforeEach()
    })

    test('Retorna un contenido especifico', async () => { //chequeamos que dentro de las notas, haya una que contenga el string 'Hola como estas'
        const { contents } = await getAllContentFromNotes()
        expect(contents).toContain('Hola como estas')
    })


    // Test POST

    test('Agrega una nota y devuelve el length +1', async () => {
        const newNote = {
            content: "nueva nota",
            important: true
        }

        await api
            .post('/api/notes')
            .send(newNote)
            .expect(200)
            .expect('Content-Type', /application\/json/)

        const { response, contents: notes } = await getAllContentFromNotes()

        expect(response.body).toHaveLength(initialNotes.length + 1)
        expect(notes).toContain('nueva nota')

    })

    test('nota sin contenido no se guardara', async () => {
        const newNote = {
            important: true
        }

        await api
            .post('/api/notes')
            .send(newNote)
            .expect(400)

        const response = await api.get('/api/notes')

        expect(response.body).toHaveLength(initialNotes.length)
    })


    afterAll(() => {
        mongoose.connection.close()
        server.close()
    })
})