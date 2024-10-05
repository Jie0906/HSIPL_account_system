const userController = require('../controllers/userController')
const tokenController = require('../middleware/tokenController')
const sessionIdController = require('../middleware/sessionIdController')
const imgUpload = require('../middleware/imgUpload')
const router = require('express').Router()
const passport = require('passport')


router.get("/protected", userController.protected)
router.post("/signUp", userController.createUser)
router.post("/login",userController.login)
router.post("/forgetPassword", userController.forgetPassword)
router.get("/find", tokenController.verifyToken ,userController.findUser)
router.put("/resetPassword", userController.resetPassword)
router.delete("/:id", tokenController.verifyToken, userController.deleteUser)



module.exports = router
