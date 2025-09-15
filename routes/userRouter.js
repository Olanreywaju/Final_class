const { register } = require('../controllers/userController');
const uploads = require('../middleware/multer')

const userRouter = require('express').Router();

userRouter.post('/register',uploads.single('profilePicture'), register)

module.exports = userRouter
