const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    name: {
        type: String,
        required: 'Please Provide Your Name',
        trim: true,
    },
    email: {
        type: String,
        required: 'Please Provide Your Email',
        trim: true,
        unique: [true, 'User Already Exists in This Email']
    },
    password: {
        type: String,
        required: 'Please Provide Your Password'
    },
    balance: Number,
    income: Number,
    expense: Number,
    transitions: {
        type:[{
            type: Schema.Types.ObjectId,
            ref: 'Transaction'
        }]
    }
},{timestamps:true,});

const User = mongoose.model('User',userSchema);

module.exports = User