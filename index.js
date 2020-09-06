require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const app = express()
const cors = require('cors')
const Person = require('./models/person')

const logger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}

app.use(cors())
app.use(express.static('build'))
app.use(bodyParser.json())
app.use(logger)


morgan.token('body', function getId (req) {
    return JSON.stringify(req.body)
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.get('/',(request,response) => {
    response.send(`<div>This is a phonebook server.</div>`)
})

//get all persons data
app.get('/api/persons',(request,response,next) => {
    Person.find({}).then(persons => {
        response.json(persons)
      })
      .catch(error => next(error))
})

//get info
app.get('/info',(request,response) => {
    response.send(`<div>Phonebook has info for ${persons.length} people</div><div>${Date()}</div>`)
})

//get single entry
app.get('/api/persons/:id',(request,response,next) => {
    Person.findById(request.params.id).then(person => {
        if(person){
          response.json(person)
        }
        else{
          response.status(404).end()
        }
      })
      .catch(error => next(error))
})

//delete single entry
app.delete('/api/persons/:id',(request,response,next) => {
    Person.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

//post entry
app.post('/api/persons',(request,response,next) => {
    const body = request.body
    const person = new Person({
        name: body.name,
        number: body.number
    })
    person.save().then(savedPerson => {
        response.json(savedPerson)
      })
      .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body
    const person = {
        name: body.name,
        number: body.number
    }
    Person.findByIdAndUpdate(request.params.id, person, { new: true })
      .then(updatePerson => {
        response.json(updatePerson)
      })
      .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message)
    if (error.name === 'CastError' && error.kind == 'ObjectId') {
        return response.status(400).send({ error: 'malformatted id' })
    }
    else if (error.name === 'ValidationError') {
      return response.status(400).json({ error: error.message })
    }
    next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})