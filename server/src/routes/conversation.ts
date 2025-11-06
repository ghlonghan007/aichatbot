import express, { Response } from 'express';
import Conversation from '../models/Conversation.js';
import { AuthRequest } from '../middleware/auth.js';
import { generateConversationTitle } from '../utils/openai.js';

const router = express.Router();

// 创建新对话
router.post('/', async (req, res: Response) => {
  try {
    const { userId, title } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const conversation = new Conversation({
      userId,
      title: title || '新对话',
      messages: [],
    });

    await conversation.save();

    res.status(201).json(conversation);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 获取用户对话列表
router.get('/:userId', async (req, res: Response) => {
  try {
    const { limit = '20', skip = '0' } = req.query;

    const conversations = await Conversation.find({ userId: req.params.userId })
      .sort({ updatedAt: -1 })
      .limit(parseInt(limit as string))
      .skip(parseInt(skip as string))
      .select('-messages'); // 列表不返回消息内容

    const total = await Conversation.countDocuments({ userId: req.params.userId });

    res.json({
      conversations,
      total,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 获取单个对话详情
router.get('/detail/:id', async (req, res: Response) => {
  try {
    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    res.json(conversation);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 添加消息到对话
router.post('/:id/message', async (req, res: Response) => {
  try {
    const { role, content } = req.body;

    if (!role || !content) {
      return res.status(400).json({ error: 'Role and content are required' });
    }

    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    conversation.messages.push({
      role,
      content,
      timestamp: new Date(),
    });

    // 如果是第一条用户消息，自动生成标题
    if (conversation.messages.length === 1 && role === 'user' && conversation.title === '新对话') {
      try {
        conversation.title = await generateConversationTitle(content);
      } catch (error) {
        // 标题生成失败不影响主流程
      }
    }

    await conversation.save();

    res.json(conversation);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 更新对话标题
router.put('/:id/title', async (req, res: Response) => {
  try {
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const conversation = await Conversation.findByIdAndUpdate(
      req.params.id,
      { title },
      { new: true }
    );

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    res.json(conversation);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 删除对话
router.delete('/:id', async (req, res: Response) => {
  try {
    const conversation = await Conversation.findByIdAndDelete(req.params.id);

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    res.json({ message: 'Conversation deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

