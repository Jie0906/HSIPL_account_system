const rolePermissionController = require('../../controllers/User/rolePermissonController')
const tokenController = require('../../middleware/tokenController')
const checkPermission = require('../../middleware/checkPermission')
const router = require('express').Router()

router.post("/", tokenController.verifyToken, checkPermission('assignPermissionToRole'),rolePermissionController.assignPermissionToRole)
router.get("/:id", tokenController.verifyToken, checkPermission('getPermissionRoles'),rolePermissionController.getPermissionRoles)
router.get("/:id", tokenController.verifyToken, checkPermission('getRolePermissions'),rolePermissionController.getRolePermissions)
router.post("/", tokenController.verifyToken, checkPermission('checkRoleHasPermission'),rolePermissionController.checkRoleHasPermission)
router.post("/", tokenController.verifyToken, checkPermission('removePermissionFromRole'),rolePermissionController.removePermissionFromRole)

module.exports = router