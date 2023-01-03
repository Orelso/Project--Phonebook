const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('Please provide the password as an argument: node mongo.js <password>')
  process.exit(1)
}



const password = process.argv[2]

const url = `mongodb+srv://phonebook:phonebook1@cluster0.xewuh4u.mongodb.net/phonebookApp?retryWrites=true&w=majority`


const personSchema = new mongoose.Schema({
  content: String,
  date: Date,
  number: Number,
  important: Boolean,
})

const Person = mongoose.model('Person', personSchema)

mongoose
  .connect(url)
  .then((result) => {
    console.log('connected')

    const person = new Person({
      content: process.argv[3],
      date:new Date(),
      number: process.argv[4],
      important: true,
    })

    personSchema.set('toJSON', {
        transform: (document, returnedObject) => {
          returnedObject.id = returnedObject._id.toString()
          delete returnedObject._id
          delete returnedObject.__v
        }
      })
    
    console.log("------------------------------------------------------",person, "---------------------------------------------------");
    person.save().then(result => {
        console.log('Person Saved!')
      }) 
      .catch((err) => console.log(err))

    return Person.find({}).then(result => {
        result.forEach(person => {
          console.log(person)
        })
        mongoose.connection.close()
      })
    //   return person.save()
  })
  