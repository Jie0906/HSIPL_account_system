const db = require('../../models/index')
const Role = db.Role
const sequelize = db.sequelize;

class roleController {
    createRole = async (req, res, next) => {
        const t = await sequelize.transaction()
        try {
            const { name, description } = req.body
            if (!name || !description) {
                const error = new Error('Field cannot be empty.');
                error.status = 400;
                throw error;
            }
            const newRole = await Role.create({
                name,
                description
            }, { transaction: t })
            
            await t.commit()
            return res.status(201).json({
                message: 'Created new role successfully.',
                newRole
            })
        } catch (error) {
            await t.rollback()
            next(error)
        }
    }

    getAllRole = async (req, res, next) => {
        try {
            const roles = await Role.findAll()
            return res.status(200).json(roles)
        } catch (error) {
            next(error)
        }
    }

    getRoleById = async (req, res, next) => {
        try {
            const { id } = req.params
            const role = await Role.findByPk(id)
            if (!role) {
                const error = new Error('Role not found');
                error.status = 404;
                throw error;
            }
            return res.status(200).json(role)
        } catch (error) {
            next(error)
        }
    }

    updateRole = async (req, res, next) => {
        const t = await sequelize.transaction()
        try {
            const { id } = req.params
            const { name, description } = req.body
            const role = await Role.findByPk(id)
            if (!role) {
                const error = new Error('Role not found');
                error.status = 404;
                throw error;
            }
            await role.update({ name, description }, { transaction: t })
            
            await t.commit()
            return res.status(200).json({
                message: 'Updated role successfully.',
                role
            })
        } catch (error) {
            await t.rollback()
            next(error)
        }
    }

    deleteRole = async (req, res, next) => {
        const t = await sequelize.transaction()
        try {
            const { id } = req.params
            const role = await Role.findByPk(id)
            if (!role) {
                const error = new Error('Role not found');
                error.status = 404;
                throw error;
            }
            await role.destroy({ transaction: t })
            
            await t.commit()
            return res.status(200).json({
                message: 'Deleted role successfully.'
            })
        } catch (error) {
            await t.rollback()
            next(error)
        }
    }

    restoreRole = async (req, res, next) => {
        const t = await sequelize.transaction()
        try {
            const { id } = req.params
            const role = await Role.findByPk(id, { paranoid: false })
            if (!role) {
                const error = new Error('Role not found');
                error.status = 404;
                throw error;
            }
            await role.restore({ transaction: t })
            
            await t.commit()
            return res.status(200).json({
                message: 'Restored role successfully.',
                role
            })
        } catch (error) {
            await t.rollback()
            next(error)
        }
    }
}

module.exports = new roleController()