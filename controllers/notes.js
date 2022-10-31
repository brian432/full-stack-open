const notesRouter = require('express').Router()
const Note = require('../models/Note')
const User = require('../models/User')
const jwt = require('jsonwebtoken')

notesRouter.get('/', async (req, res) => {
    const notes = await Note.find({}).populate('user', { username: 1, name: 1 })
    res.json(notes)
})

notesRouter.get('/:id', async (request, response) => {
    const { id } = request.params
    try {
        const note = await Note.findById(id)
        response.json(note)
    } catch (err) {
        response.status(404)
            .json({ error: "ID no encontrada" })
            .end()
    }

})
notesRouter.delete('/:id', async (request, response, next) => {
    const { id } = request.params
    try {
        await Note.findByIdAndDelete(id)
        response.status(204).end()
    } catch (err) {
        next(err)
    }
})

const getTokenFrom = request => {
    const authorization = request.get('authorization')
    if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
        return authorization.substring(7)
    }
    return null
}
notesRouter.post('/', async (request, response, next) => {
    const { content, important = false } = request.body

    let token = getTokenFrom(request)

    let decodedToken = {}
    try{
        decodedToken = jwt.verify(token, process.env.SECRET)
    }catch(e){
        console.log(e)
    }

    if (!token || !decodedToken.id) {
        return response.status(401).json({
            error: 'token missing or invalid'
        })
    }

    const user = await User.findById(decodedToken.id)

    if (!content) {
        return response.status(400).json({
            error: "content not found"
        })
    }
    const newNote = new Note({
        content,
        date: new Date(),
        important,
        user: user._id

    })
    try {
        const savedNote = await newNote.save()
        user.notes = user.notes.concat(savedNote._id)
        await user.save()
        response.json(newNote)
    } catch (err) {
        console.log('post failure', err);
        next(err)
    }
})

notesRouter.put('/:id', (request, response, next) => {
    const { id } = request.params
    const note = request.body

    const newNoteInfo = {
        content: note.content,
        important: note.important
    }
    Note.findByIdAndUpdate(id, newNoteInfo, { new: true })
        .then(result => response.json(result))
})

module.exports = notesRouter