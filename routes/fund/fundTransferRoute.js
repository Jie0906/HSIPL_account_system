const fundTransferController = require('../../controllers/Fund/fundTransferController')
const tokenController = require('../../middleware/tokenController')
const checkPermission = require('../../middleware/checkPermission')
const router = require('express').Router()

router.post("/", tokenController.verifyToken, checkPermission('fundTransfer'), fundTransferController.fundTransfer)

module.exports = router