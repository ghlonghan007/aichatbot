import express, { Response } from 'express';
import User from '../models/User.js';
import { AuthRequest, generateToken } from '../middleware/auth.js';
import { encrypt, decrypt } from '../utils/encryption.js';

const router = express.Router();

// 注册或获取用户
router.post('/register', async (req, res: Response) => {
  try {
    const { userId, name, email } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    let user = await User.findOne({ userId });

    if (!user) {
      user = new User({
        userId,
        name: name || '用户',
        email,
      });
      await user.save();
    }

    const token = generateToken(userId);

    res.json({
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        preferences: user.preferences,
      },
      token,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 获取用户信息
router.get('/:userId', async (req, res: Response) => {
  try {
    const user = await User.findOne({ userId: req.params.userId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      userId: user.userId,
      name: user.name,
      email: user.email,
      preferences: user.preferences,
      createdAt: user.createdAt,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 更新用户信息
router.put('/:userId', async (req, res: Response) => {
  try {
    const { name, email, preferences } = req.body;

    const user = await User.findOneAndUpdate(
      { userId: req.params.userId },
      {
        ...(name && { name }),
        ...(email && { email }),
        ...(preferences && { preferences }),
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      userId: user.userId,
      name: user.name,
      email: user.email,
      preferences: user.preferences,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 更新 API Key
router.put('/:userId/apikey', async (req, res: Response) => {
  try {
    const { provider, apiKey } = req.body;

    if (!provider || !apiKey) {
      return res.status(400).json({ error: 'Provider and API key are required' });
    }

    const encryptedKey = encrypt(apiKey);

    const user = await User.findOne({ userId: req.params.userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.apiKeys = {
      ...user.apiKeys,
      [provider]: encryptedKey,
    };

    await user.save();

    res.json({ message: 'API key updated successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 获取 API Key（解密）
router.get('/:userId/apikey/:provider', async (req, res: Response) => {
  try {
    const user = await User.findOne({ userId: req.params.userId }).select('+apiKeys');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const encryptedKey = user.apiKeys?.[req.params.provider as keyof typeof user.apiKeys];

    if (!encryptedKey) {
      return res.status(404).json({ error: 'API key not found' });
    }

    const decryptedKey = decrypt(encryptedKey);

    res.json({ apiKey: decryptedKey });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

