const mongoose = require('mongoose')

  const personSchema = new mongoose.Schema({
    content: String,
    date: Date,
    number: Number,
    important: Boolean,
  })

personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
      returnedObject.id = returnedObject._id.toString()
      delete returnedObject._id
      delete returnedObject.__v
    }
  })

module.exports = mongoose.model('Person', personSchema)