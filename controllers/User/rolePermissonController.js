const db = require('../../models/index')
const Role = db.Role
const Permission = db.Permission
const RolePermission = db.RolePermission
const sequelize = db.sequelize

class rolePermissionController {
    assignPermissionToRole = async (req, res, next) => {
        const t = await sequelize.transaction()
        try {
            const { roleId, permissionId } = req.body
            const role = await Role.findByPk(roleId)
            const permission = await Permission.findByPk(permissionId)

            if (!role) {
                const error = new Error('Role not found')
                error.status = 404
                throw error
            }
            if (!permission) {
                const error = new Error('Permission not found')
                error.status = 404
                throw error
            }

            const [rolePermission, created] = await RolePermission.findOrCreate({
                where: { roleId, permissionId },
                transaction: t
            })

            if (!created) {
                const error = new Error('Permission already assigned to this role')
                error.status = 400
                throw error
            }

            await t.commit()
            return res.status(201).json({
                message: 'Permission assigned to role successfully',
                rolePermission
            })
        } catch (error) {
            await t.rollback()
            next(error)
        }
    }

    removePermissionFromRole = async (req, res, next) => {
        const t = await sequelize.transaction()
        try {
            const { roleId, permissionId } = req.body
            const rolePermission = await RolePermission.findOne({
                where: { roleId, permissionId }
            })

            if (!rolePermission) {
                const error = new Error('Role does not have this permission')
                error.status = 404
                throw error
            }

            await rolePermission.destroy({ transaction: t })

            await t.commit()
            return res.status(200).json({
                message: 'Permission removed from role successfully'
            })
        } catch (error) {
            await t.rollback()
            next(error)
        }
    }

    getRolePermissions = async (req, res, next) => {
        try {
            const { roleId } = req.params
            const role = await Role.findByPk(roleId, {
                include: [{
                    model: Permission,
                    through: { attributes: [] }
                }]
            })

            if (!role) {
                const error = new Error('Role not found')
                error.status = 404
                throw error
            }

            return res.status(200).json(role.Permissions)
        } catch (error) {
            next(error)
        }
    }

    getPermissionRoles = async (req, res, next) => {
        try {
            const { permissionId } = req.params
            const permission = await Permission.findByPk(permissionId, {
                include: [{
                    model: Role,
                    through: { attributes: [] }
                }]
            })

            if (!permission) {
                const error = new Error('Permission not found')
                error.status = 404
                throw error
            }

            return res.status(200).json(permission.Roles)
        } catch (error) {
            next(error)
        }
    }

    checkRoleHasPermission = async (req, res, next) => {
        try {
            const { roleId, permissionId } = req.body
            const rolePermission = await RolePermission.findOne({
                where: { roleId, permissionId }
            })

            if (rolePermission) {
                return res.status(200).json({ hasPermission: true })
            } else {
                return res.status(200).json({ hasPermission: false })
            }
        } catch (error) {
            next(error)
        }
    }
}

module.exports = new rolePermissionController()