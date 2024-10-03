const db = require('../../models/index')
const FundCategory = db.FundCategory


class fundCategoryController{
    addCategory = async (req, res, next) => {
        try{
            const { name, description } = req.body

            if ( !name || !description ){
                const error = new Error('Field cannot be empty.')
                error.status = 400
                throw error
            }

            let infor = {
                name,
                description
            }
            await FundCategory.create(infor)
            return res.status(201).json({
                message: 'Added new category successful.'
            })

        }
        catch(error){
            next(error)
        }
    }

    getCategory = async (req, res, next) => {

    }

    updateCategory = async (req, res, next) => {

    }

    deleteCategory = async (req, res, next) => {

    }

    restoreCategory = async (req, res, next) => {

    }
}

module.exports = new fundCategoryController()