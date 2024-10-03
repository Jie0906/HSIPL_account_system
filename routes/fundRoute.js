const fundController = require('../controllers/fundController')
const tokenController = require('../middleware/tokenController')
const router = require('express').Router()

router.post("/", tokenController.verifyToken ,fundController.addItem)
router.get("/", tokenController.verifyToken, fundController.getAllItem)
router.get("/search", tokenController.verifyToken, fundController.searchItem)
router.get ("/:id", tokenController.verifyToken, fundController.getItemById)
router.put("/:id", tokenController.verifyToken,fundController.updateItem)
router.delete("/:id", tokenController.verifyToken, fundController.deleteItem)
router.post("/:id", tokenController.verifyToken, fundController.restoreItem)


module.exports = router
