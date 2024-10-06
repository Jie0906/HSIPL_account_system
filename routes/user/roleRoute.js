const roleController = require('../../controllers/User/roleController')
const tokenController = require('../../middleware/tokenController')
const checkPermission = require('../../middleware/checkPermission')
const router = require('express').Router()

router.post("/", tokenController.verifyToken, checkPermission('createRole'),roleController.createRole)
router.get("/", tokenController.verifyToken, checkPermission('getAllRole'),roleController.getAllRole)
router.get("/:id", tokenController.verifyToken, checkPermission('getRoleById'),roleController.getRoleById)
router.put("/", tokenController.verifyToken, checkPermission('updateRole'),roleController.updateRole)
router.delete("/", tokenController.verifyToken, checkPermission('deleteRole'),roleController.deleteRole)
router.post("/", tokenController.verifyToken, checkPermission('restoreRole'),roleController.restoreRole)

module.exports = router