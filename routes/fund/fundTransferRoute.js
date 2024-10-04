const fundTransferController = require('../../controllers/Fund/fundTransferController')
const tokenController = require('../../middleware/tokenController')
const router = require('express').Router()

router.post("/", tokenController.verifyToken,fundTransferController.fundTransfer)

module.exports = router