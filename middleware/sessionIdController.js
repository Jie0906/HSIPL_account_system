const { generateId } = require('../utils/sessionUtils')
const connectRedis = require('../config/redisClient.config')
class SessionIdController  {
    async gernerateSessionId(userId){
        let redisClient
        try{
            redisClient = await connectRedis();
            const sessionIdKey = `userId:${userId}`;
            let sessionId = await redisClient.get(sessionIdKey);
        
            if (!sessionId) {
                sessionId = generateId();
                const sessionData = { userId, loggedIn: true };
                await redisClient.set(sessionId, JSON.stringify(sessionData), 'EX', 3600);
                await redisClient.set(sessionIdKey, sessionId, 'EX', 3600);
        
                console.log(`Generated new sessionId: ${sessionId}`);
          }
          else{
                await redisClient.expire(sessionId, 3600);
                await redisClient.expire(sessionIdKey, 3600);
                console.log(`Refreshed the sessionId: ${sessionId}`);
          }
          return sessionId
        }catch(err){
            console.error('Error in generateSessionId:', err);
            const error = new Error('Failed to generate or refresh session');
            error.status = 500;
            throw error;
        }
    }
    async verifySessionId (req, res, next){
        let redisClient;
        try {
        redisClient = await connectRedis();
        const sessionId = req.cookies.sessionId;
        console.log(`${sessionId }`)

        if (!sessionId) {
            const error = new Error('No session found');
            error.status = 401;
            throw error;
        }

        const sessionData = await redisClient.get(sessionId);

        if (!sessionData) {
            const error = new Error('Invalid session');
            error.status = 401;
            throw error;
        }

        const parsedSessionData = JSON.parse(sessionData);

        if (!parsedSessionData.loggedIn) {
            const error = new Error('User not logged in');
            error.status = 403;
            throw error;
        }

        console.log('Session verified successfully');
        next();
        } catch (error) {
        next(error);
        }
}
}

module.exports = new SessionIdController()