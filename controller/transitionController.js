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

// get monthly transitions
module.exports.getTransitions = async (req, res, next) => {
    try {
        const { id } = req.user
        const limit = req.query.limit || 50
        const skip = req.query.skip || 0
        const { month, year } = req.query

        if (!id) {
            return errorMessage(res, 401, 'Unauthorized Access')
        }
        const result = await Transition.find({
            author: id,
            createdAt: { $gte: `${year}-${month}-01`, $lte: `${year}-${month}-30` }
        })
            .populate('author', '-password')
            .sort({ $natural: -1 })
            .limit(limit)
            .skip(skip)
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


// get a transition by id
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
        user.transitions.unshift(result._id)
        const userResult = await User.findByIdAndUpdate(id, user, { new: true })
        if (!userResult) {
            errorMessage(res, 404, 'No user found')
        }
        return res.status(200).send({
            status: true,
            message: 'Transition create successfully',
            transition: result,
            user: userResult
        })
    } catch (err) {
        return errorMessage(res, 500, 'Internal server error occurred')
    }
}

// delete a transition by id
module.exports.removeTransition = async (req, res, next) => {
    try {
        const id = req.params.id
        const userId = req.user.id
        const user = await User.findById(userId)
        const transition = await Transition.findById(id).populate("author", "-password, -transitions")
        if (transition.type === 'income') {
            user.balance -= transition.amount
            user.income -= transition.amount
        }
        if (transition.type === 'expense') {
            user.balance += transition.amount
            user.expense -= transition.amount
        }
        await Transition.findByIdAndDelete(id)
        const userResult = await User.findByIdAndUpdate(userId, user, { new: true })
        return res.status(200).send({
            status: true,
            message: 'Transition delete successfully',
            user: userResult
        })
    } catch (err) {
        return errorMessage(res, 500, 'Server error occurred', err)
    }
}

// delete all
module.exports.removeAllTransition = async (req, res, next) => {
    try {
        const userId = req.user.id

        const transition = await Transition.deleteMany()

        const user = await User.findById(userId)
        user.balance = 0
        user.income = 0
        user.expense = 0
        user.transitions = []

        const updatedUser = await User.findByIdAndUpdate(userId, user, {new: true})


        res.send({updatedUser, transition})

    } catch (err) {
        return errorMessage(res, 500, 'Server error occurred', err)
    }
}


// update a transition by id