const express = require('express')
require('./db/mongoose')
const app = express()

const taskRouter = require('./routers/task')
const userRouter = require('./routers/user')
const port = process.env.PORT || 3000

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

module.exports = app

