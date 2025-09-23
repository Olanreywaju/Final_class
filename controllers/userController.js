const userModel = require('../models/userModel');
const cloudinary = require('../config/cloudinary')
const bcrypt = require('bcrypt');
const express = require('express');
const fs = require('fs');
const { sendMail } = require('../middleware/email');
const jwt = require('jsonwebtoken')

const {html} = require('../middleware/signUp')
const {forgotHtml} = require('../middleware/forgot') 

exports.register = async (req, res) => {
    try {
        const {fullName, email, password, age, phoneNumber} = req.body;
        const file = req.file;
        let response;
        const exisistingEmail = await userModel.findOne({email: email})
        const existingPhoneNumber = await userModel.findOne({phoneNumber: phoneNumber})
        
        if (exisistingEmail || existingPhoneNumber) {
            fs.unlinkSync(file.path)
           return res.status(400).json({
            message: 'User already exist'})
        };

        if (file && file.path) {
            response = await cloudinary.uploader.upload(file.path);
            console.log(response);
            
            fs.unlinkSync(file.path)
        };
        const saltRound = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, saltRound);

        const user = await userModel.create({
            fullName, 
            email, 
            password: hashPassword, 
            age, 
            phoneNumber,
            profilePicture: {
                publicId: response.public_id,
                imageUrl: response.secure_url
            }
        });
        await user.save()

        const subject = "Kindly Verify Your Email";
        const link = `${req.protocol}://${req.get("host")}/api/v1/verify/${user._id}`
        const text = `Hello ${user.fullName}, welcome to our app! Please verify your email.with the link below ${link}`;

        await sendMail({
            to: email,
            subject,
            text,
            html: html(link, user.fullName)
        }
    ).then(()=>{console.log('mail sent')}).catch((e)=>{
        console.log(e)     
    })
        
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
};

// exports.update = async (req, res) => {
//     try {
//         const { fullName, age} = req.body;
//         const {id} = req.params;
//         const file = req.file
//         let response;
//         const user = await userModel.findById(id);

//         if (!user) {
//             return res.status(404).json('User not found')
//         };

//         if (file && file.path) {
//             await cloudinary.uploader.destroy(user.profilePicture.publicId);
//             response = await cloudinary.uploader.upload(file.path);
//             fs.unlinkSync(file.path)
//         }

//         const userData = {
//             fullName: fullName ?? user.fullName,
//             age: age ?? user.age,
//             profilePicture: {
//                 imageUrl: response?.secure_url,
//                 publicId: response?.public_id
//             }
//         };

//         const newData = Object.asssign(user, userData)
//         const update = await userModel.findByIdAndUpdate(user._id, newData, {new: true});

//         res.status(200).json({
//             message: 'User updated successfully',
//             data: update
//         })
//     } catch (error) {
//         res.status(500).json({
//             message: 'Internal server error',
//             error: error.message
//         })
//     }
// }

exports.updateUser = async (req, res) => {
    try {
        const {id} = req.params;
        const {...type} = req.body;

        if (!user) {
            return res.status(404).json('User not found')
        };

        if (Object.values(type).length === 0) {
            return res.status(400).json('An input is required')
        };

        const updateUser = await userModel.findByIdAndUpdate(id, type, {new: true});
        res.status(200).json({
            message: 'User successfully updated',
            data: updateUser
        })
    } catch (error) {
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        })
    }
}

exports.delete = async (req, res) => {
    try {
        const {id} = req.params;
        const user = await userModel.findById(id);

        if (!user) {
            return res.status(404).json('User not found')
        };

        await userModel.findByIdAndDelete(user._id);
        res.status(200).json('User deleted successfully')

    } catch (error) {
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        })
    }
}

exports.verifyUser = async (req, res) => {
    try {
       const checkUser = await userModel.findById(req.params.id)
       if(!checkUser) {
        return res.status(404).json({
            message: 'User not found'
        })
       } 

       if (checkUser.isVerified){
        return res.status(400).json({
            message: 'Email already verified'
        })
       }
       await userModel.findByIdAndUpdate(req.params.id, {isVerified:true}), {new:true}

       res.status(200).json({
        message: 'Email successfully verified'
       })
    } catch (error) {
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        })
    }
}

exports.login = async (req, res) => {
    try {
        const {email, password} = req.body
        const checkUser = await userModel.findOne({email:email.toLowerCase()})

        if (!checkUser){
            return res.status(400).json("Invalid Credential")
        }

        const checkPassword = await bcrypt.compare(password, checkUser.password)

        if (!checkUser || !checkPassword){
            return res.status(400).json("Invalid credentials")
        }

        const token = jwt.sign({id:checkUser._id}, "larry", {expiresIn:"1d"})
        
        res.status(200).json({
            message: 'Login successful',
            data: checkUser, token
        })
    } catch (error) {
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        })
    }
}

// This line exports the 'home' function so it can be used in other modules.
exports.home = async (req,res) => {
    try {
        // Retrieve the token from the request headers for authorization checks
        const checkToken = req.headers.authorization

        // If no token is found, return a 400 status code with a "Login required" message
        if (!checkToken){
            return res.status(400).json("Login required")
        }

        // Extract the actual token from the 'Authorization' header by splitting the string
        const token = req.headers.authorization.split(" ")[1]

        // Verify the token using jwt.verify, with a secret key "larry"
        jwt.verify(token, "larry", async(err, result)=>{
            // If there's an error in token verification, return a 400 status code with the error message
            if (err){
                return res.status(400).json({error:err,message})
            } else {
                // If verification is successful, find the user in the database by their ID from the token
                const checkUser = await userModel.findById(result.id)

                // Send a successful response with the user's full name in the message
                res.status(200).json(`Welcome ${checkUser.fullName}, we are happy to have you here.`)
            }
        })
    // Catch any errors not handled in the try block and respond with a 500 status code
    } catch (error) {
        res.status(500).json({
            message: 'Internal server error',
            error: error.message // Return the error message for debugging
        })
    }
}

// Function to handle forgotten password requests
exports.forgotPassword = async (req, res) => {
    try {
        // Extract email from the request body
        const {email} = req.body

        // Find a user with the provided email (after converting to lowercase and trimming spaces)
        const checkEmail = await userModel.findOne({email: email.toLowerCase().trim()})

        // If no user found, return a 404 error with an appropriate message
        if(!checkEmail){
            return res.status(404).json({
                message: 'Invalid email provided'
            })
        }

        // Set the subject for the reset password email
        const subject = `Reset Password`

        // Create a token for password reset that expires in 1 day
        const token = jwt.sign({id: checkEmail._id}, "larry", {expiresIn: "1d"})

        // Generate the link that will be sent in the email for the user to reset their password
        const link = `${req.protocol}://${req.get("host")}/api/v1/reset/${token}`
        // Send the email with the reset instructions
        await sendMail({
            to: email,
            subject,
            text,
            html: forgotHtml(link, checkEmail.fullName)
        })

        // Respond with a success message
        res.status(200).json({
            message: 'Kindly check your email for instruction'
        })
    } catch (error) {
        // If there's an error, respond with a 500 status and error message
        res.status(500).json({
            messsage: 'Internal server error',
            error: error.message
        })
    }
}

// Define the changePassword function as an asynchronous function
exports.changePassword = async (req, res) => {
    try {
        // Extract new password and confirm password from the request body
        const { newPassword, confirmPassword } = req.body;

        // Check if the new password and confirm password match
        if (newPassword !== confirmPassword) {
            // Send response with error if they don't match
            return res.status(400).json({ message: "Passwords do not match" });
        }

        // Generate a salt to use in password hashing
        const salt = await bcrypt.genSalt(10);
        // Hash the new password using the salt
        const hash = await bcrypt.hash(newPassword, salt);

        // Find the user in the database by their ID from the request parameters
        const user = await userModel.findById(req.params.id);

        // Verify the user's JWT token
        jwt.verify(user.token, "your_secret_key", async (err, result) => {
            // If there's an error during verification (e.g., token expiration)
            if (err) {
                // Send response with error message
                return res.status(400).json({ message: 'Token expired' });
            } else {
                // Update the user's password in the database with the hashed password and clear the token
                await userModel.findByIdAndUpdate(result.id, { password: hash, token: null }, { new: true });
                // Send back a success message
                res.status(200).json({ message: "Password successfully changed" });
            }
        });
    } catch (error) {
        // Handle any server errors by sending a 500 status code
        res.status(500).json({ 
            message: "Server error",
            error: error.message
     });
    }
};