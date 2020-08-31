const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')

app.use(express.json())
app.use(cors())

morgan.token('body', function getId (req) {
    return JSON.stringify(req.body)
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

let persons = [
    {
      "name": "Arto Hellas",
      "number": "040-123456",
      "id": 1
    },
    {
      "name": "Ada Lovelace",
      "number": "39-44-5323523",
      "id": 2
    },
    {
      "name": "Dan Abramov",
      "number": "12-43-234345",
      "id": 3
    },
    {
      "name": "Mary Poppendieck",
      "number": "39-23-6423122",
      "id": 4
    }
  ]

app.get('/',(request,response) => {
    response.json(persons)
})

//get all persons data
app.get('/api/persons',(request,response) => {
    response.json(persons)
})

//get info
app.get('/info',(request,response) => {
    response.send(`<div>Phonebook has info for ${persons.length} people</div><div>${Date()}</div>`)
})

//get single entry
app.get('/api/persons/:id',(request,response) => {
    const id = Number(request.params.id)
    const person = persons.filter(person => person.id === id)
    if(person.length>0){
        response.json(person)
    }
    else{
        response.status(404).end()
    }
})

//delete single entry
app.delete('/api/persons/:id',(request,response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)
    response.status(204).end()
})

const generateId = ()=>{
    let maxId = 0
    if(persons.length > 0)
    {
        persons.map(person=>{
            maxId = person.id>maxId ? person.id : maxId
        })
        maxId = Math.floor(Math.random() * 10) + (maxId)
    }
    console.log(maxId)
    return maxId + 1
}

//post entry
app.post('/api/persons',(request,response) => {
    const body = request.body
    const alreadyExist = persons.some(person => person.name === body.name);
    if(!body.name || !body.number || alreadyExist)
    {
        if(alreadyExist)
        {
            return response.status(409).json({
                error: 'Name must be unique.'
              })
        }
        else
        {
            return response.status(400).json({
                error: 'Name or number missing.'
              })
        }
    }
    const person = {
        name: body.name,
        number: body.number,
        id: generateId()
    }
    persons = persons.concat(person)
    response.json(person)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})