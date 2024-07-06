const { register, login, getUserById } = require("../controller/user.controller.js")
const express  = require("express")
const { isAuthenticated } = require('../middleware/auth.js')
const router = express.Router()


router.post('/auth/register', register)
router.post('/auth/login', login)
router.get('/api/users/:userId', isAuthenticated, getUserById)



module.exports = router