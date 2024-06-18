import dbClient from '../utils/db';
import { encryptPassword } from '../utils/crypto';

export default class UsersController {
  static async postNew(req, res) {
    try {
      const { email, password } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'Missing email' });
      }

      if (!password) {
        return res.status(400).json({ error: 'Missing password' });
      }

      const exists = await dbClient.getUserWithEmail(email);
      if (exists) {
        return res.status(400).json({ error: 'Already exist' });
      }

      const hashedPassword = encryptPassword(password);
      const user = await dbClient.createUser(email, hashedPassword);
      return res.status(201).send({ id: user._id, email: user.email });
    } catch (error) {
      console.error(error);
      return res.status(500).send({ error: 'Server error' });
    }
  }
}

// utils/crypto.js
export function encryptPassword(password) {
  const sha1 = crypto.createHash('sha1');
  sha1.update(password);
  const hashedPassword = sha1.digest('hex');
  return hashedPassword;
}