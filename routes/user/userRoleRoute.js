const userRoleController = require('../../controllers/User/userRoleController')
const tokenController = require('../../middleware/tokenController')
const checkPermission = require('../../middleware/checkPermission')
const router = require('express').Router()

router.post("/", tokenController.verifyToken, checkPermission('assignRoleToUser'),userRoleController.assignRoleToUser)
router.get("/:id", tokenController.verifyToken, checkPermission('getRoleUsers'),userRoleController.getRoleUsers)
router.get("/:id", tokenController.verifyToken, checkPermission('getUserRoles'),userRoleController.getUserRoles)
router.post("/", tokenController.verifyToken, checkPermission('checkUserHasRole'),userRoleController.checkUserHasRole)
router.post("/", tokenController.verifyToken, checkPermission('removeRoleFromUser'),userRoleController.removeRoleFromUser)

module.exports = router