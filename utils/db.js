const { MongoClient, ObjectId } = require('mongodb');

const HOST = process.env.DB_HOST || 'localhost';
const PORT = process.env.DB_PORT || '27017';
const DATABASE = process.env.DB_DATABASE || 'files_manager';

const url = `mongodb://${HOST}:${PORT}`;

class DBClient {
  constructor() {
    this.client = new MongoClient(url, { useUnifiedTopology: true });
    this.client.connect();
    this.database = DATABASE;
    this.host = HOST;
  }

  isAlive() {
    return this.client.isConnected();
  }

  async nbUsers() {
    try {
      const db = this.client.db(this.database);
      const users = db.collection('users');
      return await users.countDocuments();
    } catch (err) {
      console.error('Error counting documents in "users" collection');
    }
  }

  async nbFiles() {
    try {
      const db = this.client.db(this.database);
      const files = db.collection('files');
      return await files.countDocuments();
    } catch (err) {
      console.error('Error counting documents in "files" collection');
    }
  }

  async findFileById(id) {
    try {
      const db = this.client.db(this.database);
      const files = db.collection('files');
      const results = await files.findOne({ _id: ObjectId(id) });
      return results;
    } catch (err) {
      throw Error('Cant find file by "id"');
    }
  }

  async createNewFile(fileObject) {
    try {
      const db = this.client.db(this.database);
      const files = db.collection('files');
      return await files.insertOne(fileObject);
    } catch (err) {
      throw Error('Cant create new file');
    }
  }

  async findFileByUserId(userId) {
    try {
      const db = this.client.db(this.database);
      const files = db.collection('files');
      return await files.findOne({ userId });
    } catch (err) {
      throw Error('Error occured while looking for file with "userId"');
    }
  }

  async replaceValue(idObject, updatedObject) {
    try {
      const db = this.client.db(this.database);
      const files = db.collection('files');
      return await files.replaceOne(idObject, updatedObject);
    } catch (err) {
      throw Error('Error occured while updating collection files');
    }
  }

  async getUserWithEmail(email) {
    try {
      const db = this.client.db(this.database);
      const users = db.collection('users');
      const result = await users.findOne({ email });
      return result;
    } catch (err) {
      throw Error('Error occured while finding user in "users" collection');
    }
  }

  async getUserWithId(id) {
    try {
      const db = this.client.db(this.database);
      const users = db.collection('users');
      const result = await users.findOne({ _id: ObjectId(id) });
      return result;
    } catch (err) {
      throw Error('Error occured while finding user in "users" collection');
    }
  }

  async createUser(email, hashedPassword) {
    try {
      const db = this.client.db(this.database);
      const users = db.collection('users');
      await users.insertOne({ email, password: hashedPassword });
      const user = await users.findOne({ email }, { projection: { _id: 1 } });
      return user;
    } catch (err) {
      throw Error('Error occured while finding user in "users" collection');
    }
  }

  async aggregateFiles(userId, parentId, skip, limit) {
    const pipeline = [
      {
        $match: {
          userId,
          parentId,
        },
      },
      { $skip: skip },
      { $limit: limit },
    ];

    try {
      const db = this.client.db(this.database);
      const filesCollection = db.collection('files');
      const result = await filesCollection.aggregate(pipeline).toArray();
      return result;
    } catch (err) {
      throw new Error('Error aggregating files');
    }
  }
}

const dbClient = new DBClient();
module.exports = dbClient;
