const userModel = require('../models/userModel');
const bcrypt = require('bcrypt');

exports.register = async (req, res) => {
    try {
        const {fullName, email, password, age, phoneNumber} = req.body;

        const exisistingEmail = await userModel.findOne({email})
        const existingPhoneNumber = await userModel.findOne({phoneNumber})
        if (exisistingEmail || existingPhoneNumber) {
           return res.status(400).json({message: 'User already exist'})
        }
        const saltRound = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, saltRound);

        const user = await userModel.create({
            fullName, email, password: hashPassword, age, phoneNumber
        });
        res.status(201).json({
            message: 'User registered successfully', 
            data:user
        })
    } catch (error) {
        res.status(400).json({
            message: 'Internal server error', 
            error: error.message
        })    
    }
};


exports.getAll = async (req, res) => {
    try {
       const users = await userModel.find();
       res.status(200).json({
          message: 'Users successfully found',
          data: users
       });
    } catch (error) {
        res.status(400).json({
            message: 'Internal server error',
            error: error.message
        });
    }
};


exports.getOneUser = async (req, res) => {
    try {
        const id = req.params.id;
        const user = await userModel.findById(id);
        if (!user) {
             res.status(404).json({message: 'User not found'})
        } else {
            return res.status(200).json({
                message: 'User found',
                data: user
            })
        }
    } catch (error) {
       res.status(500).json({
        message: 'Internal server error',
        error: error.message
       }) 
    }
}