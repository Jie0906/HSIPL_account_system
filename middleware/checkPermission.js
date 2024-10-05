const connectRedis = require('../config/redisClient.config')

const checkPermission = (requiredPermission) => {
    return async (req, res, next) => {
        try {
            const userEmail = req.user.email;
            
            if (!userEmail) {
                const error = new Error('User not authenticated')
                error.status = 401
                return next(error)
            }

            // 從 Redis 中獲取用戶權限，使用 email 作為 key
            let userPermissions = await connectRedis.get(`user:${userEmail}:permissions`);

            if (!userPermissions) {
                const error = new Error('User permissions not found');
                error.status = 403;
                return next(error);
            }

            userPermissions = JSON.parse(userPermissions);

            if (userPermissions.includes(requiredPermission)) {
                next();
            } else {
                const error = new Error('Permission denied');
                error.status = 403;
                return next(error);
            }
        } catch (error) {
            console.error('Error checking permission:', error);
            next(error)
        }
    };
};

module.exports = checkPermission;