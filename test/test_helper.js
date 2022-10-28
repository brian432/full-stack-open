const supertest = require('supertest')
const { app } = require('../index')
const api = supertest(app)

const initialNotes = [
    {
        content: "Hola como estas",
        important: true,
    },
    {
        content: "Chau hasta luego",
        important: false
    }
]

const getAllContentFromNotes = async() =>{
    const response = await api.get('/api/notes')
    const contents = response.body.map(note => note.content)
    return {contents, response}
}
module.exports = {
    initialNotes,
    getAllContentFromNotes, 
    api
}