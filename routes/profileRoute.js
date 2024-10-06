const tokenController = require('../middleware/tokenController')
const profileController = require('../controllers/profileController')
const imageUploadController = require('../middleware/imageUpload')
const router = require('express').Router()


router.get("/", tokenController.verifyToken,profileController.showProfile)
router.put("/", tokenController.verifyToken,profileController.addUserInfor)
router.put("/:uploadType", tokenController.verifyToken,imageUploadController.uploadFile, profileController.uploadAvatar)


module.exports = router