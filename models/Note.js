const { Schema, model } = require('mongoose')

const notesSchema = new Schema({
    content: String,
    date: Date,
    important: Boolean,
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
}) //ver funcionalidad de validación en mongoose

notesSchema.set('toJSON', {
    transform: (document, returnedObj) => {
        returnedObj.id = returnedObj._id
        delete returnedObj._id
        delete returnedObj.__v
    }
})

const Note = model('Note', notesSchema)

module.exports = Note