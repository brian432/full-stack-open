const notesRouter = require('express').Router()
const Note = require('../models/Note')
const User = require('../models/User')
const jwt = require('jsonwebtoken')
const getTokenFrom = require('../utils/get_token')

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
    let token = getTokenFrom(request)

    let decodedToken = {}
    try {
        decodedToken = jwt.verify(token, process.env.SECRET)
    } catch (e) {
        console.log(e)
    }

    if (!token || !decodedToken.id) {
        return response.status(401).json({
            status_code: 401,
            error: 'token missing or invalid'
        })
    }

    const { id } = request.params
    try {
        const noteDelete = await Note.findByIdAndRemove(id)
        console.log(noteDelete)
        response.json({
            status_code: 200,
            note: noteDelete
        })
    } catch (err) {
        next(err)
    }
})

notesRouter.get('/', async (request, response) => {
    let token = getTokenFrom(request)

    let decodedToken = {}
    try {
        decodedToken = jwt.verify(token, process.env.SECRET)
    } catch (e) {
        console.log(e)
    }

    if (!token || !decodedToken.id) {
        return response.status(401).json({
            status_code: 401,
            error: 'token missing or invalid'
        })
    }

    const user = await User.findById(decodedToken.id).populate('notes', { content: 1, date: 1, id: 1, important: 1 })

    response.status(200).json({
        status_code: 200,
        notes: user.notes
    })
})

notesRouter.post('/', async (request, response, next) => {
    const { content, important = false } = request.body

    let token = getTokenFrom(request)

    let decodedToken = {}
    try {
        decodedToken = jwt.verify(token, process.env.SECRET)
    } catch (e) {
        console.log(e)
    }

    if (!token || !decodedToken.id) {
        return response.status(401).json({
            status_code: 401,
            error: 'token missing or invalid'
        })
    }

    const user = await User.findById(decodedToken.id)

    if (!content) {
        return response.status(400).json({
            status_code: 400,
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
        response.status(201).json({
            status_code: 201,
            note: newNote
        })
    } catch (err) {
        console.log('post failure', err);
        next(err)
    }
})

notesRouter.put('/:id', async (request, response, next) => {
    let token = getTokenFrom(request)

    let decodedToken = {}
    try {
        decodedToken = jwt.verify(token, process.env.SECRET)
    } catch (e) {
        console.log(e)
    }

    if (!token || !decodedToken.id) {
        return response.status(401).json({
            status_code: 401,
            error: 'token missing or invalid'
        })
    }

    const { id } = request.params
    const note = request.body

    const newNoteInfo = {
        content: note.content,
        important: note.important
    }
    try {
        const noteUpdate = await Note.findByIdAndUpdate(id, newNoteInfo, { new: true })
        response.status(200).json({
            status_code: 200,
            note: noteUpdate
        })
    } catch (err) {
        console.log("PUT failure", err)
        next(err)
    }

})

module.exports = notesRouter