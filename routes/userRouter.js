const express = require('express');
const router = express.Router()
const userController = require('../controller/userController')
const jwtVerify = require('../utilities/jwtVerify')

//GET: http://localhost:5000/api/v1/users/all
router.get('/all', userController.getAllUsers)

//GET: http://localhost:5000/api/v1/users
router.get('/', jwtVerify, userController.getUser)

//GET: http://localhost:5000/api/v1/users/:id
router.get('/:id', userController.getSingleUsers)

// POST: http://localhost:5000/api/v1/users/register
router.post('/register', userController.register)

// POST: http://localhost:5000/api/v1/users/login
router.post('/login', userController.login)




module.exports = router