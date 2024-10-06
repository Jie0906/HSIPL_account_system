const db = require('../../models/index')
const User = db.User
const Role = db.Role
const UserRole = db.UserRole
const sequelize = db.sequelize


class userRoleController {
    assignRoleToUser = async (req, res, next) => {
        const t = await sequelize.transaction()
        try{
            const { userId, roleId } = req.body
            const user = await User.findByPk(userId)
            const role = await User.findByPk(roleId)
            if (!user || !role){
                const error = new Error('Data not found.');
                error.status = 404;
                throw error;
            }
            await UserRole.create({
                userId,
                roleId
            },{transaction: t})

            await t.commit()
            return res.status(201).json({
                message: 'Role assigned to user successfully'
            })
        }
        catch(error){
            await t.rollback()
            next(error)
        }
    }

    removeRoleFromUser = async (req, res, next) => {
        const t = await sequelize.transaction()
        try {
            const { userId, roleId } = req.body;
            const userRole = await UserRole.findOne({ where: { userId, roleId } });

            if (!userRole) {
                const error = new Error('User does not have this role.');
                error.status = 404;
                throw error;
            }

            await userRole.destroy({ transaction: t });

            await t.commit();
            res.status(200).json({ message: 'Role removed from user successfully' });
        } catch (error) {
            await t.rollback();
            next(error);
        }
    }

    getUserRoles = async (req, res, next) => {
        try {
            const { userId } = req.params;
            const user = await User.findByPk(userId, {
                include: [{
                    model: Role,
                    through: { attributes: [] }
                }]
            });

            if (!user) {
                const error = new Error('User not found');
                error.status = 404;
                throw error;
            }

            res.status(200).json(user.Roles);
        } catch (error) {
            next(error);
        }
    }

    getRoleUsers = async (req, res, next) => {
        try {
            const { roleId } = req.params;
            const role = await Role.findByPk(roleId, {
                include: [{
                    model: User,
                    through: { attributes: [] }
                }]
            });

            if (!role) {
                const error = new Error('Role not found.');
                error.status = 404;
                throw error;
            }

            res.status(200).json(role.Users);
        } catch (error) {
            next(error);
        }
    }

    checkUserHasRole = async (req, res, next) => {
        try {
            const { userId, roleId } = req.body;
            const userRole = await UserRole.findOne({ where: { userId, roleId } });

            if (userRole) {
                res.status(200).json({ hasRole: true });
            } else {
                res.status(200).json({ hasRole: false });
            }
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new userRoleController()