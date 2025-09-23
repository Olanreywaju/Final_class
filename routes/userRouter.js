const { register, getAll, getOneUser, login, home, changePassword } = require('../controllers/userController');
const uploads = require('../middleware/multer')

const userRouter = require('express').Router();

userRouter.post('/register',uploads.single('profilePicture'), register)

userRouter.get('/', getAll)

userRouter.get('/:id', getOneUser)

userRouter.post("/login", login);
userRouter.get("/", home)
userRouter.post("/password", changePassword)

module.exports = userRouter
