 const mongoose = require('mongoose')

 const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type:String,
        required: true,
        unique: true,
        lowwercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    phoneNumber: {
        type: Number,
        required: true
    },
    profilePicture: {
        imageUrl: {
            type: String
        },
        publicId: {
            type: String
        }
    },

 }, {
    timestamps: true
 });

 const userModel = mongoose.model('users', userSchema)

 module.exports = userModel;