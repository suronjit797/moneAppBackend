const express = require('express');
const router = express.Router()
const transitionController = require('../controller/transitionController')
const jwtVerify = require('../utilities/jwtVerify')

//GET: http://localhost:5000/api/v1/transition/all
router.get('/all',jwtVerify, transitionController.getAllTransitions)
router.get('/',jwtVerify, transitionController.getTransitions)
router.get('/:id',jwtVerify, transitionController.getTransitionById)
router.post('/', jwtVerify, transitionController.createTransition)







module.exports = router