const User = require('../schema/userSchema');
const registerValidator = require('../validator/registerValidator')
const loginValidator = require('../validator/loginValidator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const errorMessage = require('../utilities/errorMessage')


// Get all user 
module.exports.getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find().populate("transitions")
        if (!users.length) {
            return res.send({
                status: false,
                message: 'No user found',
            })
        }
        res.send({
            status: true,
            message: 'Successfully retrieved',
            users,
        })
    } catch (error) {
        return errorMessage(res, 400, "Server Error occurred", error)
    }

}
// Get user 
module.exports.getUser = async (req, res, next) => {
    const { email } = req.user
    try {
        const user = await User.findOne({ email })
        if (!user) {
            return res.send({
                status: false,
                message: 'No user found',
            })
        }
        user.password = ''
        res.send({
            status: true,
            message: 'Successfully retrieved',
            user,
        })
    } catch (error) {
        return errorMessage(res, 400, "Server Error occurred", error)
    }

}
// Get a user  
module.exports.getSingleUsers = async (req, res, next) => {
    try {
        const { id } = req.params
        const users = await User.findById(id, "-password").populate("transitions")
        if (!users) {
            return res.send({
                status: false,
                message: 'No user found',
            })
        }
        res.send({
            status: true,
            message: 'Successfully retrieved',
            users,
        })
    } catch (error) {
        return errorMessage(res, 400, "Server Error occurred", error)
    }

}

// register
module.exports.register = async (req, res, next) => {
    const { name, email, password, confirmPassword } = req.body

    // check validate
    const validate = registerValidator({ name, email, password, confirmPassword })
    if (!validate.isValid) {
        return errorMessage(res, 400, validate.error)
    }

    // check duplicate user
    const isUser = await User.findOne({ email })
    if (isUser) {
        return errorMessage(res, 500, 'User already exists')
    }

    // hash password
    bcrypt.hash(password, parseInt(process.env.PASS_HASH), async (err, hash) => {
        if (err) {
            return errorMessage(res, 500, 'Internal server error occurred', err)
        }
        try {
            // create instance
            const user = new User({
                name,
                email,
                password: hash,
                balance: 0,
                income: 0,
                expense: 0,
                transitions: []
            })
            const result = await user.save()

            if (result) {
                // create token
                const token = jwt.sign({
                    id: result._id,
                    email: result.email,
                    name: result.name,
                    income: result.income,
                    expense: result.expense,
                    balance: result.balance
                }, process.env.JWT_SECRETE, {
                    expiresIn: '1d'
                })

                return res.status(200).send({
                    status: true,
                    message: 'User create successfully',
                    token: `Bearer ${token}`
                })
            } else {
                return errorMessage(res, 500, 'Internal server error occurred')
            }
        } catch (err) {
            return errorMessage(res, 500, 'Internal server error occurred')
        }
    });
}


// login
module.exports.login = async (req, res, next) => {
    const { email, password } = req.body

    // check validate
    const validate = loginValidator({ email, password })
    if (!validate.isValid) {
        return errorMessage(res, 400, validate.error)
    }

    try {
        // check duplicate user
        const user = await User.findOne({ email })
        if (!user) {
            return errorMessage(res, 400, { password: "User and password doesn't match" })
        }

        const hash = user.password
        bcrypt.compare(password, hash, function (err, result) {
            if (err) {
                return errorMessage(res, 500, 'Internal server error occurred', err)
            }
            if (!result) {
                return errorMessage(res, 400, { password: "User and password doesn't match" })
            }
            // create token
            const token = jwt.sign({
                id: user._id,
                email: user.email,
                name: user.name,
                income: user.income,
                expense: user.expense,
                balance: user.balance
            },
                process.env.JWT_SECRETE,
                // { expiresIn: '1d' }
            )
            return res.status(200).send({
                status: true,
                message: 'Login successfully',
                token: `Bearer ${token}`
            })
        });

    } catch (err) {
        return errorMessage(res, 500, 'Internal server error occurred')
    }
}

