import { v4 } from 'uuid';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

export async function getConnect(req, res) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
  const email = credentials.split(':')[0];

  const user = await dbClient.getUserWithEmail(email);
  if (!user) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  const token = v4();
  const key = `auth_${token}`;

  const userId = user._id.toString();
  await redisClient.set(key, userId, 86400);

  return res.status(200).json({ token: token });
}

export async function getDisconnect(req, res) {
  const token = req.headers['x-token'];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const key = `auth_${token}`;
  const userId = await redisClient.get(key);

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  await redisClient.del(key);

  return res.status(204).send();
}
