const express = require('express');
const router = express.Router()
const transitionController = require('../controller/transitionController')
const jwtVerify = require('../utilities/jwtVerify')

//GET: http://localhost:5000/api/v1/transition/all
router.get('/', transitionController.getTransitions)
router.get('/:id', transitionController.getTransitionById)
router.post('/', jwtVerify, transitionController.createTransition)







module.exports = router