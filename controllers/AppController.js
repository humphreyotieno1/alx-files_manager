const redis = require('../utils/redis');
const db = require('../utils/db');

class AppController {
  static async getStatus(req, res) {
    try {
      const redisStatus = await redis.isAlive();
      const dbStatus = await db.isAlive();

      res.status(200).json({ redis: redisStatus, db: dbStatus });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getStats(req, res) {
    try {
      const userCount = await db.countUsers();
      const fileCount = await db.countFiles();

      res.status(200).json({ users: userCount, files: fileCount });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = AppController;
