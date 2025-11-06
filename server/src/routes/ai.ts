import express, { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { chatCompletion, chatCompletionStream, testApiKey } from '../utils/openai.js';
import User from '../models/User.js';
import { decrypt } from '../utils/encryption.js';

const router = express.Router();

// 聊天补全
router.post('/chat', async (req: AuthRequest, res: Response) => {
  try {
    const { messages, userId, stream = false, options = {} } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    // 获取用户的 API Key
    let apiKey: string | undefined;
    if (userId) {
      const user = await User.findOne({ userId }).select('+apiKeys');
      if (user?.apiKeys?.openai) {
        try {
          apiKey = decrypt(user.apiKeys.openai);
        } catch (error) {
          console.error('Failed to decrypt API key');
        }
      }
    }

    // 流式响应
    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      try {
        for await (const chunk of chatCompletionStream(messages, apiKey, options)) {
          res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
        }
        res.write('data: [DONE]\n\n');
        res.end();
      } catch (error: any) {
        res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
        res.end();
      }
    } else {
      // 非流式响应
      const result = await chatCompletion(messages, apiKey, options);
      res.json(result);
    }
  } catch (error: any) {
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    }
  }
});

// 测试 API Key
router.post('/test-key', async (req, res: Response) => {
  try {
    const { apiKey } = req.body;

    if (!apiKey) {
      return res.status(400).json({ error: 'API key is required' });
    }

    const isValid = await testApiKey(apiKey);

    res.json({ valid: isValid });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

