const express = require('express');
const router = express.Router()
const transitionController = require('../controller/transitionController')
const jwtVerify = require('../utilities/jwtVerify')

//GET: http://localhost:5000/api/v1/transition/all
router.get('/all', jwtVerify, transitionController.getAllTransitions)
//GET: http://localhost:5000/api/v1/transition
router.get('/', jwtVerify, transitionController.getTransitions)
//GET: http://localhost:5000/api/v1/transition/:id
router.get('/:id', jwtVerify, transitionController.getTransitionById)
//POST: http://localhost:5000/api/v1/transition/
router.post('/', jwtVerify, transitionController.createTransition)

//DELETE: http://localhost:5000/api/v1/transition/deleteAll
router.delete('/deleteAll', jwtVerify, transitionController.removeAllTransition)  // only for emergency
//DELETE: http://localhost:5000/api/v1/transition/:id
router.delete('/:id', jwtVerify, transitionController.removeTransition)







module.exports = router