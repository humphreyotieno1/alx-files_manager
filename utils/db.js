// utils/db.js

const { MongoClient } = require('mongodb');

class DBClient {
  constructor() {
    this.host = process.env.DB_HOST || 'localhost';
    this.port = process.env.DB_PORT || 27017;
    this.database = process.env.DB_DATABASE || 'files_manager';
    this.client = null;
    this.db = null;
  }

  async connect() {
    if (!this.client) {
      this.client = await MongoClient.connect(`mongodb://${this.host}:${this.port}`, {
        useUnifiedTopology: true,
      });
      this.db = this.client.db(this.database);
    }
  }

  isAlive() {
    return this.client !== null;
  }

  async nbUsers() {
    await this.connect();
    const usersCollection = this.db.collection('users');
    return await usersCollection.countDocuments();
  }

  async nbFiles() {
    await this.connect();
    const filesCollection = this.db.collection('files');
    return await filesCollection.countDocuments();
  }
}

const dbClient = new DBClient();
module.exports = dbClient;
