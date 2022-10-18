const express = require('express');
const cors = require('cors');
const colors = require('colors');
const mongoose = require('mongoose');
require('dotenv').config()
const userRoute = require('./routes/userRouter')
const transitionRoute = require('./routes/transitionRoute')

const PORT = process.env.PORT || 5000
const app = express()


// middleware
app.use(cors({origin: 'https://money-app-psi.vercel.app/'}))
app.use(express.json())

mongoose.connect(process.env.DB_URI).then(() => console.log(`Database is connected...`.blue.bold))

// user
app.use('/api/v1/users', userRoute)
app.use('/api/v1/transition', transitionRoute)









app.get('/', (req, res) => {
    res.send(`server is online`)
})


// app.all('*', (req, res) => {
//     res.send(`The route is not available`)
// })

app.listen(PORT, () => {
    console.log(`Server is online on port ${PORT}...`.blue.bold)
})
