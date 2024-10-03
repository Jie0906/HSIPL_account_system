const fundCategoryController = require('../../controllers/Fund/fundCategoryController')
const router = require('express').Router()

router.post("/", fundCategoryController.addCategory)

module.exports = router