const errorMessage = require("../utilities/errorMessage")
const Transition = require('../schema/transitionSchema')
const User = require('../schema/userSchema')
const transitionsValidator = require("../validator/transitionsValidator")


// get all transitions
module.exports.getAllTransitions = async (req, res, next) => {
    const result = await Transition.find().populate("author", "-password")
    try {
        if (!result.length) {
            return errorMessage(res, 404, 'No transition found')
        }
        res.status(200).send({
            status: true,
            message: 'Get all transitions',
            data: result
        })
    } catch (err) {
        return errorMessage(res, 500, 'Server error occurred', err)
    }
}
module.exports.getTransitions = async (req, res, next) => {
    const { id } = req.user
    const result = await Transition.find({author: id}).populate('author', '-password')
    try {
        if (!result.length) {
            return errorMessage(res, 404, 'No transition found')
        }
        res.status(200).send({
            status: true,
            message: 'Get all transitions',
            data: result
        })
    } catch (err) {
        return errorMessage(res, 500, 'Server error occurred', err)
    }
}

module.exports.getTransitionById = async (req, res, next) => {
    try {
        const id = req.params.id
        const result = await Transition.findById(id).populate("author", "-password")
        if (!result) {
            return errorMessage(res, 404, 'No transition found')
        }
        res.status(200).send({
            status: true,
            message: 'Get a transition',
            data: result
        })
    } catch (err) {
        return errorMessage(res, 500, 'Server error occurred', err)
    }
}


// get a transition by id

// create a transition
module.exports.createTransition = async (req, res, next) => {
    const { amount, type, note } = req.body
    const { id } = req.user
    const validate = transitionsValidator({ amount, type })
    if (!validate.isValid) {
        return errorMessage(res, 400, validate.error)
    }

    try {
        const user = await User.findById(id)
        if (!user) {
            errorMessage(res, 404, 'No user found')
        }

        const transition = new Transition({
            amount,
            type,
            note,
            author: id
        })

        const result = await transition.save()
        if (!result) {
            errorMessage(res, 401, 'Transition create failed')
        }
        if (type === "income") {
            user.income += amount
            user.balance += amount
        } else if (type === "expense") {
            user.expense += amount
            user.balance -= amount
        }
        user.balance = user.income - user.expense
        user.transitions.unshift(result._id)
        const userResult = await User.findByIdAndUpdate(id, user, { new: true })
        console.log(userResult)
        if (!userResult) {
            errorMessage(res, 500, 'Internal server error occurred')
        }
        return res.status(200).send({
            status: true,
            message: 'Transition create successfully',
            data: result
        })
    } catch (err) {
        return errorMessage(res, 500, 'Internal server error occurred')
    }
}

// delete a transition by id


// update a transition by id