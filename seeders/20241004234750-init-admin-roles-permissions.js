'use strict';

const bcrypt = require('bcrypt');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // 創建角色
      const roles = await queryInterface.bulkInsert('Role', [
        { name: 'admin', description: 'Administrator with full access', createdAt: new Date(), updatedAt: new Date() },
        { name: 'normalUser', description: 'Regular user with limited access', createdAt: new Date(), updatedAt: new Date() }
      ], { returning: true, transaction });

      // 創建基本權限
      const permissions = await queryInterface.bulkInsert('Permission', [
        { name: 'create_user', description: 'Can create new users', createdAt: new Date(), updatedAt: new Date() },
        { name: 'edit_user', description: 'Can edit user information', createdAt: new Date(), updatedAt: new Date() },
        { name: 'delete_user', description: 'Can delete users', createdAt: new Date(), updatedAt: new Date() },
        { name: 'view_users', description: 'Can view user list', createdAt: new Date(), updatedAt: new Date() },
        { name: 'manage_roles', description: 'Can manage roles', createdAt: new Date(), updatedAt: new Date() },
        { name: 'manage_permissions', description: 'Can manage permissions', createdAt: new Date(), updatedAt: new Date() }
      ], { returning: true, transaction });

      // 為 admin 角色分配所有權限
      const adminRoleId = roles[0].id;
      const rolePermissions = permissions.map(permission => ({
        roleId: adminRoleId,
        permissionId: permission.id,
        createdAt: new Date(),
        updatedAt: new Date()
      }));

      await queryInterface.bulkInsert('RolePermission', rolePermissions, { transaction });

      // 創建 admin 用戶
      const hashedPassword = await bcrypt.hash('adminpassword', 10);
      const adminUser = await queryInterface.bulkInsert('User', [{
        name: 'Admin User',
        username: 'admin',
        email: 'eugene605110@gmail.com',
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date()
      }], { returning: true, transaction });

      // 為 admin 用戶分配 admin 角色
      await queryInterface.bulkInsert('UserRole', [{
        userId: adminUser[0].id,
        roleId: adminRoleId,
        createdAt: new Date(),
        updatedAt: new Date()
      }], { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // 刪除所有相關數據
      await queryInterface.bulkDelete('UserRole', null, { transaction });
      await queryInterface.bulkDelete('RolePermission', null, { transaction });
      await queryInterface.bulkDelete('User', null, { transaction });
      await queryInterface.bulkDelete('Permission', null, { transaction });
      await queryInterface.bulkDelete('Role', null, { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};