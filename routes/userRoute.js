const userController = require('../controllers/userController')
const tokenController = require('../middleware/tokenController')
const router = require('express').Router()
const passport = require('passport')


router.get("/protected", userController.protected)
router.post("/signUp", userController.createUser)
router.post("/login",userController.login)
router.post("/forgetPassword", userController.forgetPassword)
router.get("/find", tokenController.verifyToken ,userController.findUser)
router.put("/resetPassword", userController.resetPassword)
router.delete("/:id", tokenController.verifyToken, userController.deleteUser)
router.post("/:id", tokenController.verifyToken, userController.restoreUser)



module.exports = router
