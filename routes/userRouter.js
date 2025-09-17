const { register, getAll, getOneUser } = require('../controllers/userController');
const uploads = require('../middleware/multer')

const userRouter = require('express').Router();

userRouter.post('/register',uploads.single('profilePicture'), register)

userRouter.get('/', getAll)

userRouter.get('/:id', getOneUser)

module.exports = userRouter
