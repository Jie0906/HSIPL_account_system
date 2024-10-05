const permissionController = require('../../controllers/User/permissionController')
const tokenController = require('../../middleware/tokenController')
const checkPermission = require('../../middleware/checkPermission')
const router = require('express').Router()

router.post("/", tokenController.verifyToken, checkPermission('createPermission'), permissionController.createPermission)
router.get("/", tokenController.verifyToken, checkPermission('getAllPermission'), permissionController.getAllPermission)
router.get("/:id", tokenController.verifyToken, checkPermission('getPermissionById'),permissionController.getPermissionById)
router.put("/", tokenController.verifyToken, checkPermission('updatePermission'),permissionController.updatePermission)
router.delete("/", tokenController.verifyToken, checkPermission('deletePermission'),permissionController.deletePermission)
router.post("/", tokenController.verifyToken, checkPermission('restorePermission'),permissionController.restorePermission)

module.exports = router