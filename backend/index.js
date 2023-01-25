const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();

var morgan = require("morgan");
app.use(express.static("build"));

/* -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
let persons = [];
/* -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
const mongoose = require("mongoose");
const Person = require("./models/person");

const url = process.env.MONGODB_URI;

console.log("connecting to", url);

mongoose
  .connect(url)
  .then((result) => {
    console.log("connected to MongoDB");
  })
  .catch((error) => {
    console.log("error connecting to MongoDB:", error.message);
  });

const personSchema = new mongoose.Schema({
  content: String,
  date: Date,
  number: Number,
  important: { type: Boolean, default: false },
});
/* -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
const requestLogger = (request, response, next) => {
  console.log("Method:", request.method);
  console.log("Path:  ", request.path);
  console.log("Body:  ", request.body);
  console.log("---");
  next();
};
app.use(express.json()); //Notice that json-parser is taken into use before the requestLogger middleware, because otherwise request.body will not be initialized when the logger is executed!
app.use(requestLogger);
app.use(
  morgan(
    ":method :url :status :response-time[digits] :response-time ms - :body"
  )
);
app.use(cors());
/* -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
app.post("/api/persons", async (request, response,) => {
  const body = request.body;

  if (body.content === undefined) {
    return response.status(400).json({ error: "content missing" });
  }

  const exists = persons.find((checkPerson) => {
    return (
      checkPerson.content === body.content && checkPerson.number === body.number
    );
  });

  if (exists) {
    return response.status(400).json({
      error: `name and number must be unique`,
    });
  }

  const person = new Person({
    content: body.content,
    number: body.number,
    important: body.important || false, // To be exact, when the important property is false, then the body.important || false expression will in fact return the false from the right-hand side..
    date: new Date(),
  });


  await person.save();

  response.json(person);
});
/* -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
morgan.token("body", (req) => {
  return JSON.stringify(req.body);
});

app.use(
  morgan(
    ":method :url :status :response-time[digits] :response-time ms - :body"
  )
);
/* -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
app.get("/api/persons", (request, response) => {
  // The event handler function accepts two parameters. The first request parameter contains all of the information of the HTTP request, and the second response parameter is used to define how the request is responded to.
  Person.find({}).then((persons) => {
    response.send(persons);
  });
});
/* -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
app.get("/api/persons/:id", (request, response, next) => {
  // The second route defines an event handler that handles HTTP GET requests made to the persons path of the application.--- Now app.get('/api/persons/:id', ...) will handle all HTTP GET requests that are of the form /api/persons/SOMETHING, where SOMETHING is an arbitrary string.
  // const id = Number(request.params.id) // The id parameter in the route of a request, can be accessed through the request object. Since id is a number we need to define it with "Number"
  // const person = persons.find(person => person.id === id) // find method of arrays is used to find the person with an id that matches the parameter. The person is then returned to the sender of the request.
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person);
      } else {
        response.status(404).end(); //If no person is found, the server should respond with the status code 404 not found instead of 200.
      }
    })
    .catch(error => next(error))
});

/* -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
app.delete("/api/persons/:id", async (request, response) => {
  const id = request.params.id;
  console.log("-------", id);
  const person = await Person.findById(id);
  console.log(person);
  if (person === null) {
    return response.status(404).json({ error: "person not found" });
  }
  await Person.findByIdAndRemove(id);
  response.status(204).end();
});
/* -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/

app.put("/api/persons/:id", (req, res, next) => {
  console.log(req.body.important); // check if the important field is being passed correctly

  const id = req.params.id;
  const person = {
    name: req.body.name,
    number: req.body.number,
    important: req.body.important,
  };

  Person.findByIdAndUpdate(id, person, { new: true })
    .then((updatedPerson) => {
      res.json(updatedPerson);
    })
    .catch((error) => next(error));
});

/* -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
const unknownEndpoint = (request, response) => {
  // This means that we are defining middleware functions that are only called if no route handles the HTTP request.
  response.status(404).send({ error: "unknown endpoint" }); // is used for catching requests made to non-existent routes
};

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } 

  next(error)
}

// this has to be the last loaded middleware.
app.use(errorHandler)

app.use(unknownEndpoint);
/* -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
const PORT = process.env.PORT || 12000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
