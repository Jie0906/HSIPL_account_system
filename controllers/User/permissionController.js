const db = require('../../models/index')
const Permission = db.Permission
const sequelize = db.sequelize;

class permissionController {
    createPermission = async (req, res, next) => {
        const t = await sequelize.transaction()
        try {
            const { name, description } = req.body
            if (!name || !description) {
                const error = new Error('Field cannot be empty.');
                error.status = 400;
                throw error;
            }
            const newPermission = await Permission.create({
                name,
                description
            }, { transaction: t })
            
            await t.commit()
            return res.status(201).json({
                message: 'Created new permission successfully.',
                newPermission
            })
        } catch (error) {
            await t.rollback()
            next(error)
        }
    }

    getAllPermission = async (req, res, next) => {
        try {
            const permissions = await Permission.findAll()
            return res.status(200).json(permissions)
        } catch (error) {
            next(error)
        }
    }

    getPermissionById = async (req, res, next) => {
        try {
            const { id } = req.params
            const permission = await Permission.findByPk(id)
            if (!permission) {
                const error = new Error('Permission not found');
                error.status = 404;
                throw error;
            }
            return res.status(200).json(permission)
        } catch (error) {
            next(error)
        }
    }

    updatePermission = async (req, res, next) => {
        const t = await sequelize.transaction()
        try {
            const { id } = req.params
            const { name, description } = req.body
            const permission = await Permission.findByPk(id)
            if (!permission) {
                const error = new Error('Permission not found');
                error.status = 404;
                throw error;
            }
            await permission.update({ name, description }, { transaction: t })
            
            await t.commit()
            return res.status(200).json({
                message: 'Updated permission successfully.',
                permission
            })
        } catch (error) {
            await t.rollback()
            next(error)
        }
    }

    deletePermission = async (req, res, next) => {
        const t = await sequelize.transaction()
        try {
            const { id } = req.params
            const permission = await Permission.findByPk(id)
            if (!permission) {
                const error = new Error('Permission not found');
                error.status = 404;
                throw error;
            }
            await permission.destroy({ transaction: t })
            
            await t.commit()
            return res.status(200).json({
                message: 'Deleted permission successfully.'
            })
        } catch (error) {
            await t.rollback()
            next(error)
        }
    }

    restorePermission = async (req, res, next) => {
        const t = await sequelize.transaction()
        try {
            const { id } = req.params
            const permission = await Permission.findByPk(id, { paranoid: false })
            if (!permission) {
                const error = new Error('Permission not found');
                error.status = 404;
                throw error;
            }
            await permission.restore({ transaction: t })
            
            await t.commit()
            return res.status(200).json({
                message: 'Restored permission successfully.',
                permission
            })
        } catch (error) {
            await t.rollback()
            next(error)
        }
    }
}

module.exports = new permissionController()