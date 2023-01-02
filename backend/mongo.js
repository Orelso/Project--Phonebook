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

    // const person = new Person({
    //   content: 'John',
    //   date: new Date().toISOString(),
    //   number: 465131153,
    //   important: true,
    // })

    Person.find({}).then(result => {
        result.forEach(person => {
          console.log(person)
        })
        mongoose.connection.close()
      })

    return Person.find()
  })
  .then(() => {
    console.log('Person Saved!')
    return mongoose.connection.close()
  })
  .catch((err) => console.log(err))